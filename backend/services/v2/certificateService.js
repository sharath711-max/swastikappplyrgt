'use strict';

/**
 * certificateService.js  —  v2 (hardened)
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGES IN THIS VERSION
 *   1. All validation runs BEFORE transactions; throws BusinessError.
 *   2. Every public write: audit.start → _txn() → audit.commit / audit.rollback.
 *   3. rethrow() wraps unknown errors into SystemError.
 *   4. _createCertificateWork: composable bare-DB (used by testService.completeTest).
 *   5. createCertificate: sequence + items + rollup + ledger in ONE transaction.
 *   6. updateStatus DONE: rollup + status + ledger in ONE transaction, no catch swallowing.
 *   7. saveResults: items + rollup + GST + parent patch in ONE transaction.
 */

const { db, genId, now, transaction } = require('../../db/db');
const { BusinessError, SystemError, ERR, rethrow } = require('./errors');
const audit        = require('./auditLogger');
const calcSvc      = require('./calculationService');
const seqSvc       = require('./sequenceService');
const ledgerSvc    = require('./ledgerService');
const customerRepo = require('../../repositories/customerRepository');

// ─── Fee model (canonical, matches testService.completeTest) ─────────────────
const CERT_FEE_RATE = 50;

// ─── Type config ──────────────────────────────────────────────────────────────
/** @typedef {'gold'|'silver'} MetalType */

const TYPE_CFG = Object.freeze({
    gold: {
        parentTable    : 'gold_certificate',
        itemTable      : 'gold_certificate_item',
        fkColumn       : 'gold_certificate_id',
        parentIdPrefix : 'GCR',
        itemIdPrefix   : 'GCI',
        hasRatePerGram : true,
        hasFineTotal   : true,
    },
    silver: {
        parentTable    : 'silver_certificate',
        itemTable      : 'silver_certificate_item',
        fkColumn       : 'silver_certificate_id',
        parentIdPrefix : 'SCR',
        itemIdPrefix   : 'SCI',
        hasRatePerGram : false,
        hasFineTotal   : false,
    },
});

const STATUS_RANK = Object.freeze({ TODO: 1, IN_PROGRESS: 2, DONE: 3 });

// ─── Config / guards ──────────────────────────────────────────────────────────

function _cfg(type) {
    const c = TYPE_CFG[type];
    if (!c) throw new BusinessError(
        `Unknown metal type: "${type}". Must be 'gold' or 'silver'.`,
        ERR.INVALID_TYPE, 400
    );
    return c;
}

function _assertStatusMove(current, next) {
    if (!STATUS_RANK[next]) {
        throw new BusinessError(`Invalid status: "${next}"`, ERR.STATUS_INVALID, 422);
    }
    if (STATUS_RANK[current] > STATUS_RANK[next]) {
        throw new BusinessError(
            `Backward status move not permitted: ${current} → ${next}`,
            ERR.STATUS_BACKWARD, 409
        );
    }
}

function _assertMutable(type, id) {
    const c   = _cfg(type);
    const row = db.prepare(
        `SELECT id, status, customer_id, total, mode_of_payment, auto_number
         FROM ${c.parentTable} WHERE id = ? AND deletedon IS NULL`
    ).get(id);
    if (!row) throw new BusinessError(`${type} certificate not found: ${id}`, ERR.CERT_NOT_FOUND, 404);
    if (row.status === 'DONE') {
        throw new BusinessError(`Certificate ${id} is DONE and immutable`, ERR.IMMUTABLE, 409);
    }
    return row;
}

// ─── Pre-transaction validation helpers ───────────────────────────────────────

function _validateCreate(type, data) {
    _cfg(type);  // validates type

    if (!data.customer_id || typeof data.customer_id !== 'string') {
        throw new BusinessError('customer_id is required', ERR.MISSING_FIELD, 400);
    }
    const customer = customerRepo.findById(data.customer_id);
    if (!customer) {
        throw new BusinessError(`Customer not found: ${data.customer_id}`, ERR.CUSTOMER_NOT_FOUND, 404);
    }
    if (!Array.isArray(data.items) || data.items.length === 0) {
        throw new BusinessError('items array is required and cannot be empty', ERR.ITEMS_EMPTY, 422);
    }
}

