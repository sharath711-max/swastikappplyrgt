const { db } = require('../db/db');

const tablesToClear = [
    'gold_test_item',
    'silver_test_item',
    'gold_test',
    'silver_test',
    'gold_certificate_item',
    'silver_certificate_item',
    'photo_certificate_item',
    'gold_certificate',
    'silver_certificate',
    'photo_certificate',
    'cash_register',
    'credit_history',
    'weight_loss_history',
    'audit_logs'
];

console.log('[INFO] Clearing data except users and customers...');

const existingTables = new Set(
    db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((row) => row.name)
);

const upsertGlobalValue = (key, value) => {
    const existing = db.prepare('SELECT key FROM globals WHERE key = ?').get(key);
    if (existing) {
        db.prepare('UPDATE globals SET value = ?, lastmodified = CURRENT_TIMESTAMP WHERE key = ?').run(value, key);
        return;
    }

    db.prepare(`
        INSERT INTO globals (key, value, created, lastmodified)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(key, value);
};

try {
    const clearDatabase = db.transaction(() => {
        for (const table of tablesToClear) {
            if (!existingTables.has(table)) continue;
            const result = db.prepare(`DELETE FROM ${table}`).run();
            console.log(`Cleared ${table}: ${result.changes} row(s)`);
        }

        if (existingTables.has('sequences')) {
            const result = db.prepare('UPDATE sequences SET value = 0').run();
            console.log(`Reset sequences: ${result.changes} row(s)`);
        }

        if (existingTables.has('globals')) {
            const removedItemSequences = db.prepare("DELETE FROM globals WHERE key LIKE 'ITEM_SEQ_%'").run();
            console.log(`Removed item sequence globals: ${removedItemSequences.changes} row(s)`);

            upsertGlobalValue('daily_global_seq', '0');
            upsertGlobalValue('daily_last_date', '');
            console.log('Reset daily global sequence counters');
        }

        if (existingTables.has('sqlite_sequence')) {
            const result = db.prepare("DELETE FROM sqlite_sequence WHERE name = 'cash_register'").run();
            console.log(`Reset sqlite autoincrement entries: ${result.changes} row(s)`);
        }

        // Reset balances for customers since transactions are gone
        if (existingTables.has('customer')) {
            const result = db.prepare('UPDATE customer SET balance = 0, gold_weight_balance = 0, silver_weight_balance = 0').run();
            console.log(`Reset balances for ${result.changes} customer(s)`);
        }
    });

    clearDatabase();
    db.exec('VACUUM');
    console.log('[OK] Selective clear complete.');
} catch (error) {
    console.error('[ERROR] selective clear failed:', error);
    process.exitCode = 1;
} finally {
    db.close();
}
