'use strict';

const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');
require('../config/env');
const { generateId } = require('../utils/idUtils');

const isPkg    = typeof process.pkg !== 'undefined';
const APP_ROOT = path.join(__dirname, '..');

function resolveDbPath() {
    const configured = process.env.DB_PATH && process.env.DB_PATH.trim();
    if (configured) {
        return path.isAbsolute(configured)
            ? configured
            : path.resolve(APP_ROOT, configured);
    }
    return isPkg
        ? path.join(path.dirname(process.execPath), 'lab.db')
        : path.join(__dirname, 'lab.db');
}

const DB_PATH      = resolveDbPath();
const INIT_SQL_PATH = path.join(__dirname, 'init.sql');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : null,
});

// ── Connection-level PRAGMAs ──────────────────────────────────────────────────
// These are per-connection; they MUST be set here, not just in init.sql,
// because pragma settings are not persisted to the database file.

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');    // enforce FK constraints on every write
db.pragma('busy_timeout = 5000'); // wait up to 5 s instead of failing instantly on lock
db.pragma('synchronous = NORMAL'); // safe under WAL; slightly faster than FULL

// ─── Schema helpers ───────────────────────────────────────────────────────────

function columnExists(tableName, columnName) {
    return db.prepare(`PRAGMA table_info(${tableName})`).all()
             .some(c => c.name === columnName);
}

