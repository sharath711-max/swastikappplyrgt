'use strict';

/**
 * ledgerService.js  —  v2 (customer-centric)
 * ─────────────────────────────────────────────────────────────────────────────
 * CH (credit_history) is now strictly customer-centric — no workflow back-
 * references. Idempotency for cert charges lives on the certificate row
 * itself via gold_certificate.ledger_charged_at (atomic UPDATE gate).
 *
 * Public surface:
 *   recordRevenue(...)        — DEBIT (and matching CREDIT for non-Balance pay)
 *                               No idempotency. Caller must guarantee one call
 *                               per logical event (use chargeCertificate for
 *                               cert flows).
 *   chargeCertificate(...)    — atomic, idempotent revenue recording for
 *                               certificates. UPDATE cert.ledger_charged_at
 *                               WHERE NULL is the gate; second call is a no-op.
 *   getHistory / getBalanceSummary  — read-only.
 */

const { db, genId, now } = require('../../db/db');
const { BusinessError, SystemError, ERR } = require('./errors');
const seqSvc = require('./sequenceService');

// ─── Constants ────────────────────────────────────────────────────────────────
const EntryType    = Object.freeze({ DEBIT: 'DEBIT', CREDIT: 'CREDIT' });

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
    if (!['gold', 'silver', 'photo', 'cash'].includes(source_type)) {
        throw new BusinessError(
            `source_type must be 'gold', 'silver', 'photo', or 'cash', got "${source_type}"`,
            ERR.INVALID_TYPE, 400
        );
    }
}

// ─── Bare-DB balance roll-ups ─────────────────────────────────────────────────
// No own transaction — must be called inside an active transaction.

