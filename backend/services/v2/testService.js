'use strict';

/**
 * testService.js  —  v2 (hardened)
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGES IN THIS VERSION
 *   1. All validation runs BEFORE transactions; throws BusinessError.
 *   2. Every public write function: audit.start → _txn() → audit.commit/rollback.
 *   3. rethrow() wraps unknown errors into SystemError.
 *   4. completeTest: single transaction, no silent ledger failure.
 *   5. _finalizeItemsWork / _markTestDoneWork: bare-DB composable helpers.
 */

const { db, genId, now, transaction } = require('../../db/db');
const { BusinessError, SystemError, ERR, rethrow } = require('./errors');
const audit      = require('./auditLogger');
const seqSvc     = require('./sequenceService');
const ledgerSvc  = require('./ledgerService');
const GoldTestCalc   = require('../goldTestCalculationService');
const SilverTestCalc = require('../silverTestCalculationService');
const customerRepo   = require('../../repositories/customerRepository');

// Lazy-load to break circular dependency (certSvc ↔ testSvc)
let _certSvc = null;
function _getCertSvc() {
    if (!_certSvc) _certSvc = require('./certificateService');
    return _certSvc;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const HALLMARK_THRESHOLD = Object.freeze({ gold: 50, silver: 50 });
const STATUS_RANK        = Object.freeze({ TODO: 1, IN_PROGRESS: 2, DONE: 3 });

// ─── Type config ──────────────────────────────────────────────────────────────
/** @typedef {'gold'|'silver'} MetalType */

function _cfg(type) {
    if (type === 'gold') return {
        parentTable : 'gold_test',
        itemTable   : 'gold_test_item',
        fkColumn    : 'gold_test_id',
        parentPrefix: 'GTS',
        itemPrefix  : 'GTI',
        calc        : GoldTestCalc,
    };
    if (type === 'silver') return {
        parentTable : 'silver_test',
        itemTable   : 'silver_test_item',
        fkColumn    : 'silver_test_id',
        parentPrefix: 'STS',
        itemPrefix  : 'STI',
        calc        : SilverTestCalc,
    };
    throw new BusinessError(
        `Unknown metal type: "${type}". Must be 'gold' or 'silver'.`,
        ERR.INVALID_TYPE, 400
    );
}

// ─── Validation helpers (run before transactions) ─────────────────────────────

function _assertStatusMove(currentStatus, nextStatus) {
    if (!STATUS_RANK[nextStatus]) {
        throw new BusinessError(`Invalid status: "${nextStatus}"`, ERR.STATUS_INVALID, 422);
    }
    if (STATUS_RANK[currentStatus] > STATUS_RANK[nextStatus]) {
        throw new BusinessError(
            `Backward status move not permitted: ${currentStatus} → ${nextStatus}`,
            ERR.STATUS_BACKWARD, 409
        );
    }
}

function _assertFoundAndMutable(type, id) {
    const c   = _cfg(type);
    const row = db.prepare(
        `SELECT status, customer_id FROM ${c.parentTable} WHERE id = ? AND deletedon IS NULL`
    ).get(id);
    if (!row) {
        throw new BusinessError(`${type} test not found: ${id}`, ERR.TEST_NOT_FOUND, 404);
    }
    if (row.status === 'DONE') {
        throw new BusinessError(
            `${type} test ${id} is DONE and immutable`,
            ERR.IMMUTABLE, 409
        );
    }
    return row;
}

function _validateCreateTest(type, data) {
    _cfg(type);   // validates type

    const { customer_id, items } = data;

    if (!customer_id || typeof customer_id !== 'string') {
        throw new BusinessError('customer_id is required', ERR.MISSING_FIELD, 400);
    }
    const customer = customerRepo.findById(customer_id);
    if (!customer) {
        throw new BusinessError(`Customer not found: ${customer_id}`, ERR.CUSTOMER_NOT_FOUND, 404);
    }
    if (!Array.isArray(items) || items.length === 0) {
        throw new BusinessError('items array is required and cannot be empty', ERR.ITEMS_EMPTY, 422);
    }
}

function _validateSaveResults(type, id, data) {
    _assertFoundAndMutable(type, id);
    for (const item of (data.items ?? [])) {
        if (item.purity !== undefined) {
            const p = parseFloat(item.purity);
            if (isNaN(p) || p < 0 || p > 100) {
                throw new BusinessError(
                    `Invalid purity for item ${item.id ?? '?'}: ${item.purity}`,
                    ERR.INVALID_PURITY, 422
                );
            }
        }
    }
}

function _validateCompleteTest(type, id, data) {
    _cfg(type);
    if (!id) throw new BusinessError('testId is required', ERR.MISSING_FIELD, 400);
    if (!data.mode_of_payment) {
        throw new BusinessError(
            'mode_of_payment is required to complete a test',
            ERR.MISSING_PAYMENT, 422
        );
    }
}

// ─── Item normaliser ──────────────────────────────────────────────────────────
function _normaliseItem(raw, type, stripPurity = false) {
    return {
        item_type    : raw.item_type || raw.item_name || raw.name || (type === 'gold' ? 'Gold Sample' : 'Silver Sample'),
        gross_weight : parseFloat(raw.gross_weight || raw.total_weight || raw.weight || 0),
        sample_weight: parseFloat(raw.sample_weight || 0),
        test_weight  : parseFloat(raw.test_weight  || raw.sample_weight || 0),
        purity       : stripPurity ? 0 : parseFloat(raw.purity || 0),
        returned     : Boolean(raw.returned),
        net_weight   : raw.net_weight !== undefined ? parseFloat(raw.net_weight) : undefined,
    };
}

// ─── Composable bare-DB helpers ───────────────────────────────────────────────

function _finalizeItemsWork(type, testId, items, ts) {
    const c = _cfg(type);
    for (const raw of items) {
        const current = db.prepare(
            `SELECT * FROM ${c.itemTable} WHERE id = ? AND ${c.fkColumn} = ? AND deletedon IS NULL`
        ).get(raw.id, testId);

        if (!current) {
            throw new BusinessError(
                `Item ${raw.id} not found on test ${testId}`,
                ERR.ITEM_NOT_FOUND, 404
            );
        }

        const calc = c.calc.calculateItem({
            gross_weight: current.gross_weight,
            test_weight : current.test_weight,
            purity      : parseFloat(raw.purity),
            returned    : raw.returned == 1 || raw.returned === true,
            item_type   : current.item_type,
        });

        db.prepare(`
            UPDATE ${c.itemTable}
            SET purity = ?, returned = ?, fine_weight = ?, item_total = ?, lastmodified = ?
            WHERE id = ? AND ${c.fkColumn} = ? AND deletedon IS NULL
        `).run(
            calc.purity, calc.returned ? 1 : 0,
            calc.fine_weight, calc.item_total,
            ts, raw.id, testId
        );
    }
}

function _markTestDoneWork(type, testId, mode_of_payment, weight_loss, ts) {
    const c = _cfg(type);

    db.prepare(`
        UPDATE ${c.parentTable}
        SET status = 'DONE', mode_of_payment = ?,
            done_at = COALESCE(done_at, ?), lastmodified = ?
        WHERE id = ? AND deletedon IS NULL
    `).run(mode_of_payment, ts, ts, testId);

    if (weight_loss > 0) {
        const row = db.prepare(
            `SELECT customer_id FROM ${c.parentTable} WHERE id = ?`
        ).get(testId);
        if (!row) {
            throw new SystemError(
                `_markTestDoneWork: test ${testId} disappeared mid-transaction`,
                null, { testId, type }
            );
        }
        db.prepare(
            'INSERT INTO weight_loss_history (id, customer_id, amount, reason, created) VALUES (?, ?, ?, ?, ?)'
        ).run(genId('WLH'), row.customer_id, weight_loss, `${type} test finalization: ${testId}`, ts);
    }
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

function createTest(type, data) {
    // ── Validate BEFORE transaction ─────────────────────────────────────────
    _validateCreateTest(type, data);
    audit.validate('testService.createTest', { type, customer_id: data.customer_id, item_count: data.items.length });

    const c = _cfg(type);
    const { customer_id, items, status = 'TODO', mode_of_payment = 'Pending' } = data;
    const stripPurity = (status === 'TODO');

    audit.start('testService.createTest', { type, customer_id });

    const _txn = transaction(() => {
        const ts         = now();
        const testId     = genId(c.parentPrefix);
        // Sequence inside transaction — race-safe
        const autoNumber = seqSvc._generateGlobalSequenceWork(type);

        db.prepare(`
            INSERT INTO ${c.parentTable}
              (id, auto_number, customer_id, status, mode_of_payment, total, created, lastmodified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(testId, autoNumber, customer_id, status, mode_of_payment, 0, ts, ts);

        const insertedItems = [];
        let   itemSeq = 1;

        for (const raw of items) {
            const norm = _normaliseItem(raw, type, stripPurity);
            const calc = c.calc.calculateItem(norm);
            const itemId     = genId(c.itemPrefix);
            const itemNumber = seqSvc.generateTestItemNumber(autoNumber, itemSeq++);

            db.prepare(`
                INSERT INTO ${c.itemTable}
                  (id, ${c.fkColumn}, item_number, item_type,
                   gross_weight, sample_weight, test_weight, net_weight,
                   purity, fine_weight, item_total, returned, created)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                itemId, testId, itemNumber, calc.item_type,
                calc.gross_weight, norm.sample_weight, calc.test_weight,
                calc.net_weight, calc.purity, calc.fine_weight,
                calc.item_total, calc.returned ? 1 : 0, ts
            );

            insertedItems.push({ id: itemId, item_number: itemNumber, ...calc, created: ts });
        }

        return { id: testId, auto_number: autoNumber, items: insertedItems, created: ts };
    });

    try {
        const result = _txn();
        audit.commit('testService.createTest', { id: result.id, auto_number: result.auto_number, type });
        audit.sequence('testService.createTest', result.auto_number, type, result.id);
        return result;
    } catch (err) {
        audit.rollback('testService.createTest', err, { type, customer_id });
        rethrow(err, 'testService.createTest', { type, customer_id });
    }
}

// ─── SAVE RESULTS ─────────────────────────────────────────────────────────────

function saveResults(type, id, data) {
    // ── Validate BEFORE transaction ─────────────────────────────────────────
    _validateSaveResults(type, id, data);
    audit.validate('testService.saveResults', { type, id, item_count: (data.items ?? []).length });

    const c = _cfg(type);
    const { items = [], mode_of_payment, total } = data;

    audit.start('testService.saveResults', { type, id });

    const _txn = transaction(() => {
        const ts = now();

        for (const raw of items) {
            const current = db.prepare(
                `SELECT * FROM ${c.itemTable} WHERE id = ? AND deletedon IS NULL`
            ).get(raw.id);
            if (!current) continue;

            const mergedInput = {
                gross_weight: current.gross_weight,
                test_weight : raw.test_weight !== undefined ? parseFloat(raw.test_weight) : current.test_weight,
                purity      : raw.purity      !== undefined ? parseFloat(raw.purity)      : current.purity,
                returned    : raw.returned    !== undefined ? raw.returned                : current.returned,
                item_type   : current.item_type,
                net_weight  : raw.net_weight  !== undefined ? parseFloat(raw.net_weight)  : undefined,
            };

            const calc = c.calc.calculateItem(mergedInput);

            db.prepare(`
                UPDATE ${c.itemTable}
                SET purity = ?, returned = ?, fine_weight = ?, item_total = ?,
                    test_weight = ?, net_weight = ?, lastmodified = ?
                WHERE id = ? AND ${c.fkColumn} = ? AND deletedon IS NULL
            `).run(
                calc.purity, calc.returned ? 1 : 0, calc.fine_weight, calc.item_total,
                calc.test_weight, calc.net_weight, ts,
                raw.id, id
            );
        }

        const sets   = ['lastmodified = ?'];
        const values = [ts];
        if (mode_of_payment !== undefined) { sets.push('mode_of_payment = ?'); values.push(mode_of_payment); }
        if (total           !== undefined) { sets.push('total = ?');           values.push(total); }
        values.push(id);

        db.prepare(`UPDATE ${c.parentTable} SET ${sets.join(', ')} WHERE id = ? AND deletedon IS NULL`)
          .run(...values);

        // Auto-advance to IN_PROGRESS
        if (mode_of_payment !== undefined) {
            const curr = db.prepare(`SELECT status FROM ${c.parentTable} WHERE id = ?`).get(id);
            if (curr && curr.status === 'TODO') {
                db.prepare(`
                    UPDATE ${c.parentTable}
                    SET status = 'IN_PROGRESS', in_progress_at = COALESCE(in_progress_at, ?)
                    WHERE id = ?
                `).run(ts, id);
                audit.statusChange('testService.saveResults', id, 'TODO', 'IN_PROGRESS');
            }
        }

        return { success: true };
    });

    try {
        const result = _txn();
        audit.commit('testService.saveResults', { id, type });
        return result;
    } catch (err) {
        audit.rollback('testService.saveResults', err, { type, id });
        rethrow(err, 'testService.saveResults', { type, id });
    }
}

// ─── FINALIZE TEST (no cert) ──────────────────────────────────────────────────

function finalizeTest(type, id, data) {
    // ── Validate BEFORE transaction ─────────────────────────────────────────
    _assertFoundAndMutable(type, id);
    if (!data.mode_of_payment) {
        throw new BusinessError('mode_of_payment is required', ERR.MISSING_PAYMENT, 422);
    }
    audit.validate('testService.finalizeTest', { type, id });

    const { items = [], mode_of_payment, weight_loss = 0 } = data;

    audit.start('testService.finalizeTest', { type, id });

    const _txn = transaction(() => {
        const ts = now();
        _finalizeItemsWork(type, id, items, ts);
        _markTestDoneWork(type, id, mode_of_payment, weight_loss, ts);
        return { success: true };
    });

    try {
        const result = _txn();
        audit.commit('testService.finalizeTest', { id, type });
        audit.statusChange('testService.finalizeTest', id, 'IN_PROGRESS', 'DONE');
        return result;
    } catch (err) {
        audit.rollback('testService.finalizeTest', err, { type, id });
        rethrow(err, 'testService.finalizeTest', { type, id });
    }
}

// ─── COMPLETE TEST (finalize + cert + ledger — one transaction) ───────────────

function completeTest(type, testId, data) {
    // ── Validate BEFORE transaction ─────────────────────────────────────────
    _validateCompleteTest(type, testId, data);

    const c = _cfg(type);
    const testRow = db.prepare(
        `SELECT status, customer_id FROM ${c.parentTable} WHERE id = ? AND deletedon IS NULL`
    ).get(testId);

    if (!testRow) {
        throw new BusinessError(`${type} test not found: ${testId}`, ERR.TEST_NOT_FOUND, 404);
    }
    if (testRow.status === 'DONE') {
        throw new BusinessError(`Test ${testId} is already DONE`, ERR.IMMUTABLE, 409);
    }

    audit.validate('testService.completeTest', { type, testId, customer_id: testRow.customer_id });

    const {
        items          = [],
        mode_of_payment,
        weight_loss    = 0,
        cert           = {},
        post_ledger    = true,
    } = data;

    // Validate ledger inputs now (before transaction), so we fail fast
    if (post_ledger) {
        ledgerSvc._validateAppendEntry(type, {
            customer_id : testRow.customer_id,
            amount      : 0,      // amount unknown yet; re-validate inside with real amount
            entry_type  : 'DEBIT',
            description : 'pre-validate',
        });
    }

    audit.start('testService.completeTest', { type, testId, customer_id: testRow.customer_id });

    const certSvc = _getCertSvc();

    const _txn = transaction(() => {
        const ts              = now();
        const { customer_id } = testRow;

        // Step 1: Finalize items
        _finalizeItemsWork(type, testId, items, ts);

        // Step 2: Mark test DONE
        _markTestDoneWork(type, testId, mode_of_payment, weight_loss, ts);

        // Step 3: Build cert — get fresh item state post-update
        const finalItems = db.prepare(
            `SELECT * FROM ${c.itemTable} WHERE ${c.fkColumn} = ? AND deletedon IS NULL`
        ).all(testId);

        const threshold = HALLMARK_THRESHOLD[type];
        const certItems = finalItems.filter(
            item => !item.returned && parseFloat(item.purity) >= threshold
        );

        let certificate = null;
        if (certItems.length > 0) {
            // _createCertificateWork: composable bare-DB from certificateService
            certificate = certSvc._createCertificateWork(type, {
                customer_id,
                items          : certItems,
                status         : 'IN_PROGRESS',
                mode_of_payment,
                gst            : cert.gst            ?? false,
                gst_bill_number: cert.gst_bill_number ?? '',
                total_tax      : cert.total_tax       ?? 0,
            }, ts);
        }

        // Step 4: Ledger charge — inside same transaction, no try/catch here
        // If this throws, steps 1-3 also roll back
        let ledgerEntry = null;
        if (post_ledger && certificate && certificate.totals.grand_total > 0) {
            const cap  = type.charAt(0).toUpperCase() + type.slice(1);
            const desc = `${cap} Certificate ${certificate.auto_number} — lab charges`;

            ledgerEntry = ledgerSvc._appendEntryWork(type, {
                customer_id,
                amount             : certificate.totals.grand_total,
                entry_type         : 'DEBIT',
                description        : desc,
                mode_of_payment,
                post_cash_register : false,
            });
        }

        return { test: { id: testId, status: 'DONE' }, certificate, ledger: ledgerEntry };
    });

    try {
        const result = _txn();
        audit.commit('testService.completeTest', {
            testId,
            type,
            certId     : result.certificate?.id,
            auto_number: result.certificate?.auto_number,
            total      : result.certificate?.totals?.grand_total,
            ledger_id  : result.ledger?.id,
        });
        if (result.certificate) {
            audit.sequence('testService.completeTest', result.certificate.auto_number, type, result.certificate.id);
        }
        audit.statusChange('testService.completeTest', testId, testRow.status, 'DONE');
        return result;
    } catch (err) {
        audit.rollback('testService.completeTest', err, { type, testId });
        rethrow(err, 'testService.completeTest', { type, testId });
    }
}

// ─── STATUS UPDATE ────────────────────────────────────────────────────────────

function updateStatus(type, id, newStatus) {
    const c       = _cfg(type);
    const current = db.prepare(
        `SELECT status FROM ${c.parentTable} WHERE id = ? AND deletedon IS NULL`
    ).get(id);

    if (!current) throw new BusinessError(`${type} test not found`, ERR.TEST_NOT_FOUND, 404);
    _assertStatusMove(current.status, newStatus);  // validates before transaction

    audit.start('testService.updateStatus', { type, id, newStatus });

    const ts     = now();
    const sets   = ['status = ?', 'lastmodified = ?'];
    const values = [newStatus, ts];
    if (newStatus === 'IN_PROGRESS') { sets.push('in_progress_at = COALESCE(in_progress_at, ?)'); values.push(ts); }
    if (newStatus === 'DONE')        { sets.push('done_at = COALESCE(done_at, ?)');                values.push(ts); }
    values.push(id);

    try {
        const result = db.prepare(
            `UPDATE ${c.parentTable} SET ${sets.join(', ')} WHERE id = ? AND deletedon IS NULL`
        ).run(...values);
        audit.commit('testService.updateStatus', { id, type, from: current.status, to: newStatus });
        audit.statusChange('testService.updateStatus', id, current.status, newStatus);
        return result;
    } catch (err) {
        audit.rollback('testService.updateStatus', err, { type, id, newStatus });
        rethrow(err, 'testService.updateStatus', { type, id });
    }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

function deleteTest(type, id) {
    const c   = _cfg(type);
    const row = db.prepare(
        `SELECT status FROM ${c.parentTable} WHERE id = ? AND deletedon IS NULL`
    ).get(id);

    if (!row) throw new BusinessError(`${type} test not found`, ERR.TEST_NOT_FOUND, 404);
    if (row.status === 'IN_PROGRESS') {
        throw new BusinessError('Cannot delete a test that is IN_PROGRESS', ERR.CANNOT_DELETE, 409);
    }

    audit.start('testService.deleteTest', { type, id });

    const _txn = transaction(() => {
        const ts = now();
        db.prepare(`UPDATE ${c.parentTable} SET deletedon = ?, lastmodified = ? WHERE id = ?`).run(ts, ts, id);
        db.prepare(`UPDATE ${c.itemTable}   SET deletedon = ? WHERE ${c.fkColumn} = ?`).run(ts, id);
        return { success: true };
    });

    try {
        const result = _txn();
        audit.commit('testService.deleteTest', { id, type });
        return result;
    } catch (err) {
        audit.rollback('testService.deleteTest', err, { type, id });
        rethrow(err, 'testService.deleteTest', { type, id });
    }
}

// ─── READ ─────────────────────────────────────────────────────────────────────

function getTest(type, id) {
    const c = _cfg(type);
    const test = db.prepare(`
        SELECT t.*, t.created AS created_at, cu.name AS customer_name, cu.phone AS customer_phone
        FROM ${c.parentTable} t
        JOIN customer cu ON t.customer_id = cu.id
        WHERE t.id = ? AND t.deletedon IS NULL
    `).get(id);
    if (!test) return null;

    const items = db.prepare(`
        SELECT * FROM ${c.itemTable}
        WHERE ${c.fkColumn} = ? AND deletedon IS NULL ORDER BY item_number ASC
    `).all(id);

    return { ...test, items };
}

function listTests(type, filters = {}) {
    const c         = _cfg(type);
    const alias     = type === 'gold' ? 'gt' : 'st';
    const itemAlias = type === 'gold' ? 'gti' : 'sti';
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
            OR EXISTS (SELECT 1 FROM ${c.itemTable} ${itemAlias}
                       WHERE ${itemAlias}.${c.fkColumn} = ${alias}.id AND ${itemAlias}.item_number LIKE ?))`,
            s, s, s, s);
    }

    listQ += ` ORDER BY ${alias}.created DESC LIMIT ? OFFSET ?`;
    listP.push(limit, offset);

    const tests     = db.prepare(listQ).all(...listP);
    const { total } = db.prepare(countQ).get(...countP);
    return { tests, total, pages: Math.ceil(total / limit) };
}

function splitToCertAndNonCert(type, id) {
    const test = getTest(type, id);
    if (!test) throw new BusinessError(`${type} test not found`, ERR.TEST_NOT_FOUND, 404);
    if (test.status !== 'DONE') {
        throw new BusinessError('Test must be DONE before splitting', ERR.STATUS_INVALID, 409);
    }

    const threshold = HALLMARK_THRESHOLD[type];
    const cert      = [];
    const nonCert   = [];

    for (const item of test.items) {
        ((!item.returned && parseFloat(item.purity) >= threshold) ? cert : nonCert).push(item);
    }

    return { cert, nonCert, test };
}

function getStats(type, startDate, endDate) {
    const c      = _cfg(type);
    const params = [];
    let q = `
        SELECT COUNT(*) AS total_tests, SUM(t.total) AS total_amount,
            SUM((SELECT SUM(test_weight) FROM ${c.itemTable}
                 WHERE ${c.fkColumn} = t.id AND deletedon IS NULL)) AS total_weight,
            AVG((SELECT AVG(purity) FROM ${c.itemTable}
                 WHERE ${c.fkColumn} = t.id AND deletedon IS NULL)) AS avg_purity,
            COUNT(CASE WHEN t.status = 'TODO'        THEN 1 END) AS pending,
            COUNT(CASE WHEN t.status = 'IN_PROGRESS' THEN 1 END) AS in_progress,
            COUNT(CASE WHEN t.status = 'DONE'        THEN 1 END) AS completed
        FROM ${c.parentTable} t WHERE t.deletedon IS NULL
    `;
    if (startDate) { q += ' AND DATE(t.created) >= DATE(?)'; params.push(startDate); }
    if (endDate)   { q += ' AND DATE(t.created) <= DATE(?)'; params.push(endDate); }
    return db.prepare(q).get(...params);
}

module.exports = {
    createTest,
    getTest,
    listTests,
    updateStatus,
    saveResults,
    finalizeTest,
    completeTest,
    deleteTest,
    splitToCertAndNonCert,
    getStats,
    HALLMARK_THRESHOLD,
};
