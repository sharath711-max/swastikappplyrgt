const { db } = require('../db/db');

console.log('🧹 Clearing transaction records...');

const tables = [
    'gold_test_item',
    'silver_test_item',
    'gold_certificate_item',
    'silver_certificate_item',
    'photo_certificate_item',
    'gold_test',
    'silver_test',
    'gold_certificate',
    'silver_certificate',
    'photo_certificate',
    'credit_history',
    'weight_loss_history',
    'customer'
];

try {
    // Ensure sequences table exists
    db.exec(`CREATE TABLE IF NOT EXISTS sequences (
        name TEXT PRIMARY KEY,
        value INTEGER DEFAULT 0
    )`);

    db.transaction(() => {
        for (const table of tables) {
            const result = db.prepare(`DELETE FROM ${table}`).run();
            console.log(`Deleted ${result.changes} rows from ${table}`);
        }

        // Reset sequences to restart certificate counters
        db.prepare("DELETE FROM sequences").run();
        console.log('Reset sequences');
    })();
    console.log('✅ All transaction records cleared successfully.');
} catch (err) {
    console.error('❌ Error clearing records:', err);
}
