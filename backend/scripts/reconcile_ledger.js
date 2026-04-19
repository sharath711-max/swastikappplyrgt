'use strict';

/**
 * reconcile_ledger.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin integrity check — run manually or as a scheduled job.
 * Any rows returned = action required.
 *
 * Run: node backend/scripts/reconcile_ledger.js
 */

const { initDb, db } = require('../db/db');
initDb();

function section(title) { process.stdout.write(`\n── ${title} ──\n`); }
function row(label, data) {
    if (!data.length) { process.stdout.write(`  ✅ ${label}: 0 issues\n`); return; }
    process.stdout.write(`  ❌ ${label}: ${data.length} issue(s)\n`);
    data.forEach(r => process.stdout.write(`     ${JSON.stringify(r)}\n`));
}

// ── 1. DONE certs with no DEBIT entry (missed charge) ────────────────────────
section('1. DONE certs with no ledger DEBIT');

for (const [label, table, refType] of [
    ['gold_certificate',   'gold_certificate',   'gold_certificate'],
    ['silver_certificate', 'silver_certificate', 'silver_certificate'],
    ['photo_certificate',  'photo_certificate',  'photo_certificate'],
]) {
    const missed = db.prepare(`
        SELECT c.id, c.auto_number, c.customer_id
        FROM ${table} c
        WHERE c.status = 'DONE'
          AND c.deletedon IS NULL
          AND NOT EXISTS (
              SELECT 1 FROM credit_history ch
              WHERE ch.reference_type = ? AND ch.reference_id = c.id AND ch.type = 'DEBIT'
          )
    `).all(refType);
    row(label, missed);
}

// ── 2. Certs with more than one DEBIT (index should prevent, but verify) ─────
section('2. Certs with multiple DEBIT rows (should be 0 after ux_*_debit indexes)');

for (const [label, refType] of [
    ['gold_certificate',   'gold_certificate'],
    ['silver_certificate', 'silver_certificate'],
    ['photo_certificate',  'photo_certificate'],
]) {
    const dupes = db.prepare(`
        SELECT reference_id, COUNT(*) AS debit_count
        FROM credit_history
        WHERE reference_type = ? AND type = 'DEBIT'
        GROUP BY reference_id
        HAVING debit_count > 1
    `).all(refType);
    row(label, dupes);
}

// ── 3. DONE certs with no snapshot hash (missed seal) ────────────────────────
section('3. DONE certs with no snapshot hash');

for (const [label, table] of [
    ['gold_certificate',   'gold_certificate'],
    ['silver_certificate', 'silver_certificate'],
    ['photo_certificate',  'photo_certificate'],
]) {
    const unsealed = db.prepare(`
        SELECT id, auto_number FROM ${table}
        WHERE status = 'DONE'
          AND deletedon IS NULL
          AND (snapshot_hash IS NULL OR snapshot_hash = '')
    `).all();
    row(label, unsealed);
}

// ── 4. IN_PROGRESS certs that have been stalled for > 24 hours ───────────────
section('4. Stalled IN_PROGRESS certs (>24 h, may need manual resolution)');

for (const [label, table] of [
    ['gold_certificate',   'gold_certificate'],
    ['silver_certificate', 'silver_certificate'],
    ['photo_certificate',  'photo_certificate'],
    ['gold_test',          'gold_test'],
    ['silver_test',        'silver_test'],
]) {
    const stalled = db.prepare(`
        SELECT id, auto_number, in_progress_at
        FROM ${table}
        WHERE status = 'IN_PROGRESS'
          AND deletedon IS NULL
          AND JULIANDAY('now') - JULIANDAY(in_progress_at) > 1
    `).all();
    row(label, stalled);
}

// ── 5. credit_history rows with unrecognised reference_type ──────────────────
section('5. credit_history rows with unrecognised reference_type');

const unknownRefTypes = db.prepare(`
    SELECT DISTINCT reference_type, COUNT(*) AS cnt
    FROM credit_history
    WHERE reference_type IS NOT NULL
      AND reference_type NOT IN (
          'gold_test', 'silver_test',
          'gold_certificate', 'silver_certificate', 'photo_certificate'
      )
    GROUP BY reference_type
`).all();
row('unknown reference_type', unknownRefTypes);

process.stdout.write('\n── Done ──\n');
