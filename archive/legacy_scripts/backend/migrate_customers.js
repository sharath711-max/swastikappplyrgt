const fs = require('fs');
const path = require('path');
const { db, genId } = require('../db/db');

const CUSTOMER_JSON_PATH = path.join(__dirname, '..', '..', 'db_json', 'customer.json');

console.log('Starting Customer Migration...');

try {
    if (!fs.existsSync(CUSTOMER_JSON_PATH)) {
        throw new Error(`Customer file not found at ${CUSTOMER_JSON_PATH}`);
    }

    const customers = JSON.parse(fs.readFileSync(CUSTOMER_JSON_PATH, 'utf8'));
    console.log(`Found ${customers.length} legacy customers.`);

    let migratedCount = 0;
    let skippedCount = 0;

    const stmtCheck = db.prepare('SELECT id FROM customer WHERE legacy_id = ?');
    const stmtInsert = db.prepare(`
        INSERT INTO customer (
            id, name, phone, balance, notes, 
            created, lastmodified, deletedon, legacy_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const runMigration = db.transaction(() => {
        for (const c of customers) {
            // Check if already migrated
            const existing = stmtCheck.get(c.id);
            if (existing) {
                skippedCount++;
                continue;
            }

            const newId = genId('CUS');

            // Clean phone number (extract digits only, check length)
            let phone = c.phone ? String(c.phone).replace(/\D/g, '') : null;
            if (phone && phone.length > 10) phone = phone.slice(-10); // Take last 10 digits

            // Handle disabled -> deletedon
            const deletedon = c.disabled ? new Date().toISOString() : null;

            stmtInsert.run(
                newId,
                c.name || 'Unknown Customer',
                phone,
                c.balance || 0,
                c.notes || null,
                c.created, // Preserve creation time
                c.created, // First modified at creation
                deletedon,
                c.id // Legacy ID
            );
            migratedCount++;
        }
    });

    runMigration();

    console.log('✅ Customer Migration Complete');
    console.log(`- Migrated: ${migratedCount}`);
    console.log(`- Skipped: ${skippedCount}`);

} catch (error) {
    console.error('❌ Customer Migration Failed:', error.message);
}
