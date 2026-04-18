const { db } = require('../db/db');
const fs = require('fs');
const path = require('path');

const tables = ['gold_test_item', 'silver_test_item', 'gold_certificate_item', 'silver_certificate_item', 'photo_certificate_item'];

const sqls = {
  gold_test_item: `CREATE TABLE gold_test_item (
    id TEXT PRIMARY KEY,
    item_number TEXT NOT NULL UNIQUE,
    gold_test_id TEXT NOT NULL,
    name TEXT,
    item_type TEXT NOT NULL,
    gross_weight REAL NOT NULL CHECK (gross_weight > 0),
    sample_weight REAL DEFAULT 0,
    test_weight REAL NOT NULL CHECK (test_weight >= 0),
    net_weight REAL CHECK (net_weight >= 0),
    purity REAL CHECK (purity >= 0 AND purity <= 100),
    fine_weight REAL CHECK (fine_weight >= 0),
    item_total REAL DEFAULT 0,
    returned INTEGER DEFAULT 0,
    created DATETIME NOT NULL,
    lastmodified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deletedon DATETIME,
    FOREIGN KEY (gold_test_id) REFERENCES gold_test(id) ON DELETE CASCADE
  )`,
  silver_test_item: `CREATE TABLE silver_test_item (
    id TEXT PRIMARY KEY,
    item_number TEXT NOT NULL UNIQUE,
    silver_test_id TEXT NOT NULL,
    name TEXT,
    item_type TEXT NOT NULL,
    gross_weight REAL NOT NULL CHECK (gross_weight > 0),
    sample_weight REAL DEFAULT 0,
    test_weight REAL NOT NULL CHECK (test_weight >= 0),
    net_weight REAL CHECK (net_weight >= 0),
    purity REAL CHECK (purity >= 0 AND purity <= 100),
    fine_weight REAL CHECK (fine_weight >= 0),
    item_total REAL DEFAULT 0,
    returned INTEGER DEFAULT 0,
    created DATETIME NOT NULL,
    lastmodified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deletedon DATETIME,
    FOREIGN KEY (silver_test_id) REFERENCES silver_test(id) ON DELETE CASCADE
  )`,
  gold_certificate_item: `CREATE TABLE gold_certificate_item (
    id TEXT PRIMARY KEY,
    item_number TEXT NOT NULL UNIQUE,
    gold_certificate_id TEXT NOT NULL,
    certificate_number TEXT NOT NULL,
    name TEXT,
    item_type TEXT NOT NULL,
    gross_weight REAL NOT NULL CHECK (gross_weight > 0),
    test_weight REAL NOT NULL CHECK (test_weight >= 0),
    net_weight REAL NOT NULL CHECK (net_weight >= 0),
    purity REAL CHECK (purity >= 0 AND purity <= 100),
    fine_weight REAL DEFAULT 0 CHECK (fine_weight >= 0),
    item_total REAL DEFAULT 0,
    returned INTEGER DEFAULT 0,
    created DATETIME NOT NULL,
    lastmodified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deletedon DATETIME,
    FOREIGN KEY (gold_certificate_id) REFERENCES gold_certificate(id) ON DELETE CASCADE
  )`,
  silver_certificate_item: `CREATE TABLE silver_certificate_item (
    id TEXT PRIMARY KEY,
    item_number TEXT NOT NULL UNIQUE,
    silver_certificate_id TEXT NOT NULL,
    certificate_number TEXT NOT NULL,
    name TEXT,
    item_type TEXT NOT NULL,
    gross_weight REAL NOT NULL CHECK (gross_weight > 0),
    test_weight REAL NOT NULL CHECK (test_weight >= 0),
    net_weight REAL NOT NULL CHECK (net_weight >= 0),
    purity REAL CHECK (purity >= 0 AND purity <= 100),
    fine_weight REAL DEFAULT 0 CHECK (fine_weight >= 0),
    item_total REAL DEFAULT 0,
    returned INTEGER DEFAULT 0,
    created DATETIME NOT NULL,
    lastmodified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deletedon DATETIME,
    FOREIGN KEY (silver_certificate_id) REFERENCES silver_certificate(id) ON DELETE CASCADE
  )`,
  photo_certificate_item: `CREATE TABLE photo_certificate_item (
    id TEXT PRIMARY KEY,
    item_number TEXT NOT NULL UNIQUE,
    photo_certificate_id TEXT NOT NULL,
    certificate_number TEXT NOT NULL,
    name TEXT,
    item_type TEXT NOT NULL,
    gross_weight REAL CHECK (gross_weight > 0),
    test_weight REAL CHECK (test_weight >= 0),
    net_weight REAL CHECK (net_weight >= 0),
    purity REAL CHECK (purity >= 0 AND purity <= 100),
    fine_weight REAL DEFAULT 0 CHECK (fine_weight >= 0),
    item_total REAL DEFAULT 0,
    returned INTEGER DEFAULT 0,
    media_path TEXT,
    created DATETIME NOT NULL,
    lastmodified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deletedon DATETIME,
    FOREIGN KEY (photo_certificate_id) REFERENCES photo_certificate(id) ON DELETE CASCADE
  )`
};

try {
  db.exec('PRAGMA foreign_keys=OFF;');
  db.exec('BEGIN TRANSACTION;');
  for (const table of tables) {
      console.log(`Rebuilding ${table}...`);
      db.exec(`ALTER TABLE ${table} RENAME TO _${table}_old`);
      db.exec(sqls[table]);
      const columnsRows = db.prepare(`PRAGMA table_info(_${table}_old)`).all();
      const colNames = columnsRows.map(r => r.name).join(', ');
      db.exec(`INSERT INTO ${table} (${colNames}) SELECT ${colNames} FROM _${table}_old`);
      db.exec(`DROP TABLE _${table}_old`);
  }
  db.exec('COMMIT;');
  db.exec('PRAGMA foreign_keys=ON;');
  console.log('Successfully enforced DB constraints mathematically.');
} catch (e) {
  db.exec('ROLLBACK;');
  console.error('Failed migration:', e);
}
