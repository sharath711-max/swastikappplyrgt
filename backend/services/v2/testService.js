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

const { db, genId, now, transaction, readCachedResult } = require('../../db/db');
const { getRequestId } = require('../../utils/audit');
const { BusinessError, SystemError, ERR, rethrow } = require('./errors');
const audit      = require('./auditLogger');
const socket     = require('../../socket');
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

        // Persist operator cert-eligibility override alongside purity
        const certRequired = raw.certificate_required !== undefined
            ? (raw.certificate_required ? 1 : 0)
            : current.certificate_required ?? 0;

        db.prepare(`
            UPDATE ${c.itemTable}
            SET purity = ?, returned = ?, fine_weight = ?, item_total = ?,
                certificate_required = ?, lastmodified = ?
            WHERE id = ? AND ${c.fkColumn} = ? AND deletedon IS NULL
        `).run(
            calc.purity, calc.returned ? 1 : 0,
            calc.fine_weight, calc.item_total,
            certRequired, ts, raw.id, testId
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
            'INSERT INTO weight_loss_history (id, customer_id, amount, reason, mode_of_payment, ref_id, created) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(genId('WLH'), row.customer_id, weight_loss, `${type} test finalization: ${testId}`, mode_of_payment || null, testId, ts);
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
        const autoNumber = seqSvc._generateGlobalSequenceWork(type, { context: 'TEST' });

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
        socket.emit(`${type}_test`, 'item:added', { id: result.id, auto_number: result.auto_number, type });
        socket.emit('workflow',     'item:added', { id: result.id, type });
        return result;
    } catch (err) {
        audit.rollback('testService.createTest', err, { type, customer_id });
        rethrow(err, 'testService.createTest', { type, customer_id });
    }
}

// ─── SAVE RESULTS ─────────────────────────────────────────────────────────────