function ensureColumn(tableName, columnName, definition) {
    if (!columnExists(tableName, columnName)) {
        db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`).run();
    }
}

// ─── Post-init migrations (legacy / patch set) ───────────────────────────────

function applyPostInitMigrations() {
    ensureColumn('gold_certificate',  'total_net_weight',  'REAL DEFAULT 0');
    ensureColumn('gold_certificate',  'total_fine_weight', 'REAL DEFAULT 0');
    ensureColumn('silver_certificate','total_net_weight',  'REAL DEFAULT 0');
    ensureColumn('gold_test',         'completion_request_id', 'TEXT');
    ensureColumn('silver_test',       'completion_request_id', 'TEXT');

    ensureColumn('gold_certificate_item',   'fine_weight', 'REAL DEFAULT 0');
    ensureColumn('gold_certificate_item',   'item_total',  'REAL DEFAULT 0');
    ensureColumn('silver_certificate_item', 'fine_weight', 'REAL DEFAULT 0');
    ensureColumn('silver_certificate_item', 'item_total',  'REAL DEFAULT 0');
    ensureColumn('photo_certificate_item',  'fine_weight', 'REAL DEFAULT 0');
    ensureColumn('photo_certificate_item',  'item_total',  'REAL DEFAULT 0');

    ensureColumn('audit_logs', 'request_id',    'TEXT');
    ensureColumn('audit_logs', 'event',         'TEXT');
    ensureColumn('audit_logs', 'operation',     'TEXT');
    ensureColumn('audit_logs', 'method',        'TEXT');
    ensureColumn('audit_logs', 'url',           'TEXT');
    ensureColumn('audit_logs', 'metadata_json', 'TEXT');

    ensureColumn('credit_history',       'reference_type',  'TEXT');
    ensureColumn('credit_history',       'reference_id',    'TEXT');
    ensureColumn('weight_loss_history',  'ref_id',          'TEXT');
    ensureColumn('weight_loss_history',  'mode_of_payment', 'TEXT');

    ensureColumn('gold_test',         'print_snapshot',         'TEXT');
    ensureColumn('silver_test',       'print_snapshot',         'TEXT');
    ensureColumn('gold_certificate',  'print_snapshot',         'TEXT');
    ensureColumn('silver_certificate','print_snapshot',         'TEXT');
    ensureColumn('photo_certificate', 'print_snapshot',         'TEXT');
    ensureColumn('photo_certificate', 'snapshot_hash',          'TEXT');
    ensureColumn('photo_certificate', 'snapshot_key_version',   'TEXT');
    ensureColumn('gold_test',         'snapshot_hash',          'TEXT');
    ensureColumn('gold_test',         'snapshot_key_version',   'TEXT');
    ensureColumn('silver_test',       'snapshot_hash',          'TEXT');
    ensureColumn('silver_test',       'snapshot_key_version',   'TEXT');
    ensureColumn('gold_certificate',  'snapshot_hash',          'TEXT');
    ensureColumn('gold_certificate',  'snapshot_key_version',   'TEXT');
    ensureColumn('silver_certificate','snapshot_hash',          'TEXT');
    ensureColumn('silver_certificate','snapshot_key_version',   'TEXT');

    ensureColumn('gold_test',          'total_tax', 'REAL DEFAULT 0');
    ensureColumn('silver_test',        'total_tax', 'REAL DEFAULT 0');
    ensureColumn('gold_certificate',   'total_tax', 'REAL DEFAULT 0');
    ensureColumn('silver_certificate', 'total_tax', 'REAL DEFAULT 0');

    ensureColumn('gold_certificate',   'in_progress_at',        'DATETIME');
    ensureColumn('gold_certificate',   'done_at',               'DATETIME');
    ensureColumn('silver_certificate', 'in_progress_at',        'DATETIME');
    ensureColumn('silver_certificate', 'done_at',               'DATETIME');

    ensureColumn('gold_certificate',   'completion_request_id', 'TEXT');
    ensureColumn('silver_certificate', 'completion_request_id', 'TEXT');
    ensureColumn('photo_certificate',  'completion_request_id', 'TEXT');

    ensureColumn('gold_test_item',   'certificate_required', 'INTEGER DEFAULT 0');
    ensureColumn('silver_test_item', 'certificate_required', 'INTEGER DEFAULT 0');

    // GST sequence seeds
    const seedGlobal = db.prepare(
        'INSERT OR IGNORE INTO globals (key, value, created, lastmodified) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
    );
    seedGlobal.run('GST_CERT_SEQ',     '0');
    seedGlobal.run('NON_GST_CERT_SEQ', '0');
    seedGlobal.run('GOLD_TEST_SEQ',    '0');
    seedGlobal.run('SILVER_TEST_SEQ',  '0');

    db.exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_gc_bill_number_unique
        ON gold_certificate(gst_bill_number)
        WHERE gst_bill_number IS NOT NULL AND gst_bill_number != ''
    `);
    db.exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_sc_bill_number_unique
        ON silver_certificate(gst_bill_number)
        WHERE gst_bill_number IS NOT NULL AND gst_bill_number != ''
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS request_log (
            request_id    TEXT PRIMARY KEY,
            response_json TEXT,
            created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.exec('CREATE INDEX IF NOT EXISTS idx_audit_request ON audit_logs (request_id)');

    // ── New migration set (migrations.js) ─────────────────────────────────────
    const { applyMigrations } = require('./migrations');
    applyMigrations();
}

// ─── Database initialiser ─────────────────────────────────────────────────────

function initDb() {
    try {
        const { getJwtSecret, validateSnapshotSecret, validateDbPath } = require('../config/env');

        // ── Fail-fast secret + path checks ───────────────────────────────────
        // All three throw with a descriptive message if the value is absent,
        // too weak, or points to an unwritable location.  Doing this here means
        // the server refuses to start rather than crashing mid-request.
        validateDbPath(DB_PATH);        // parent dir exists + writable
        getJwtSecret();                 // present, not placeholder, ≥ 32 chars
        validateSnapshotSecret();       // present, not placeholder, ≥ 32 chars

        const sql = fs.readFileSync(INIT_SQL_PATH, 'utf8');
        db.exec(sql);
        applyPostInitMigrations();
        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        throw error;
    }
}

// ─── Transaction helpers ──────────────────────────────────────────────────────

/**
 * rawTransaction(fn) → db.transaction(fn)
 * ─────────────────────────────────────────
 * Plain better-sqlite3 transaction wrapper.  No idempotency check.
 * Use for internal sub-operations called from within an outer transaction.
 * Nested calls automatically use SAVEPOINT.
 */
const rawTransaction = (fn) => db.transaction(fn);

/**
 * withTransaction(fn, opts) → result
 * ─────────────────────────────────────────────────────────────────────────────
 * BEGIN IMMEDIATE + runWithRetry in one call.
 *
 * Why IMMEDIATE:
 *   BEGIN DEFERRED (the default) acquires only a SHARED lock on first read,
 *   then escalates to RESERVED when the first write happens.  That escalation
 *   can fail with SQLITE_BUSY if a concurrent reader upgraded between our read
 *   and our write — after we have already done real work.
 *   BEGIN IMMEDIATE acquires the RESERVED lock at transaction start, so no
 *   concurrent writer can start; the only failure mode is at the BEGIN itself,
 *   which is handled by the retry wrapper before any work is done.
 *
 * Nesting:
 *   better-sqlite3 detects when a transaction is already active and silently
 *   downgrades to SAVEPOINT, so calling withTransaction inside an outer
 *   withTransaction / rawTransaction is safe.
 *
 * @param {Function} fn                                   - synchronous body
 * @param {{ maxRetries?: number, baseDelayMs?: number }} [opts]
 * @returns {*} fn's return value
 */
function withTransaction(fn, opts = {}) {
    // Tighter backoff than the global runWithRetry default:
    //   attempt 0 →  10–20 ms
    //   attempt 1 →  20–40 ms  (capped at 50 ms)
    //   attempt 2 →  40–80 ms  (capped at 50 ms)
    // BEGIN IMMEDIATE contention windows are typically very short (< 5 ms),
    // so aggressive backoff would burn unnecessary latency per request.
    const { maxRetries = 3, baseDelayMs = 10, maxDelayMs = 50 } = opts;
    const txFn = db.transaction(fn);
    return runWithRetry(() => txFn.immediate(), { maxRetries, baseDelayMs, maxDelayMs });
}

/**
 * transaction(fn) → wrapped db.transaction(fn)
 * ─────────────────────────────────────────────
 * Service-layer idempotency guard on top of better-sqlite3 transactions.
 *
 * Before executing fn:
 *   1. INSERT OR IGNORE a placeholder into request_log.
 *   2. If changes === 0 → duplicate request → return cached response.
 *   3. Execute fn.
 *   4. UPDATE request_log with the response JSON.
 *
 * Nested calls (inside an outer transaction) use SAVEPOINT automatically.
 */
const transaction = (fn) => {
    return db.transaction((...args) => {
        const { getRequestId } = require('../utils/audit');
        const requestId = getRequestId();

        if (requestId) {
            const inserted = db.prepare(
                'INSERT OR IGNORE INTO request_log (request_id) VALUES (?)'
            ).run(requestId);

            if (inserted.changes === 0) {
                const row = db.prepare(
                    'SELECT response_json FROM request_log WHERE request_id = ?'
                ).get(requestId);
                if (row?.response_json) {
                    try { return JSON.parse(row.response_json); } catch (_) { /* fall through */ }
                } else {
                    const { BusinessError } = require('../services/v2/errors');
                    throw new BusinessError('Request is already processing', 'CONFLICT', 409);
                }
            }
        }

        const res = fn(...args);

        if (requestId && res !== undefined) {
            try {
                db.prepare('UPDATE request_log SET response_json = ? WHERE request_id = ?')
                  .run(JSON.stringify(res), requestId);
            } catch (_) { /* non-fatal: idempotency cache write failure */ }
        }

        return res;
    });
};

/**
 * readCachedResult(requestId) → object | null
 * ─────────────────────────────────────────────
 * Non-transactional read from request_log.
 * Call BEFORE any business-state validation to short-circuit duplicates.
 */
function readCachedResult(requestId) {
    if (!requestId) return null;
    try {
        const row = db.prepare(
            'SELECT response_json FROM request_log WHERE request_id = ?'
        ).get(requestId);
        if (row?.response_json) return JSON.parse(row.response_json);
    } catch (_) { /* malformed JSON — treat as miss */ }
    return null;
}

// ─── Idempotency keys (richer, user-scoped) ───────────────────────────────────

/**
 * saveIdempotencyKey({ key, userId, method, path, entityType, entityId, statusCode, response })
 * ──────────────────────────────────────────────────────────────────────────────────────────────
 * Upserts a completed idempotency record.  Expires after 24 hours.
 */
function saveIdempotencyKey({ key, userId, method, path, entityType = null, entityId = null, statusCode, response }) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    db.prepare(`
        INSERT INTO idempotency_keys (key, user_id, method, path, entity_type, entity_id, status_code, response, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
            status_code = excluded.status_code,
            response    = excluded.response,
            entity_id   = excluded.entity_id,
            expires_at  = excluded.expires_at
    `).run(key, userId, method, path, entityType, entityId, statusCode, response ? JSON.stringify(response) : null, expiresAt);
}

