'use strict';

/**
 * migrations.js — additive runtime migrations
 * ────────────────────────────────────────────
 * Every migration is idempotent (CREATE IF NOT EXISTS, ensureColumn, etc.).
 * Called once from initDb() after the base schema is applied.
 *
 * Priority order (matches task brief):
 *   1. Transactions  — idempotency_keys table (richer than request_log)
 *   2. Concurrency   — version columns + OCC triggers
 *   3. FK safety     — explicit runtime PRAGMA (belt-and-suspenders)
 *   4. Indexes       — covering indexes for all hot query paths
 */

const { db } = require('./db');
const { ALL_LEDGER_REF_TYPES } = require('../constants/entityTypes');

// ─── Helpers (local, not exported) ───────────────────────────────────────────

function columnExists(table, col) {
    return db.prepare(`PRAGMA table_info(${table})`).all().some(r => r.name === col);
}

function indexExists(name) {
    return !!db.prepare(`SELECT 1 FROM sqlite_master WHERE type='index' AND name=?`).get(name);
}

function triggerExists(name) {
    return !!db.prepare(`SELECT 1 FROM sqlite_master WHERE type='trigger' AND name=?`).get(name);
}

function ensureCol(table, col, definition) {
    if (!columnExists(table, col)) {
        db.prepare(`ALTER TABLE ${table} ADD COLUMN ${col} ${definition}`).run();
    }
}

function ensureIndex(name, sql) {
    if (!indexExists(name)) db.exec(sql);
}

function ensureTrigger(name, sql) {
    if (!triggerExists(name)) db.exec(sql);
}

// ─── 1. Idempotency keys table ────────────────────────────────────────────────
//
// Richer replacement for request_log.  Stores per-user, per-path context so
// duplicate detection is accurate even across restarts.
// request_log is kept as-is for backward compat; new code should use this.

