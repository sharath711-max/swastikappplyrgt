'use strict';

/**
 * backfill_legacy_certs.js
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time repair for 4 DONE certificates that were finalised through a
 * pre-v2 code path and are missing snapshot and/or ledger DEBIT:
 *
 *   gold_certificate  GCRMO60L769ysWpVHW  (N26-600)
 *     – Has DEBIT ✅  |  snapshot_hash NULL ❌
 *
 *   photo_certificate  PCRMO4Y60ORfOlBVG1  (20260419-060)
 *   photo_certificate  PCRMO5A54SY8KSZx07  (20260419-070)
 *   photo_certificate  PCRMO5A550PWJaTmxY  (20260419-071)
 *     – DEBIT NULL ❌  |  snapshot_hash NULL ❌
 *
 * Each repair runs in its own db.transaction() so a failure on one record
 * does not affect the others.
 *
 * Safe to re-run:
 *   – snapshot: idempotent (overwrites with same deterministic value if key unchanged)
 *   – DEBIT:    guarded by SELECT COUNT before insert — skipped if already present
 *
 * Usage:
 *   node backend/scripts/backfill_legacy_certs.js [--dry-run]
 */

// ── Bootstrap ─────────────────────────────────────────────────────────────────
// Must set TZ before any require that touches Date
process.env.TZ = 'Asia/Kolkata';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { db, transaction, genId, now } = require('../db/db');
const printSvc   = require('../services/v2/printService');
const ledgerSvc  = require('../services/v2/ledgerService');

const DRY_RUN = process.argv.includes('--dry-run');

// ─── Records to repair ────────────────────────────────────────────────────────