/**
 * getIdempotencyKey(key) → { statusCode, response } | null
 * ──────────────────────────────────────────────────────────
 * Returns a non-expired cached key, or null.
 */
function getIdempotencyKey(key) {
    if (!key) return null;
    const row = db.prepare(`
        SELECT status_code, response FROM idempotency_keys
        WHERE key = ? AND expires_at > CURRENT_TIMESTAMP
    `).get(key);
    if (!row) return null;
    try {
        return { statusCode: row.status_code, response: row.response ? JSON.parse(row.response) : null };
    } catch (_) {
        return null;
    }
}

/**
 * purgeExpiredIdempotencyKeys()
 * ──────────────────────────────
 * Called periodically by the maintenance interval in app.js.
 */
function purgeExpiredIdempotencyKeys() {
    return db.prepare(`DELETE FROM idempotency_keys WHERE expires_at < CURRENT_TIMESTAMP`).run().changes;
}

// ─── Optimistic locking ───────────────────────────────────────────────────────

/**
 * withOptimisticLock(table, id, expectedVersion, fn) → result
 * ─────────────────────────────────────────────────────────────
 * MUST be called inside an existing transaction (rawTransaction or transaction).
 *
 * 1. Reads current version from the row.
 * 2. Compares to expectedVersion — throws 409 if mismatch.
 * 3. Calls fn(currentRow) — your update logic (must use db.prepare().run() calls).
 * 4. Atomically increments version with a WHERE version = expectedVersion check.
 *    If another writer beat us between steps 2 and 4, throws 409.
 *
 * @param {string} table           - table name
 * @param {string} id              - row primary key
 * @param {number} expectedVersion - version the caller read when fetching the row
 * @param {function} fn            - (currentRow) => any  — your update work
 * @returns the return value of fn
 *
 * Usage (inside a rawTransaction):
 *   const result = withOptimisticLock('gold_test', testId, req.body.version, (row) => {
 *       db.prepare('UPDATE gold_test SET status = ? WHERE id = ?').run('IN_PROGRESS', row.id);
 *   });
 */
