// migrate_phase1.js - Idempotent migration for Phase 1 (production‑safe data migration)
// Run with: npm run migrate:phase1

const path = require('path');
const fs = require('fs');
const { db, initDb } = require('../db/db');

// Ensure database is initialized (creates tables if missing)
initDb();

function columnExists(table, column) {
    const row = db.prepare(`PRAGMA table_info(${table})`).get();
    // PRAGMA returns rows; we need to fetch all
    const cols = db.prepare(`PRAGMA table_info(${table})`).all();
    return cols.some(c => c.name === column);
}

function addMigrationColumn() {
    if (!columnExists('certificates', 'data')) {
        console.log('🔧 Adding legacy data column...');
        db.exec(`ALTER TABLE certificates ADD COLUMN data TEXT;`);
    } else {
        console.log('✅ data column already exists');
    }
    if (!columnExists('certificates', 'migrated_to_gci')) {
        console.log('🔧 Adding migrated_to_gci flag...');
        db.exec(`ALTER TABLE certificates ADD COLUMN migrated_to_gci INTEGER NOT NULL DEFAULT 0;`);
    } else {
        console.log('✅ migrated_to_gci column already exists');
    }
}

function createReadOnlyTrigger() {
    console.log('⚙️ Creating read‑only trigger for legacy data...');
    db.exec(`DROP TRIGGER IF EXISTS certificates_data_readonly;`);
    db.exec(`CREATE TRIGGER certificates_data_readonly
    BEFORE UPDATE OF data ON certificates
    FOR EACH ROW
    WHEN NEW.migrated_to_gci = 1
    BEGIN
      SELECT RAISE(ABORT, 'certificates.data is read‑only for migrated certificates');
    END;`);
}

function createMigrationIndex() {
    console.log('⚙️ Creating index on migration flag...');
    db.exec(`DROP INDEX IF EXISTS idx_certificates_migrated;`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_certificates_migrated ON certificates(migrated_to_gci, updated_at);`);
}

function markExistingCertificates() {
    console.log('🔎 Detecting certificates that already have GCI/SCI items...');

    // Gold items
    let goldIds = [];
    try {
        goldIds = db.prepare(`SELECT DISTINCT certificate_id FROM gold_certificate_item`).all().map(r => r.certificate_id);
    } catch (e) {
        console.log('⚠️ Could not query gold_certificate_item (table might be missing)');
    }

    // Silver items
    let silverIds = [];
    try {
        silverIds = db.prepare(`SELECT DISTINCT certificate_id FROM silver_certificate_item`).all().map(r => r.certificate_id);
    } catch (e) {
        console.log('ℹ️ silver_certificate_item table not found, skipping silver items check.');
    }

    const allIds = Array.from(new Set([...goldIds, ...silverIds]));
    if (allIds.length === 0) {
        console.log('ℹ️ No existing GCI/SCI items found. No certificates will be marked as migrated.');
        return;
    }
    const stmt = db.prepare(`UPDATE certificates SET migrated_to_gci = 1 WHERE id = ?`);
    const transaction = db.transaction((ids) => {
        for (const id of ids) stmt.run(id);
    });
    transaction(allIds);
    console.log(`✅ Marked ${allIds.length} certificate(s) as migrated.`);
}

function runMigration() {
    try {
        addMigrationColumn();
        createReadOnlyTrigger();
        createMigrationIndex();
        markExistingCertificates();
        console.log('🎉 Phase 1 migration completed successfully.');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        db.close();
    }
}

runMigration();