const REPAIRS = [
    {
        resourceType : 'certificate',
        metalType    : 'gold',
        table        : 'gold_certificate',
        id           : 'GCRMO60L769ysWpVHW',
        auto_number  : 'N26-600',
        customer_id  : 'CSTMO60L75StB6HnWc',
        total        : 50,
        mode_of_payment: 'Cash',
        needsDebit   : false,
        needsSnapshot: true,
    },
    {
        resourceType : 'certificate',
        metalType    : 'photo',
        table        : 'photo_certificate',
        id           : 'PCRMO4Y60ORfOlBVG1',
        auto_number  : '20260419-060',
        customer_id  : 'CSTMO4Y60MV61MBs3l',
        total        : 50,
        mode_of_payment: 'Cash',
        needsDebit   : true,
        needsSnapshot: true,
    },
    {
        resourceType : 'certificate',
        metalType    : 'photo',
        table        : 'photo_certificate',
        id           : 'PCRMO5A54SY8KSZx07',
        auto_number  : '20260419-070',
        customer_id  : 'CSTMO5A54S9X9DGyCd',
        total        : 50,
        mode_of_payment: 'Cash',
        needsDebit   : true,
        needsSnapshot: true,
    },
    {
        resourceType : 'certificate',
        metalType    : 'photo',
        table        : 'photo_certificate',
        id           : 'PCRMO5A550PWJaTmxY',
        auto_number  : '20260419-071',
        customer_id  : 'CSTMO5A54VDpm7Yl1G',
        total        : 50,
        mode_of_payment: 'Cash',
        needsDebit   : true,
        needsSnapshot: true,
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg)  { process.stdout.write(`  ${msg}\n`); }
function warn(msg) { process.stderr.write(`  ⚠️  ${msg}\n`); }
function ok(msg)   { process.stdout.write(`  ✅ ${msg}\n`); }
function fail(msg) { process.stderr.write(`  ❌ ${msg}\n`); }

// ─── Per-record repair ────────────────────────────────────────────────────────

function repairRecord(rec) {
    process.stdout.write(`\n── ${rec.table}/${rec.id} (${rec.auto_number}) ──\n`);

    // Verify the record exists and is DONE
    const row = db.prepare(
        `SELECT id, status, snapshot_hash FROM ${rec.table} WHERE id = ? AND deletedon IS NULL`
    ).get(rec.id);

    if (!row) {
        fail(`Record not found — skipped`);
        return false;
    }
    if (row.status !== 'DONE') {
        fail(`Status is ${row.status}, not DONE — skipped (unexpected state)`);
        return false;
    }

    // ── 1. Snapshot (compute outside transaction — CPU work, no locks) ─────────
    // If snapshot is already sealed, skip re-generation.
    // getPrintLayout returns the cached envelope when print_snapshot is present,
    // which causes validateSnapshotSchema to fail — re-sealing an already-valid
    // snapshot is also unnecessary.
    let snapshotResult = null;
    if (row.snapshot_hash) {
        log(`Snapshot already sealed — skipping re-generation`);
    } else {
        log(`Generating snapshot...`);
        try {
            snapshotResult = printSvc.serializeSnapshot(rec.resourceType, rec.metalType, rec.id, 'backfill_script');
        } catch (err) {
            fail(`serializeSnapshot failed: ${err.message}`);
            return false;
        }
        log(`  snapshot_hash = ${snapshotResult.snapshotHash.slice(0, 16)}...`);
    }

    if (DRY_RUN) {
        const snapshotAction = snapshotResult ? 'SNAPSHOT' : '(snapshot already sealed)';
        log(`[DRY-RUN] would write: ${rec.needsDebit ? 'DEBIT + ' : ''}${snapshotAction}`);
        ok(`Dry-run complete — no writes`);
        return true;
    }

    // Nothing to do if both guards passed (DEBIT present, snapshot present)
    const alreadyChargedCheck = !rec.needsDebit || db.prepare(
        `SELECT COUNT(*) AS cnt FROM credit_history WHERE reference_type = ? AND reference_id = ? AND type = 'DEBIT'`
    ).get(rec.table, rec.id).cnt > 0;

    if (!snapshotResult && alreadyChargedCheck) {
        ok(`Already fully repaired — nothing to write`);
        return true;
    }

    // ── 2. Transaction: DEBIT (if needed) + snapshot write ───────────────────
    const _txn = transaction(() => {
        const ts = now();

        // 2a. Ledger DEBIT — idempotency guard
        if (rec.needsDebit) {
            const alreadyCharged = db.prepare(
                `SELECT COUNT(*) AS cnt FROM credit_history
                 WHERE reference_type = ? AND reference_id = ? AND type = 'DEBIT'`
            ).get(rec.table, rec.id).cnt > 0;

            if (alreadyCharged) {
                log(`  DEBIT already present — skipping ledger write`);
            } else {
                const certTypeCap = rec.metalType.charAt(0).toUpperCase() + rec.metalType.slice(1);
                ledgerSvc.recordRevenue('cash', {
                    customer_id    : rec.customer_id,
                    amount         : rec.total,
                    entry_type     : 'DEBIT',
                    description    : `${certTypeCap} Certificate ${rec.auto_number} — lab charges (backfill)`,
                    mode_of_payment: rec.mode_of_payment,
                    post_cash_register: false,
                    reference_type : rec.table,
                    reference_id   : rec.id,
                    skip_status_check: true,
                });
                log(`  DEBIT written (amount=${rec.total}, mode=${rec.mode_of_payment})`);
            }
        }

        // 2b. Seal snapshot — only when a fresh result was computed above
        if (snapshotResult) {
            const { snapshotJson, snapshotHash, snapshotKeyVersion } = snapshotResult;
            db.prepare(
                `UPDATE ${rec.table}
                 SET print_snapshot = ?, snapshot_hash = ?, snapshot_key_version = ?, lastmodified = ?
                 WHERE id = ?`
            ).run(snapshotJson, snapshotHash, snapshotKeyVersion, ts, rec.id);
            log(`  snapshot_hash written (key_version=${snapshotKeyVersion})`);
        }
    });

    try {
        _txn();
        ok(`Repaired successfully`);
        return true;
    } catch (err) {
        fail(`Transaction failed: ${err.message}`);
        return false;
    }
}

// ─── Verify after repair ──────────────────────────────────────────────────────

function verifyRecord(rec) {
    const row = db.prepare(
        `SELECT status, snapshot_hash, snapshot_key_version FROM ${rec.table} WHERE id = ?`
    ).get(rec.id);
    const debitRow = db.prepare(
        `SELECT COUNT(*) AS cnt FROM credit_history
         WHERE reference_type = ? AND reference_id = ? AND type = 'DEBIT'`
    ).get(rec.table, rec.id);

    const snapshotOk = !!row?.snapshot_hash;
    const debitOk    = !rec.needsDebit || debitRow.cnt > 0;

    if (snapshotOk && debitOk) {
        ok(`Verified: snapshot=${row.snapshot_hash.slice(0,12)}... debit_count=${debitRow.cnt}`);
        return true;
    } else {
        fail(`Verification FAILED: snapshot=${snapshotOk} debit=${debitOk}`);
        return false;
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

process.stdout.write('╔══════════════════════════════════════════════════════╗\n');
process.stdout.write(`║  Backfill Legacy Certs${DRY_RUN ? ' [DRY-RUN]' : '           (LIVE)    '}         ║\n`);
process.stdout.write('╚══════════════════════════════════════════════════════╝\n');

let passed = 0;
let failed = 0;

for (const rec of REPAIRS) {
    const ok_repair = repairRecord(rec);
    if (!ok_repair) { failed++; continue; }
    if (!DRY_RUN) {
        const ok_verify = verifyRecord(rec);
        if (ok_verify) passed++; else failed++;
    } else {
        passed++;
    }
}

process.stdout.write('\n╔══════════════════════════════════════════════════════╗\n');
process.stdout.write(`║  Backfill complete: ${passed} repaired, ${failed} failed`.padEnd(55) + '║\n');
process.stdout.write('╚══════════════════════════════════════════════════════╝\n');

if (failed > 0) process.exit(1);