function _rollupBalance(customer_id) {
    // Soft-deleted CH rows are excluded — balance reflects active history only.
    const agg = db.prepare(`
        SELECT
            COALESCE(SUM(CASE WHEN type = 'DEBIT'  THEN amount ELSE 0 END), 0) AS total_debit,
            COALESCE(SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END), 0) AS total_credit
        FROM credit_history
        WHERE customer_id = ?
          AND deletedon IS NULL
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



// ─── Composable bare-DB core ──────────────────────────────────────────────────

/**
 * Execute ledger INSERT + balance roll-ups with NO own transaction wrapper.
 * Must be called inside an active db.transaction().
 *
 * Validation is NOT repeated here — caller must call _validateAppendEntry first.
 * Any DB error propagates immediately; the outer transaction rolls back.
 *
 * @param {'gold'|'silver'|'photo'|'cash'} source_type
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
        post_cash_register = false,
    } = opts;

    const id        = genId('CHS');
    const autoNumber = seqSvc.generateTechnicalAutoNumber('CH');
    const timestamp = now();

    // 1. Insert ledger row — customer-centric only. No workflow back-references.
    tx.prepare(`
        INSERT INTO credit_history
          (id, auto_number, customer_id, amount, type, mode_of_payment, description, created)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, autoNumber, customer_id, amount, entry_type, mode_of_payment, description, timestamp);

    // 2. Roll-up money balance (throws SystemError if customer vanished)
    const new_balance = _rollupBalance(customer_id);

    // 3. Cash register
    if (post_cash_register && amount > 0) {
        const cashType = entry_type === 'DEBIT' ? 'IN' : 'OUT';
        const cashAutoNumber = seqSvc.generateTechnicalAutoNumber('CR');
        db.prepare(
            'INSERT INTO cash_register (auto_number, date, type, amount, description, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(cashAutoNumber, timestamp, cashType, amount, description, timestamp);
    }

    return {
        id, auto_number: autoNumber, customer_id, amount,
        type            : entry_type,
        mode_of_payment,
        description,
        created         : timestamp,
        new_balance,
    };
}

// ─── Public standalone API ────────────────────────────────────────────────────

/**
 * Encapsulated revenue recording logic (SOLE PUBLIC ENTRY POINT FOR CASH-FLOW).
 * Ensures the DEBIT liability is tracked, and immediately offsets it with a CREDIT if payment is instantaneous.
 */
function recordRevenue(source_type, opts, tx = db) {
    _validateAppendEntry(source_type, opts);

    // DEBIT: liability incurred
    const debitOpt = { ...opts, entry_type: EntryType.DEBIT, post_cash_register: false };
    const debitEntry = _recordTransaction(source_type, debitOpt, tx);

    // CREDIT: payment received (only when mode ≠ Balance, since Balance defers payment)
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

// ─── chargeCertificate — atomic, idempotent revenue recording ────────────────
//
// Replaces the legacy alreadyCharged-then-recordRevenue pattern. The cert row's
// ledger_charged_at column is the gate:
//   • UPDATE … SET ledger_charged_at = now WHERE id = ? AND ledger_charged_at IS NULL
//   • changes() === 1 → first call wins, proceed to record revenue
//   • changes() === 0 → already charged (or row vanished); return { alreadyCharged: true }
//
// Must be called inside an active transaction (composable bare-DB).
//
// @param {'gold'|'silver'|'photo'} certType
// @param {Object} opts — { cert_id, customer_id, amount, mode_of_payment, description }
// @param {DbHandle} [tx=db]
// @returns {{ alreadyCharged: boolean, debit?, credit? }}
const CERT_TABLE_BY_TYPE = Object.freeze({
    gold:   'gold_certificate',
    silver: 'silver_certificate',
    photo:  'photo_certificate',
});

function chargeCertificate(certType, opts, tx = db) {
    const certTable = CERT_TABLE_BY_TYPE[certType];
    if (!certTable) {
        throw new BusinessError(
            `chargeCertificate: certType must be gold/silver/photo, got "${certType}"`,
            ERR.INVALID_TYPE, 400
        );
    }
    if (!opts.cert_id || typeof opts.cert_id !== 'string') {
        throw new BusinessError('chargeCertificate: cert_id is required', ERR.MISSING_FIELD, 400);
    }

    // certType ('gold'|'silver'|'photo') flows through unchanged.
    // Photo Certificate is its own domain category — it is NOT a gold subtype.
    // The validator accepts 'photo' as a first-class source_type.
    const sourceType = certType;
    _validateAppendEntry(sourceType, opts);

    const timestamp = now();

    // ── Atomic gate: only the first call succeeds ────────────────────────────
    const gate = tx.prepare(
        `UPDATE ${certTable}
            SET ledger_charged_at = ?, lastmodified = ?
          WHERE id = ?
            AND ledger_charged_at IS NULL
            AND deletedon IS NULL`
    ).run(timestamp, timestamp, opts.cert_id);

    if (gate.changes === 0) {
        // Either already charged (idempotent no-op) or cert doesn't exist
        const exists = tx.prepare(`SELECT 1 FROM ${certTable} WHERE id = ?`).get(opts.cert_id);
        if (!exists) {
            throw new BusinessError(
                `chargeCertificate: ${certTable} ${opts.cert_id} not found`,
                ERR.NOT_FOUND, 404
            );
        }
        return { alreadyCharged: true, debit: null, credit: null };
    }

    // ── Gate won — record DEBIT (and CREDIT for non-Balance payments) ────────
    const debitOpt   = { ...opts, entry_type: EntryType.DEBIT, post_cash_register: false };
    const debitEntry = _recordTransaction(sourceType, debitOpt, tx);

    let creditEntry = null;
    if (opts.mode_of_payment && opts.mode_of_payment !== 'Balance' && opts.amount > 0) {
        const creditOpt = {
            ...opts,
            entry_type: EntryType.CREDIT,
            description: `Payment for ${opts.description}`,
            post_cash_register: (opts.mode_of_payment === 'Cash'),
        };
        creditEntry = _recordTransaction(sourceType, creditOpt, tx);
    }

    return { alreadyCharged: false, debit: debitEntry, credit: creditEntry };
}

// ─── Read-only helpers ────────────────────────────────────────────────────────

function getHistory(customer_id, limit = 50, offset = 0) {
    if (!customer_id) throw new BusinessError('customer_id is required', ERR.MISSING_FIELD, 400);
    return db.prepare(
        'SELECT * FROM credit_history WHERE customer_id = ? AND deletedon IS NULL ORDER BY created DESC LIMIT ? OFFSET ?'
    ).all(customer_id, limit, offset);
}

function getBalanceSummary(customer_id) {
    if (!customer_id) throw new BusinessError('customer_id is required', ERR.MISSING_FIELD, 400);
    const row = db.prepare(
        'SELECT balance FROM customer WHERE id = ?'
    ).get(customer_id);
    if (!row) throw new BusinessError(`Customer not found: ${customer_id}`, ERR.CUSTOMER_NOT_FOUND, 404);
    return row;
}

module.exports = {
    recordRevenue,
    chargeCertificate,
    getHistory,
    getBalanceSummary,
    _validateAppendEntry,
    EntryType,
};
