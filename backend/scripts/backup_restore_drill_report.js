'use strict';

const Database = require('better-sqlite3');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

const BUSINESS_TABLES = Object.freeze([
    { table: 'customer', amountColumn: 'balance' },
    { table: 'gold_test', amountColumn: 'total', status: true },
    { table: 'silver_test', amountColumn: 'total', status: true },
    { table: 'gold_certificate', amountColumn: 'total', status: true },
    { table: 'silver_certificate', amountColumn: 'total', status: true },
    { table: 'photo_certificate', amountColumn: 'total', status: true },
    { table: 'credit_history', amountColumn: 'amount' },
    { table: 'weight_loss_history', amountColumn: 'amount' },
    { table: 'cash_register', amountColumn: 'amount' },
    { table: 'audit_logs' },
    { table: 'receipts' },
]);

function tableExists(db, table) {
    return !!db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(table);
}

function columnExists(db, table, column) {
    if (!tableExists(db, table)) return false;
    return db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === column);
}

function scalar(db, sql, fallback = 0) {
    try {
        const row = db.prepare(sql).get();
        return row ? Object.values(row)[0] ?? fallback : fallback;
    } catch {
        return fallback;
    }
}

function sha256(filePath) {
    const hash = crypto.createHash('sha256');
    hash.update(fs.readFileSync(filePath));
    return hash.digest('hex');
}