function withOptimisticLock(table, id, expectedVersion, fn) {
    const { BusinessError } = require('../services/v2/errors');

    const current = db.prepare(
        `SELECT * FROM ${table} WHERE id = ? AND deletedon IS NULL`
    ).get(id);

    if (!current) {
        throw new BusinessError(`Record not found: ${id}`, 'NOT_FOUND', 404);
    }

    if (current.version == null) {
        // Table has no version column yet — run fn without OCC (graceful degradation)
        return fn(current);
    }

    const actualVersion = Number(current.version);
    if (actualVersion !== Number(expectedVersion)) {
        throw new BusinessError(
            `Concurrent modification: expected version ${expectedVersion}, got ${actualVersion}. Reload and retry.`,
            'OPTIMISTIC_LOCK_CONFLICT',
            409,
            { expectedVersion, actualVersion },
        );
    }

    const result = fn(current);

    // Atomic version bump — if another writer changed version between our read
    // and now, changes will be 0 and we throw to roll back the outer transaction.
    const bump = db.prepare(
        `UPDATE ${table} SET version = version + 1 WHERE id = ? AND version = ? AND deletedon IS NULL`
    ).run(id, actualVersion);

    if (bump.changes === 0) {
        throw new BusinessError(
            'Concurrent modification detected between read and write. Reload and retry.',
            'OPTIMISTIC_LOCK_CONFLICT',
            409,
        );
    }

    return result;
}

