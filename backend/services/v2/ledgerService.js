'use strict';

/**
 * ledgerService.js  —  v2 (hardened)
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGES IN THIS VERSION
 *   1. All validation runs BEFORE the transaction opens; throws BusinessError.
 *   2. _recordTransaction is composable bare-DB (no own transaction) and remains PRIVATE.
 *   4. rethrow() converts unknown errors to SystemError.
 *   5. No silent failures anywhere.
 */

const { db, genId, now, transaction } = require('../../db/db');
const { BusinessError, SystemError, ERR, rethrow } = require('./errors');
const audit = require('./auditLogger');

// ─── Constants ────────────────────────────────────────────────────────────────
const EntryType    = Object.freeze({ DEBIT: 'DEBIT', CREDIT: 'CREDIT' });
const WeightType   = Object.freeze({ GOLD: 'GOLD', SILVER: 'SILVER', NONE: 'NONE' });
const WEIGHT_TYPE_MAP = Object.freeze({
    gold  : WeightType.GOLD,
    silver: WeightType.SILVER,
    cash  : WeightType.NONE,
});

// ─── Pre-transaction validation ───────────────────────────────────────────────

/**
 * Validate all ledger inputs BEFORE a transaction opens.
 * Throws BusinessError immediately on any violation.
 *
 * @param {string} source_type
 * @param {Object} opts
 * @throws {BusinessError}
 */
function _validateAppendEntry(source_type, opts) {
    const { customer_id, amount, entry_type, description } = opts;

    if (!customer_id || typeof customer_id !== 'string' || !customer_id.trim()) {
        throw new BusinessError('customer_id is required', ERR.MISSING_FIELD, 400);
    }
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
        throw new BusinessError(
            `amount must be a non-negative number, got ${amount}`,
            ERR.INVALID_AMOUNT, 422
        );
    }
    if (!EntryType[entry_type]) {
        throw new BusinessError(
            `entry_type must be DEBIT or CREDIT, got "${entry_type}"`,
            ERR.VALIDATION, 422
        );
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
        throw new BusinessError('description is required', ERR.MISSING_FIELD, 400);
    }
    if (!WEIGHT_TYPE_MAP[source_type]) {
        throw new BusinessError(
            `source_type must be 'gold', 'silver', or 'cash', got "${source_type}"`,
            ERR.INVALID_TYPE, 400
        );
    }
}

// ─── Bare-DB balance roll-ups ─────────────────────────────────────────────────
// No own transaction — must be called inside an active transaction.

function _rollupBalance(customer_id) {
    const agg = db.prepare(`
        SELECT
            COALESCE(SUM(CASE WHEN type = 'DEBIT'  THEN amount ELSE 0 END), 0) AS total_debit,
            COALESCE(SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END), 0) AS total_credit
        FROM credit_history
        WHERE customer_id = ?
    `).get(customer_id);

    const newBalance = agg.total_debit - agg.total_credit;
    const result = db.prepare(
        'UPDATE customer SET balance = ?, lastmodified = ? WHERE id = ?'
    ).run(newBalance, now(), customer_id);

    if (result.changes === 0) {
        throw new SystemError(
            `Balance roll-up: customer ${customer_id} not found during UPDATE`,
            null, { customer_id }
        );
    }
    return newBalance;
}

function _rollupWeightBalance(customer_id, source_type) {
    const wt = WEIGHT_TYPE_MAP[source_type];
    if (!wt || wt === WeightType.NONE) return 0;

    const agg = db.prepare(`
        SELECT
            COALESCE(SUM(CASE WHEN type = 'DEBIT'  THEN weight ELSE 0 END), 0) AS total_debit_w,
            COALESCE(SUM(CASE WHEN type = 'CREDIT' THEN weight ELSE 0 END), 0) AS total_credit_w
        FROM credit_history
        WHERE customer_id = ? AND weight_type = ?
    `).get(customer_id, wt);

    const newWeightBalance = agg.total_debit_w - agg.total_credit_w;
    const column = source_type === 'gold' ? 'gold_weight_balance' : 'silver_weight_balance';
    db.prepare(`UPDATE customer SET ${column} = ?, lastmodified = ? WHERE id = ?`)
      .run(newWeightBalance, now(), customer_id);

    return newWeightBalance;
}

// ─── Composable bare-DB core ──────────────────────────────────────────────────

/**
 * Execute ledger INSERT + balance roll-ups with NO own transaction wrapper.
 * Must be called inside an active db.transaction().
 *
 * Validation is NOT repeated here — caller must call _validateAppendEntry first.
 * Any DB error propagates immediately; the outer transaction rolls back.
 *
 * @param {'gold'|'silver'|'cash'} source_type
 * @param {Object} opts
 * @returns {Object} – ledger row + computed balances
 */
