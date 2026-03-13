const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../db/lab.db');
const db = new Database(dbPath);

const TABLE_NAMES = [
    'gold_certificate_item',
    'silver_certificate_item',
    'photo_certificate_item'
];

console.log('Running Schema Migration: Adding certificate_number and name to item tables...');

try {
    const runMigration = db.transaction(() => {
        for (const table of TABLE_NAMES) {
            const tableInfo = db.pragma(`table_info(${table})`);

            const hasCertNum = tableInfo.some(col => col.name === 'certificate_number');
            const hasName = tableInfo.some(col => col.name === 'name');

            if (!hasCertNum) {
                console.log(`Adding certificate_number to ${table}...`);
                // Add column. Note: NOT NULL DEFAULT '' to avoid issues with existing rows if any
                db.prepare(`ALTER TABLE ${table} ADD COLUMN certificate_number TEXT NOT NULL DEFAULT ''`).run();
            }

            if (!hasName) {
                console.log(`Adding name to ${table}...`);
                db.prepare(`ALTER TABLE ${table} ADD COLUMN name TEXT`).run();
            }
        }
    });

    runMigration();
    console.log('✅ Schema migration completed: certificate_number and name added.');

} catch (error) {
    console.error('❌ Schema migration failed:', error.message);
}
