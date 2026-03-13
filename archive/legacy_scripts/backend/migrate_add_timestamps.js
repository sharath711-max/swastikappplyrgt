const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../db/lab.db');
const db = new Database(dbPath);

const TABLE_NAMES = [
    'gold_test', 'silver_test',
    'gold_certificate', 'silver_certificate', 'photo_certificate'
];

console.log('Running Schema Migration: Adding state timestamps...');

try {
    const runMigration = db.transaction(() => {
        for (const table of TABLE_NAMES) {
            const tableInfo = db.pragma(`table_info(${table})`);

            const hasInProgress = tableInfo.some(col => col.name === 'in_progress_at');
            const hasDoneAt = tableInfo.some(col => col.name === 'done_at');

            if (!hasInProgress) {
                console.log(`Adding in_progress_at to ${table}...`);
                db.prepare(`ALTER TABLE ${table} ADD COLUMN in_progress_at DATETIME`).run();
            }

            if (!hasDoneAt) {
                console.log(`Adding done_at to ${table}...`);
                db.prepare(`ALTER TABLE ${table} ADD COLUMN done_at DATETIME`).run();
            }
        }
    });

    runMigration();
    console.log('✅ Schema migration completed successfully.');

} catch (error) {
    console.error('❌ Schema migration failed:', error.message);
}
