const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../db/lab.db');
const db = new Database(dbPath);

const TABLE_NAMES = [
    'customer',
    'gold_test', 'silver_test',
    'gold_certificate', 'silver_certificate', 'photo_certificate'
];

console.log('Running Schema Migration: Adding legacy_id columns...');

try {
    const runMigration = db.transaction(() => {
        for (const table of TABLE_NAMES) {
            const tableInfo = db.pragma(`table_info(${table})`);

            const hasLegacyId = tableInfo.some(col => col.name === 'legacy_id');

            if (!hasLegacyId) {
                console.log(`Adding legacy_id to ${table}...`);
                db.prepare(`ALTER TABLE ${table} ADD COLUMN legacy_id TEXT`).run();
                console.log(`Creating unique index on legacy_id for ${table}...`);
                db.prepare(`CREATE UNIQUE INDEX idx_${table}_legacy_id ON ${table}(legacy_id)`).run();
            }
        }
    });

    runMigration();
    console.log('✅ Schema migration completed: legacy_id columns added.');

} catch (error) {
    console.error('❌ Schema migration failed:', error.message);
}
