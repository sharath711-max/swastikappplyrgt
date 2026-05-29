const fs = require('fs');
const os = require('os');
const path = require('path');
const Database = require('better-sqlite3');
const { buildReport, renderMarkdown } = require('../../scripts/backup_restore_drill_report');

function tempDir() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'restore-drill-'));
}

function createOperationalDb(file) {
    const db = new Database(file);
    db.exec(`
        PRAGMA foreign_keys = ON;
        CREATE TABLE customer (id TEXT PRIMARY KEY, balance REAL, deletedon TEXT);
        CREATE TABLE gold_test (id TEXT PRIMARY KEY, status TEXT, total REAL, deletedon TEXT);
        CREATE TABLE gold_certificate (id TEXT PRIMARY KEY, status TEXT, total REAL, deletedon TEXT);
        CREATE TABLE credit_history (id TEXT PRIMARY KEY, amount REAL, deletedon TEXT);
        CREATE TABLE cash_register (id INTEGER PRIMARY KEY AUTOINCREMENT, amount REAL);
        CREATE TABLE globals (key TEXT PRIMARY KEY, value TEXT);
        CREATE TABLE audit_logs (id TEXT PRIMARY KEY);
    `);
    db.prepare('INSERT INTO customer VALUES (?, ?, NULL)').run('CUS-1', 25);
    db.prepare('INSERT INTO gold_test VALUES (?, ?, ?, NULL)').run('GTS-1', 'IN_PROGRESS', 30);
    db.prepare('INSERT INTO gold_certificate VALUES (?, ?, ?, NULL)').run('GCR-1', 'DONE', 50);
    db.prepare('INSERT INTO credit_history VALUES (?, ?, NULL)').run('CHI-1', 10);
    db.prepare('INSERT INTO cash_register (amount) VALUES (?)').run(100);
    db.prepare('INSERT INTO globals VALUES (?, ?)').run('GST_CERT_SEQ', '12');
    db.close();
}

describe('backup restore drill report', () => {
    test('proves restored database preserves counts, totals, statuses, and sequences', async () => {
        const root = tempDir();
        const source = path.join(root, 'source.db');
        const backup = path.join(root, 'backup.db');
        const restore = path.join(root, 'restore.db');
        createOperationalDb(source);

        const report = await buildReport({ sourcePath: source, backupPath: backup, restorePath: restore });
        const markdown = renderMarkdown(report);

        expect(report.acceptanceStatus).toBe('PASS');
        expect(report.backup.exists).toBe(true);
        expect(report.restore.exists).toBe(true);
        expect(report.comparison.globalsMatch).toBe(true);
        expect(report.comparison.tableComparisons.find((row) => row.table === 'gold_test').statusMatch).toBe(true);
        expect(markdown).toContain('Backup Restore Drill Evidence');
        expect(markdown).toContain('Operator Recovery Steps');
        expect(markdown).toContain('Business Sign-Off');
    });
});