function saveTestDraft(type, id, data) {
    // ── Validate BEFORE transaction ─────────────────────────────────────────
    _validateSaveResults(type, id, data);
    audit.validate('testService.saveTestDraft', { type, id, item_count: (data.items ?? []).length });

    const c = _cfg(type);
    const { items = [], mode_of_payment, total } = data;

    audit.start('testService.saveTestDraft', { type, id });

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

            // Also persist operator cert-override during draft save
            const certRequired = raw.certificate_required !== undefined
                ? (raw.certificate_required ? 1 : 0)
                : current.certificate_required ?? 0;

            db.prepare(`
                UPDATE ${c.itemTable}
                SET purity = ?, returned = ?, fine_weight = ?, item_total = ?,
                    test_weight = ?, net_weight = ?, certificate_required = ?, lastmodified = ?
                WHERE id = ? AND ${c.fkColumn} = ? AND deletedon IS NULL
            `).run(
                calc.purity, calc.returned ? 1 : 0, calc.fine_weight, calc.item_total,
                calc.test_weight, calc.net_weight, certRequired, ts,
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

        // Auto-advance to IN_PROGRESS (PENDING draft state)
        const curr = db.prepare(`SELECT status FROM ${c.parentTable} WHERE id = ?`).get(id);
        if (curr && curr.status === 'TODO') {
            db.prepare(`
                UPDATE ${c.parentTable}
                SET status = 'IN_PROGRESS', in_progress_at = COALESCE(in_progress_at, ?)
                WHERE id = ?
            `).run(ts, id);
            audit.statusChange('testService.saveTestDraft', id, 'TODO', 'IN_PROGRESS');
        }

        return { success: true };
    });

    try {
        const result = _txn();
        audit.commit('testService.saveTestDraft', { id, type });
        return result;
    } catch (err) {
        audit.rollback('testService.saveTestDraft', err, { type, id });
        rethrow(err, 'testService.saveTestDraft', { type, id });
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
    // ── GATE 0: Field-only validation (pure, no DB reads) ──────────────────
    _validateCompleteTest(type, testId, data);

    // ── GATE 1: Idempotency — ABSOLUTE ENTRY GATE ─────────────────────────
    const reqId = getRequestId();
    if (reqId) {
        const cached = readCachedResult(reqId);
        if (cached !== null) {
            audit.info('testService.completeTest', { event: 'IDEMPOTENT_HIT', type, testId, reqId });
            return { ...cached, _idempotent: true };
        }
    }

    const c = _cfg(type);

    // ── GATE 2: Business-state validation (now safe — not a duplicate) ────
    const testRow = db.prepare(
        `SELECT status, customer_id FROM ${c.parentTable} WHERE id = ? AND deletedon IS NULL`
    ).get(testId);

    if (!testRow) {
        throw new BusinessError(`${type} test not found: ${testId}`, ERR.TEST_NOT_FOUND, 404);
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
        // Check status inside transaction
        const current = db.prepare(`SELECT status FROM ${c.parentTable} WHERE id = ?`).get(testId);
        if (current.status === 'DONE') {
            throw new BusinessError(`Test ${testId} is already DONE`, ERR.IMMUTABLE, 409);
        }

        const tx = db; // architecture requirement
        const ts              = now();
        const { customer_id } = testRow;

        // Step 1: Finalize items
        _finalizeItemsWork(type, testId, items, ts);

        // Fetch fresh state post-update
        const finalItems = db.prepare(
            `SELECT * FROM ${c.itemTable} WHERE ${c.fkColumn} = ? AND deletedon IS NULL`
        ).all(testId);

        if (!finalItems || finalItems.length === 0) {
            throw new BusinessError(`Test must contain at least one item to be finalized.`, ERR.VALIDATION, 422);
        }

        for (const item of finalItems) {
            if (item.gross_weight <= 0) {
                throw new BusinessError(`Item ${item.item_number} has an invalid gross weight.`, ERR.VALIDATION, 422);
            }
            if (item.purity < 0 || item.purity > 100) {
                throw new BusinessError(`Item ${item.item_number} has purity out of bounds (0-100).`, ERR.VALIDATION, 422);
            }
            if (item.purity === 0 && !item.returned) {
                throw new BusinessError(`Item ${item.item_number} must have a valid purity entered, or be marked as returned.`, ERR.VALIDATION, 422);
            }
        }

        const threshold = HALLMARK_THRESHOLD[type];

        // BUSINESS_LOGIC_PIVOT: Operator override (certificate_required=1) takes precedence over auto purity rule
        const certItems = finalItems.filter(item => {
            if (item.returned) return false;
            // Explicit operator selection wins
            if (item.certificate_required === 1) return true;
            if (item.certificate_required === 0) return false;
            // Fallback: auto-suggest based on purity threshold
            return parseFloat(item.purity) >= threshold;
        });
        const nonCertItems = finalItems.filter(item => !certItems.includes(item));
        
        const isFullConvert = (certItems.length > 0 && nonCertItems.length === 0);

        if (isFullConvert) {
            // IF 100% Cert: Mark DONE first (needed by ledger cross-check), then clean up staging rows
            _markTestDoneWork(type, testId, mode_of_payment, weight_loss, ts);
            db.prepare(`DELETE FROM ${c.itemTable} WHERE ${c.fkColumn} = ?`).run(testId);
            db.prepare(`DELETE FROM ${c.parentTable} WHERE id = ?`).run(testId);
        } else {
            // IF Mixed or NO_CONVERT: UPDATE parent Test to status='DONE'
            _markTestDoneWork(type, testId, mode_of_payment, weight_loss, ts);
        }

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
            }, ts, tx);
        }

        // Step 4: Ledger charge (Split Bill Logic)
        const TEST_FEE_RATE = 150;
        const CERT_FEE_RATE = 50;
        
        let testFeeTotal = TEST_FEE_RATE * finalItems.length;
        let certFeeTotal = certificate ? (CERT_FEE_RATE * certItems.length) : 0;
        
        // GST Calculation (Inclusive)
        const applyGst = cert.gst ?? false;
        
        let testTax = applyGst ? (testFeeTotal - (testFeeTotal / 1.18)) : 0;
        let certTax = applyGst ? (certFeeTotal - (certFeeTotal / 1.18)) : 0;

        // Update Test Parent with calculated amount ONLY if it wasn't deleted
        if (!isFullConvert) {
            db.prepare(
                `UPDATE ${c.parentTable} SET total = ?, total_tax = ?, lastmodified = ? WHERE id = ?`
            ).run(testFeeTotal, testTax, ts, testId);
        }
        
        // Also update the cert totals to match our fixed fee if cert was created
        if (certificate) {
            db.prepare(
                `UPDATE ${type === 'gold' ? 'gold_certificate' : 'silver_certificate'} 
                 SET total = ?, total_tax = ?, lastmodified = ? WHERE id = ?`
            ).run(certFeeTotal, certTax, ts, certificate.id);
            certificate.totals.grand_total = certFeeTotal;
        }

        let ledgerEntry = null;
        let certLedgerEntry = null;

        if (post_ledger) {
            // Split Bill Logic: 1st Bill for Lab Test
            // skip_status_check=true because full-convert deletes the test row after marking DONE
            if (testFeeTotal > 0 && !isFullConvert) {
                const cap = type.charAt(0).toUpperCase() + type.slice(1);
                ledgerEntry = ledgerSvc.recordRevenue(type, {
                    customer_id,
                    amount: testFeeTotal,
                    entry_type: 'DEBIT',
                    description: `${cap} Lab Test ${testRow.auto_number} — charges`,
                    mode_of_payment,
                    post_cash_register: false,
                    reference_type: c.parentTable,
                    reference_id: testId,
                    skip_status_check: true,  // row is DONE but may have been deleted (full-convert)
                }, tx);
            }

            // Split Bill Logic: 2nd Bill for Certificate
            if (certificate && certFeeTotal > 0) {
                const cap = type.charAt(0).toUpperCase() + type.slice(1);
                certLedgerEntry = ledgerSvc.recordRevenue(type, {
                    customer_id,
                    amount: certFeeTotal,
                    entry_type: 'DEBIT',
                    description: `${cap} Certificate ${certificate.auto_number} — issuance fee`,
                    mode_of_payment,
                    post_cash_register: false,
                    reference_type: type === 'gold' ? 'gold_certificate' : 'silver_certificate',
                    reference_id: certificate.id,
                    skip_status_check: true,  // cert is IN_PROGRESS at billing time
                }, tx);
            }
        }

        const printSvc = require('./printService');
        
        if (!isFullConvert) {
            const { snapshotJson, snapshotHash, snapshotKeyVersion } = printSvc.serializeSnapshot('test', type, testId, getRequestId() || null);
            tx.prepare(`UPDATE ${c.parentTable} SET print_snapshot = ?, snapshot_hash = ?, snapshot_key_version = ? WHERE id = ?`).run(snapshotJson, snapshotHash, snapshotKeyVersion, testId);
        }
        
        if (certificate) {
            const { snapshotJson, snapshotHash, snapshotKeyVersion } = printSvc.serializeSnapshot('certificate', type, certificate.id, getRequestId() || null);
            const certTable = type === 'gold' ? 'gold_certificate' : 'silver_certificate';
            tx.prepare(`UPDATE ${certTable} SET print_snapshot = ?, snapshot_hash = ?, snapshot_key_version = ? WHERE id = ?`).run(snapshotJson, snapshotHash, snapshotKeyVersion, certificate.id);
        }

        return { test: { id: testId, status: 'DONE', total: testFeeTotal }, certificate, ledger: ledgerEntry?.debit, certLedger: certLedgerEntry?.debit };
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
        socket.emit(`${type}_test`, 'item:done', { id: testId, type });
        socket.emit('workflow',     'item:done', { id: testId, type });
        if (result.certificate) {
            socket.emit(`${type}_cert`, 'cert:created', { id: result.certificate.id, type });
            socket.emit('workflow',     'cert:created', { id: result.certificate.id, type });
        }
        // Tag as the original (non-duplicate) call
        return { ...result, _idempotent: false };
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

