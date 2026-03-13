const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../db/lab.db');
const db = new Database(dbPath);

console.log('Running Schema Migration: Adding legacy_id to photo_certificate...');

try {
    const table = 'photo_certificate';
    const tableInfo = db.pragma(`table_info(${table})`);

    const hasLegacyId = tableInfo.some(c => c.name === 'legacy_id');
    const hasInProgress = tableInfo.some(c => c.name === 'in_progress_at');
    const hasDoneAt = tableInfo.some(c => c.name === 'done_at');

    const runMigration = db.transaction(() => {
        if (!hasLegacyId) {
            console.log(`Adding legacy_id to ${table}...`);
            db.prepare(`ALTER TABLE ${table} ADD COLUMN legacy_id TEXT`).run();
            // No unique index here yet, just add column
        }

        if (!hasInProgress) {
            console.log(`Adding in_progress_at to ${table}...`);
            db.prepare(`ALTER TABLE ${table} ADD COLUMN in_progress_at DATETIME`).run();
        }

        if (!hasDoneAt) {
            console.log(`Adding done_at to ${table}...`);
            db.prepare(`ALTER TABLE ${table} ADD COLUMN done_at DATETIME`).run();
        }
    });

    runMigration();
    console.log('✅ Schema migration completed: photo_certificate columns added.');

} catch (error) {
    console.error('❌ Schema migration failed:', error.message);
}