function _validateUpdateItem(type, certId, itemId, updates) {
    _cfg(type);
    if (!certId) throw new BusinessError('certId is required', ERR.MISSING_FIELD, 400);
    if (!itemId) throw new BusinessError('itemId is required', ERR.MISSING_FIELD, 400);
    if (updates.purity !== undefined) {
        const p = parseFloat(updates.purity);
        if (isNaN(p) || p < 0 || p > 100) {
            throw new BusinessError(
                `Invalid purity: ${updates.purity}`, ERR.INVALID_PURITY, 422
            );
        }
    }
}

// ─── Item normaliser ──────────────────────────────────────────────────────────

function _normaliseItem(raw, type) {
    const base = {
        gross_weight: parseFloat(raw.gross_weight || raw.weight || 0),
        test_weight : parseFloat(raw.test_weight  || 0),
        purity      : parseFloat(raw.purity       || 0),
        is_returned : Boolean(raw.returned || raw.is_returned),
        item_name   : raw.name || raw.item_name || raw.item_type
                      || (type === 'gold' ? 'Gold Item' : 'Silver Item'),
    };
    if (type === 'gold') {
        base.rate_per_gram = parseFloat(raw.rate_per_gram || 0);
    }
    return base;
}

// ─── Bare-DB helpers ──────────────────────────────────────────────────────────

