const { db } = require('../db/db');

console.log('🚀 Starting Database Cleanup...');

// 1. DROP Unwanted Tables
const dropQueries = [
    // Duplicates
    "DROP TABLE IF EXISTS customers;",

    // Legacy JSON-based tables
    "DROP TABLE IF EXISTS certificates;",
    "DROP TABLE IF EXISTS certificate_items;",
    "DROP TABLE IF EXISTS samples;",

    // Deprecated features
    "DROP TABLE IF EXISTS bills;",
    "DROP TABLE IF EXISTS weight_loss_ledger;"
];

console.log('🗑️ Dropping obsolete tables...');

try {
    db.transaction(() => {
        for (const query of dropQueries) {
            console.log(`Executing: ${query}`);
            db.exec(query);
        }
    })();
    console.log('✅ Tables dropped successfully.');
} catch (error) {
    console.error('❌ Error during table cleanup:', error);
    process.exit(1);
}

// 2. Verify Remaining Tables
console.log('\n🔍 Verifying current table list...');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();

const expectedTables = [
    'customer',
    'gold_test', 'gold_test_item',
    'silver_test', 'silver_test_item',
    'gold_certificate', 'gold_certificate_item',
    'silver_certificate', 'silver_certificate_item',
    'photo_certificate', 'photo_certificate_item',
    'credit_history', 'weight_loss_history',
    'cash_register', 'globals', 'users', 'sqlite_sequence',
    'gold_certificate_item_audit', 'sequences' // Auto-sequence table if present
];

const foundTableNames = tables.map(t => t.name);

console.log('--------------------------------------------------');
console.log('CURRENT TABLES:');
foundTableNames.forEach(name => {
    const isExpected = expectedTables.includes(name);
    console.log(`${isExpected ? '✅' : '⚠️'} ${name}`);
});
console.log('--------------------------------------------------');

// Check for forbidden tables
const forbidden = ['customers', 'certificates', 'bills', 'samples'];
const remainingForbidden = foundTableNames.filter(t => forbidden.includes(t));

if (remainingForbidden.length > 0) {
    console.error('❌ FAILED: The following forbidden tables still exist:', remainingForbidden);
    process.exit(1);
}

console.log('🎉 Cleanup verification passed! Database is clean.');
