'use strict';

/**
 * sequenceService.js  —  v2 (hardened)
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGES IN THIS VERSION
 *   1. Atomic UPDATE … RETURNING for sequence increment (no separate read step).
 *   2. Daily reset detected and applied in one transaction before the RETURNING UPDATE.
 *   3. BusinessError / SystemError used throughout.
 *   4. Audit logging on every mint.
 *
 * TRANSACTION DESIGN
 *   generateGlobalSequence()         – own db.transaction(), safe standalone.
 *   _generateGlobalSequenceWork()    – BARE-DB (no own transaction), call from
 *                                      inside any outer transaction.  Race-safe
 *                                      because the UPDATE … RETURNING is atomic.
 *
 * SQLite version requirement: 3.35.0+ for RETURNING (bundled in better-sqlite3 ≥ 7.5).
 */

const { db, transaction, nowIST } = require('../../db/db');
const { BusinessError, SystemError, ERR, rethrow } = require('./errors');
const audit = require('./auditLogger');

// ─── Constants ────────────────────────────────────────────────────────────────
const DATE_KEY  = 'daily_last_date';
// SEQ_KEY is dynamically chosen
const ALPHA     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function _todayStr() {
    const d  = nowIST();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    return `${d.getUTCFullYear()}${mm}${dd}`;
}

/**
 * Ensure a globals row exists (INSERT OR IGNORE).
 * Bare-DB — call inside a transaction.
 */
function _ensureGlobal(key, defaultValue) {
    db.prepare(
        'INSERT OR IGNORE INTO globals (key, value, created, lastmodified) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
    ).run(key, defaultValue);
}

// ─── Core logic (bare-DB, composable) ────────────────────────────────────────

/**
 * Atomic sequence generation — bare-DB, must run inside an active transaction.
 *
 * Algorithm:
 *   1. Ensure both globals rows exist.
 *   2. If stored date ≠ today → reset seq to '0' + update date row (two UPDATEs).
 *   3. Atomic: UPDATE globals SET value=value+1 … RETURNING new value.
 *   4. Build and return the formatted auto_number.
 *
 * The RETURNING clause makes step 3 a single round-trip.  Because step 3 runs
 * inside a transaction, no two concurrent requests can read the same pre-increment
 * value — the second one blocks until the first commits.
 *
 * @param {string} [_type] – reserved for future per-type series
 * @returns {string}  e.g. "20260411-003"
 * @throws  {SystemError} if the RETURNING row is absent (table corruption)
 */
