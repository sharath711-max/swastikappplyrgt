const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Master Migration Script: Legacy dbjson to SwastikCore SQL
 * Handles: Gold, Silver, and Photo Certificates (Parent & Child)
 * Integrated with Customer ID mapping for full relational integrity.
 */

const DBJSON_DIR = path.join(__dirname, 'db_json');
const OUTPUT_FILE = path.join(__dirname, 'migrate_all_certificates.sql');
const MAPPING_FILE = path.join(__dirname, 'id_mapping.json');

function generate18CharId() {
    return crypto.randomBytes(9).toString('hex');
}

if (!fs.existsSync(DBJSON_DIR)) {
    console.error(`db_json directory not found: ${DBJSON_DIR}`);
    process.exit(1);
}

// Load Customer ID mapping
let idMapping = {};
if (fs.existsSync(MAPPING_FILE)) {
    console.log('Loading customer ID mapping...');
    idMapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
} else {
    console.warn('[WARN] No id_mapping.json found. Customer IDs will not be translated.');
}

let sqlOutput = '-- Master Migration: Gold, Silver, and Photo Certificates\n';
sqlOutput += 'PRAGMA foreign_keys = OFF;\n\n';

const certificateConfigs = [
    { type: 'gold', filename: 'gold_certificate.json', parentTable: 'gold_certificate', childTable: 'gold_certificate_item', childIdRef: 'gold_certificate_id' },
    { type: 'silver', filename: 'silver_certificate.json', parentTable: 'silver_certificate', childTable: 'silver_certificate_item', childIdRef: 'silver_certificate_id' },
    { type: 'photo', filename: 'photo_certificate.json', parentTable: 'photo_certificate', childTable: 'photo_certificate_item', childIdRef: 'photo_certificate_id' }
];

certificateConfigs.forEach(config => {
    const inputPath = path.join(DBJSON_DIR, config.filename);
    if (!fs.existsSync(inputPath)) {
        console.warn(`[SKIP] Missing: ${config.filename}`);
        return;
    }

    console.log(`Processing ${config.type} certificates...`);
    const certs = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

    // Group by Date for NNN sequencing
    const certsByDate = {};
    certs.forEach(cert => {
        const dateMatch = cert.created.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!dateMatch) return;
        const dateKey = `${dateMatch[1]}${dateMatch[2]}${dateMatch[3]}`;
        if (!certsByDate[dateKey]) certsByDate[dateKey] = [];
        certsByDate[dateKey].push(cert);
    });

    Object.keys(certsByDate).sort().forEach(date => {
        const dailyCerts = certsByDate[date];

        const takenNnn = new Set();
        dailyCerts.forEach(c => {
            const val = parseInt(c.gst_bill_number);
            if (val > 0) takenNnn.add(val);
        });

        let counter = 1;
        function getNextNnn() {
            while (takenNnn.has(counter)) counter++;
            takenNnn.add(counter);
            return counter;
        }

        dailyCerts.sort((a, b) => new Date(a.created) - new Date(b.created));

        dailyCerts.forEach(cert => {
            let nnnVal = parseInt(cert.gst_bill_number) > 0 ? parseInt(cert.gst_bill_number) : getNextNnn();
            const autoNumber = `${date}-${String(nnnVal).padStart(3, '0')}`;

            const totalPayable = cert.total || 0;
            const gstMode = cert.gst === 1 ? 1 : 0;
            const baseAmount = gstMode === 1 ? totalPayable / 1.18 : totalPayable;
            const gstAmount = totalPayable - baseAmount;

            const parentId = generate18CharId();
            const createdYmd = cert.created;
            const mappedCustomerId = idMapping[cert.customer_id] || cert.customer_id;

            sqlOutput += `INSERT INTO ${config.parentTable} (id, auto_number, customer_id, status, total, gst, total_tax, gst_bill_number, mode_of_payment, created, lastmodified) \n`;
            sqlOutput += `VALUES ('${parentId}', '${autoNumber}', '${mappedCustomerId}', 'DONE', ${totalPayable.toFixed(2)}, ${gstMode}, ${gstAmount.toFixed(2)}, '${cert.gst_bill_number}', '${cert.mode_of_payment || 'cash'}', '${createdYmd}', '${createdYmd}');\n`;

            try {
                const items = JSON.parse(cert.data || '[]');
                const medias = cert.media ? JSON.parse(cert.media) : [];

                items.forEach((item, idx) => {
                    const childId = generate18CharId();
                    const itemRefId = item.certificate_number || `A${String(idx + 1).padStart(2, '0')}`;
                    const itemName = (item.item || 'Item').toString().replace(/'/g, "''");
                    const grossWeight = parseFloat(item.total_weight) || 0;
                    const testWeight = parseFloat(item.test_weight) || 0;
                    const netWeight = grossWeight - testWeight;
                    const purity = parseFloat(item.purity) || 0;
                    const returned = item.returned ? 1 : 0;
                    const itemNumber = `${autoNumber}-${itemRefId}`;

                    if (config.type === 'photo') {
                        let mediaPath = medias[idx] || null;
                        sqlOutput += `INSERT INTO ${config.childTable} (id, item_number, ${config.childIdRef}, certificate_number, name, item_type, gross_weight, test_weight, net_weight, purity, returned, media_path, created) \n`;
                        sqlOutput += `VALUES ('${childId}', '${itemNumber}', '${parentId}', '${itemRefId}', '${itemName}', '${config.type}', ${grossWeight}, ${testWeight}, ${netWeight.toFixed(2)}, ${purity}, ${returned}, ${mediaPath ? `'${mediaPath.replace(/'/g, "''")}'` : 'NULL'}, '${createdYmd}');\n`;
                    } else {
                        sqlOutput += `INSERT INTO ${config.childTable} (id, item_number, ${config.childIdRef}, certificate_number, name, item_type, gross_weight, test_weight, net_weight, purity, returned, created) \n`;
                        sqlOutput += `VALUES ('${childId}', '${itemNumber}', '${parentId}', '${itemRefId}', '${itemName}', '${config.type}', ${grossWeight}, ${testWeight}, ${netWeight.toFixed(2)}, ${purity}, ${returned}, '${createdYmd}');\n`;
                    }
                });
            } catch (e) {
                console.warn(`[ERR] Item parse failed for ${cert.id}`);
            }
            sqlOutput += '\n';
        });
    });
});

sqlOutput += 'PRAGMA foreign_keys = ON;\n';
fs.writeFileSync(OUTPUT_FILE, sqlOutput);
console.log(`\x1b[32m✔ Success!\x1b[0m SQL migration script updated with Customer Mapping at: ${OUTPUT_FILE}`);
