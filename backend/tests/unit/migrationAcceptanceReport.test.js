const fs = require('fs');
const os = require('os');
const path = require('path');
const Database = require('better-sqlite3');
const { buildReport, renderMarkdown } = require('../../scripts/migration_acceptance_report');

function tempPath(name) {
    return path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'migration-report-')), name);
}

function createPythonDb(file, { badStatus = false, missingMedia = false } = {}) {
    const db = new Database(file);
    db.exec(`
        CREATE TABLE customer (id INTEGER PRIMARY KEY, name TEXT, phone TEXT, balance REAL, notes TEXT, created TEXT);
        CREATE TABLE gold_test (id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, total REAL, mode_of_payment TEXT, data TEXT, created TEXT);
        CREATE TABLE gold_certificate (id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, total REAL, gst INTEGER, gst_bill_number TEXT, mode_of_payment TEXT, data TEXT, created TEXT);
        CREATE TABLE silver_certificate (id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, total REAL, gst INTEGER, gst_bill_number TEXT, mode_of_payment TEXT, data TEXT, created TEXT);
        CREATE TABLE photo_certificate (id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, total REAL, gst INTEGER, gst_bill_number TEXT, mode_of_payment TEXT, data TEXT, media TEXT, created TEXT);
        CREATE TABLE credit_history (id INTEGER PRIMARY KEY, customer_id INTEGER, amount REAL, type TEXT, mode_of_payment TEXT, created TEXT);
        CREATE TABLE weight_loss_history (id INTEGER PRIMARY KEY, customer_id INTEGER, amount REAL, created TEXT);
    `);
    db.prepare('INSERT INTO customer VALUES (1, ?, ?, ?, ?, ?)').run('Asha', '999', 0, '', '2026-01-01');
    db.prepare('INSERT INTO gold_test VALUES (1, 1, ?, 30, ?, ?, ?)').run(
        badStatus ? 'tested' : 'pending',
        'cash',
        JSON.stringify([{ item: 'Ring' }]),
        '2026-01-01',
    );
    db.prepare('INSERT INTO gold_certificate VALUES (1, 1, ?, 50, 1, ?, ?, ?, ?)').run('completed', '12', 'upi', JSON.stringify([{ item: 'Chain' }]), '2026-01-01');
    db.prepare('INSERT INTO silver_certificate VALUES (1, 1, ?, 100, 0, ?, ?, ?, ?)').run('ongoing', '7', 'cash', JSON.stringify([{ item: 'Coin' }]), '2026-01-01');
    db.prepare('INSERT INTO photo_certificate VALUES (1, 1, ?, 50, 0, ?, ?, ?, ?, ?)').run(
        'completed',
        '8',
        'cash',
        JSON.stringify([{ item: 'Photo' }]),
        JSON.stringify([missingMedia ? 'missing.jpg' : 'existing.jpg']),
        '2026-01-01',
    );
    db.prepare('INSERT INTO credit_history VALUES (1, 1, 10, ?, ?, ?)').run('DEBIT', 'cash', '2026-01-01');
    db.prepare('INSERT INTO weight_loss_history VALUES (1, 1, 5, ?)').run('2026-01-01');
    db.close();
}

