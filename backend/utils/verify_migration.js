// verify_migration.js - Verify Phase 1 migration
// Run with: npm run verify:migration

const { db, initDb } = require('../db/db');

function columnExists(table, column) {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all();
    return cols.some(c => c.name === column);
}

function triggerExists(name) {
    const row = db.prepare(`SELECT name FROM sqlite_master WHERE type='trigger' AND name = ?`).get(name);
    return !!row;
}

function indexExists(name) {
    const row = db.prepare(`SELECT name FROM sqlite_master WHERE type='index' AND name = ?`).get(name);
    return !!row;
}

function verify() {
    initDb();
    console.log('🔍 Verifying Phase 1 migration...');

    // 1. Columns
    const dataCol = columnExists('certificates', 'data');
    const migratedCol = columnExists('certificates', 'migrated_to_gci');
    console.log(`   data column: ${dataCol ? '✅ present' : '❌ missing'}`);
    console.log(`   migrated_to_gci column: ${migratedCol ? '✅ present' : '❌ missing'}`);

    // 2. Trigger
    const trigger = triggerExists('certificates_data_readonly');
    console.log(`   read‑only trigger: ${trigger ? '✅ present' : '❌ missing'}`);

    // 3. Index
    const index = indexExists('idx_certificates_migrated');
    console.log(`   migration index: ${index ? '✅ present' : '❌ missing'}`);

    // 4. Migration flag consistency
    const total = db.prepare('SELECT COUNT(*) as cnt FROM certificates').get().cnt;
    const migrated = db.prepare('SELECT COUNT(*) as cnt FROM certificates WHERE migrated_to_gci = 1').get().cnt;
    console.log(`   Certificates total: ${total}`);
    console.log(`   Certificates marked migrated: ${migrated}`);

    // 5. Test trigger (attempt to update data on a migrated cert)
    const sample = db.prepare('SELECT id FROM certificates WHERE migrated_to_gci = 1 LIMIT 1').get();
    if (sample) {
        try {
            db.prepare('UPDATE certificates SET data = ? WHERE id = ?').run('{"test":"value"}', sample.id);
            console.log('   ❌ Trigger test failed – data was updated on migrated certificate');
        } catch (e) {
            console.log('   ✅ Trigger test passed – update blocked as expected');
        }
    } else {
        console.log('   ℹ️ No migrated certificates to test trigger against');
    }

    console.log('✅ Verification complete');
    db.close();
}

verify();