function migrateIdempotencyKeys() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS idempotency_keys (
            key         TEXT PRIMARY KEY,
            user_id     TEXT NOT NULL,
            method      TEXT NOT NULL,
            path        TEXT NOT NULL,
            entity_type TEXT,
            entity_id   TEXT,
            status_code INTEGER NOT NULL DEFAULT 0,
            response    TEXT,
            created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            expires_at  DATETIME NOT NULL
        )
    `);

    ensureIndex('idx_idem_expires',
        `CREATE INDEX IF NOT EXISTS idx_idem_expires ON idempotency_keys(expires_at)`);
    ensureIndex('idx_idem_user_path',
        `CREATE INDEX IF NOT EXISTS idx_idem_user_path ON idempotency_keys(user_id, path, created_at)`);
}

// ─── 2. Version columns (optimistic concurrency control) ─────────────────────
//
// Each mutable entity row carries a monotonically increasing version counter.
// The service layer does:
//   UPDATE … SET version = version + 1 WHERE id = ? AND version = <expected>
// If changes === 0 → concurrent modification detected → throw 409.

const VERSION_TABLES = [
    'gold_test',
    'silver_test',
    'gold_certificate',
    'silver_certificate',
    'photo_certificate',
    'customer',
];

function migrateVersionColumns() {
    for (const table of VERSION_TABLES) {
        ensureCol(table, 'version', 'INTEGER NOT NULL DEFAULT 1');
    }

    // Triggers: increment version on every meaningful UPDATE
    // We do NOT auto-increment on lastmodified-only triggers because those fire
    // on every SET lastmodified = CURRENT_TIMESTAMP update.
    // Instead, version is controlled explicitly by withOptimisticLock().
    // These triggers act as a safety net for any direct UPDATE that forgets to bump version.
    const triggerDefs = [
        ['trg_gold_test_version',        'gold_test'],
        ['trg_silver_test_version',      'silver_test'],
        ['trg_gold_cert_version',        'gold_certificate'],
        ['trg_silver_cert_version',      'silver_certificate'],
        ['trg_photo_cert_version',       'photo_certificate'],
        ['trg_customer_version',         'customer'],
    ];

    for (const [name, table] of triggerDefs) {
        ensureTrigger(name, `
            CREATE TRIGGER IF NOT EXISTS ${name}
            AFTER UPDATE ON ${table}
            WHEN NEW.version = OLD.version
            BEGIN
                UPDATE ${table} SET version = OLD.version + 1 WHERE id = NEW.id;
            END
        `);
    }
}

// ─── 3. FK enforcement (belt-and-suspenders) ─────────────────────────────────
//
// SQLite's foreign_keys pragma is per-connection and does not persist in the
// db file.  init.sql sets it via PRAGMA inside db.exec() which applies to the
// open connection, but only after initDb() runs.  The db.js module now also
// calls db.pragma('foreign_keys = ON') at connection open time, making this
// migration a no-op but keeping it here for documentation and explicit intent.

function migrateForeignKeys() {
    db.pragma('foreign_keys = ON');
}

// ─── 4. Performance indexes ───────────────────────────────────────────────────

function migrateIndexes() {
    // ── Tests: customer lookup (customer profile page shows all their tests) ──
    ensureIndex('idx_gt_customer',
        `CREATE INDEX IF NOT EXISTS idx_gt_customer ON gold_test(customer_id, status, deletedon)`);
    ensureIndex('idx_st_customer',
        `CREATE INDEX IF NOT EXISTS idx_st_customer ON silver_test(customer_id, status, deletedon)`);

    // ── Tests: auto_number unique lookup (public verify, print, search) ───────
    ensureIndex('idx_gt_auto_number',
        `CREATE INDEX IF NOT EXISTS idx_gt_auto_number ON gold_test(auto_number) WHERE deletedon IS NULL`);
    ensureIndex('idx_st_auto_number',
        `CREATE INDEX IF NOT EXISTS idx_st_auto_number ON silver_test(auto_number) WHERE deletedon IS NULL`);

    // ── Tests: date range queries (analytics, reports) ────────────────────────
    ensureIndex('idx_gt_created',
        `CREATE INDEX IF NOT EXISTS idx_gt_created ON gold_test(created DESC) WHERE deletedon IS NULL`);
    ensureIndex('idx_st_created',
        `CREATE INDEX IF NOT EXISTS idx_st_created ON silver_test(created DESC) WHERE deletedon IS NULL`);

    // ── Certificates: auto_number + date (public verify, search) ─────────────
    ensureIndex('idx_gc_auto_number',
        `CREATE INDEX IF NOT EXISTS idx_gc_auto_number ON gold_certificate(auto_number) WHERE deletedon IS NULL`);
    ensureIndex('idx_sc_auto_number',
        `CREATE INDEX IF NOT EXISTS idx_sc_auto_number ON silver_certificate(auto_number) WHERE deletedon IS NULL`);
    ensureIndex('idx_pc_auto_number',
        `CREATE INDEX IF NOT EXISTS idx_pc_auto_number ON photo_certificate(auto_number) WHERE deletedon IS NULL`);

    ensureIndex('idx_gc_created',
        `CREATE INDEX IF NOT EXISTS idx_gc_created ON gold_certificate(created DESC) WHERE deletedon IS NULL`);
    ensureIndex('idx_sc_created',
        `CREATE INDEX IF NOT EXISTS idx_sc_created ON silver_certificate(created DESC) WHERE deletedon IS NULL`);
    ensureIndex('idx_pc_created',
        `CREATE INDEX IF NOT EXISTS idx_pc_created ON photo_certificate(created DESC) WHERE deletedon IS NULL`);

    // ── Certificates: snapshot_hash (hash-based verification endpoint) ────────
    ensureIndex('idx_gc_hash',
        `CREATE INDEX IF NOT EXISTS idx_gc_hash ON gold_certificate(snapshot_hash) WHERE snapshot_hash IS NOT NULL`);
    ensureIndex('idx_sc_hash',
        `CREATE INDEX IF NOT EXISTS idx_sc_hash ON silver_certificate(snapshot_hash) WHERE snapshot_hash IS NOT NULL`);
    ensureIndex('idx_pc_hash',
        `CREATE INDEX IF NOT EXISTS idx_pc_hash ON photo_certificate(snapshot_hash) WHERE snapshot_hash IS NOT NULL`);

    // Unique partial indexes: one DEBIT per cert, enforced at storage level.
    // Three separate indexes because SQLite partial-index WHERE does not support IN().
    ensureIndex('ux_gc_debit',
        `CREATE UNIQUE INDEX IF NOT EXISTS ux_gc_debit ON credit_history(reference_id)
         WHERE reference_type = 'gold_certificate' AND type = 'DEBIT'`);
    ensureIndex('ux_sc_debit',
        `CREATE UNIQUE INDEX IF NOT EXISTS ux_sc_debit ON credit_history(reference_id)
         WHERE reference_type = 'silver_certificate' AND type = 'DEBIT'`);
    ensureIndex('ux_pc_debit',
        `CREATE UNIQUE INDEX IF NOT EXISTS ux_pc_debit ON credit_history(reference_id)
         WHERE reference_type = 'photo_certificate' AND type = 'DEBIT'`);

    // ── Test items: parent FK (cascading reads, item list) ────────────────────
    ensureIndex('idx_gti_test',
        `CREATE INDEX IF NOT EXISTS idx_gti_test ON gold_test_item(gold_test_id, deletedon)`);
    ensureIndex('idx_sti_test',
        `CREATE INDEX IF NOT EXISTS idx_sti_test ON silver_test_item(silver_test_id, deletedon)`);
    ensureIndex('idx_gci_cert',
        `CREATE INDEX IF NOT EXISTS idx_gci_cert ON gold_certificate_item(gold_certificate_id, deletedon)`);
    ensureIndex('idx_sci_cert',
        `CREATE INDEX IF NOT EXISTS idx_sci_cert ON silver_certificate_item(silver_certificate_id, deletedon)`);
    ensureIndex('idx_pci_cert',
        `CREATE INDEX IF NOT EXISTS idx_pci_cert ON photo_certificate_item(photo_certificate_id, deletedon)`);

    // ── Credit history: customer + type + date (ledger page, balance calc) ────
    ensureIndex('idx_ch_customer_type',
        `CREATE INDEX IF NOT EXISTS idx_ch_customer_type ON credit_history(customer_id, type, created)`);
    ensureIndex('idx_ch_created',
        `CREATE INDEX IF NOT EXISTS idx_ch_created ON credit_history(created DESC)`);

    // ── Weight loss: customer + date ──────────────────────────────────────────
    ensureIndex('idx_wlh_created',
        `CREATE INDEX IF NOT EXISTS idx_wlh_created ON weight_loss_history(created DESC)`);

    // ── Cert tables: completion_request_id (workflow idempotency guard) ──────
    ensureIndex('idx_gc_completion_req',
        `CREATE INDEX IF NOT EXISTS idx_gc_completion_req
         ON gold_certificate(completion_request_id)
         WHERE completion_request_id IS NOT NULL`);
    ensureIndex('idx_sc_completion_req',
        `CREATE INDEX IF NOT EXISTS idx_sc_completion_req
         ON silver_certificate(completion_request_id)
         WHERE completion_request_id IS NOT NULL`);
    ensureIndex('idx_pc_completion_req',
        `CREATE INDEX IF NOT EXISTS idx_pc_completion_req
         ON photo_certificate(completion_request_id)
         WHERE completion_request_id IS NOT NULL`);

    // ── Cert tables: in_progress_at / done_at (workflow moveItem sets these) ──
    ensureIndex('idx_gc_status',
        `CREATE INDEX IF NOT EXISTS idx_gc_status ON gold_certificate(status) WHERE deletedon IS NULL`);
    ensureIndex('idx_sc_status',
        `CREATE INDEX IF NOT EXISTS idx_sc_status ON silver_certificate(status) WHERE deletedon IS NULL`);

    // ── Audit logs: action filter + entity + request (analytics, security) ────
    ensureIndex('idx_audit_action',
        `CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action, created DESC)`);
    ensureIndex('idx_audit_entity_action',
        `CREATE INDEX IF NOT EXISTS idx_audit_entity_action ON audit_logs(entity_type, action, created DESC)`);

    // ── Users: active user lookup (auth, role queries) ────────────────────────
    ensureIndex('idx_users_username',
        `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE deletedon IS NULL`);
    ensureIndex('idx_users_role',
        `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE deletedon IS NULL`);

    // ── idempotency_keys: TTL cleanup ─────────────────────────────────────────
    // (index created in migrateIdempotencyKeys — this is a reminder, not duplicate)
}

// ─── 5. reference_type integrity (belt-and-suspenders over ledgerService enum) ─
//
// SQLite does not support ALTER TABLE ADD CONSTRAINT.
// A BEFORE INSERT / BEFORE UPDATE trigger is the equivalent hard check.
// NULL is permitted — some ledger entries (e.g. cash adjustments) have no source entity.
// Actual values in production (confirmed): gold_test, silver_test,
//   gold_certificate, silver_certificate, photo_certificate.

function migrateReferenceTypeGuard() {
    const inLiteral = ALL_LEDGER_REF_TYPES.map(t => `'${t}'`).join(', ');

    ensureTrigger('chk_credit_history_ref_type_insert', `
        CREATE TRIGGER IF NOT EXISTS chk_credit_history_ref_type_insert
        BEFORE INSERT ON credit_history
        WHEN NEW.reference_type IS NOT NULL
         AND NEW.reference_type NOT IN (${inLiteral})
        BEGIN
            SELECT RAISE(ABORT, 'INVALID_REFERENCE_TYPE');
        END
    `);

    ensureTrigger('chk_credit_history_ref_type_update', `
        CREATE TRIGGER IF NOT EXISTS chk_credit_history_ref_type_update
        BEFORE UPDATE OF reference_type ON credit_history
        WHEN NEW.reference_type IS NOT NULL
         AND NEW.reference_type NOT IN (${inLiteral})
        BEGIN
            SELECT RAISE(ABORT, 'INVALID_REFERENCE_TYPE');
        END
    `);
}

// ─── 6. Immutability triggers (DONE rows are read-only) ──────────────────────
//
// Once a test or certificate reaches status='DONE', no further UPDATEs are
// permitted on that row.  The service layer enforces this via _assertMutable /
// assertTransitionAllowed, but these triggers are the hard DB-level guarantee.
//
// The finalization paths in testService.completeTest and
// certServiceV2.updateStatus are structured to write total, snapshot, and all
// other fields BEFORE the single atomic status='DONE' write, so these triggers
// never fire during a legitimate finalization.
//
// photo_certificate excluded: its finalization path (photoCertRepo) has not yet
// been restructured to the single-DONE-write pattern and would be blocked.

function migrateImmutabilityTriggers() {
    const updateTables = [
        ['trg_immutable_gold_test',    'gold_test'],
        ['trg_immutable_silver_test',  'silver_test'],
        ['trg_immutable_gold_cert',    'gold_certificate'],
        ['trg_immutable_silver_cert',  'silver_certificate'],
        ['trg_immutable_photo_cert',   'photo_certificate'],
    ];

    for (const [name, table] of updateTables) {
        ensureTrigger(name, `
            CREATE TRIGGER IF NOT EXISTS ${name}
            BEFORE UPDATE ON ${table}
            WHEN OLD.status = 'DONE'
            BEGIN
                SELECT RAISE(ABORT, '${table} is finalized and cannot be modified');
            END
        `);
    }

    // DELETE blockers — finalized records are permanent; deletion must go through
    // soft-delete (deletedon column) which is blocked by the UPDATE trigger above.
    const deleteTables = [
        ['trg_nodelete_gold_test',    'gold_test'],
        ['trg_nodelete_silver_test',  'silver_test'],
        ['trg_nodelete_gold_cert',    'gold_certificate'],
        ['trg_nodelete_gold_cert_items',  'gold_certificate_item'],
        ['trg_nodelete_silver_cert',  'silver_certificate'],
        ['trg_nodelete_silver_cert_items', 'silver_certificate_item'],
        ['trg_nodelete_photo_cert',   'photo_certificate'],
        ['trg_nodelete_photo_cert_items',  'photo_certificate_item'],
    ];

    // For parent tables: block DELETE when status = DONE
    for (const [name, table] of deleteTables.filter(([, t]) => !t.endsWith('_item'))) {
        ensureTrigger(name, `
            CREATE TRIGGER IF NOT EXISTS ${name}
            BEFORE DELETE ON ${table}
            WHEN OLD.status = 'DONE'
            BEGIN
                SELECT RAISE(ABORT, 'Cannot hard-delete a finalized ${table} record');
            END
        `);
    }

    // For item tables: block DELETE when the parent is DONE
    // gold_certificate_item
    ensureTrigger('trg_nodelete_gold_cert_items', `
        CREATE TRIGGER IF NOT EXISTS trg_nodelete_gold_cert_items
        BEFORE DELETE ON gold_certificate_item
        WHEN (SELECT status FROM gold_certificate WHERE id = OLD.gold_certificate_id) = 'DONE'
        BEGIN
            SELECT RAISE(ABORT, 'Cannot hard-delete items of a finalized gold_certificate');
        END
    `);
    // silver_certificate_item
    ensureTrigger('trg_nodelete_silver_cert_items', `
        CREATE TRIGGER IF NOT EXISTS trg_nodelete_silver_cert_items
        BEFORE DELETE ON silver_certificate_item
        WHEN (SELECT status FROM silver_certificate WHERE id = OLD.silver_certificate_id) = 'DONE'
        BEGIN
            SELECT RAISE(ABORT, 'Cannot hard-delete items of a finalized silver_certificate');
        END
    `);
    // photo_certificate_item
    ensureTrigger('trg_nodelete_photo_cert_items', `
        CREATE TRIGGER IF NOT EXISTS trg_nodelete_photo_cert_items
        BEFORE DELETE ON photo_certificate_item
        WHEN (SELECT status FROM photo_certificate WHERE id = OLD.photo_certificate_id) = 'DONE'
        BEGIN
            SELECT RAISE(ABORT, 'Cannot hard-delete items of a finalized photo_certificate');
        END
    `);
}

// ─── Public entry point ───────────────────────────────────────────────────────

function applyMigrations() {
    migrateIdempotencyKeys();           // priority 1
    migrateVersionColumns();            // priority 2
    migrateForeignKeys();               // priority 3
    migrateIndexes();                   // priority 4
    migrateReferenceTypeGuard();        // priority 5
    migrateImmutabilityTriggers();      // priority 6
}

module.exports = { applyMigrations };
