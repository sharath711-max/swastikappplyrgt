'use strict';

// clear_data.js — Wipe operational data while preserving users + customer.
//
// Differs from factory_reset.js by KEEPING customer rows (factory_reset wipes
// them too). Resets customer.balance to 0 because the credit_history rollup
// that produced those balances is wiped. Backs up the DB to
// `<DB_PATH>.backup-<timestamp>` before any writes.
//
// Run with the backend server stopped:
//   node backend/scripts/clear_data.js

const fs   = require('fs');
const path = require('path');
const { db } = require('../db/db');
const { applyMigrations } = require('../db/migrations');

// ── Mirror db.js path resolution so we can locate the file for backup ──
const APP_ROOT = path.join(__dirname, '..');
const isPkg    = typeof process.pkg !== 'undefined';
function resolveDbPath() {
    const configured = process.env.DB_PATH && process.env.DB_PATH.trim();
    if (configured) {
        return path.isAbsolute(configured)
            ? configured
            : path.resolve(APP_ROOT, configured);
    }
    return isPkg
        ? path.join(path.dirname(process.execPath), 'lab.db')
        : path.join(APP_ROOT, 'db', 'lab.db');
}
const DB_PATH = resolveDbPath();

// ── Operational tables to wipe (children before parents for FK safety) ──
// PRESERVED: users, customer, globals, sequences (entries reset, table kept).
const tablesToClear = [
    // Test/cert items first (FK children)
    'gold_test_item',
    'silver_test_item',
    'gold_certificate_item',
    'silver_certificate_item',
    'photo_certificate_item',

    // Workflow parents
    'gold_test',
    'silver_test',
    'gold_certificate',
    'silver_certificate',
    'photo_certificate',

    // Customer-centric history
    'credit_history',
    'weight_loss_history',

    // Receipts (snapshots) and cash register
    'receipts',
    'cash_register',

    // Operational caches and audit history
    'audit_logs',
    'idempotency_keys',
    'request_log',
];

// Migration-installed triggers that block direct DELETE on test/cert rows.
// Dropped inside the wipe transaction; recreated by applyMigrations() after.
const blockingTriggers = [
    'trg_nodelete_gold_test',
    'trg_nodelete_silver_test',
    'trg_nodelete_gold_cert',
    'trg_nodelete_gold_cert_items',
    'trg_nodelete_silver_cert',
    'trg_nodelete_silver_cert_items',
    'trg_nodelete_photo_cert',
    'trg_nodelete_photo_cert_items',
];

// Operational counters in `globals` that should reset to '0'.
// daily_last_date is set to '' so the next entry seeds a fresh day.
const globalsCountersToReset = [
    'daily_global_seq',
    'GST_CERT_SEQ',
    'NON_GST_CERT_SEQ',
    'GOLD_TEST_SEQ',
    'SILVER_TEST_SEQ',
    'GOLD_CERT_ITEM_SEQ',
    'SILVER_CERT_ITEM_SEQ',
    'PHOTO_CERT_ITEM_SEQ',
];

// ── Backup the DB before any writes ─────────────────────────────────────
function backupDb() {
    if (!fs.existsSync(DB_PATH)) {
        console.log(`[INFO] No DB at ${DB_PATH} — nothing to back up.`);
        return null;
    }
    // Checkpoint WAL so the main file is a complete snapshot, then copy.
    // TRUNCATE mode also empties lab.db-wal so a single-file copy suffices.
    try {
        db.pragma('wal_checkpoint(TRUNCATE)');
    } catch (err) {
        console.warn('[WARN] WAL checkpoint failed before backup:', err.message);
    }
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${DB_PATH}.backup-${ts}`;
    fs.copyFileSync(DB_PATH, backupPath);
    console.log(`[OK] Backup written: ${backupPath}`);
    return backupPath;
}

// ── Main ─────────────────────────────────────────────────────────────────
console.log('[WARN] Clearing operational DB data.');
console.log('       PRESERVED: users, customer (rows), globals + sequences (tables).');
console.log('       RESET:     customer.balance, sequence counters, operational globals.');

const backupPath = backupDb();

const existingTables = new Set(
    db.prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((row) => row.name),
);

try {
    const clear = db.transaction(() => {
        for (const trigger of blockingTriggers) {
            db.exec(`DROP TRIGGER IF EXISTS ${trigger}`);
        }

        for (const table of tablesToClear) {
            if (!existingTables.has(table)) continue;
            const result = db.prepare(`DELETE FROM ${table}`).run();
            console.log(`  Cleared ${table}: ${result.changes} row(s)`);
        }

        // credit_history is gone, so any non-zero balance is now stale.
        if (existingTables.has('customer')) {
            const result = db.prepare('UPDATE customer SET balance = 0 WHERE balance != 0').run();
            console.log(`  Reset customer.balance: ${result.changes} row(s)`);
        }

        if (existingTables.has('sequences')) {
            const result = db.prepare('UPDATE sequences SET value = 0').run();
            console.log(`  Reset sequences: ${result.changes} row(s)`);
        }

        if (existingTables.has('globals')) {
            const dropped = db.prepare("DELETE FROM globals WHERE key LIKE 'ITEM_SEQ_%'").run();
            console.log(`  Removed ITEM_SEQ_* globals: ${dropped.changes} row(s)`);

            const upd = db.prepare(
                "UPDATE globals SET value = '0', lastmodified = CURRENT_TIMESTAMP WHERE key = ?",
            );
            let resetCount = 0;
            for (const key of globalsCountersToReset) {
                resetCount += upd.run(key).changes;
            }
            console.log(`  Reset operational globals counters: ${resetCount} row(s)`);

            db.prepare(
                "UPDATE globals SET value = '', lastmodified = CURRENT_TIMESTAMP WHERE key = 'daily_last_date'",
            ).run();
        }

        // cash_register uses INTEGER PRIMARY KEY AUTOINCREMENT — clear so IDs restart at 1.
        if (existingTables.has('sqlite_sequence')) {
            const result = db.prepare("DELETE FROM sqlite_sequence WHERE name = 'cash_register'").run();
            console.log(`  Reset sqlite_sequence for cash_register: ${result.changes} row(s)`);
        }
    });

    clear();

    // Recreates any triggers we dropped + any pending migrations.
    applyMigrations();

    db.exec('VACUUM');
    console.log('[OK] Database compressed.');
    console.log('[OK] Operational data cleared.');
    if (backupPath) {
        console.log(`[INFO] Backup retained: ${backupPath}`);
        console.log(`[INFO] To restore: stop the server, then`);
        console.log(`       cp "${backupPath}" "${DB_PATH}"`);
    }
} catch (error) {
    console.error('[ERROR] clear_data failed:', error);
    if (backupPath) {
        console.error(`[INFO] DB may be partially modified. Restore from: ${backupPath}`);
    }
    process.exitCode = 1;
} finally {
    db.close();
}
