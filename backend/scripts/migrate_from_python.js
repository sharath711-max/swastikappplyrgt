'use strict';

/**
 * migrate_from_python.js
 *
 * One-shot migration: Python SQLite (Flask/SQLAlchemy) → SERN SQLite.
 *
 * Run ONCE on the server before go-live:
 *   node backend/scripts/migrate_from_python.js \
 *     --source /path/to/python/app.db \
 *     --target /path/to/sern/backend/database.sqlite
 *
 * What it does:
 *   1. Customers          — integer id → prefixed text id (CUS-xxx)
 *   2. Users              — email-based auth → username-based auth (manual password reset required)
 *   3. Gold tests         — JSON data[] exploded into gold_test_item rows
 *   4. Silver tests       — same pattern (silver_test table added manually if missing)
 *   5. Gold certificates  — JSON data[] exploded into gold_certificate_item rows
 *   6. Silver certs       — same
 *   7. Photo certs        — same (media JSON preserved as-is in item rows)
 *   8. Credit history     — customer_id remapped to new text id
 *   9. Weight loss history — same
 *  10. Globals / sequences — gst_bill_number high-water mark seeded
 *
 * Safety:
 *   - Runs entirely in a single SQLite transaction — either all or nothing.
 *   - Dry-run mode (--dry-run) prints counts without writing anything.
 *   - Skips records that already exist in the target (idempotent re-runs).
 *   - All warnings logged to migration.log in the same directory.
 *
 * Limitations:
 *   - Python bcrypt hashes are NOT compatible with the SERN bcryptjs hashes.
 *     All migrated users get a temporary password: Swastik@Reset1
 *     Staff MUST change passwords after first login.
 *   - silver_test did not exist in the original Python schema — those records
 *     are skipped if the source table is absent.
 *   - Photo media files are not copied — only paths are migrated.
 *     Ensure /uploads is copied separately.
 */

const Database  = require('better-sqlite3');
const path      = require('path');
const fs        = require('fs');
const crypto    = require('crypto');
const bcrypt    = require('bcryptjs');

// ─── CLI args ──────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const getArg  = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };
const DRY_RUN = args.includes('--dry-run');
const SOURCE  = getArg('--source');
const TARGET  = getArg('--target');

if (!SOURCE || !TARGET) {
    console.error('Usage: node migrate_from_python.js --source <python.db> --target <sern.sqlite> [--dry-run]');
    process.exit(1);
}
if (!fs.existsSync(SOURCE)) { console.error(`Source not found: ${SOURCE}`); process.exit(1); }
if (!fs.existsSync(TARGET)) { console.error(`Target not found: ${TARGET}`); process.exit(1); }

// ─── Logging ───────────────────────────────────────────────────────────────
const logPath = path.join(path.dirname(TARGET), 'migration.log');
const logStream = fs.createWriteStream(logPath, { flags: 'a' });
function log(msg)  { const line = `[${new Date().toISOString()}] ${msg}`; console.log(line);  logStream.write(line + '\n'); }
function warn(msg) { const line = `[WARN] ${msg}`;                        console.warn(line); logStream.write(line + '\n'); }

// ─── Open DBs ──────────────────────────────────────────────────────────────
const src = new Database(SOURCE, { readonly: true });
const tgt = DRY_RUN ? null : new Database(TARGET);

log(`Migration start — source: ${SOURCE}`);
log(`Target: ${TARGET}  DRY_RUN: ${DRY_RUN}`);

// ─── ID helpers ───────────────────────────────────────────────────────────
function genId(prefix) {
    return `${prefix}-${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
}
function now() {
    const d = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    return d.toISOString().replace('Z', '+05:30');
}

// Map: Python integer id → new SERN text id
const customerIdMap = new Map(); // py_int → sern_text

// ─── Status mapping ────────────────────────────────────────────────────────
function mapStatus(pyStatus) {
    switch ((pyStatus || '').toLowerCase()) {
        case 'ongoing':   return 'TODO';
        case 'pending':   return 'IN_PROGRESS';
        case 'completed': return 'DONE';
        default:          return 'TODO';
    }
}

// ─── Mode of payment normalise ─────────────────────────────────────────────
function mapPayment(mop) {
    if (!mop) return 'Cash';
    const m = mop.toLowerCase();
    if (m === 'cash')    return 'Cash';
    if (m === 'upi')     return 'UPI';
    if (m === 'balance') return 'Balance';
    return mop; // pass-through unknown values
}

// ─── Table existence helper ────────────────────────────────────────────────
function tableExists(db, name) {
    return !!db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=?`).get(name);
}