function _recordTransaction(source_type, opts, tx = db) {
    const {
        customer_id,
        amount,
        entry_type,
        description,
        mode_of_payment    = 'Cash',
        weight             = 0,
        post_cash_register = false,
        reference_type     = null,
        reference_id       = null,
    } = opts;

    const weight_type = WEIGHT_TYPE_MAP[source_type] ?? WeightType.NONE;
    const id          = genId('CHS');
    const timestamp   = now();

    // 1. Insert ledger row
    tx.prepare(`
        INSERT INTO credit_history
          (id, customer_id, amount, weight, weight_type, type, mode_of_payment, description, reference_type, reference_id, created)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, customer_id, amount, weight, weight_type, entry_type, mode_of_payment, description, reference_type, reference_id, timestamp);

    // 2. Roll-up money balance (throws SystemError if customer vanished)
    const new_balance = _rollupBalance(customer_id);

    // 3. Roll-up weight balance
    let new_weight_balance = null;
    if (source_type !== 'cash') {
        new_weight_balance = _rollupWeightBalance(customer_id, source_type);
    }

    // 4. Cash register
    if (post_cash_register && amount > 0) {
        const cashType = entry_type === 'DEBIT' ? 'IN' : 'OUT';
        db.prepare(
            'INSERT INTO cash_register (date, type, amount, description, created_at) VALUES (?, ?, ?, ?, ?)'
        ).run(timestamp, cashType, amount, description, timestamp);
    }

    return {
        id, customer_id, amount, weight, weight_type,
        type            : entry_type,
        mode_of_payment,
        description,
        created         : timestamp,
        new_balance,
        new_weight_balance,
    };
}

// ─── Public standalone API ────────────────────────────────────────────────────

/**
 * Encapsulated revenue recording logic (SOLE PUBLIC ENTRY POINT FOR CASH-FLOW).
 * Ensures the DEBIT liability is tracked, and immediately offsets it with a CREDIT if payment is instantaneous.
 */
function recordRevenue(source_type, opts, tx = db) {
    if (!opts.reference_type || !['gold_test', 'silver_test', 'gold_certificate', 'silver_certificate', 'photo_certificate'].includes(opts.reference_type)) {
        throw new BusinessError('Invalid or missing reference_type. Must be a TEST or CERT.', ERR.VALIDATION, 400);
    }

    if (opts.reference_id && !opts.skip_status_check) {
        const row = tx.prepare(`SELECT status FROM ${opts.reference_type} WHERE id = ?`).get(opts.reference_id);
        if (row && row.status !== 'DONE') {
            throw new BusinessError(`recordRevenue cross-check failed: source record ${opts.reference_id} must be DONE, but is ${row.status}`, ERR.VALIDATION, 409);
        }
    }

    _validateAppendEntry(source_type, opts);

    // We execute the DEBIT for the charge always
    const debitOpt = { ...opts, entry_type: EntryType.DEBIT, post_cash_register: false };
    const debitEntry = _recordTransaction(source_type, debitOpt, tx);

    // If payment mode is not Balance, record the immediate receipt of payment (Revenue)
    let creditEntry = null;
    if (opts.mode_of_payment && opts.mode_of_payment !== 'Balance' && opts.amount > 0) {
        const creditOpt = {
            ...opts,
            entry_type: EntryType.CREDIT,
            description: `Payment for ${opts.description}`,
            post_cash_register: (opts.mode_of_payment === 'Cash')
        };
        creditEntry = _recordTransaction(source_type, creditOpt, tx);
    }
    
    return { debit: debitEntry, credit: creditEntry };
}

// ─── Read-only helpers ────────────────────────────────────────────────────────

function getHistory(customer_id, limit = 50, offset = 0) {
    if (!customer_id) throw new BusinessError('customer_id is required', ERR.MISSING_FIELD, 400);
    return db.prepare(
        'SELECT * FROM credit_history WHERE customer_id = ? ORDER BY created DESC LIMIT ? OFFSET ?'
    ).all(customer_id, limit, offset);
}

function getBalanceSummary(customer_id) {
    if (!customer_id) throw new BusinessError('customer_id is required', ERR.MISSING_FIELD, 400);
    const row = db.prepare(
        'SELECT balance, gold_weight_balance, silver_weight_balance FROM customer WHERE id = ?'
    ).get(customer_id);
    if (!row) throw new BusinessError(`Customer not found: ${customer_id}`, ERR.CUSTOMER_NOT_FOUND, 404);
    return row;
}

module.exports = {
    recordRevenue,
    getHistory,
    getBalanceSummary,
    _validateAppendEntry,
    EntryType,
    WeightType,
};