function createTargetDb(file) {
    const db = new Database(file);
    db.exec(`
        CREATE TABLE customer (id TEXT PRIMARY KEY, deletedon TEXT);
        CREATE TABLE gold_test (id TEXT PRIMARY KEY, status TEXT, total REAL, deletedon TEXT);
        CREATE TABLE gold_test_item (id TEXT PRIMARY KEY, gold_test_id TEXT, deletedon TEXT);
        CREATE TABLE silver_test (id TEXT PRIMARY KEY, status TEXT, total REAL, deletedon TEXT);
        CREATE TABLE silver_test_item (id TEXT PRIMARY KEY, silver_test_id TEXT, deletedon TEXT);
        CREATE TABLE gold_certificate (id TEXT PRIMARY KEY, status TEXT, total REAL, deletedon TEXT);
        CREATE TABLE gold_certificate_item (id TEXT PRIMARY KEY, gold_certificate_id TEXT, deletedon TEXT);
        CREATE TABLE silver_certificate (id TEXT PRIMARY KEY, status TEXT, total REAL, deletedon TEXT);
        CREATE TABLE silver_certificate_item (id TEXT PRIMARY KEY, silver_certificate_id TEXT, deletedon TEXT);
        CREATE TABLE photo_certificate (id TEXT PRIMARY KEY, status TEXT, total REAL, deletedon TEXT);
        CREATE TABLE photo_certificate_item (id TEXT PRIMARY KEY, photo_certificate_id TEXT, deletedon TEXT);
        CREATE TABLE credit_history (id TEXT PRIMARY KEY, amount REAL, deletedon TEXT);
        CREATE TABLE weight_loss_history (id TEXT PRIMARY KEY, amount REAL, deletedon TEXT);
        CREATE TABLE globals (key TEXT PRIMARY KEY, value TEXT);
    `);
    db.prepare('INSERT INTO customer VALUES (?, NULL)').run('CUS-1');
    db.prepare('INSERT INTO gold_test VALUES (?, ?, ?, NULL)').run('GTS-1', 'IN_PROGRESS', 30);
    db.prepare('INSERT INTO gold_test_item VALUES (?, ?, NULL)').run('GTI-1', 'GTS-1');
    db.prepare('INSERT INTO gold_certificate VALUES (?, ?, ?, NULL)').run('GCR-1', 'DONE', 50);
    db.prepare('INSERT INTO gold_certificate_item VALUES (?, ?, NULL)').run('GCI-1', 'GCR-1');
    db.prepare('INSERT INTO silver_certificate VALUES (?, ?, ?, NULL)').run('SCR-1', 'TODO', 100);
    db.prepare('INSERT INTO silver_certificate_item VALUES (?, ?, NULL)').run('SCI-1', 'SCR-1');
    db.prepare('INSERT INTO photo_certificate VALUES (?, ?, ?, NULL)').run('PCR-1', 'DONE', 50);
    db.prepare('INSERT INTO photo_certificate_item VALUES (?, ?, NULL)').run('PCI-1', 'PCR-1');
    db.prepare('INSERT INTO credit_history VALUES (?, ?, NULL)').run('CHI-1', 10);
    db.prepare('INSERT INTO weight_loss_history VALUES (?, ?, NULL)').run('WLH-1', 5);
    db.prepare('INSERT INTO globals VALUES (?, ?)').run('GST_CERT_SEQ', '12');
    db.prepare('INSERT INTO globals VALUES (?, ?)').run('NON_GST_CERT_SEQ', '8');
    db.close();
}

describe('migration acceptance report', () => {
    test('produces business-readable continuity evidence', () => {
        const source = tempPath('python.db');
        const target = tempPath('sern.db');
        const mediaRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'migration-media-'));
        fs.writeFileSync(path.join(mediaRoot, 'existing.jpg'), 'fake image');
        createPythonDb(source);
        createTargetDb(target);

        const report = buildReport({ sourcePath: source, targetPath: target, mediaRoot });
        const md = renderMarkdown(report);

        expect(report.acceptanceStatus).toBe('PASS');
        expect(report.moduleComparison.find((m) => m.key === 'gold_tests').targetStatus.IN_PROGRESS).toBe(1);
        expect(md).toContain('Migration Acceptance Report');
        expect(md).toContain('Business Sign-Off');
    });

    test('blocks unknown statuses and missing media', () => {
        const source = tempPath('python.db');
        const target = tempPath('sern.db');
        const mediaRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'migration-media-'));
        createPythonDb(source, { badStatus: true, missingMedia: true });
        createTargetDb(target);

        const report = buildReport({ sourcePath: source, targetPath: target, mediaRoot });

        expect(report.acceptanceStatus).toBe('BLOCKED');
        expect(report.failures.some((f) => f.area === 'status')).toBe(true);
        expect(report.failures.some((f) => f.area === 'media')).toBe(true);
    });
});
