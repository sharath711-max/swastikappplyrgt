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

function _timestampStr() {
    const d  = nowIST();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mi = String(d.getUTCMinutes()).padStart(2, '0');
    const ss = String(d.getUTCSeconds()).padStart(2, '0');
    return `${d.getUTCFullYear()}${mm}${dd}${hh}${mi}${ss}`;
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

    // 2. Daily reset: if stored date ≠ today, stamp the new date and reset only
    //    TEST sequences.  Certificate sequences are NOT reset daily because their
    //    auto_number values are globally UNIQUE in the DB — resetting would produce
    //    collisions with certs created on previous days.
    const dateRow = db.prepare('SELECT value FROM globals WHERE key = ?').get(DATE_KEY);
    if (!dateRow || dateRow.value !== today) {
        db.prepare(
            'UPDATE globals SET value = ?, lastmodified = CURRENT_TIMESTAMP WHERE key = ?'
        ).run(today, DATE_KEY);
        // Only reset test sequences (their auto_numbers are displayed per-day, not globally unique)
        db.prepare(
            `UPDATE globals SET value = '0', lastmodified = CURRENT_TIMESTAMP
             WHERE key IN ('GOLD_TEST_SEQ', 'SILVER_TEST_SEQ')`
        ).run();
    }

    // 3. For test sequences: self-heal if counter is behind the max existing auto_number/bill_no.
    //    This prevents UNIQUE constraint failures after a daily reset when the year-prefixed
    //    format (e.g. GT26-001) matches a record from a previous day in the same year.
    //    Crucial: limit the lookup to records created today (IST timezone) to allow daily resetting to 001.
    if (!isCert) {
        const curRow = db.prepare('SELECT CAST(value AS INTEGER) AS v FROM globals WHERE key = ?').get(SEQ_KEY);
        const cur = curRow?.v || 0;
        const yyEarly    = today.slice(2, 4);   // e.g. '26' from '20260503'
        const testTable  = _type === 'gold' ? 'gold_test'   : 'silver_test';
        const testPrefix = _type === 'gold' ? `GT${yyEarly}-` : `ST${yyEarly}-`;

        // Compute explicit today's start prefix in IST to avoid UTC midnight shift bugs
        const d = nowIST();
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');
        const todayPrefix = `${d.getUTCFullYear()}-${mm}-${dd}`;

        const maxRow = db.prepare(
            `SELECT MAX(CAST(SUBSTR(COALESCE(bill_no, auto_number), INSTR(COALESCE(bill_no, auto_number),'-')+1) AS INTEGER)) AS m
             FROM ${testTable} 
             WHERE COALESCE(bill_no, auto_number) LIKE ? 
               AND created LIKE ?`
        ).get(`${testPrefix}%`, `${todayPrefix}%`);
        
        const maxExisting = maxRow?.m || 0;
        if (maxExisting > cur) {
            db.prepare('UPDATE globals SET value = ?, lastmodified = CURRENT_TIMESTAMP WHERE key = ?')
                .run(String(maxExisting), SEQ_KEY);
        }
    }

    // 4. For cert sequences: self-heal if the counter is behind the max existing
    //    auto_number (can happen after a day-boundary reset or DB restore).
    if (isCert) {
        const curRow = db.prepare('SELECT CAST(value AS INTEGER) AS v FROM globals WHERE key = ?').get(SEQ_KEY);
        const cur = curRow?.v || 0;
        // Extract max numeric suffix from existing bill_no values (format: N26-009 or G26-009)
        const maxGold   = db.prepare(`SELECT MAX(CAST(SUBSTR(COALESCE(bill_no, auto_number), INSTR(COALESCE(bill_no, auto_number),'-')+1) AS INTEGER)) AS m FROM gold_certificate   WHERE COALESCE(bill_no, auto_number) IS NOT NULL`).get()?.m || 0;
        const maxSilver = db.prepare(`SELECT MAX(CAST(SUBSTR(COALESCE(bill_no, auto_number), INSTR(COALESCE(bill_no, auto_number),'-')+1) AS INTEGER)) AS m FROM silver_certificate WHERE COALESCE(bill_no, auto_number) IS NOT NULL`).get()?.m || 0;
        const maxExisting = Math.max(maxGold, maxSilver, 0);
        if (maxExisting > cur) {
            db.prepare('UPDATE globals SET value = ?, lastmodified = CURRENT_TIMESTAMP WHERE key = ?')
                .run(String(maxExisting), SEQ_KEY);
        }
    }

    // Atomic increment — RETURNING gives updated value in one statement
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
 *
 * SPEC (myprompt.txt — UPDATED):
 *   Format:  <LETTER><3-DIGIT NUMBER>
 *   n=1 → A001, n=999 → A999, n=1000 → B001, n=25974 → Z999
 *   n=25975 → A001 (cycle repeats)
 *
 * @param {number} itemSeq – 1-based global counter
 * @returns {string}  e.g. "A001", "B001", "Z999"
 * @throws {BusinessError} if itemSeq is not a positive integer
 */
function generateCertificateLabel(itemSeq) {
    if (!Number.isInteger(itemSeq) || itemSeq < 1) {
        throw new BusinessError(
            `generateCertificateLabel: itemSeq must be a positive integer, got ${itemSeq}`,
            ERR.VALIDATION, 422
        );
    }
    // Cycle rollover: after Z999 (n=25974), n=25975 wraps to A001
    const letterIdx = Math.floor((itemSeq - 1) / 999) % ALPHA.length;
    const numPart   = ((itemSeq - 1) % 999) + 1;
    return `${ALPHA[letterIdx]}${String(numPart).padStart(3, '0')}`;
}

/**
 * Global certificate item number — BARE-DB, must run inside a transaction.
 * Atomically increments a per-type global counter and returns the A001-Z999 label.
 *
 * Python parity: Globals.increment_by_key('gold_certificate') → to_certificate_number(n)
 *
 * Keys: GOLD_CERT_ITEM_SEQ, SILVER_CERT_ITEM_SEQ, PHOTO_CERT_ITEM_SEQ
 *
 * @param {'gold'|'silver'|'photo'} certType
 * @returns {string} e.g. "A001", "A002", ..., "B001"
 */
function getNextCertificateItemNumber(certType) {
    const SEQ_KEY = `${certType.toUpperCase()}_CERT_ITEM_SEQ`;

    // Ensure row exists
    _ensureGlobal(SEQ_KEY, '0');

    // Self-heal: seed from max existing certificate_number if counter is behind
    const tableMap = {
        gold  : 'gold_certificate_item',
        silver: 'silver_certificate_item',
        photo : 'photo_certificate_item',
    };
    const itemTable = tableMap[certType];
    if (itemTable) {
        const curRow = db.prepare('SELECT CAST(value AS INTEGER) AS v FROM globals WHERE key = ?').get(SEQ_KEY);
        const cur = curRow?.v || 0;
        // Count all existing items to find the true max
        const maxRow = db.prepare(
            `SELECT COUNT(*) AS cnt FROM ${itemTable} WHERE certificate_number IS NOT NULL AND certificate_number != ''`
        ).get();
        const maxExisting = maxRow?.cnt || 0;
        if (maxExisting > cur) {
            db.prepare('UPDATE globals SET value = ?, lastmodified = CURRENT_TIMESTAMP WHERE key = ?')
                .run(String(maxExisting), SEQ_KEY);
        }
    }

    // Atomic increment
    const row = db.prepare(`
        UPDATE globals
        SET    value        = CAST(CAST(value AS INTEGER) + 1 AS TEXT),
               lastmodified = CURRENT_TIMESTAMP
        WHERE  key = ?
        RETURNING CAST(value AS INTEGER) AS new_seq
    `).get(SEQ_KEY);

    if (!row || row.new_seq == null) {
        throw new SystemError(
            `getNextCertificateItemNumber: RETURNING returned no row for key ${SEQ_KEY}`,
            null, { SEQ_KEY, certType }
        );
    }

    return generateCertificateLabel(row.new_seq);
}

/**
 * Peek the next certificate-item label for `certType` WITHOUT incrementing.
 * Pure read — safe to call outside any transaction. Used by UI surfaces that
 * display "next certificate number" so the operator can see what will be
 * assigned to the next item created.
 *
 * @param {'gold'|'silver'|'photo'} certType
 * @returns {string} e.g. "A001", "A002", ..., "B001"
 */
function peekNextCertificateItemNumber(certType) {
    const SEQ_KEY = `${certType.toUpperCase()}_CERT_ITEM_SEQ`;
    const row = db.prepare(
        'SELECT CAST(value AS INTEGER) AS v FROM globals WHERE key = ?'
    ).get(SEQ_KEY);
    const current = row?.v ?? 0;
    return generateCertificateLabel(current + 1);
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

function generateTechnicalAutoNumber(prefix) {
    if (!prefix || typeof prefix !== 'string') {
        throw new BusinessError('generateTechnicalAutoNumber: prefix is required', ERR.MISSING_FIELD, 400);
    }

    const cleanPrefix = prefix.trim().toUpperCase();
    const stamp = _timestampStr();
    const seqKey = `AUTO_NUMBER_${cleanPrefix}_${stamp}`;
    _ensureGlobal(seqKey, '0');

    const row = db.prepare(`
        UPDATE globals
        SET    value        = CAST(CAST(value AS INTEGER) + 1 AS TEXT),
               lastmodified = CURRENT_TIMESTAMP
        WHERE  key = ?
        RETURNING CAST(value AS INTEGER) AS new_seq
    `).get(seqKey);

    if (!row || row.new_seq == null) {
        throw new SystemError(
            `generateTechnicalAutoNumber: RETURNING returned no row for key ${seqKey}`,
            null, { seqKey, prefix: cleanPrefix }
        );
    }

    return `${cleanPrefix}-${stamp}-${row.new_seq}`;
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
 * Sequence is YEARLY (not daily) and uses its own dedicated keys
 * (NON_GST_BILL_SEQ / GST_BILL_SEQ) that are NEVER reset daily.
 * This is intentionally decoupled from NON_GST_CERT_SEQ / GST_CERT_SEQ
 * which reset at midnight and are only used for daily auto_number generation.
 *
 * On first call the key is seeded to MAX(existing bill numbers) so that
 * no past value can be re-issued after a day boundary reset.
 *
 * Format:  G26-0001  (GST)  |  N26-0001  (Non-GST)
 *
 * @param {boolean} isGst
 * @returns {string}
 * @throws {SystemError} if sequence row missing (table corruption)
 */
function getNextBillNumber(isGst) {
    const seqKey  = isGst ? 'GST_BILL_SEQ'     : 'NON_GST_BILL_SEQ';
    const table   = isGst ? 'gold_certificate'  : 'gold_certificate';  // both share the same gst flag
    const prefix  = isGst ? 'G'                 : 'N';
    const yy      = String(nowIST().getUTCFullYear()).slice(-2);

    // Seed from max existing bill number on first use (self-healing after counter desync)
    const existing = db.prepare(`SELECT value FROM globals WHERE key = ?`).get(seqKey);
    if (!existing) {
        // Find the max numeric part across both cert tables to be safe
        const maxGold   = db.prepare(`SELECT MAX(CAST(REPLACE(REPLACE(gst_bill_number,'N${yy}-',''),'G${yy}-','') AS INTEGER)) AS m FROM gold_certificate   WHERE gst_bill_number IS NOT NULL`).get()?.m || 0;
        const maxSilver = db.prepare(`SELECT MAX(CAST(REPLACE(REPLACE(gst_bill_number,'N${yy}-',''),'G${yy}-','') AS INTEGER)) AS m FROM silver_certificate WHERE gst_bill_number IS NOT NULL`).get()?.m || 0;
        const maxPhoto  = db.prepare(`SELECT MAX(CAST(REPLACE(REPLACE(gst_bill_number,'N${yy}-',''),'G${yy}-','') AS INTEGER)) AS m FROM photo_certificate  WHERE gst_bill_number IS NOT NULL`).get()?.m || 0;
        const seed = String(Math.max(maxGold, maxSilver, maxPhoto, 0));
        db.prepare(
            'INSERT OR IGNORE INTO globals (key, value, created, lastmodified) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
        ).run(seqKey, seed);
    }

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
    generateTechnicalAutoNumber,
    peekGlobalSequence,
    getNextBillNumber,
    getNextCertificateItemNumber,
    peekNextCertificateItemNumber,
    // Composable bare-DB exports for outer transactions
    _generateGlobalSequenceWork,
};