function _buildParentInsert(type, certId, autoNumber, customer_id, status, mode_of_payment, gst, gst_bill_number, total_tax, ts) {
    if (type === 'gold') {
        return {
            sql: `
                INSERT INTO gold_certificate
                  (id, auto_number, customer_id, status, mode_of_payment,
                   total, total_net_weight, total_fine_weight,
                   gst, gst_bill_number, total_tax, created, lastmodified)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            values: [
                certId, autoNumber, customer_id, status, mode_of_payment,
                0, 0, 0,
                gst ? 1 : 0, gst_bill_number, total_tax, ts, ts,
            ],
        };
    }
    return {
        sql: `
            INSERT INTO silver_certificate
              (id, auto_number, customer_id, status, mode_of_payment,
               total, total_net_weight,
               gst, gst_bill_number, total_tax, created, lastmodified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        values: [
            certId, autoNumber, customer_id, status, mode_of_payment,
            0, 0,
            gst ? 1 : 0, gst_bill_number, total_tax, ts, ts,
        ],
    };
}

/**
 * INSERT a batch of items.  Bare-DB, no own transaction.
 *
 * @param {MetalType} type
 * @param {string}    certId
 * @param {string}    autoNumber
 * @param {Array}     rawItems
 * @param {string}    ts
 * @param {number}    [startSeq=1]
 * @returns {Array}
 */
function _insertItemsWork(type, certId, autoNumber, rawItems, ts, startSeq = 1) {
    const c             = _cfg(type);
    const insertedItems = [];
    let   itemSeq       = startSeq;

    for (const raw of rawItems) {
        const itemId     = genId(c.itemIdPrefix);
        const itemNumber = seqSvc.generateTestItemNumber(autoNumber, itemSeq);
        const certLabel  = seqSvc.generateCertificateLabel(itemSeq);
        itemSeq++;

        const normInput = _normaliseItem(raw, type);
        const calc      = calcSvc.calculateItem(type, normInput);

        const baseFields = [
            'id', c.fkColumn, 'item_number', 'certificate_number',
            'name', 'item_type',
            'gross_weight', 'test_weight', 'net_weight',
            'purity', 'fine_weight', 'item_total',
            'returned', 'created',
        ];
        const baseValues = [
            itemId, certId, itemNumber,
            raw.certificate_number || itemNumber,
            raw.name || raw.item_name || normInput.item_name || '',
            raw.item_type || raw.item_name || normInput.item_name || '',
            calc.gross_weight, calc.test_weight, calc.net_weight,
            calc.purity, calc.fine_weight, calc.item_total,
            calc.is_returned ? 1 : 0, ts,
        ];

        db.prepare(`
            INSERT INTO ${c.itemTable} (${baseFields.join(', ')})
            VALUES (${baseFields.map(() => '?').join(', ')})
        `).run(...baseValues);

        insertedItems.push({
            id                : itemId,
            item_number       : itemNumber,
            certificate_number: raw.certificate_number || itemNumber,
            ...calc,
            created           : ts,
        });
    }

    return insertedItems;
}

/**
 * Full certificate creation — COMPOSABLE BARE-DB, no own transaction.
 * Called by createCertificate() and testService.completeTest().
 * Uses seqSvc._generateGlobalSequenceWork() to participate in caller's transaction.
 *
 * @param {MetalType} type
 * @param {Object}    data
 * @param {string}    [ts]  – supply from outer transaction for consistent timestamps
 * @param {Object}    [tx]  – the active db transaction binding
 * @returns {{ id, auto_number, items, totals, created }}
 */
function _createCertificateWork(type, data, ts, tx = db) {
    const c = _cfg(type);
    const {
        customer_id,
        items,
        status          = 'TODO',
        mode_of_payment = 'Cash',
        gst             = false,
        gst_bill_number = '',
        total_tax       = 0,
    } = data;

    ts = ts || now();

    const certId     = genId(c.parentIdPrefix);
    // Certificate tracking number (lab sequence, daily-reset)
    const autoNumber = seqSvc._generateGlobalSequenceWork(type, { context: 'CERT', isGst: gst });
    // Financial bill number (yearly sequence, NEVER resets — uniqueness enforced by DB index)
    const billNumber = seqSvc.getNextBillNumber(gst);

    // Parent INSERT — billNumber written to gst_bill_number column
    const pi = _buildParentInsert(type, certId, autoNumber, customer_id, status, mode_of_payment, gst, billNumber, total_tax, ts);
    db.prepare(pi.sql).run(...pi.values);

    // Item INSERTs
    const insertedItems = _insertItemsWork(type, certId, autoNumber, items, ts);

    // Roll-up (bare-DB, same transaction)
    const agg = calcSvc.rollupTotals(type, certId, db);

    // GST
    if (gst) {
        const { tax_amount } = calcSvc.calculateGstBreakdown(agg.grand_total, true);
        db.prepare(
            `UPDATE ${c.parentTable} SET total_tax = ?, lastmodified = ? WHERE id = ?`
        ).run(tax_amount, ts, certId);
    }

    return {
        id          : certId,
        auto_number : autoNumber,
        bill_number : billNumber,
        items       : insertedItems,
        totals      : agg,
        created     : ts,
    };
}

// ─── PUBLIC: CREATE ───────────────────────────────────────────────────────────

/**
 * Create a certificate.
 * Validation runs BEFORE the transaction.
 * Sequence + items + rollup + ledger charge in ONE atomic transaction.
 * Any failure → full rollback. No silent ledger failures.
 *
 * @param {MetalType} type
 * @param {Object}    data
 * @param {string}    data.customer_id
 * @param {Array}     data.items
 * @param {string}    [data.status='TODO']
 * @param {string}    [data.mode_of_payment='Cash']
 * @param {boolean}   [data.gst=false]
 * @param {string}    [data.gst_bill_number='']
 * @param {number}    [data.total_tax=0]
 * @param {boolean}   [data.post_ledger=true]
 * @returns {{ id, auto_number, items, totals, created, ledger }}
 */
function createCertificate(type, data) {
    // ── Validate BEFORE transaction ──────────────────────────────────────────
    _validateCreate(type, data);
    audit.validate('certificateService.createCertificate', {
        type,
        customer_id: data.customer_id,
        item_count : data.items.length,
        gst        : data.gst ?? false,
    });

    const post_ledger = data.post_ledger !== false;

    audit.start('certificateService.createCertificate', { type, customer_id: data.customer_id });

    const _txn = transaction(() => {
        const tx = db;
        const ts   = now();
        const cert = _createCertificateWork(type, data, ts, tx);

        // Ledger INSIDE transaction — failure rolls back cert + items
        let ledgerEntry = null;
        if (post_ledger && cert.totals.grand_total > 0) {
            const cap  = type.charAt(0).toUpperCase() + type.slice(1);
            const desc = `${cap} Certificate ${cert.auto_number} — lab charges`;

            ledgerEntry = ledgerSvc.recordRevenue(type, {
                customer_id    : data.customer_id,
                amount         : cert.totals.grand_total,
                entry_type     : 'DEBIT',
                description    : desc,
                mode_of_payment: data.mode_of_payment || 'Cash',
                post_cash_register: false,
                reference_type : c.parentTable,
                reference_id   : cert.id,
            }, tx);
        }

        return { ...cert, ledger: ledgerEntry?.debit };
    });

    try {
        const result = _txn();
        audit.commit('certificateService.createCertificate', {
            id         : result.id,
            auto_number: result.auto_number,
            type,
            total      : result.totals.grand_total,
            ledger_id  : result.ledger?.id,
        });
        audit.sequence('certificateService.createCertificate', result.auto_number, type, result.id);
        return result;
    } catch (err) {
        audit.rollback('certificateService.createCertificate', err, { type, customer_id: data.customer_id });
        rethrow(err, 'certificateService.createCertificate', { type });
    }
}

function createFromTestItems(type, data, certItems) {
    if (!Array.isArray(certItems) || certItems.length === 0) {
        throw new BusinessError('No cert-eligible items provided', ERR.NO_CERT_ITEMS, 422);
    }
    return createCertificate(type, { ...data, items: certItems });
}

// ─── READ ─────────────────────────────────────────────────────────────────────

function getCertificate(type, id) {
    const c    = _cfg(type);
    const cert = db.prepare(`
        SELECT p.*, p.created AS created_at,
               cu.name AS customer_name, cu.phone AS customer_phone
        FROM ${c.parentTable} p
        JOIN customer cu ON p.customer_id = cu.id
        WHERE p.id = ? AND p.deletedon IS NULL
    `).get(id);
    if (!cert) return null;

    const items = db.prepare(`
        SELECT * FROM ${c.itemTable}
        WHERE ${c.fkColumn} = ? AND deletedon IS NULL ORDER BY item_number ASC
    `).all(id);

    return { ...cert, items };
}

function getCertificateByPrefix(id) {
    if (id.startsWith('GCR')) return getCertificate('gold',   id);
    if (id.startsWith('SCR')) return getCertificate('silver', id);
    throw new BusinessError(`Cannot infer type from ID: "${id}"`, ERR.INVALID_TYPE, 400);
}

function listCertificates(type, filters = {}) {
    const c         = _cfg(type);
    const alias     = type === 'gold' ? 'gc' : 'sc';
    const ia        = type === 'gold' ? 'gci' : 'sci';
    const limit     = filters.limit  ?? 20;
    const offset    = filters.offset ?? 0;
    const listP     = [];
    const countP    = [];

    let listQ  = `
        SELECT ${alias}.*, ${alias}.created AS created_at, cu.name AS customer_name,
            (SELECT COUNT(*) FROM ${c.itemTable}
             WHERE ${c.fkColumn} = ${alias}.id AND deletedon IS NULL) AS item_count
        FROM ${c.parentTable} ${alias}
        JOIN customer cu ON ${alias}.customer_id = cu.id
        WHERE ${alias}.deletedon IS NULL
    `;
    let countQ = `
        SELECT COUNT(*) AS total FROM ${c.parentTable} ${alias}
        JOIN customer cu ON ${alias}.customer_id = cu.id
        WHERE ${alias}.deletedon IS NULL
    `;

    function addF(clause, ...args) { listQ += clause; countQ += clause; listP.push(...args); countP.push(...args); }

    if (filters.status)      addF(` AND ${alias}.status = ?`,      filters.status);
    if (filters.customer_id) addF(` AND ${alias}.customer_id = ?`, filters.customer_id);
    if (filters.search) {
        const s = `%${filters.search}%`;
        addF(` AND (cu.name LIKE ? OR cu.phone LIKE ? OR ${alias}.auto_number LIKE ?
            OR EXISTS (SELECT 1 FROM ${c.itemTable} ${ia}
                       WHERE ${ia}.${c.fkColumn} = ${alias}.id AND ${ia}.item_number LIKE ?))`,
            s, s, s, s);
    }

    listQ += ` ORDER BY ${alias}.created DESC LIMIT ? OFFSET ?`;
    listP.push(limit, offset);

    const certificates = db.prepare(listQ).all(...listP);
    const { total }    = db.prepare(countQ).get(...countP);
    return { certificates, total, pages: Math.ceil(total / limit) };
}

// ─── STATUS ───────────────────────────────────────────────────────────────────

/**
 * Advance certificate status.
 * When transitioning to DONE: rollup → status → ledger — all ONE transaction.
 *
 * @param {MetalType} type
 * @param {string}    id
 * @param {string}    newStatus
 * @returns {{ changes: number, ledger: Object|null }}
 */
function updateStatus(type, id, newStatus) {
    const c       = _cfg(type);
    // Read BEFORE transaction — validate status move
    const current = db.prepare(
        `SELECT status, customer_id, total, mode_of_payment, auto_number
         FROM ${c.parentTable} WHERE id = ? AND deletedon IS NULL`
    ).get(id);

    if (!current) throw new BusinessError(`${type} certificate not found`, ERR.CERT_NOT_FOUND, 404);
    _assertStatusMove(current.status, newStatus);   // BusinessError if backward

    audit.start('certificateService.updateStatus', { type, id, newStatus });

    const _txn = transaction(() => {
        const tx = db;
        const ts = now();

        // Final rollup before DONE seal — updates total_net_weight / total_fine_weight
        if (newStatus === 'DONE') {
            calcSvc.rollupTotals(type, id, db);
        }

        const result = db.prepare(
            `UPDATE ${c.parentTable} SET status = ?, lastmodified = ? WHERE id = ? AND deletedon IS NULL`
        ).run(newStatus, ts, id);

        // Ledger — INSIDE transaction, no catch; failure rolls back status too
        let ledgerEntry = null;
        if (newStatus === 'DONE') {
            const finalRow = db.prepare(
                `SELECT total, gst, customer_id, mode_of_payment, auto_number FROM ${c.parentTable} WHERE id = ?`
            ).get(id);

            if (!finalRow) {
                throw new SystemError(
                    `updateStatus: cert ${id} vanished mid-transaction`,
                    null, { id, type }
                );
            }

            // Apply canonical fee model (CERT_FEE_RATE × item count), overriding the
            // weight-based total written by rollupTotals above.
            const itemCount = db.prepare(
                `SELECT COUNT(*) AS cnt FROM ${c.itemTable} WHERE ${c.fkColumn} = ? AND deletedon IS NULL`
            ).get(id).cnt;

            const feeTotal = CERT_FEE_RATE * itemCount;
            const applyGst = Boolean(finalRow.gst);
            const feeTax   = applyGst ? (feeTotal - feeTotal / 1.18) : 0;

            db.prepare(
                `UPDATE ${c.parentTable} SET total = ?, total_tax = ?, lastmodified = ? WHERE id = ?`
            ).run(feeTotal, feeTax, ts, id);

            // Guard: completeTest may have already posted a DEBIT for this cert
            const alreadyCharged = db.prepare(
                `SELECT COUNT(*) AS cnt FROM credit_history WHERE reference_type = ? AND reference_id = ? AND type = 'DEBIT'`
            ).get(c.parentTable, id).cnt > 0;

            if (feeTotal > 0 && !alreadyCharged) {
                const cap  = type.charAt(0).toUpperCase() + type.slice(1);
                const desc = `${cap} Certificate ${finalRow.auto_number} — lab charges`;

                ledgerEntry = ledgerSvc.recordRevenue(type, {
                    customer_id    : finalRow.customer_id,
                    amount         : feeTotal,
                    entry_type     : 'DEBIT',
                    description    : desc,
                    mode_of_payment: finalRow.mode_of_payment || 'Cash',
                    post_cash_register: false,
                    reference_type : c.parentTable,
                    reference_id   : id,
                }, tx);
            }
            
            const printSvc = require('./printService');
            const { getRequestId } = require('../../utils/audit');
            const { snapshotJson, snapshotHash, snapshotKeyVersion } = printSvc.serializeSnapshot('certificate', type, id, getRequestId() || null);
            tx.prepare(`UPDATE ${c.parentTable} SET print_snapshot = ?, snapshot_hash = ?, snapshot_key_version = ? WHERE id = ?`).run(snapshotJson, snapshotHash, snapshotKeyVersion, id);
        }

        return { changes: result.changes, ledger: ledgerEntry?.debit };
    });

    try {
        const result = _txn();
        audit.commit('certificateService.updateStatus', {
            id, type, from: current.status, to: newStatus,
            ledger_id: result.ledger?.id,
        });
        audit.statusChange('certificateService.updateStatus', id, current.status, newStatus);
        return result;
    } catch (err) {
        audit.rollback('certificateService.updateStatus', err, { type, id, newStatus });
        rethrow(err, 'certificateService.updateStatus', { type, id, newStatus });
    }
}

function finalizeCertificate(type, certId) {
    _assertMutable(type, certId);   // throws if DONE (pre-transaction guard)
    try {
        updateStatus(type, certId, 'DONE');
        return getCertificate(type, certId);
    } catch (err) {
        rethrow(err, 'certificateService.finalizeCertificate', { type, certId });
    }
}

// ─── ITEM CRUD ────────────────────────────────────────────────────────────────

function addItems(type, certId, newItems) {
    const c = _cfg(type);
    _assertMutable(type, certId);  // pre-transaction

    if (!Array.isArray(newItems) || newItems.length === 0) {
        throw new BusinessError('newItems array cannot be empty', ERR.ITEMS_EMPTY, 422);
    }

    audit.start('certificateService.addItems', { type, certId, count: newItems.length });

    const _txn = transaction(() => {
        const ts = now();

        const cntRow = db.prepare(
            `SELECT COUNT(*) AS cnt FROM ${c.itemTable} WHERE ${c.fkColumn} = ? AND deletedon IS NULL`
        ).get(certId);
        const startSeq   = (cntRow?.cnt ?? 0) + 1;
        const parent     = db.prepare(`SELECT auto_number FROM ${c.parentTable} WHERE id = ?`).get(certId);
        const autoNumber = parent?.auto_number ?? certId;

        const added  = _insertItemsWork(type, certId, autoNumber, newItems, ts, startSeq);
        const totals = calcSvc.rollupTotals(type, certId, db);
        return { added, totals };
    });

    try {
        const result = _txn();
        audit.commit('certificateService.addItems', { certId, type, added: result.added.length, total: result.totals.grand_total });
        return result;
    } catch (err) {
        audit.rollback('certificateService.addItems', err, { type, certId });
        rethrow(err, 'certificateService.addItems', { type, certId });
    }
}

function updateItem(type, certId, itemId, updates) {
    // ── Validate BEFORE transaction ─────────────────────────────────────────
    _assertMutable(type, certId);
    _validateUpdateItem(type, certId, itemId, updates);

    const c = _cfg(type);

    audit.start('certificateService.updateItem', { type, certId, itemId });

    const _txn = transaction(() => {
        const current = db.prepare(
            `SELECT * FROM ${c.itemTable} WHERE id = ? AND ${c.fkColumn} = ? AND deletedon IS NULL`
        ).get(itemId, certId);

        if (!current) throw new BusinessError('Item not found', ERR.ITEM_NOT_FOUND, 404);

        const merged    = { ...current, ...updates };
        const normInput = _normaliseItem(merged, type);
        normInput.is_returned = merged.returned == 1 || merged.returned === true || Boolean(merged.is_returned);

        const calc = calcSvc.calculateItem(type, normInput);

        const fields = {
            item_type         : merged.item_type || merged.name || current.item_type,
            name              : merged.name      || current.name,
            gross_weight      : calc.gross_weight,
            test_weight       : calc.test_weight,
            net_weight        : calc.net_weight,
            purity            : calc.purity,
            fine_weight       : calc.fine_weight,
            item_total        : calc.item_total,
            returned          : calc.is_returned ? 1 : 0,
            certificate_number: merged.certificate_number || current.certificate_number,
        };
        if (type === 'gold') fields.rate_per_gram = normInput.rate_per_gram;

        const setClause = Object.keys(fields).map(k => `${k} = ?`).join(', ');
        db.prepare(`
            UPDATE ${c.itemTable}
            SET ${setClause}, lastmodified = ?
            WHERE id = ? AND ${c.fkColumn} = ? AND deletedon IS NULL
        `).run(...Object.values(fields), now(), itemId, certId);

        const totals = calcSvc.rollupTotals(type, certId, db);
        return { success: true, totals };
    });

    try {
        const result = _txn();
        audit.commit('certificateService.updateItem', { certId, itemId, type, total: result.totals.grand_total });
        return result;
    } catch (err) {
        audit.rollback('certificateService.updateItem', err, { type, certId, itemId });
        rethrow(err, 'certificateService.updateItem', { type, certId, itemId });
    }
}

function removeItem(type, certId, itemId) {
    _assertMutable(type, certId);
    const c = _cfg(type);

    audit.start('certificateService.removeItem', { type, certId, itemId });

    const _txn = transaction(() => {
        const ts     = now();
        const result = db.prepare(
            `UPDATE ${c.itemTable} SET deletedon = ?, lastmodified = ?
             WHERE id = ? AND ${c.fkColumn} = ? AND deletedon IS NULL`
        ).run(ts, ts, itemId, certId);

        if (result.changes === 0) throw new BusinessError('Item not found', ERR.ITEM_NOT_FOUND, 404);

        const totals = calcSvc.rollupTotals(type, certId, db);
        return { success: true, totals };
    });

    try {
        const result = _txn();
        audit.commit('certificateService.removeItem', { certId, itemId, type });
        return result;
    } catch (err) {
        audit.rollback('certificateService.removeItem', err, { type, certId, itemId });
        rethrow(err, 'certificateService.removeItem', { type, certId, itemId });
    }
}

// ─── SAVE RESULTS ─────────────────────────────────────────────────────────────

function saveResults(type, certId, data) {
    // ── Validate BEFORE transaction ─────────────────────────────────────────
    _assertMutable(type, certId);

    // Validate item purities before opening transaction
    for (const rawItem of (data.items ?? [])) {
        if (rawItem.purity !== undefined) {
            const p = parseFloat(rawItem.purity);
            if (isNaN(p) || p < 0 || p > 100) {
                throw new BusinessError(
                    `Invalid purity for item ${rawItem.id ?? '?'}: ${rawItem.purity}`,
                    ERR.INVALID_PURITY, 422
                );
            }
        }
    }

    audit.validate('certificateService.saveResults', { type, certId, item_count: (data.items ?? []).length });
    audit.start('certificateService.saveResults', { type, certId });

    const c = _cfg(type);
    const { items = [], mode_of_payment, gst, gst_bill_number, total, total_tax } = data;

    const _txn = transaction(() => {
        // Update items inside this transaction (nested calls become SAVEPOINTs)
        for (const rawItem of items) {
            if (!rawItem.id) continue;
            updateItem(type, certId, rawItem.id, rawItem);
        }

        const agg = calcSvc.rollupTotals(type, certId, db);

        // GST
        let computedTax = total_tax;
        if (gst !== undefined) {
            const base      = total ?? agg.grand_total;
            const breakdown = calcSvc.calculateGstBreakdown(base, Boolean(gst));
            computedTax     = breakdown.tax_amount;
        }

        // Parent patch
        const patches = [];
        const vals    = [];
        if (mode_of_payment !== undefined) { patches.push('mode_of_payment = ?'); vals.push(mode_of_payment); }
        if (gst             !== undefined) { patches.push('gst = ?');             vals.push(gst ? 1 : 0); }
        if (gst_bill_number !== undefined) { patches.push('gst_bill_number = ?'); vals.push(gst_bill_number); }
        if (total           !== undefined) { patches.push('total = ?');           vals.push(total); }
        if (computedTax     !== undefined) { patches.push('total_tax = ?');       vals.push(computedTax); }

        if (patches.length > 0) {
            vals.push(now(), certId);
            db.prepare(
                `UPDATE ${c.parentTable} SET ${patches.join(', ')}, lastmodified = ? WHERE id = ?`
            ).run(...vals);
        }

        return getCertificate(type, certId);
    });

    try {
        const result = _txn();
        audit.commit('certificateService.saveResults', { certId, type, total: result.total });
        return result;
    } catch (err) {
        audit.rollback('certificateService.saveResults', err, { type, certId });
        rethrow(err, 'certificateService.saveResults', { type, certId });
    }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

function deleteCertificate(type, id) {
    _assertMutable(type, id);
    const c = _cfg(type);

    audit.start('certificateService.deleteCertificate', { type, id });

    const _txn = transaction(() => {
        const ts = now();
        db.prepare(`UPDATE ${c.parentTable} SET deletedon = ?, lastmodified = ? WHERE id = ?`).run(ts, ts, id);
        db.prepare(`UPDATE ${c.itemTable}   SET deletedon = ? WHERE ${c.fkColumn} = ?`).run(ts, id);
        return { success: true };
    });

    try {
        const result = _txn();
        audit.commit('certificateService.deleteCertificate', { id, type });
        return result;
    } catch (err) {
        audit.rollback('certificateService.deleteCertificate', err, { type, id });
        rethrow(err, 'certificateService.deleteCertificate', { type, id });
    }
}

// ─── STATS ────────────────────────────────────────────────────────────────────

function getStats(type, startDate, endDate) {
    const c      = _cfg(type);
    const params = [];
    let q = `
        SELECT COUNT(*) AS total_certs,
            COALESCE(SUM(p.total),            0) AS total_amount,
            COALESCE(SUM(p.total_net_weight),  0) AS total_net_weight,
            COUNT(CASE WHEN p.status = 'TODO'        THEN 1 END) AS pending,
            COUNT(CASE WHEN p.status = 'IN_PROGRESS' THEN 1 END) AS in_progress,
            COUNT(CASE WHEN p.status = 'DONE'        THEN 1 END) AS completed,
            COUNT(CASE WHEN p.gst = 1               THEN 1 END) AS with_gst
        FROM ${c.parentTable} p WHERE p.deletedon IS NULL
    `;
    if (startDate) { q += ' AND DATE(p.created) >= DATE(?)'; params.push(startDate); }
    if (endDate)   { q += ' AND DATE(p.created) <= DATE(?)'; params.push(endDate); }
    return db.prepare(q).get(...params);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    createCertificate,
    createFromTestItems,
    getCertificate,
    getCertificateByPrefix,
    listCertificates,
    getStats,
    updateStatus,
    finalizeCertificate,
    addItems,
    updateItem,
    removeItem,
    saveResults,
    deleteCertificate,
    // Composable bare-DB for testService.completeTest
    _createCertificateWork,
};
