const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../db/lab.db');
const db = new Database(dbPath);

console.log('Migrating users table to include role column...');

try {
    // Check if column exists
    const tableInfo = db.pragma('table_info(users)');
    const hasRole = tableInfo.some(col => col.name === 'role');

    if (!hasRole) {
        db.prepare("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'").run();
        console.log('✅ Added role column to users table.');
    } else {
        console.log('ℹ️ Role column already exists.');
    }

} catch (error) {
    console.error('❌ Migration failed:', error.message);
}
