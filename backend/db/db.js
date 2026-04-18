const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('../config/env');
const { generateId } = require('../utils/idUtils');

const isPkg = typeof process.pkg !== 'undefined';
const APP_ROOT = path.join(__dirname, '..');

function resolveDbPath() {
    const configuredPath = process.env.DB_PATH && process.env.DB_PATH.trim();

    if (configuredPath) {
        return path.isAbsolute(configuredPath)
            ? configuredPath
            : path.resolve(APP_ROOT, configuredPath);
    }

    return isPkg
        ? path.join(path.dirname(process.execPath), 'lab.db')
        : path.join(__dirname, 'lab.db');
}

const DB_PATH = resolveDbPath();
const INIT_SQL_PATH = path.join(__dirname, 'init.sql');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// Enable WAL mode for performance
db.pragma('journal_mode = WAL');

function columnExists(tableName, columnName) {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    return columns.some((column) => column.name === columnName);
}

function ensureColumn(tableName, columnName, definition) {
    if (!columnExists(tableName, columnName)) {
        db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`).run();
    }
}

function applyPostInitMigrations() {
    ensureColumn('gold_certificate', 'total_net_weight', 'REAL DEFAULT 0');
    ensureColumn('gold_certificate', 'total_fine_weight', 'REAL DEFAULT 0');
    ensureColumn('silver_certificate', 'total_net_weight', 'REAL DEFAULT 0');
    ensureColumn('gold_test', 'completion_request_id', 'TEXT');
    ensureColumn('silver_test', 'completion_request_id', 'TEXT');

    ensureColumn('gold_certificate_item', 'fine_weight', 'REAL DEFAULT 0');
    ensureColumn('gold_certificate_item', 'item_total', 'REAL DEFAULT 0');

    ensureColumn('silver_certificate_item', 'fine_weight', 'REAL DEFAULT 0');
    ensureColumn('silver_certificate_item', 'item_total', 'REAL DEFAULT 0');

    ensureColumn('photo_certificate_item', 'fine_weight', 'REAL DEFAULT 0');
    ensureColumn('photo_certificate_item', 'item_total', 'REAL DEFAULT 0');

    ensureColumn('audit_logs', 'request_id', 'TEXT');
    ensureColumn('audit_logs', 'event', 'TEXT');
    ensureColumn('audit_logs', 'operation', 'TEXT');
    ensureColumn('audit_logs', 'method', 'TEXT');
    ensureColumn('audit_logs', 'url', 'TEXT');
    ensureColumn('audit_logs', 'metadata_json', 'TEXT');
    
    // Patch 02 & 03: TRACE fields
    ensureColumn('credit_history', 'reference_type', 'TEXT');
    ensureColumn('credit_history', 'reference_id', 'TEXT');
    ensureColumn('weight_loss_history', 'ref_id', 'TEXT');
    ensureColumn('weight_loss_history', 'mode_of_payment', 'TEXT');

    // Patch 04: HISTORICAL_IMMUTABILITY (Snapshot prints)
    ensureColumn('gold_test', 'print_snapshot', 'TEXT');
    ensureColumn('silver_test', 'print_snapshot', 'TEXT');
    ensureColumn('gold_certificate', 'print_snapshot', 'TEXT');
    ensureColumn('silver_certificate', 'print_snapshot', 'TEXT');

    // Patch 04b: TOTALS — tax and fee fields added by v2 testService.completeTest
    ensureColumn('gold_test',   'total_tax', 'REAL DEFAULT 0');
    ensureColumn('silver_test', 'total_tax', 'REAL DEFAULT 0');
    ensureColumn('gold_certificate',   'total_tax', 'REAL DEFAULT 0');
    ensureColumn('silver_certificate', 'total_tax', 'REAL DEFAULT 0');

    // Patch 05: OPERATOR_OVERRIDE — cert eligibility flag per test item
    ensureColumn('gold_test_item', 'certificate_required', 'INTEGER DEFAULT 0');
    ensureColumn('silver_test_item', 'certificate_required', 'INTEGER DEFAULT 0');

    // Patch 06: GST COMPLIANCE — unique bill number enforcement + sequence seeding
    // Seed GST/NON-GST cert sequences if they don't exist in globals table
    db.prepare(
        'INSERT OR IGNORE INTO globals (key, value, created, lastmodified) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
    ).run('GST_CERT_SEQ', '0');
    db.prepare(
        'INSERT OR IGNORE INTO globals (key, value, created, lastmodified) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
    ).run('NON_GST_CERT_SEQ', '0');
    db.prepare(
        'INSERT OR IGNORE INTO globals (key, value, created, lastmodified) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
    ).run('GOLD_TEST_SEQ', '0');
    db.prepare(
        'INSERT OR IGNORE INTO globals (key, value, created, lastmodified) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
    ).run('SILVER_TEST_SEQ', '0');

    // UNIQUE constraint on gst_bill_number — legal requirement (no duplicate GST bills)
    // SQLite cannot add UNIQUE constraint via ALTER TABLE — use a partial unique index instead
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
            request_id TEXT PRIMARY KEY,
            response_json TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.exec('CREATE INDEX IF NOT EXISTS idx_audit_request ON audit_logs (request_id)');
}

// Initialize database with schema
function initDb() {
    try {
        const sql = fs.readFileSync(INIT_SQL_PATH, 'utf8');
        db.exec(sql);
        applyPostInitMigrations();
        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        throw error;
    }
}

/**
 * rawTransaction — plain better-sqlite3 transaction with NO idempotency check.
 * Use ONLY for internal sub-operations (e.g. sequence generation) that are
 * called from within an outer idempotency-guarded transaction and must NOT
 * re-trigger the request_log collision check.
 */
const rawTransaction = (fn) => db.transaction(fn);

/**
 * readCachedResult — non-transactional read from request_log.
 *
 * Call this BEFORE any business-state validation when you need idempotency
 * to act as an absolute entry gate.  On a cache-hit the caller should
 * short-circuit and return the cached payload immediately, skipping all
 * business logic (including status-based guards such as DONE checks).
 *
 * Returns the parsed JSON object if a completed response is stored, or
 * null if the request is new or still in-flight.
 *
 * @param {string|undefined} requestId
 * @returns {object|null}
 */
function readCachedResult(requestId) {
    if (!requestId) return null;
    try {
        const row = db.prepare(
            'SELECT response_json FROM request_log WHERE request_id = ?'
        ).get(requestId);
        if (row && row.response_json) return JSON.parse(row.response_json);
    } catch (_) { /* malformed JSON — treat as miss */ }
    return null;
}

// Transaction helper with Service-Layer Idempotency
const transaction = (fn) => {
    return db.transaction((...args) => {
        const { getRequestId } = require('../utils/audit');
        const requestId = getRequestId();
        
        if (requestId) {
            // 1 & 2. Atomic Check & Placeholder: INSERT OR IGNORE
            const result = db.prepare('INSERT OR IGNORE INTO request_log (request_id) VALUES (?)').run(requestId);
            
            if (result.changes === 0) {
                // Duplicate Request Found!
                const row = db.prepare('SELECT response_json FROM request_log WHERE request_id = ?').get(requestId);
                if (row && row.response_json) {
                    try {
                        return JSON.parse(row.response_json);
                    } catch (e) {
                         // Fallback safely below
                    }
                } else {
                    const { BusinessError, ERR } = require('../services/v2/errors');
                    throw new BusinessError('Request is already processing', ERR?.IDEMPOTENT_COLLISION || 'CONFLICT', 409);
                }
            }
        }
        
        // Execute original transaction function
        const res = fn(...args);
        
        // 3. Finalize: UPDATE result after commit
        if (requestId && res !== undefined) {
             try {
                 db.prepare('UPDATE request_log SET response_json = ? WHERE request_id = ?').run(JSON.stringify(res), requestId);
             } catch(e) {}
        }
        
        return res;
    });
};

const genId = (prefix) => {
    return generateId(prefix);
};
const now = () => new Date().toISOString();

// Simple sequence generator using a dedicated table
function getNextSequence(name) {
    db.prepare('INSERT OR IGNORE INTO sequences (name, value) VALUES (?, 0)').run(name);
    db.prepare('UPDATE sequences SET value = value + 1 WHERE name = ?').run(name);
    const row = db.prepare('SELECT value FROM sequences WHERE name = ?').get(name);
    return `${name.split('_')[0].toUpperCase()}-${new Date().getFullYear()}-${row.value.toString().padStart(5, '0')}`;
}

module.exports = {
    db,
    initDb,
    transaction,
    rawTransaction,
    readCachedResult,
    genId,
    now,
    getNextSequence
};
