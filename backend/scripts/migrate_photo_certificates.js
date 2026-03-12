const fs = require('fs');
const path = require('path');
const { db, genId } = require('../db/db');
const { formatTimestamp } = require('../utils/autoNumber');

const CERT_JSON_PATH = path.join(__dirname, '..', '..', 'db_json', 'photo_certificate.json');

console.log('Starting Photo Certificate Migration...');

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
    console.log(`Found ${certs.length} legacy photo certificates.`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let globalItemSeq = 1;

    const stmtCheckCert = db.prepare('SELECT id FROM photo_certificate WHERE legacy_id = ?');
    const stmtGetCustomer = db.prepare('SELECT id FROM customer WHERE legacy_id = ?');

    const insertCert = db.prepare(`
        INSERT INTO photo_certificate (
            id, auto_number, customer_id, status, 
            mode_of_payment, total, gst, gst_bill_number, total_tax,
            created, lastmodified, in_progress_at, done_at, legacy_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItem = db.prepare(`
        INSERT INTO photo_certificate_item (
            id, item_number, photo_certificate_id, certificate_number,
            name, item_type, gross_weight, purity, media_path,
            created
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Define helper to process one certificate atomically
    const processCertificate = db.transaction((c, createdDate) => {
        // 1. Get New Customer ID
        const customerRow = stmtGetCustomer.get(c.customer_id);
        if (!customerRow) {
            throw new Error(`Customer not found (LegID: ${c.customer_id})`);
        }

        // 2. Generate Data
        const newCertId = genId('PCR');
        // Random suffix
        const autoNumber = generateAutoNumber('PC', createdDate, Math.floor(Math.random() * 90000) + 10000);

        // 3. Insert Parent
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

        // 4. Process Items
        let items = [];
        try {
            items = JSON.parse(c.data);
        } catch (e) {
            console.warn(`Data JSON parse error for ${c.id}`);
        }

        if (Array.isArray(items)) {
            for (const item of items) {
                const newItemId = genId('PCI');
                const itemNumber = generateAutoNumber('PCI', createdDate, globalItemSeq++);
                if (globalItemSeq > 99999) globalItemSeq = 1;

                let gross = parseFloat(item.total_weight || item.gross_weight || 0);
                if (gross <= 0) gross = 0.01;

                insertItem.run(
                    newItemId,
                    itemNumber,
                    newCertId,
                    item.certificate_number || 'UNKNOWN',
                    item.name || null,
                    item.item || item.item_type || 'Photo Item',
                    gross,
                    parseFloat(item.purity || 0),
                    item.media_path || item.media || null, // Handle both legacy keys if exist
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
            console.error(`❌ Error migrating photo cert ${c.id}:`, err.message);
            errorCount++;
        }
    }

    console.log('✅ Photo Certificate Migration Complete');
    console.log(`- Migrated: ${migratedCount}`);
    console.log(`- Skipped: ${skippedCount}`);
    console.log(`- Errors: ${errorCount}`);

} catch (error) {
    console.error('❌ Photo Migration Failed:', error.message);
}
