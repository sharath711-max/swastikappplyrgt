const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { generateId } = require('../utils/idUtils');

const isPkg = typeof process.pkg !== 'undefined';
const DB_PATH = process.env.DB_PATH || (isPkg ? path.join(path.dirname(process.execPath), 'lab.db') : path.join(__dirname, 'lab.db'));
const INIT_SQL_PATH = path.join(__dirname, 'init.sql');

const db = new Database(DB_PATH, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// Enable WAL mode for performance
db.pragma('journal_mode = WAL');

// Initialize database with schema
function initDb() {
    try {
        const sql = fs.readFileSync(INIT_SQL_PATH, 'utf8');
        db.exec(sql);
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
