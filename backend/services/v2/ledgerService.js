'use strict';

/**
 * ledgerService.js  —  v2 (hardened)
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGES IN THIS VERSION
 *   1. All validation runs BEFORE the transaction opens; throws BusinessError.
 *   2. _appendEntryWork is composable bare-DB (no own transaction).
 *   3. appendEntry wraps it in its own transaction + audit START/COMMIT/ROLLBACK.
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
function _appendEntryWork(source_type, opts) {
    const {
        customer_id,
        amount,
        entry_type,
        description,
        mode_of_payment    = 'Cash',
        weight             = 0,
        post_cash_register = false,
    } = opts;

    const weight_type = WEIGHT_TYPE_MAP[source_type] ?? WeightType.NONE;
    const id          = genId('CHS');
    const timestamp   = now();

    // 1. Insert ledger row
    db.prepare(`
        INSERT INTO credit_history
          (id, customer_id, amount, weight, weight_type, type, mode_of_payment, description, created)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, customer_id, amount, weight, weight_type, entry_type, mode_of_payment, description, timestamp);

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
 * Standalone ledger write with its own transaction.
 * Validation runs BEFORE the transaction opens.
 * Any error → rollback + rethrow annotated.
 *
 * @param {'gold'|'silver'|'cash'} source_type
 * @param {Object} opts  – see _appendEntryWork
 * @returns {Object}
 */
function appendEntry(source_type, opts) {
    // ── Validate BEFORE the transaction ────────────────────────────────────
    _validateAppendEntry(source_type, opts);
    audit.validate('ledgerService.appendEntry', {
        source_type,
        customer_id: opts.customer_id,
        entry_type : opts.entry_type,
        amount     : opts.amount,
    });

    audit.start('ledgerService.appendEntry', { source_type, customer_id: opts.customer_id });

    const _txn = transaction(() => _appendEntryWork(source_type, opts));
    try {
        const result = _txn();
        audit.commit('ledgerService.appendEntry', {
            id          : result.id,
            customer_id : result.customer_id,
            type        : result.type,
            amount      : result.amount,
            new_balance : result.new_balance,
        });
        return result;
    } catch (err) {
        audit.rollback('ledgerService.appendEntry', err, { source_type, customer_id: opts.customer_id });
        rethrow(err, 'ledgerService.appendEntry', { source_type });
    }
}

/**
 * Charge customer for a service (DEBIT — increases outstanding balance).
 */
function chargeCustomer(source_type, customer_id, amount, description, mode_of_payment = 'Cash') {
    return appendEntry(source_type, {
        customer_id,
        amount,
        entry_type         : EntryType.DEBIT,
        description,
        mode_of_payment,
        post_cash_register : false,
    });
}

/**
 * Record a payment received (CREDIT — reduces outstanding balance).
 */
function recordPayment(source_type, customer_id, amount, mode_of_payment = 'Cash', description = 'Payment received') {
    return appendEntry(source_type, {
        customer_id,
        amount,
        entry_type         : EntryType.CREDIT,
        description,
        mode_of_payment,
        post_cash_register : (mode_of_payment === 'Cash'),
    });
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
    appendEntry,
    chargeCustomer,
    recordPayment,
    getHistory,
    getBalanceSummary,
    // Composable bare-DB (for outer transactions)
    _appendEntryWork,
    _validateAppendEntry,
    EntryType,
    WeightType,
};