// ─── MANUAL CONVERT TO CERTIFICATE ───────────────────────────────────────────
// Python equivalent: PUT /:id/to-gold-certificate/
// Staff picks specific item IDs from a DONE test to move into a new certificate.
// Remaining items stay on the test. Audit logged. Atomic transaction.
function convertToCertificate(type, testId, data) {
    const c = _cfg(type);

    if (!data.item_ids || !Array.isArray(data.item_ids) || data.item_ids.length === 0)
        throw new BusinessError('item_ids array is required and cannot be empty', ERR.ITEMS_EMPTY, 422);
    if (!data.mode_of_payment)
        throw new BusinessError('mode_of_payment is required', ERR.MISSING_PAYMENT, 422);

    const testRow = db.prepare(
        `SELECT status, customer_id FROM ${c.parentTable} WHERE id = ? AND deletedon IS NULL`
    ).get(testId);

    if (!testRow)
        throw new BusinessError(`${type} test not found: ${testId}`, ERR.TEST_NOT_FOUND, 404);
    if (testRow.status !== 'DONE')
        throw new BusinessError(
            `Test ${testId} must be DONE before manual convert (current: ${testRow.status})`,
            ERR.STATUS_INVALID, 409
        );

    audit.validate('testService.convertToCertificate', { type, testId, item_count: data.item_ids.length });
    audit.start('testService.convertToCertificate', { type, testId });

    const certSvc = _getCertSvc();

    const _txn = transaction(() => {
        const ts = now();
        const { customer_id } = testRow;
        const { item_ids, mode_of_payment, gst = false, gst_bill_number = '', total_tax = 0 } = data;

        const selectedItems = item_ids.map(itemId => {
            const item = db.prepare(
                `SELECT * FROM ${c.itemTable} WHERE id = ? AND ${c.fkColumn} = ? AND deletedon IS NULL`
            ).get(itemId, testId);
            if (!item) throw new BusinessError(`Item ${itemId} not found on test ${testId}`, ERR.ITEM_NOT_FOUND, 404);
            if (item.returned) throw new BusinessError(`Item ${itemId} is returned and cannot be certified`, ERR.VALIDATION, 422);
            return item;
        });

        const certificate = certSvc._createCertificateWork(type, {
            customer_id, items: selectedItems, status: 'IN_PROGRESS',
            mode_of_payment, gst, gst_bill_number, total_tax,
        }, ts, db);

        // Soft-delete selected items from test — they now live on the certificate
        const ts2 = now();
        for (const itemId of item_ids) {
            db.prepare(
                `UPDATE ${c.itemTable} SET deletedon = ?, lastmodified = ? WHERE id = ? AND ${c.fkColumn} = ?`
            ).run(ts2, ts2, itemId, testId);
        }

        const { remaining } = db.prepare(
            `SELECT COUNT(*) AS remaining FROM ${c.itemTable} WHERE ${c.fkColumn} = ? AND deletedon IS NULL`
        ).get(testId);

        return { certificate, remaining_item_count: remaining };
    });

    try {
        const result = _txn();
        audit.commit('testService.convertToCertificate', {
            testId, type,
            certId: result.certificate?.id,
            auto_number: result.certificate?.auto_number,
            bill_number: result.certificate?.bill_number,
            remaining: result.remaining_item_count,
        });
        if (result.certificate)
            audit.sequence('testService.convertToCertificate', result.certificate.auto_number, type, result.certificate.id);
        socket.emit(`${type}_cert`, 'cert:created', { id: result.certificate?.id, type });
        socket.emit('workflow',     'cert:created', { id: result.certificate?.id, type });
        return result;
    } catch (err) {
        audit.rollback('testService.convertToCertificate', err, { type, testId });
        rethrow(err, 'testService.convertToCertificate', { type, testId });
    }
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
    saveTestDraft,
    finalizeTest,
    completeTest,
    deleteTest,
    splitToCertAndNonCert,
    convertToCertificate,
    getStats,
    HALLMARK_THRESHOLD,
};
