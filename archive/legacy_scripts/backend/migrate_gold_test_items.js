const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'db', 'lab.db');
const db = new Database(DB_PATH);

console.log('Running migration: Add calculation fields to gold_test_item...');

const columns = [
    { name: 'net_weight', type: 'REAL' },
    { name: 'fine_weight', type: 'REAL' },
    { name: 'item_total', type: 'REAL DEFAULT 0' }
];

try {
    for (const col of columns) {
        try {
            db.prepare(`ALTER TABLE gold_test_item ADD COLUMN ${col.name} ${col.type}`).run();
            console.log(`Added ${col.name} to gold_test_item`);
        } catch (e) {
            if (e.message.includes('duplicate column name')) {
                console.log(`Column ${col.name} already exists`);
            } else {
                throw e;
            }
        }
    }
    console.log('Migration completed successfully');
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
