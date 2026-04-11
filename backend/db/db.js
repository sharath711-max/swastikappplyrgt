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

// Transaction helper
const transaction = (fn) => {
    return db.transaction(fn);
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
    genId,
    now,
    getNextSequence
};
