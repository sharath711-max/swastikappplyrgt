const db = require('../db/db').db;

console.log('Migrating gold_certificate_item table...');

db.exec('PRAGMA foreign_keys = OFF;');

try {
    db.prepare('BEGIN TRANSACTION').run();

    // 1. Rename old table
    db.prepare('ALTER TABLE gold_certificate_item RENAME TO gold_certificate_item_old').run();

    // 2. Create new table with relaxed constraint
    // Note: copied structure from init.sql but with >= 0 for rate_per_gram
    db.prepare(`
        CREATE TABLE IF NOT EXISTS gold_certificate_item (
        id TEXT PRIMARY KEY CHECK (length(id)=18 AND substr(id,1,3)='GCI'),
        gold_certificate_id TEXT NOT NULL CHECK (length(gold_certificate_id)=18 AND substr(gold_certificate_id,1,3)='GCR'),

        item_number TEXT NOT NULL UNIQUE,
        item_type TEXT NOT NULL,

        gross_weight REAL NOT NULL CHECK (gross_weight > 0),
        test_weight REAL NOT NULL CHECK (test_weight >= 0 AND test_weight <= gross_weight),
        net_weight REAL NOT NULL CHECK (net_weight >= 0),
        purity REAL NOT NULL CHECK (purity >= 0 AND purity <= 100),

        rate_per_gram REAL NOT NULL CHECK (rate_per_gram >= 0),
        fine_weight REAL NOT NULL CHECK (fine_weight >= 0),
        item_total REAL NOT NULL CHECK (item_total >= 0),

        returned INTEGER DEFAULT 0 CHECK (returned IN (0,1)),

        created DATETIME NOT NULL,
        deletedon DATETIME,

        FOREIGN KEY (gold_certificate_id) REFERENCES gold_certificate(id) ON DELETE CASCADE
        );
    `).run();

    // 3. Copy data
    db.prepare(`
        INSERT INTO gold_certificate_item 
        SELECT id, gold_certificate_id, item_number, item_type, gross_weight, test_weight, net_weight, purity, rate_per_gram, fine_weight, item_total, returned, created, deletedon 
        FROM gold_certificate_item_old
    `).run();

    // 4. Drop old table
    db.prepare('DROP TABLE gold_certificate_item_old').run();

    db.prepare('COMMIT').run();
    console.log('Migration successful.');

} catch (err) {
    console.error('Migration failed:', err);
    db.prepare('ROLLBACK').run();
} finally {
    db.exec('PRAGMA foreign_keys = ON;');
}
