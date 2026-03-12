const fs = require('fs');
const path = require('path');
const { db, genId } = require('../db/db');

// Schema updates first (kept from previous version)
console.log('Updating silver schema and preparing for data migration...');
try {
    // Add any helpful columns to certificate/item tables
    const schemaDb = db; // alias for clarity
    try {
        schemaDb.prepare('ALTER TABLE silver_certificate_item ADD COLUMN item_total REAL DEFAULT 0').run();
        console.log('Added item_total column to silver_certificate_item');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log('item_total column already exists');
        } else {
            console.error('Error adding item_total:', e.message);
        }
    }
    try {
        schemaDb.prepare('ALTER TABLE silver_certificate_item ADD COLUMN fine_weight REAL DEFAULT 0').run();
        console.log('Added fine_weight column to silver_certificate_item');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log('fine_weight column already exists');
        } else {
            console.error('Error adding fine_weight:', e.message);
        }
    }
    try {
        schemaDb.prepare('ALTER TABLE silver_certificate_item ADD COLUMN item_no TEXT').run();
        console.log('Added item_no column to silver_certificate_item');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log('item_no column already exists');
        } else {
            console.error('Error adding item_no:', e.message);
        }
    }
    // Add roll‑up columns to parent if missing
    const parentCols = [{ name: 'total_net_weight', type: 'REAL DEFAULT 0' }, { name: 'total_fine_weight', type: 'REAL DEFAULT 0' }];
    for (const col of parentCols) {
        try {
            schemaDb.prepare(`ALTER TABLE silver_certificate ADD COLUMN ${col.name} ${col.type}`).run();
            console.log(`Added ${col.name} to silver_certificate`);
        } catch (e) {
            if (e.message.includes('duplicate column name')) {
                console.log(`${col.name} already present on silver_certificate`);
            } else {
                console.error(`Error adding ${col.name}:`, e.message);
            }
        }
    }
} catch (schemaErr) {
    console.error('Schema update failed:', schemaErr.message);
}

// ===== Data migration section =====

const CERT_JSON_PATH = path.join(__dirname, '..', '..', 'db_json', 'silver_certificate.json');
console.log('Starting Silver Certificate Data Migration...');

function generateAutoNumber(prefix, createdDate, sequence) {
    const pad = (n) => String(n).padStart(2, '0');
    const YYYY = createdDate.getFullYear();
    const MM = pad(createdDate.getMonth() + 1);
    const DD = pad(createdDate.getDate());
    const HH = pad(createdDate.getHours());
    const mm = pad(createdDate.getMinutes());
    const ss = pad(createdDate.getSeconds());
    const batchId = `${YYYY}${MM}${DD}${HH}${mm}${ss}`;
    const seqStr = String(sequence).padStart(5, '0');
    return `${prefix}-${batchId}${seqStr}`;
}

try {
    if (!fs.existsSync(CERT_JSON_PATH)) {
        throw new Error(`File not found: ${CERT_JSON_PATH}`);
    }

    const certs = JSON.parse(fs.readFileSync(CERT_JSON_PATH, 'utf8'));
    console.log(`Found ${certs.length} legacy silver certificates.`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let globalItemSeq = 1;

    const stmtCheckCert = db.prepare('SELECT id FROM silver_certificate WHERE legacy_id = ?');
    const stmtGetCustomer = db.prepare('SELECT id FROM customer WHERE legacy_id = ?');

    const insertCert = db.prepare(`
        INSERT INTO silver_certificate (
            id, auto_number, customer_id, status,
            mode_of_payment, total, gst, gst_bill_number, total_tax,
            created, lastmodified, in_progress_at, done_at, legacy_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItem = db.prepare(`
        INSERT INTO silver_certificate_item (
            id, item_number, silver_certificate_id, certificate_number,
            name, item_type, gross_weight, test_weight, net_weight, purity, returned,
            created
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const processCertificate = db.transaction((c, createdDate) => {
        const customerRow = stmtGetCustomer.get(c.customer_id);
        if (!customerRow) {
            throw new Error(`Customer not found (LegID: ${c.customer_id})`);
        }

        const newCertId = genId('SCR');
        const autoNumber = generateAutoNumber('SC', createdDate, Math.floor(Math.random() * 90000) + 10000);

        insertCert.run(
            newCertId,
            autoNumber,
            customerRow.id,
            'DONE',
            c.mode_of_payment || 'cash',
            c.total || 0,
            c.gst ? 1 : 0,
            String(c.gst_bill_number || ''),
            c.total_tax || 0,
            c.created,
            c.created,
            c.created,
            c.created,
            c.id
        );

        let items = [];
        try {
            items = JSON.parse(c.data);
        } catch (e) {
            console.warn(`Data JSON parse error for ${c.id}`);
        }

        if (Array.isArray(items)) {
            for (const item of items) {
                const newItemId = genId('SCI');
                const itemNumber = generateAutoNumber('SCI', createdDate, globalItemSeq++);
                if (globalItemSeq > 99999) globalItemSeq = 1;

                let gross = parseFloat(item.total_weight || item.gross_weight || 0);
                if (gross <= 0) gross = 0.01;

                let test = parseFloat(item.test_weight || 0);
                if (test > gross) {
                    console.warn(`⚠️ Adjusted test_weight for item in cert ${c.id}: Test(${test}) > Gross(${gross})`);
                    test = gross;
                }

                const net = gross - test;

                insertItem.run(
                    newItemId,
                    itemNumber,
                    newCertId,
                    item.certificate_number || 'UNKNOWN',
                    item.name || null,
                    item.item || item.item_type || 'Silver Item',
                    gross,
                    test,
                    net,
                    parseFloat(item.purity || 0),
                    item.returned ? 1 : 0,
                    c.created
                );
            }
        }
    });

    for (const c of certs) {
        try {
            if (stmtCheckCert.get(c.id)) {
                skippedCount++;
                continue;
            }

            const createdDate = new Date(c.created);
            processCertificate(c, createdDate);
            migratedCount++;

        } catch (err) {
            console.error(`❌ Error migrating cert ${c.id}:`, err.message);
            errorCount++;
        }
    }

    console.log('✅ Silver Certificate Migration Complete');
    console.log(`- Migrated: ${migratedCount}`);
    console.log(`- Skipped: ${skippedCount}`);
    console.log(`- Errors: ${errorCount}`);

} catch (error) {
    console.error('❌ Global Migration Failed:', error.message);
}

// close db if necessary? not strictly required