function _generateGlobalSequenceWork(_type, opts = {}) {
    const today = _todayStr();
    const isCert = opts.context === 'CERT';
    
    let SEQ_KEY;
    if (isCert) {
        SEQ_KEY = opts.isGst ? 'GST_CERT_SEQ' : 'NON_GST_CERT_SEQ';
    } else {
        SEQ_KEY = `${_type.toUpperCase()}_TEST_SEQ`;
    }

    // 1. Ensure rows exist (INSERT OR IGNORE is idempotent)
    _ensureGlobal(DATE_KEY, today);
    _ensureGlobal(SEQ_KEY,  '0');

    // 2. Daily reset: if stored date ≠ today, reset seq and stamp date
    const dateRow = db.prepare('SELECT value FROM globals WHERE key = ?').get(DATE_KEY);
    if (!dateRow || dateRow.value !== today) {
        db.prepare(
            'UPDATE globals SET value = ?, lastmodified = CURRENT_TIMESTAMP WHERE key = ?'
        ).run(today, DATE_KEY);
        // Reset ALL sequences to '0' on a new day
        db.prepare(
            `UPDATE globals SET value = '0', lastmodified = CURRENT_TIMESTAMP 
             WHERE key IN ('GST_CERT_SEQ', 'NON_GST_CERT_SEQ', 'GOLD_TEST_SEQ', 'SILVER_TEST_SEQ')`
        ).run();
    }

    // 3. Atomic increment — RETURNING gives updated value in one statement
    const row = db.prepare(`
        UPDATE globals
        SET    value        = CAST(CAST(value AS INTEGER) + 1 AS TEXT),
               lastmodified = CURRENT_TIMESTAMP
        WHERE  key = ?
        RETURNING CAST(value AS INTEGER) AS new_seq
    `).get(SEQ_KEY);

    if (!row || row.new_seq == null) {
        throw new SystemError(
            'Sequence RETURNING returned no row — globals table may be corrupted',
            null,
            { key: SEQ_KEY, type: _type }
        );
    }

    const yy = String(nowIST().getUTCFullYear()).slice(-2);
    let typePrefix;

    if (isCert) {
        typePrefix = opts.isGst ? 'G' : 'N';
    } else {
        typePrefix = _type === 'gold' ? 'GT' : 'ST';
    }
    
    // Format: G24-001 or N24-001, or GT24-001/ST24-001
    const autoNumber = `${typePrefix}${yy}-${String(row.new_seq).padStart(3, '0')}`;
    return autoNumber;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Standalone sequence generation — wraps _generateGlobalSequenceWork in its
 * own db.transaction().  Logs audit SEQUENCE event.
 *
 * @param {'gold'|'silver'} [_type]
 * @returns {string}  e.g. "20260411-003"
 */
function generateGlobalSequence(_type) {
    const _txn = transaction(() => _generateGlobalSequenceWork(_type));
    try {
        const autoNumber = _txn();
        audit.sequence('sequenceService.generateGlobalSequence', autoNumber, _type ?? 'any');
        return autoNumber;
    } catch (err) {
        rethrow(err, 'sequenceService.generateGlobalSequence', { type: _type });
    }
}

/**
 * Certificate item label.  Pure — no DB.
 * itemSeq 1 → "A001", 999 → "A999", 1000 → "B001".
 *
 * @param {number} itemSeq – 1-based
 * @returns {string}
 * @throws {BusinessError}
 */
function generateCertificateLabel(itemSeq) {
    if (!Number.isInteger(itemSeq) || itemSeq < 1) {
        throw new BusinessError(
            `generateCertificateLabel: itemSeq must be a positive integer, got ${itemSeq}`,
            ERR.VALIDATION, 422
        );
    }
    const letterIdx = Math.floor((itemSeq - 1) / 999);
    const numPart   = ((itemSeq - 1) % 999) + 1;
    if (letterIdx >= ALPHA.length) {
        throw new BusinessError(
            `generateCertificateLabel: sequence ${itemSeq} exceeds max (${ALPHA.length * 999})`,
            ERR.VALIDATION, 422
        );
    }
    return `${ALPHA[letterIdx]}${String(numPart).padStart(2, '0')}`;
}

/**
 * Test-item number string.  Pure — no DB.
 * @param {string} parentAutoNumber
 * @param {number} itemSeq – 1-based
 * @returns {string}  e.g. "20260411-003-1"
 */
function generateTestItemNumber(parentAutoNumber, itemSeq) {
    return `${parentAutoNumber}-${itemSeq}`;
}

/**
 * Peek at current sequence state without incrementing.
 * @returns {{ date: string, value: number }}
 */
function peekGlobalSequence() {
    const dateRow = db.prepare('SELECT value FROM globals WHERE key = ?').get(DATE_KEY);
    const seqRow  = db.prepare('SELECT value FROM globals WHERE key = ?').get('daily_global_seq');
    return {
        date : dateRow?.value ?? '(none)',
        value: parseInt(seqRow?.value ?? '0', 10),
    };
}

/**
 * Generate a unique GST bill number or NON-GST bill number.
 * COMPOSABLE BARE-DB — must be called inside the same transaction that inserts the certificate.
 *
 * Sequence is YEARLY (not daily). Gaps are legally acceptable; duplicates are not.
 * The UNIQUE index on gst_bill_number provides the DB-level enforcement.
 *
 * Format:  G26-0001  (GST)  |  N26-0001  (Non-GST)
 *
 * @param {boolean} isGst
 * @returns {string}
 * @throws {SystemError} if sequence row missing (table corruption)
 */
function getNextBillNumber(isGst) {
    const seqKey = isGst ? 'GST_CERT_SEQ' : 'NON_GST_CERT_SEQ';
    const prefix = isGst ? 'G' : 'N';
    const yy     = String(nowIST().getUTCFullYear()).slice(-2);

    // Ensure row exists (idempotent on first call after migration)
    db.prepare(
        'INSERT OR IGNORE INTO globals (key, value, created, lastmodified) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
    ).run(seqKey, '0');

    // Atomic increment — single round-trip, no read-before-write
    const row = db.prepare(`
        UPDATE globals
        SET    value        = CAST(CAST(value AS INTEGER) + 1 AS TEXT),
               lastmodified = CURRENT_TIMESTAMP
        WHERE  key = ?
        RETURNING CAST(value AS INTEGER) AS new_seq
    `).get(seqKey);

    if (!row || row.new_seq == null) {
        throw new SystemError(
            `getNextBillNumber: RETURNING returned no row for key ${seqKey}`,
            null, { seqKey, isGst }
        );
    }

    return `${prefix}${yy}-${String(row.new_seq).padStart(4, '0')}`;
}

module.exports = {
    generateGlobalSequence,
    generateCertificateLabel,
    generateTestItemNumber,
    peekGlobalSequence,
    getNextBillNumber,
    // Composable bare-DB exports for outer transactions
    _generateGlobalSequenceWork,
};
