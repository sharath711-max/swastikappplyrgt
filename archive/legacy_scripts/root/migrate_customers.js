const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Master Migration Script: Step 2 - Customers & Global Mapping
 * Includes deduplication by phone and ID normalization.
 */

const DBJSON_DIR = path.join(__dirname, 'db_json');
const CUSTOMER_FILE = path.join(DBJSON_DIR, 'customer.json');
const SQL_OUTPUT = path.join(__dirname, 'migrate_customers.sql');
const MAPPING_FILE = path.join(__dirname, 'id_mapping.json');

function generate18CharId() {
    return crypto.randomBytes(9).toString('hex');
}

if (!fs.existsSync(CUSTOMER_FILE)) {
    console.error(`Customer file not found: ${CUSTOMER_FILE}`);
    process.exit(1);
}

const customers = JSON.parse(fs.readFileSync(CUSTOMER_FILE, 'utf8'));
const phoneToNewId = {};
const legacyIdToNewId = {};
const uniqueCustomers = {};

console.log(`Processing ${customers.length} legacy customer entries...`);

customers.forEach(c => {
    const phone = (c.phone || '').trim();
    let targetId;

    if (phone && phone.length >= 10) {
        if (phoneToNewId[phone]) {
            targetId = phoneToNewId[phone];
            // Merge logic: maybe append notes if different?
            if (c.notes && !uniqueCustomers[targetId].notes.includes(c.notes)) {
                uniqueCustomers[targetId].notes += ` | ${c.notes}`;
            }
        } else {
            targetId = generate18CharId();
            phoneToNewId[phone] = targetId;
            uniqueCustomers[targetId] = {
                id: targetId,
                name: (c.name || 'Unknown').toString().replace(/'/g, "''"),
                phone: phone,
                balance: c.balance || 0,
                notes: (c.notes || '').toString().replace(/'/g, "''"),
                created: c.created,
                kyc_status: 'pending'
            };
        }
    } else {
        // No valid phone, treat as unique unless we want to match by name (risky)
        targetId = generate18CharId();
        uniqueCustomers[targetId] = {
            id: targetId,
            name: (c.name || 'Unknown').toString().replace(/'/g, "''"),
            phone: phone || null,
            balance: c.balance || 0,
            notes: (c.notes || '').toString().replace(/'/g, "''"),
            created: c.created,
            kyc_status: 'pending'
        };
    }

    legacyIdToNewId[c.id] = targetId;
});

let sql = '-- Migration: Customers (Deduplicated)\n';
sql += 'PRAGMA foreign_keys = OFF;\n\n';

Object.values(uniqueCustomers).forEach(c => {
    sql += `INSERT INTO customer (id, name, phone, balance, notes, created, lastmodified, type, kyc_status) \n`;
    sql += `VALUES ('${c.id}', '${c.name}', ${c.phone ? `'${c.phone}'` : 'NULL'}, ${c.balance}, '${c.notes}', '${c.created}', '${c.created}', 'retail', '${c.kyc_status}');\n`;
});

sql += '\nPRAGMA foreign_keys = ON;\n';

fs.writeFileSync(SQL_OUTPUT, sql);
fs.writeFileSync(MAPPING_FILE, JSON.stringify(legacyIdToNewId, null, 2));

console.log(`\x1b[32m✔ Success!\x1b[0m`);
console.log(`- Original records: ${customers.length}`);
console.log(`- Unique customers: ${Object.keys(uniqueCustomers).length}`);
console.log(`- SQL generated at: ${SQL_OUTPUT}`);
console.log(`- Mapping saved to: ${MAPPING_FILE}`);