function money(value) {
    return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function statusBuckets(db, table) {
    const buckets = { TODO: 0, IN_PROGRESS: 0, DONE: 0, unknown: 0 };
    if (!tableExists(db, table) || !columnExists(db, table, 'status')) return buckets;
    const rows = db.prepare(`SELECT status, COUNT(*) AS count FROM ${table} GROUP BY status`).all();
    for (const row of rows) {
        if (Object.prototype.hasOwnProperty.call(buckets, row.status)) buckets[row.status] = row.count;
        else buckets.unknown += row.count;
    }
    return buckets;
}

function collectDbSnapshot(db) {
    const tables = BUSINESS_TABLES.map((cfg) => {
        if (!tableExists(db, cfg.table)) {
            return {
                table: cfg.table,
                exists: false,
                count: 0,
                amountTotal: 0,
                statusBuckets: cfg.status ? { TODO: 0, IN_PROGRESS: 0, DONE: 0, unknown: 0 } : null,
            };
        }

        const deletedFilter = columnExists(db, cfg.table, 'deletedon') ? ' WHERE deletedon IS NULL' : '';
        const hasAmount = cfg.amountColumn && columnExists(db, cfg.table, cfg.amountColumn);
        return {
            table: cfg.table,
            exists: true,
            count: scalar(db, `SELECT COUNT(*) FROM ${cfg.table}${deletedFilter}`, 0),
            amountTotal: hasAmount
                ? money(scalar(db, `SELECT COALESCE(SUM(${cfg.amountColumn}), 0) FROM ${cfg.table}${deletedFilter}`, 0))
                : 0,
            statusBuckets: cfg.status ? statusBuckets(db, cfg.table) : null,
        };
    });

    const globals = tableExists(db, 'globals')
        ? db.prepare("SELECT key, value FROM globals WHERE key LIKE '%SEQ%' OR key LIKE '%seq%' ORDER BY key").all()
        : [];

    return {
        integrityCheck: scalar(db, 'PRAGMA integrity_check', 'unknown'),
        foreignKeyViolations: db.prepare('PRAGMA foreign_key_check').all().length,
        userVersion: scalar(db, 'PRAGMA user_version', 0),
        pageCount: scalar(db, 'PRAGMA page_count', 0),
        tables,
        globals,
    };
}

function compareSnapshots(source, restored) {
    const restoredByTable = new Map(restored.tables.map((row) => [row.table, row]));
    const tableComparisons = source.tables.map((src) => {
        const dst = restoredByTable.get(src.table) || { exists: false, count: 0, amountTotal: 0, statusBuckets: src.statusBuckets };
        return {
            table: src.table,
            sourceExists: src.exists,
            restoredExists: dst.exists,
            sourceCount: src.count,
            restoredCount: dst.count,
            countMatch: src.count === dst.count,
            sourceAmount: src.amountTotal,
            restoredAmount: dst.amountTotal,
            amountMatch: Math.abs(src.amountTotal - dst.amountTotal) <= 0.01,
            sourceStatus: src.statusBuckets,
            restoredStatus: dst.statusBuckets,
            statusMatch: JSON.stringify(src.statusBuckets) === JSON.stringify(dst.statusBuckets),
        };
    });

    const sourceGlobals = JSON.stringify(source.globals);
    const restoredGlobals = JSON.stringify(restored.globals);

    return {
        tableComparisons,
        globalsMatch: sourceGlobals === restoredGlobals,
        integrityMatch: source.integrityCheck === 'ok' && restored.integrityCheck === 'ok',
        foreignKeysClean: source.foreignKeyViolations === 0 && restored.foreignKeyViolations === 0,
    };
}

async function createBackup(sourcePath, backupPath) {
    const db = new Database(sourcePath);
    try {
        try {
            db.pragma('wal_checkpoint(TRUNCATE)');
        } catch (_) {
            // Backup still proceeds; the online backup API reads a consistent snapshot.
        }
        if (typeof db.backup === 'function') {
            await db.backup(backupPath);
        } else {
            fs.copyFileSync(sourcePath, backupPath);
        }
    } finally {
        db.close();
    }
}

function determineStatus(report) {
    if (report.source.integrityCheck !== 'ok' || report.restored.integrityCheck !== 'ok') return 'BLOCKED';
    if (report.source.foreignKeyViolations !== 0 || report.restored.foreignKeyViolations !== 0) return 'BLOCKED';
    if (!report.backup.exists || !report.restore.exists) return 'BLOCKED';
    if (!report.comparison.globalsMatch) return 'BLOCKED';
    if (report.comparison.tableComparisons.some((row) => !row.countMatch || !row.amountMatch || !row.statusMatch)) return 'BLOCKED';
    return 'PASS';
}

async function buildReport({ sourcePath, backupPath = null, restorePath = null, backupDir = null }) {
    if (!sourcePath) throw new Error('sourcePath is required');
    if (!fs.existsSync(sourcePath)) throw new Error(`Source database not found: ${sourcePath}`);

    const drillDir = backupDir || path.join(path.dirname(sourcePath), 'restore-drills');
    fs.mkdirSync(drillDir, { recursive: true });

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resolvedBackupPath = backupPath || path.join(drillDir, `backup-${stamp}.db`);
    const resolvedRestorePath = restorePath || path.join(drillDir, `restore-${stamp}.db`);

    const started = performance.now();

    const sourceDb = new Database(sourcePath, { readonly: true });
    let sourceSnapshot;
    try {
        sourceSnapshot = collectDbSnapshot(sourceDb);
    } finally {
        sourceDb.close();
    }

    const backupStart = performance.now();
    await createBackup(sourcePath, resolvedBackupPath);
    const backupMs = Math.round(performance.now() - backupStart);

    const restoreStart = performance.now();
    fs.copyFileSync(resolvedBackupPath, resolvedRestorePath);
    const restoreMs = Math.round(performance.now() - restoreStart);

    const restoredDb = new Database(resolvedRestorePath, { readonly: true });
    let restoredSnapshot;
    try {
        restoredSnapshot = collectDbSnapshot(restoredDb);
    } finally {
        restoredDb.close();
    }

    const report = {
        generatedAt: new Date().toISOString(),
        sourcePath,
        backup: {
            path: resolvedBackupPath,
            exists: fs.existsSync(resolvedBackupPath),
            bytes: fs.existsSync(resolvedBackupPath) ? fs.statSync(resolvedBackupPath).size : 0,
            sha256: fs.existsSync(resolvedBackupPath) ? sha256(resolvedBackupPath) : null,
            durationMs: backupMs,
        },
        restore: {
            path: resolvedRestorePath,
            exists: fs.existsSync(resolvedRestorePath),
            bytes: fs.existsSync(resolvedRestorePath) ? fs.statSync(resolvedRestorePath).size : 0,
            sha256: fs.existsSync(resolvedRestorePath) ? sha256(resolvedRestorePath) : null,
            durationMs: restoreMs,
        },
        source: sourceSnapshot,
        restored: restoredSnapshot,
        comparison: compareSnapshots(sourceSnapshot, restoredSnapshot),
        totalDurationMs: Math.round(performance.now() - started),
        operatorSteps: [
            'Stop the application server before replacing the production database.',
            'Keep the original failed database file unchanged until management signs off.',
            'Copy the selected backup to the configured DB_PATH location.',
            'Start the application against the restored database.',
            'Run this drill report and the migration/media reports against the restored database.',
            'Business reviewer confirms counts, totals, statuses, sequences, and critical prints.',
        ],
    };
    report.acceptanceStatus = determineStatus(report);
    return report;
}

function fmtStatus(buckets) {
    if (!buckets) return '';
    return `TODO ${buckets.TODO || 0}, IN_PROGRESS ${buckets.IN_PROGRESS || 0}, DONE ${buckets.DONE || 0}, unknown ${buckets.unknown || 0}`;
}

function renderMarkdown(report) {
    const lines = [];
    lines.push('# Backup Restore Drill Evidence');
    lines.push('');
    lines.push(`Generated: ${report.generatedAt}`);
    lines.push(`Acceptance status: **${report.acceptanceStatus}**`);
    lines.push('');
    lines.push('## Drill Timing');
    lines.push('');
    lines.push('| Step | Duration ms | File | Bytes | SHA-256 |');
    lines.push('| --- | ---: | --- | ---: | --- |');
    lines.push(`| Backup | ${report.backup.durationMs} | ${report.backup.path} | ${report.backup.bytes} | ${report.backup.sha256 || ''} |`);
    lines.push(`| Restore copy | ${report.restore.durationMs} | ${report.restore.path} | ${report.restore.bytes} | ${report.restore.sha256 || ''} |`);
    lines.push(`| Total drill | ${report.totalDurationMs} |  |  |  |`);
    lines.push('');
    lines.push('## Integrity Checks');
    lines.push('');
    lines.push('| Check | Source | Restored |');
    lines.push('| --- | --- | --- |');
    lines.push(`| SQLite integrity_check | ${report.source.integrityCheck} | ${report.restored.integrityCheck} |`);
    lines.push(`| Foreign key violations | ${report.source.foreignKeyViolations} | ${report.restored.foreignKeyViolations} |`);
    lines.push(`| Sequence globals match |  | ${report.comparison.globalsMatch ? 'yes' : 'no'} |`);
    lines.push('');
    lines.push('## Restored Business Truth');
    lines.push('');
    lines.push('| Table | Source Count | Restored Count | Count Match | Source Amount | Restored Amount | Amount Match | Status Match | Restored Status Buckets |');
    lines.push('| --- | ---: | ---: | --- | ---: | ---: | --- | --- | --- |');
    for (const row of report.comparison.tableComparisons) {
        lines.push(`| ${row.table} | ${row.sourceCount} | ${row.restoredCount} | ${row.countMatch ? 'yes' : 'no'} | ${row.sourceAmount.toFixed(2)} | ${row.restoredAmount.toFixed(2)} | ${row.amountMatch ? 'yes' : 'no'} | ${row.statusMatch ? 'yes' : 'no'} | ${fmtStatus(row.restoredStatus)} |`);
    }
    lines.push('');
    lines.push('## Operator Recovery Steps');
    lines.push('');
    for (let i = 0; i < report.operatorSteps.length; i++) {
        lines.push(`${i + 1}. ${report.operatorSteps[i]}`);
    }
    lines.push('');
    lines.push('## Business Sign-Off');
    lines.push('');
    lines.push('| Reviewer | Role | Decision | Notes |');
    lines.push('| --- | --- | --- | --- |');
    lines.push('|  |  | Accept / Reject |  |');
    lines.push('');
    return `${lines.join('\n')}\n`;
}

function parseArgs(argv) {
    const args = argv.slice(2);
    const getArg = (flag) => {
        const i = args.indexOf(flag);
        return i === -1 ? null : args[i + 1];
    };
    return {
        sourcePath: getArg('--source'),
        backupPath: getArg('--backup'),
        restorePath: getArg('--restore'),
        backupDir: getArg('--backup-dir'),
        outPath: getArg('--out'),
        jsonPath: getArg('--json'),
    };
}

async function main() {
    const opts = parseArgs(process.argv);
    if (!opts.sourcePath) {
        console.error('Usage: node backend/scripts/backup_restore_drill_report.js --source <sern.db> [--backup backup.db] [--restore restored.db] [--backup-dir dir] [--out report.md] [--json report.json]');
        process.exit(1);
    }

    const report = await buildReport(opts);
    const markdown = renderMarkdown(report);
    if (opts.outPath) {
        fs.mkdirSync(path.dirname(path.resolve(opts.outPath)), { recursive: true });
        fs.writeFileSync(opts.outPath, markdown, 'utf8');
        console.log(`Backup restore drill report written to ${opts.outPath}`);
    } else {
        process.stdout.write(markdown);
    }
    if (opts.jsonPath) {
        fs.mkdirSync(path.dirname(path.resolve(opts.jsonPath)), { recursive: true });
        fs.writeFileSync(opts.jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
        console.log(`Backup restore drill JSON written to ${opts.jsonPath}`);
    }
    if (report.acceptanceStatus === 'BLOCKED') process.exitCode = 2;
}

if (require.main === module) {
    main().catch((err) => {
        console.error(err.message);
        process.exit(1);
    });
}

module.exports = {
    buildReport,
    renderMarkdown,
    collectDbSnapshot,
    compareSnapshots,
};
