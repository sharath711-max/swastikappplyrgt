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

function dropIndexIfExists(name) {
    if (indexExists(name)) db.exec(`DROP INDEX ${name}`);
}

function dropTriggerIfExists(name) {
    if (triggerExists(name)) db.exec(`DROP TRIGGER ${name}`);
}

function dropColumnIfExists(table, col) {
    if (columnExists(table, col)) {
        // SQLite 3.35+ supports ALTER TABLE DROP COLUMN. better-sqlite3 ships
        // with a recent enough build (see project README).
        db.prepare(`ALTER TABLE ${table} DROP COLUMN ${col}`).run();
    }
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

    // Idempotency for cert charges has moved to gold_certificate.ledger_charged_at
    // (atomic UPDATE gate). The historic ux_gc_debit / ux_sc_debit / ux_pc_debit
    // indexes — which referenced the now-removed credit_history.reference_type /
    // reference_id columns — are dropped in migrateDropWorkflowLinks().

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

    // ── Customer: name search (paged list endpoint, complements idx_customer_phone) ──
    ensureIndex('idx_customer_name',
        `CREATE INDEX IF NOT EXISTS idx_customer_name ON customer(name) WHERE deletedon IS NULL`);

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

// ─── 5. (REMOVED) reference_type integrity guard ─────────────────────────────
//
// CH no longer carries reference_type/reference_id. Idempotency for cert
// charges is enforced atomically on the cert table via ledger_charged_at.
// This step now drops the legacy triggers if they exist (idempotent).

function migrateReferenceTypeGuard() {
    dropTriggerIfExists('chk_credit_history_ref_type_insert');
    dropTriggerIfExists('chk_credit_history_ref_type_update');
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
    // IMMUTABLE-on-DONE feature removed per operator request.
    // Previously this function created BEFORE UPDATE triggers raising
    // '<table> is finalized and cannot be modified' on DONE rows. Those
    // triggers are now DROPPED — both for existing DBs (which had them)
    // and going forward (none are recreated). The accidental-hard-DELETE
    // blocker triggers below remain in place.
    const droppedUpdateTriggers = [
        'trg_immutable_gold_test',
        'trg_immutable_silver_test',
        'trg_immutable_gold_cert',
        'trg_immutable_silver_cert',
        'trg_immutable_photo_cert',
    ];
    for (const name of droppedUpdateTriggers) {
        db.exec(`DROP TRIGGER IF EXISTS ${name}`);
    }

    // DELETE blockers — accidental hard-deletion of finalized records is
    // still blocked. The app uses soft-delete (deletedon column) which now
    // works on DONE rows because the UPDATE trigger above is gone.
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

// ─── 7. Schema column backfills ───────────────────────────────────────────────
//
// init.sql was missing these columns — added here so existing DBs are healed
// without requiring a manual DROP/CREATE.  All are idempotent (ensureCol checks
// PRAGMA table_info before ALTER TABLE).

function migrateMissingColumns() {
    // ── Customer-centric business history: full lifecycle metadata ────────────
    // CH / WLH / receipts now follow the standard created/lastmodified/deletedon
    // contract.
    //
    // SQLite limitation: ALTER TABLE ADD COLUMN cannot use a non-constant
    // DEFAULT (CURRENT_TIMESTAMP). We add as nullable, then backfill existing
    // rows from `created`. Fresh INSERTs go through init.sql's NOT NULL DEFAULT.
    const _addLifecycle = (table) => {
        const wasMissing = !columnExists(table, 'lastmodified');
        ensureCol(table, 'lastmodified', 'DATETIME');
        ensureCol(table, 'deletedon',    'DATETIME');
        if (wasMissing) {
            // Backfill: lastmodified = created for existing rows
            db.prepare(`UPDATE ${table} SET lastmodified = created WHERE lastmodified IS NULL`).run();
        }
    };
    _addLifecycle('credit_history');
    _addLifecycle('weight_loss_history');

    // receipts is special — also has the created_at→created rename handled by
    // migrateLifecycleStandardisation. Backfill lastmodified from whichever
    // column is currently the truth.
    {
        const wasMissing = !columnExists('receipts', 'lastmodified');
        ensureCol('receipts', 'lastmodified', 'DATETIME');
        ensureCol('receipts', 'deletedon',    'DATETIME');
        if (wasMissing) {
            // The rename hasn't run yet at this point, so created_at may still
            // exist. Prefer it if present, fall back to created.
            const hasCreatedAt = columnExists('receipts', 'created_at');
            const hasCreated   = columnExists('receipts', 'created');
            if (hasCreatedAt) {
                db.prepare(`UPDATE receipts SET lastmodified = created_at WHERE lastmodified IS NULL`).run();
            } else if (hasCreated) {
                db.prepare(`UPDATE receipts SET lastmodified = created WHERE lastmodified IS NULL`).run();
            }
        }
    }

    // weight_loss_history: payment context (ref_id deliberately NOT included —
    // see migrateDropWorkflowLinks)
    ensureCol('weight_loss_history', 'mode_of_payment', 'TEXT');

    // gold_test / silver_test: snapshot columns added by printService
    ensureCol('gold_test',    'print_snapshot',       'TEXT');
    ensureCol('gold_test',    'snapshot_hash',        'TEXT');
    ensureCol('gold_test',    'snapshot_key_version', 'TEXT');
    ensureCol('silver_test',  'print_snapshot',       'TEXT');
    ensureCol('silver_test',  'snapshot_hash',        'TEXT');
    ensureCol('silver_test',  'snapshot_key_version', 'TEXT');

    // Certificates: snapshot + total_tax columns + ledger atomic gate
    for (const t of ['gold_certificate', 'silver_certificate', 'photo_certificate']) {
        ensureCol(t, 'print_snapshot',       'TEXT');
        ensureCol(t, 'snapshot_hash',        'TEXT');
        ensureCol(t, 'snapshot_key_version', 'TEXT');
        ensureCol(t, 'total_tax',            'REAL DEFAULT 0');
        ensureCol(t, 'completion_request_id','TEXT');
        ensureCol(t, 'ledger_charged_at',    'DATETIME');
    }

    // gold_test_item / silver_test_item: certificate_required operator flag
    ensureCol('gold_test_item',   'certificate_required', 'INTEGER');
    ensureCol('silver_test_item', 'certificate_required', 'INTEGER');

    // gold_test / silver_test: total_tax column
    ensureCol('gold_test',   'total_tax', 'REAL DEFAULT 0');
    ensureCol('silver_test', 'total_tax', 'REAL DEFAULT 0');

    // photo_certificate_item: show_kt flag
    ensureCol('photo_certificate_item', 'show_kt', 'INTEGER DEFAULT 0');
}

// ─── 8. Customer-centric CH/WLH refactor ──────────────────────────────────────
//
// Removes the workflow back-references from credit_history (reference_type,
// reference_id) and weight_loss_history (ref_id). Their old job — preventing
// double-billing — is now handled by gold_certificate.ledger_charged_at /
// silver_certificate.ledger_charged_at / photo_certificate.ledger_charged_at,
// an atomic UPDATE gate enforced at the cert row level.
//
// BEFORE dropping the columns we backfill ledger_charged_at from the existing
// DEBIT rows so historical charges aren't replayed by a future call.
//
// All steps are idempotent (column-existence checks before each ALTER).

function migrateDropWorkflowLinks() {
    // ── 1. Backfill ledger_charged_at from existing DEBIT rows ────────────────
    // Only meaningful while the legacy reference_type/reference_id columns are
    // still present. After they're dropped this is a no-op.
    if (columnExists('credit_history', 'reference_type')
        && columnExists('credit_history', 'reference_id')) {

        const tables = [
            ['gold_certificate',   'gold_certificate'],
            ['silver_certificate', 'silver_certificate'],
            ['photo_certificate',  'photo_certificate'],
        ];

        for (const [certTable, refTypeValue] of tables) {
            // Backfill ledger_charged_at = MIN(DEBIT.created) for each cert id
            // that already has a DEBIT row. Use MIN so the original first-charge
            // timestamp is preserved.
            db.prepare(`
                UPDATE ${certTable}
                   SET ledger_charged_at = (
                       SELECT MIN(ch.created)
                         FROM credit_history ch
                        WHERE ch.reference_type = ?
                          AND ch.reference_id   = ${certTable}.id
                          AND ch.type           = 'DEBIT'
                   )
                 WHERE ledger_charged_at IS NULL
                   AND EXISTS (
                       SELECT 1
                         FROM credit_history ch
                        WHERE ch.reference_type = ?
                          AND ch.reference_id   = ${certTable}.id
                          AND ch.type           = 'DEBIT'
                   )
            `).run(refTypeValue, refTypeValue);
        }
    }

    // ── 2. Drop the partial unique indexes that referenced reference_type/id ──
    dropIndexIfExists('ux_gc_debit');
    dropIndexIfExists('ux_sc_debit');
    dropIndexIfExists('ux_pc_debit');

    // ── 3. Drop the reference_type CHECK triggers (also handled by step 5
    //       in migrateReferenceTypeGuard, but explicit here for clarity) ───────
    dropTriggerIfExists('chk_credit_history_ref_type_insert');
    dropTriggerIfExists('chk_credit_history_ref_type_update');

    // ── 4. Drop the columns ────────────────────────────────────────────────────
    dropColumnIfExists('credit_history',      'reference_type');
    dropColumnIfExists('credit_history',      'reference_id');
    dropColumnIfExists('weight_loss_history', 'ref_id');
}

// ─── 9. Uniform lifecycle metadata ────────────────────────────────────────────
//
// Standardises CH / WLH / receipts on the (created, lastmodified, deletedon)
// contract every other business-entity table already follows. Renames the
// odd-one-out receipts.created_at → receipts.created and installs the
// matching lastmodified bump triggers.
//
// All steps are idempotent.

function migrateLifecycleStandardisation() {
    // ── 1. Rename receipts.created_at → created if the legacy column exists.
    //       Uses ALTER TABLE RENAME COLUMN (SQLite 3.25+, present in
    //       better-sqlite3's bundled build).
    if (columnExists('receipts', 'created_at') && !columnExists('receipts', 'created')) {
        db.prepare(`ALTER TABLE receipts RENAME COLUMN created_at TO created`).run();
    } else if (columnExists('receipts', 'created_at') && columnExists('receipts', 'created')) {
        // Both present — backfill any NULL created from created_at, then drop the legacy.
        db.prepare(`UPDATE receipts SET created = created_at WHERE created IS NULL AND created_at IS NOT NULL`).run();
        dropColumnIfExists('receipts', 'created_at');
    }

    // ── 2. lastmodified bump triggers (mirror the existing customer / test
    //       triggers). Created in init.sql for fresh DBs; ensured here for
    //       legacy DBs that pre-date them.
    ensureTrigger('update_ch_lastmodified', `
        CREATE TRIGGER IF NOT EXISTS update_ch_lastmodified
        AFTER UPDATE ON credit_history
        BEGIN UPDATE credit_history SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END
    `);
    ensureTrigger('update_wlh_lastmodified', `
        CREATE TRIGGER IF NOT EXISTS update_wlh_lastmodified
        AFTER UPDATE ON weight_loss_history
        BEGIN UPDATE weight_loss_history SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END
    `);
    ensureTrigger('update_receipts_lastmodified', `
        CREATE TRIGGER IF NOT EXISTS update_receipts_lastmodified
        AFTER UPDATE ON receipts
        BEGIN UPDATE receipts SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END
    `);
}

// ─── Public entry point ───────────────────────────────────────────────────────

function _isTechnicalAutoNumber(value) {
    return /^[A-Z]+-\d{14}-\d+$/.test(String(value || ''));
}

function _stampFromCreated(created) {
    const digits = String(created || '').replace(/\D/g, '');
    if (digits.length >= 14) return digits.slice(0, 14);
    const d = new Date(Date.now() + (5.5 * 60 * 60 * 1000));
    return [
        d.getUTCFullYear(),
        String(d.getUTCMonth() + 1).padStart(2, '0'),
        String(d.getUTCDate()).padStart(2, '0'),
        String(d.getUTCHours()).padStart(2, '0'),
        String(d.getUTCMinutes()).padStart(2, '0'),
        String(d.getUTCSeconds()).padStart(2, '0'),
    ].join('');
}

function _backfillTechnicalAutoNumbers(table, prefix, idColumn = 'id', createdColumn = 'created') {
    const rows = db.prepare(
        `SELECT ${idColumn} AS row_id, auto_number, ${createdColumn} AS created FROM ${table} ORDER BY ${createdColumn}, ${idColumn}`
    ).all();
    const counters = new Map();

    for (const row of rows) {
        if (_isTechnicalAutoNumber(row.auto_number)) continue;
        const stamp = _stampFromCreated(row.created);
        const key = `${prefix}-${stamp}`;
        const next = (counters.get(key) || 0) + 1;
        counters.set(key, next);
        db.prepare(`UPDATE ${table} SET auto_number = ? WHERE ${idColumn} = ?`)
            .run(`${prefix}-${stamp}-${next}`, row.row_id);
    }
}

function migrateAutoNumberSplit() {
    ensureCol('customer', 'customer_no', 'TEXT');
    ensureCol('customer', 'auto_number', 'TEXT');

    const parentTables = [
        ['gold_test', 'GT'],
        ['silver_test', 'ST'],
        ['gold_certificate', 'GC'],
        ['silver_certificate', 'SC'],
        ['photo_certificate', 'PC'],
    ];

    for (const [table, prefix] of parentTables) {
        ensureCol(table, 'bill_no', 'TEXT');
        db.prepare(`UPDATE ${table} SET bill_no = auto_number WHERE (bill_no IS NULL OR bill_no = '') AND auto_number IS NOT NULL`).run();
        _backfillTechnicalAutoNumbers(table, prefix);
        ensureIndex(`idx_${table}_bill_no`, `CREATE INDEX IF NOT EXISTS idx_${table}_bill_no ON ${table}(bill_no) WHERE deletedon IS NULL`);
        ensureIndex(`idx_${table}_auto_number_tech`, `CREATE UNIQUE INDEX IF NOT EXISTS idx_${table}_auto_number_tech ON ${table}(auto_number) WHERE auto_number IS NOT NULL`);
    }

    _backfillTechnicalAutoNumbers('customer', 'CUS');
    db.prepare(`UPDATE customer SET customer_no = id WHERE (customer_no IS NULL OR customer_no = '')`).run();
    ensureIndex('idx_customer_auto_number', `CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_auto_number ON customer(auto_number) WHERE auto_number IS NOT NULL`);
    ensureIndex('idx_customer_customer_no', `CREATE INDEX IF NOT EXISTS idx_customer_customer_no ON customer(customer_no) WHERE deletedon IS NULL`);

    const childTables = [
        ['gold_test_item', 'GTI', 'gold_test', 'gold_test_id'],
        ['silver_test_item', 'STI', 'silver_test', 'silver_test_id'],
        ['gold_certificate_item', 'GCI', 'gold_certificate', 'gold_certificate_id'],
        ['silver_certificate_item', 'SCI', 'silver_certificate', 'silver_certificate_id'],
        ['photo_certificate_item', 'PCI', 'photo_certificate', 'photo_certificate_id'],
    ];

    for (const [table, prefix, parentTable, fk] of childTables) {
        ensureCol(table, 'auto_number', 'TEXT');
        ensureCol(table, 'parent_auto_number', 'TEXT');
        _backfillTechnicalAutoNumbers(table, prefix);
        db.prepare(`
            UPDATE ${table}
               SET parent_auto_number = (
                   SELECT p.auto_number FROM ${parentTable} p WHERE p.id = ${table}.${fk}
               )
             WHERE parent_auto_number IS NULL OR parent_auto_number = ''
        `).run();
        ensureIndex(`idx_${table}_auto_number`, `CREATE UNIQUE INDEX IF NOT EXISTS idx_${table}_auto_number ON ${table}(auto_number) WHERE auto_number IS NOT NULL`);
        ensureIndex(`idx_${table}_parent_auto_number`, `CREATE INDEX IF NOT EXISTS idx_${table}_parent_auto_number ON ${table}(parent_auto_number) WHERE deletedon IS NULL`);
    }

    for (const [table, prefix, idColumn, createdColumn = 'created'] of [
        ['credit_history', 'CH', 'id'],
        ['weight_loss_history', 'WLH', 'id'],
        ['cash_register', 'CR', 'id', 'created_at'],
    ]) {
        ensureCol(table, 'auto_number', 'TEXT');
        _backfillTechnicalAutoNumbers(table, prefix, idColumn, createdColumn);
        ensureIndex(`idx_${table}_auto_number`, `CREATE UNIQUE INDEX IF NOT EXISTS idx_${table}_auto_number ON ${table}(auto_number) WHERE auto_number IS NOT NULL`);
    }
}

function applyMigrations() {
    migrateIdempotencyKeys();             // priority 1
    migrateVersionColumns();              // priority 2
    migrateForeignKeys();                 // priority 3
    migrateIndexes();                     // priority 4
    migrateReferenceTypeGuard();          // priority 5 — now drops legacy triggers
    migrateImmutabilityTriggers();        // priority 6
    migrateMissingColumns();              // priority 7 — adds lifecycle cols + ledger_charged_at
    migrateDropWorkflowLinks();           // priority 8 — customer-centric CH/WLH
    migrateLifecycleStandardisation();    // priority 9 — receipts rename + triggers
}

const _applyMigrationsCore = applyMigrations;
applyMigrations = function applyMigrationsWithAutoNumberSplit() {
    _applyMigrationsCore();
    migrateAutoNumberSplit();
};

module.exports = { applyMigrations };