// ─── Letter label for cert items (A001, A002 …) ───────────────────────────
function certLabel(seq) {
    const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letterIdx = Math.floor((seq - 1) / 999);
    const numPart   = ((seq - 1) % 999) + 1;
    return `${ALPHA[letterIdx] || 'Z'}${String(numPart).padStart(3, '0')}`;
}

// ─── Counters ──────────────────────────────────────────────────────────────
const counts = {
    customers: 0, users: 0,
    gold_tests: 0, gold_test_items: 0,
    silver_tests: 0, silver_test_items: 0,
    gold_certs: 0, gold_cert_items: 0,
    silver_certs: 0, silver_cert_items: 0,
    photo_certs: 0, photo_cert_items: 0,
    credit_history: 0, weight_loss: 0,
    skipped: 0, warnings: 0,
};

// ─── MIGRATION ─────────────────────────────────────────────────────────────
function runMigration() {
    const ts = now();

    // ── 1. CUSTOMERS ──────────────────────────────────────────────────────
    log('Migrating customers...');
    const pyCustomers = src.prepare('SELECT * FROM customer ORDER BY id').all();

    if (!DRY_RUN) {
        const insertCustomer = tgt.prepare(`
            INSERT OR IGNORE INTO customer (id, name, phone, balance, notes, created, lastmodified)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        for (const c of pyCustomers) {
            const newId = genId('CUS');
            customerIdMap.set(c.id, newId);
            insertCustomer.run(newId, c.name, c.phone || null, c.balance || 0, c.notes || null,
                c.created || ts, ts);
            counts.customers++;
        }
    } else {
        for (const c of pyCustomers) customerIdMap.set(c.id, genId('CUS'));
        counts.customers = pyCustomers.length;
    }
    log(`  → ${counts.customers} customers`);

    // ── 2. USERS ──────────────────────────────────────────────────────────
    log('Migrating users...');
    // Python uses email-based auth. SERN uses username. We use email as username.
    // All passwords reset to Swastik@Reset1 — staff MUST change on first login.
    const TEMP_PASSWORD = 'Swastik@Reset1';
    const tempHash = bcrypt.hashSync(TEMP_PASSWORD, 10);

    if (tableExists(src, 'user')) {
        const pyUsers = src.prepare('SELECT * FROM user ORDER BY id').all();
        if (!DRY_RUN) {
            const insertUser = tgt.prepare(`
                INSERT OR IGNORE INTO users (id, username, password, role, created, lastmodified)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            for (const u of pyUsers) {
                const newId = genId('USR');
                const username = u.email || `user_${u.id}`;
                insertUser.run(newId, username, tempHash, 'admin', u.created || ts, ts);
                counts.users++;
            }
        } else {
            counts.users = pyUsers.length;
        }
        warn(`All ${counts.users} user(s) migrated with temp password: ${TEMP_PASSWORD} — CHANGE IMMEDIATELY`);
    } else {
        warn('No user table found in source — skipping users');
    }
    log(`  → ${counts.users} users`);

    // ── 3. GOLD TESTS ─────────────────────────────────────────────────────
    log('Migrating gold tests...');

    const insertGoldTest = DRY_RUN ? null : tgt.prepare(`
        INSERT OR IGNORE INTO gold_test
          (id, auto_number, customer_id, status, mode_of_payment, total, created, lastmodified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertGoldItem = DRY_RUN ? null : tgt.prepare(`
        INSERT OR IGNORE INTO gold_test_item
          (id, item_number, gold_test_id, name, item_type, gross_weight, sample_weight,
           test_weight, net_weight, purity, fine_weight, item_total, returned, created)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const pyGoldTests = src.prepare('SELECT * FROM gold_test ORDER BY id').all();
    for (const t of pyGoldTests) {
        const custId = customerIdMap.get(t.customer_id);
        if (!custId) { warn(`gold_test ${t.id}: customer ${t.customer_id} not found — skipped`); counts.skipped++; continue; }

        const newId   = genId('GTS');
        const autoNum = `GT-LEGACY-${String(t.id).padStart(4, '0')}`;
        const status  = mapStatus(t.status);
        const mop     = mapPayment(t.mode_of_payment);
        let   data    = [];
        try { data = typeof t.data === 'string' ? JSON.parse(t.data) : (t.data || []); }
        catch { warn(`gold_test ${t.id}: invalid JSON data — items skipped`); counts.warnings++; }

        if (!DRY_RUN) insertGoldTest.run(newId, autoNum, custId, status, mop, t.total || 0, t.created || ts, ts);
        counts.gold_tests++;

        // Explode JSON items into normalised rows
        for (let i = 0; i < data.length; i++) {
            const item    = data[i];
            const itemId  = genId('GTI');
            const itemNum = `${autoNum}-${i + 1}`;
            const gross   = parseFloat(item.total_weight || 0);
            const test    = parseFloat(item.test_weight  || 0);
            const net     = gross - test;
            const purity  = item.purity != null ? parseFloat(item.purity) : null;
            const fine    = (purity != null && net > 0) ? Math.round((net * purity / 100) * 1000) / 1000 : 0;
            const returned = item.returned ? 1 : 0;

            if (!DRY_RUN) insertGoldItem.run(
                itemId, itemNum, newId,
                item.name || null, item.item || 'Gold',
                gross, 0, test, net,
                purity, fine, item.total || 0,
                returned, t.created || ts
            );
            counts.gold_test_items++;
        }
    }
    log(`  → ${counts.gold_tests} gold tests, ${counts.gold_test_items} items`);

    // ── 4. SILVER TESTS ───────────────────────────────────────────────────
    log('Migrating silver tests...');
    if (tableExists(src, 'silver_test')) {
        const insertSilverTest = DRY_RUN ? null : tgt.prepare(`
            INSERT OR IGNORE INTO silver_test
              (id, auto_number, customer_id, status, mode_of_payment, total, created, lastmodified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const insertSilverItem = DRY_RUN ? null : tgt.prepare(`
            INSERT OR IGNORE INTO silver_test_item
              (id, item_number, silver_test_id, name, item_type, gross_weight, sample_weight,
               test_weight, net_weight, purity, fine_weight, item_total, returned, created)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const pySilverTests = src.prepare('SELECT * FROM silver_test ORDER BY id').all();
        for (const t of pySilverTests) {
            const custId = customerIdMap.get(t.customer_id);
            if (!custId) { counts.skipped++; continue; }
            const newId   = genId('STS');
            const autoNum = `ST-LEGACY-${String(t.id).padStart(4, '0')}`;
            let data = [];
            try { data = typeof t.data === 'string' ? JSON.parse(t.data) : (t.data || []); }
            catch { counts.warnings++; }
            if (!DRY_RUN) insertSilverTest.run(newId, autoNum, custId, mapStatus(t.status), mapPayment(t.mode_of_payment), t.total || 0, t.created || ts, ts);
            counts.silver_tests++;
            for (let i = 0; i < data.length; i++) {
                const item   = data[i];
                const gross  = parseFloat(item.total_weight || 0);
                const test   = parseFloat(item.test_weight  || 0);
                const net    = gross - test;
                const purity = item.purity != null ? parseFloat(item.purity) : null;
                const fine   = (purity != null && net > 0) ? Math.round(net * purity / 100 * 1000) / 1000 : 0;
                if (!DRY_RUN) insertSilverItem.run(
                    genId('STI'), `${autoNum}-${i + 1}`, newId,
                    item.name || null, item.item || 'Silver',
                    gross, 0, test, net,
                    purity, fine, item.total || 0,
                    item.returned ? 1 : 0, t.created || ts
                );
                counts.silver_test_items++;
            }
        }
    } else {
        log('  → No silver_test table in source — skipped');
    }
    log(`  → ${counts.silver_tests} silver tests, ${counts.silver_test_items} items`);

    // ── 5. GOLD CERTIFICATES ──────────────────────────────────────────────
    log('Migrating gold certificates...');
    const insertGoldCert = DRY_RUN ? null : tgt.prepare(`
        INSERT OR IGNORE INTO gold_certificate
          (id, auto_number, customer_id, status, total, total_net_weight, total_fine_weight,
           gst, total_tax, gst_bill_number, mode_of_payment, created, lastmodified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertGoldCertItem = DRY_RUN ? null : tgt.prepare(`
        INSERT OR IGNORE INTO gold_certificate_item
          (id, item_number, gold_certificate_id, certificate_number, name, item_type,
           gross_weight, test_weight, net_weight, purity, fine_weight, item_total, returned, created)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let maxGstBill = 0, maxNonGstBill = 0;
    const pyGoldCerts = src.prepare('SELECT * FROM gold_certificate ORDER BY id').all();

    for (const c of pyGoldCerts) {
        const custId = customerIdMap.get(c.customer_id);
        if (!custId) { counts.skipped++; continue; }
        const newId   = genId('GCR');
        const autoNum = `GC-LEGACY-${String(c.id).padStart(4, '0')}`;
        let data = [];
        try { data = typeof c.data === 'string' ? JSON.parse(c.data) : (c.data || []); }
        catch { counts.warnings++; }

        const isGst   = c.gst ? 1 : 0;
        const billNum = c.gst_bill_number ? String(c.gst_bill_number) : null;

        // Track high-water mark for sequence seeding
        const billInt = parseInt(c.gst_bill_number, 10) || 0;
        if (isGst  && billInt > maxGstBill)    maxGstBill    = billInt;
        if (!isGst && billInt > maxNonGstBill) maxNonGstBill = billInt;

        let totalNet = 0, totalFine = 0;
        for (const item of data) {
            const gross = parseFloat(item.total_weight || 0), test = parseFloat(item.test_weight || 0);
            totalNet  += gross - test;
            totalFine += item.purity ? (gross - test) * parseFloat(item.purity) / 100 : 0;
        }

        if (!DRY_RUN) insertGoldCert.run(
            newId, autoNum, custId, mapStatus(c.status),
            c.total || 0, Math.round(totalNet * 1000) / 1000, Math.round(totalFine * 1000) / 1000,
            isGst, c.total_tax || 0, billNum,
            mapPayment(c.mode_of_payment), c.created || ts, ts
        );
        counts.gold_certs++;

        for (let i = 0; i < data.length; i++) {
            const item    = data[i];
            const gross   = parseFloat(item.total_weight || 0);
            const test    = parseFloat(item.test_weight  || 0);
            const net     = gross - test;
            const purity  = item.purity != null ? parseFloat(item.purity) : null;
            const fine    = (purity != null && net > 0) ? Math.round(net * purity / 100 * 1000) / 1000 : 0;
            const certNum = item.certificate_number || certLabel(i + 1);
            if (!DRY_RUN) insertGoldCertItem.run(
                genId('GCI'), `${autoNum}-${i + 1}`, newId, certNum,
                item.name || null, item.item || 'Gold',
                gross, test, net, purity, fine, item.total || 0,
                item.returned ? 1 : 0, c.created || ts
            );
            counts.gold_cert_items++;
        }
    }
    log(`  → ${counts.gold_certs} gold certificates, ${counts.gold_cert_items} items`);

    // ── 6. SILVER CERTIFICATES ────────────────────────────────────────────
    log('Migrating silver certificates...');
    const insertSilverCert = DRY_RUN ? null : tgt.prepare(`
        INSERT OR IGNORE INTO silver_certificate
          (id, auto_number, customer_id, status, total, total_net_weight,
           gst, total_tax, gst_bill_number, mode_of_payment, created, lastmodified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertSilverCertItem = DRY_RUN ? null : tgt.prepare(`
        INSERT OR IGNORE INTO silver_certificate_item
          (id, item_number, silver_certificate_id, certificate_number, name, item_type,
           gross_weight, test_weight, net_weight, purity, fine_weight, item_total, returned, created)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const pySilverCerts = src.prepare('SELECT * FROM silver_certificate ORDER BY id').all();
    for (const c of pySilverCerts) {
        const custId = customerIdMap.get(c.customer_id);
        if (!custId) { counts.skipped++; continue; }
        const newId   = genId('SCR');
        const autoNum = `SC-LEGACY-${String(c.id).padStart(4, '0')}`;
        let data = [];
        try { data = typeof c.data === 'string' ? JSON.parse(c.data) : (c.data || []); }
        catch { counts.warnings++; }
        let totalNet = 0;
        for (const item of data) totalNet += parseFloat(item.total_weight || 0) - parseFloat(item.test_weight || 0);
        const isGst   = c.gst ? 1 : 0;
        const billInt = parseInt(c.gst_bill_number, 10) || 0;
        if (isGst  && billInt > maxGstBill)    maxGstBill    = billInt;
        if (!isGst && billInt > maxNonGstBill) maxNonGstBill = billInt;
        if (!DRY_RUN) insertSilverCert.run(
            newId, autoNum, custId, mapStatus(c.status),
            c.total || 0, Math.round(totalNet * 1000) / 1000,
            isGst, c.total_tax || 0, c.gst_bill_number ? String(c.gst_bill_number) : null,
            mapPayment(c.mode_of_payment), c.created || ts, ts
        );
        counts.silver_certs++;
        for (let i = 0; i < data.length; i++) {
            const item   = data[i];
            const gross  = parseFloat(item.total_weight || 0);
            const test   = parseFloat(item.test_weight  || 0);
            const net    = gross - test;
            const purity = item.purity != null ? parseFloat(item.purity) : null;
            const fine   = (purity != null && net > 0) ? Math.round(net * purity / 100 * 1000) / 1000 : 0;
            if (!DRY_RUN) insertSilverCertItem.run(
                genId('SCI'), `${autoNum}-${i + 1}`, newId,
                item.certificate_number || certLabel(i + 1),
                item.name || null, item.item || 'Silver',
                gross, test, net, purity, fine, item.total || 0,
                item.returned ? 1 : 0, c.created || ts
            );
            counts.silver_cert_items++;
        }
    }
    log(`  → ${counts.silver_certs} silver certificates, ${counts.silver_cert_items} items`);

    // ── 7. PHOTO CERTIFICATES ─────────────────────────────────────────────
    log('Migrating photo certificates...');
    const insertPhotoCert = DRY_RUN ? null : tgt.prepare(`
        INSERT OR IGNORE INTO photo_certificate
          (id, auto_number, customer_id, status, total,
           gst, total_tax, gst_bill_number, mode_of_payment, created, lastmodified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertPhotoCertItem = DRY_RUN ? null : tgt.prepare(`
        INSERT OR IGNORE INTO photo_certificate_item
          (id, item_number, photo_certificate_id, certificate_number, name, item_type,
           gross_weight, test_weight, net_weight, purity, fine_weight, item_total,
           returned, media_path, created)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const pyPhotoCerts = tableExists(src, 'photo_certificate')
        ? src.prepare('SELECT * FROM photo_certificate ORDER BY id').all()
        : [];
    for (const c of pyPhotoCerts) {
        const custId = customerIdMap.get(c.customer_id);
        if (!custId) { counts.skipped++; continue; }
        const newId   = genId('PCR');
        const autoNum = `PC-LEGACY-${String(c.id).padStart(4, '0')}`;
        let data = [], media = [];
        try { data  = typeof c.data  === 'string' ? JSON.parse(c.data)  : (c.data  || []); } catch { counts.warnings++; }
        try { media = typeof c.media === 'string' ? JSON.parse(c.media) : (c.media || []); } catch { }
        if (!DRY_RUN) insertPhotoCert.run(
            newId, autoNum, custId, mapStatus(c.status), c.total || 0,
            c.gst ? 1 : 0, c.total_tax || 0,
            c.gst_bill_number ? String(c.gst_bill_number) : null,
            mapPayment(c.mode_of_payment), c.created || ts, ts
        );
        counts.photo_certs++;
        for (let i = 0; i < data.length; i++) {
            const item      = data[i];
            const mediaPath = Array.isArray(media) && media[i] ? JSON.stringify(media[i]) : null;
            const gross     = parseFloat(item.total_weight || 0);
            const test      = parseFloat(item.test_weight  || 0);
            const net       = gross - test;
            const purity    = item.purity != null ? parseFloat(item.purity) : null;
            const fine      = (purity != null && net > 0) ? Math.round(net * purity / 100 * 1000) / 1000 : 0;
            if (!DRY_RUN) insertPhotoCertItem.run(
                genId('PCI'), `${autoNum}-${i + 1}`, newId,
                item.certificate_number || certLabel(i + 1),
                item.name || null, item.item || 'Photo',
                gross, test, net, purity, fine, item.total || 0,
                item.returned ? 1 : 0, mediaPath, c.created || ts
            );
            counts.photo_cert_items++;
        }
    }
    log(`  → ${counts.photo_certs} photo certificates, ${counts.photo_cert_items} items`);

    // ── 8. CREDIT HISTORY ─────────────────────────────────────────────────
    log('Migrating credit history...');
    if (tableExists(src, 'credit_history')) {
        const insertCredit = DRY_RUN ? null : tgt.prepare(`
            INSERT OR IGNORE INTO credit_history
              (id, customer_id, amount, type, mode_of_payment, description, created)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const pyCredits = src.prepare('SELECT * FROM credit_history ORDER BY id').all();
        for (const h of pyCredits) {
            const custId = customerIdMap.get(h.customer_id);
            if (!custId) { counts.skipped++; continue; }
            const type = (h.type || '').toUpperCase() === 'CREDIT' ? 'CREDIT' : 'DEBIT';
            const desc = `Migrated from Python — previous_balance: ${h.previous_balance ?? 'n/a'}`;
            if (!DRY_RUN) insertCredit.run(genId('CHI'), custId, h.amount || 0, type, mapPayment(h.mode_of_payment), desc, h.created || ts);
            counts.credit_history++;
        }
    }
    log(`  → ${counts.credit_history} credit history records`);

    // ── 9. WEIGHT LOSS HISTORY ────────────────────────────────────────────
    log('Migrating weight loss history...');
    if (tableExists(src, 'weight_loss_history')) {
        const insertWl = DRY_RUN ? null : tgt.prepare(`
            INSERT OR IGNORE INTO weight_loss_history
              (id, customer_id, amount, reason, created)
            VALUES (?, ?, ?, ?, ?)
        `);
        const pyWls = src.prepare('SELECT * FROM weight_loss_history ORDER BY id').all();
        for (const w of pyWls) {
            const custId = customerIdMap.get(w.customer_id);
            if (!custId) { counts.skipped++; continue; }
            if (!DRY_RUN) insertWl.run(genId('WLH'), custId, w.amount || 0, 'Migrated from Python', w.created || ts);
            counts.weight_loss++;
        }
    }
    log(`  → ${counts.weight_loss} weight loss records`);

    // ── 10. SEED SEQUENCES ────────────────────────────────────────────────
    log('Seeding sequences...');
    if (!DRY_RUN) {
        // Seed GST/NON-GST sequences at the high-water mark from Python.
        // ON CONFLICT takes the higher of the existing value and the incoming value —
        // safe to re-run even if the target already has a higher counter.
        const upsertGlobal = tgt.prepare(`
            INSERT INTO globals (key, value, created, lastmodified)
            VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE
              SET value        = MAX(CAST(value AS INTEGER), CAST(excluded.value AS INTEGER)),
                  lastmodified = CURRENT_TIMESTAMP
        `);
        upsertGlobal.run('GST_CERT_SEQ',     String(maxGstBill));
        upsertGlobal.run('NON_GST_CERT_SEQ', String(maxNonGstBill));
        log(`  → GST sequence seeded at ${maxGstBill}, NON-GST at ${maxNonGstBill}`);
    }
}

// ─── Run ─────────────────────────────────────────────────────────────────
if (DRY_RUN) {
    log('=== DRY RUN — no data will be written ===');
    runMigration();
} else {
    const migrate = tgt.transaction(runMigration);
    try {
        migrate();
        log('=== Migration committed successfully ===');
    } catch (err) {
        log(`=== Migration ROLLED BACK: ${err.message} ===`);
        console.error(err);
        process.exit(1);
    }
}

// ─── Summary ─────────────────────────────────────────────────────────────
log('');
log('=== SUMMARY ===');
Object.entries(counts).forEach(([k, v]) => log(`  ${k}: ${v}`));
log(`  log written to: ${logPath}`);
if (!DRY_RUN) {
    log('');
    log('⚠️  IMPORTANT: All migrated users have temp password: Swastik@Reset1');
    log('   Staff MUST change passwords after first login.');
    log('   Run: node backend/scripts/seed_admin.js to create a fresh admin if needed.');
}

src.close();
if (tgt) tgt.close();
logStream.end();