// ─── SQLITE_BUSY retry ────────────────────────────────────────────────────────

/**
 * runWithRetry(fn, opts) → result
 * ────────────────────────────────
 * Executes fn() and retries on SQLITE_BUSY / SQLITE_LOCKED with truncated
 * exponential back-off + uniform jitter.  Uses Atomics.wait for synchronous
 * sleep that is safe inside better-sqlite3's synchronous execution model.
 *
 * Note: db.pragma('busy_timeout = 5000') already handles short-lived locks at
 * the driver level.  This layer retries only when that timeout is exhausted
 * (rare contention burst) or when an explicit LOCKED is returned immediately.
 *
 * @param {Function} fn
 * @param {{ maxRetries?: number, baseDelayMs?: number }} [opts]
 * @returns {*}
 */
function runWithRetry(fn, opts = {}) {
    const { maxRetries = 3, baseDelayMs = 80, maxDelayMs = 500 } = opts;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return fn();
        } catch (err) {
            const isBusy = err.code === 'SQLITE_BUSY' || err.code === 'SQLITE_LOCKED';
            if (!isBusy || attempt >= maxRetries) throw err;

            const delayMs = Math.min(
                baseDelayMs * (2 ** attempt) + Math.floor(Math.random() * baseDelayMs),
                maxDelayMs,
            );

            // Emit a structured warning so ops can detect lock-contention patterns.
            // Import lazily to avoid a circular dep at module load time.
            try {
                require('../utils/logger').warn('SQLITE_BUSY retry', {
                    attempt,
                    maxRetries,
                    delayMs,
                    errorCode: err.code,
                });
            } catch (_) { /* logger unavailable — swallow silently */ }

            // Synchronous sleep — safe because better-sqlite3 already blocks the event loop.
            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delayMs);
        }
    }
}

// ─── Misc utilities ───────────────────────────────────────────────────────────

const genId = (prefix) => generateId(prefix);

// IST offset is +05:30 (fixed — India does not observe DST).
const _IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Returns current time as an ISO 8601 string with +05:30 offset.
// Use this for all DB timestamp inserts — never new Date().toISOString() which is always UTC.
const now = () => {
    const d = new Date(Date.now() + _IST_OFFSET_MS);
    return d.toISOString().replace('Z', '+05:30');
};

// Returns a Date whose UTC accessors (.getUTCFullYear, .getUTCMonth, .getUTCDate, etc.)
// give the correct IST values regardless of what TZ the process runs under.
// Always use getUTC* methods on the result — never getFullYear/getMonth/getDate.
const nowIST = () => new Date(Date.now() + _IST_OFFSET_MS);

function getNextSequence(name) {
    db.prepare('INSERT OR IGNORE INTO sequences (name, value) VALUES (?, 0)').run(name);
    db.prepare('UPDATE sequences SET value = value + 1 WHERE name = ?').run(name);
    const row  = db.prepare('SELECT value FROM sequences WHERE name = ?').get(name);
    const year = nowIST().getUTCFullYear();
    return `${name.split('_')[0].toUpperCase()}-${year}-${String(row.value).padStart(5, '0')}`;
}

module.exports = {
    db,
    initDb,
    transaction,
    rawTransaction,
    withTransaction,
    readCachedResult,
    saveIdempotencyKey,
    getIdempotencyKey,
    purgeExpiredIdempotencyKeys,
    withOptimisticLock,
    runWithRetry,
    genId,
    now,
    nowIST,
    getNextSequence,
    ensureColumn,
};
