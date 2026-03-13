const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../db/lab.db');
const db = new Database(dbPath);

console.log('Running Schema Migration: Adding missing columns to silver_certificate...');

try {
    const table = 'silver_certificate';
    const columns = [
        { name: 'mode_of_payment', type: 'TEXT' },
        { name: 'total', type: 'REAL DEFAULT 0' },
        { name: 'gst', type: 'INTEGER DEFAULT 0' },
        { name: 'total_tax', type: 'REAL DEFAULT 0' },
        { name: 'gst_bill_number', type: 'TEXT' }
    ];

    const runMigration = db.transaction(() => {
        const tableInfo = db.pragma(`table_info(${table})`);

        for (const col of columns) {
            const exists = tableInfo.some(c => c.name === col.name);
            if (!exists) {
                console.log(`Adding ${col.name} to ${table}...`);
                db.prepare(`ALTER TABLE ${table} ADD COLUMN ${col.name} ${col.type}`).run();
            }
        }
    });

    runMigration();
    console.log('✅ Schema migration completed: silver_certificate columns added.');

} catch (error) {
    console.error('❌ Schema migration failed:', error.message);
}
