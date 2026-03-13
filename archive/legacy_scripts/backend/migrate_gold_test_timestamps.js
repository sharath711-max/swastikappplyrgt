const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'db', 'lab.db');
const db = new Database(DB_PATH);

console.log('Running migration: Add status timestamps to gold_test...');

try {
    // Add in_progress_at if it doesn't exist
    try {
        db.prepare('ALTER TABLE gold_test ADD COLUMN in_progress_at DATETIME').run();
        console.log('Added in_progress_at to gold_test');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log('Column in_progress_at already exists');
        } else {
            throw e;
        }
    }

    // Add done_at if it doesn't exist
    try {
        db.prepare('ALTER TABLE gold_test ADD COLUMN done_at DATETIME').run();
        console.log('Added done_at to gold_test');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log('Column done_at already exists');
        } else {
            throw e;
        }
    }

    console.log('Migration completed successfully');
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
