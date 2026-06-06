'use strict';

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { toNodeStatus, PYTHON_TO_SERN_STATUS } = require('../config/statusSemantics');

const WORKFLOW_TABLES = Object.freeze([
    { key: 'gold_tests', label: 'Gold Tests', source: 'gold_test', target: 'gold_test', targetItems: 'gold_test_item', targetItemFk: 'gold_test_id' },
    { key: 'silver_tests', label: 'Silver Tests', source: 'silver_test', target: 'silver_test', targetItems: 'silver_test_item', targetItemFk: 'silver_test_id', optional: true },
    { key: 'gold_certs', label: 'Gold Certificates', source: 'gold_certificate', target: 'gold_certificate', targetItems: 'gold_certificate_item', targetItemFk: 'gold_certificate_id' },
    { key: 'silver_certs', label: 'Silver Certificates', source: 'silver_certificate', target: 'silver_certificate', targetItems: 'silver_certificate_item', targetItemFk: 'silver_certificate_id' },
    { key: 'photo_certs', label: 'Photo Certificates', source: 'photo_certificate', target: 'photo_certificate', targetItems: 'photo_certificate_item', targetItemFk: 'photo_certificate_id', optional: true, media: true },
]);

const LEDGER_TABLES = Object.freeze([
    { key: 'customers', label: 'Customers', source: 'customer', target: 'customer' },
    { key: 'credit_history', label: 'Credit History', source: 'credit_history', target: 'credit_history', optional: true },
    { key: 'weight_loss', label: 'Weight Loss History', source: 'weight_loss_history', target: 'weight_loss_history', optional: true },
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

function all(db, sql) {
    try {
        return db.prepare(sql).all();
    } catch {
        return [];
    }
}

function money(value) {
    return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function parseJson(raw, context, warnings) {
    if (!raw) return [];
    try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        warnings.push(context);
        return [];
    }
}

function resolveMediaPath(mediaRoot, mediaValue) {
    if (!mediaValue) return null;
    const candidate = String(mediaValue);
    if (path.isAbsolute(candidate)) return candidate;
    if (!mediaRoot) return candidate;
    return path.resolve(mediaRoot, candidate.replace(/^[/\\]+/, ''));
}

function flattenMediaEntries(entry) {
    if (!entry) return [];
    if (typeof entry === 'string') return [entry];
    if (Array.isArray(entry)) return entry.flatMap(flattenMediaEntries);
    if (typeof entry === 'object') {
        return Object.values(entry)
            .filter((v) => typeof v === 'string')
            .filter((v) => /\.(png|jpe?g|webp|gif|bmp|pdf)$/i.test(v));
    }
    return [];
}

function statusBucketsFromSource(db, table, failures) {
    const buckets = { ongoing: 0, pending: 0, completed: 0, unknown: 0 };
    const mapped = { TODO: 0, IN_PROGRESS: 0, DONE: 0, unknown: 0 };
    if (!tableExists(db, table)) return { buckets, mapped };

    const rows = all(db, `SELECT id, status FROM ${table}`);
    for (const row of rows) {
        const status = String(row.status || '').toLowerCase();
        if (Object.prototype.hasOwnProperty.call(buckets, status)) {
            buckets[status]++;
        } else {
            buckets.unknown++;
            failures.push({
                area: 'status',
                table,
                id: row.id,
                message: `Unknown Python status: ${row.status}`,
            });
        }

        try {
            mapped[toNodeStatus(status, { strict: true })]++;
        } catch {
            mapped.unknown++;
        }
    }
    return { buckets, mapped };
}

function statusBucketsFromTarget(db, table) {
    const buckets = { TODO: 0, IN_PROGRESS: 0, DONE: 0, unknown: 0 };
    if (!tableExists(db, table)) return buckets;
    const rows = all(db, `SELECT status, COUNT(*) AS count FROM ${table} WHERE deletedon IS NULL GROUP BY status`);
    for (const row of rows) {
        if (Object.prototype.hasOwnProperty.call(buckets, row.status)) buckets[row.status] = row.count;
        else buckets.unknown += row.count;
    }
    return buckets;
}

function collectSourceWorkflow(sourceDb, mediaRoot) {
    const warnings = [];
    const failures = [];

    const modules = WORKFLOW_TABLES.map((mod) => {
        if (!tableExists(sourceDb, mod.source)) {
            return {
                ...mod,
                exists: false,
                sourceCount: 0,
                sourceTotal: 0,
                sourceItems: 0,
                statusBuckets: { ongoing: 0, pending: 0, completed: 0, unknown: 0 },
                mappedBuckets: { TODO: 0, IN_PROGRESS: 0, DONE: 0, unknown: 0 },
                mediaTotal: 0,
                mediaMissing: 0,
            };
        }

        const rows = all(sourceDb, `SELECT * FROM ${mod.source}`);
        const status = statusBucketsFromSource(sourceDb, mod.source, failures);
        let itemCount = 0;
        let mediaTotal = 0;
        let mediaMissing = 0;

        for (const row of rows) {
            const data = parseJson(row.data, `${mod.source} ${row.id}: invalid data JSON`, warnings);
            itemCount += data.length;

            if (mod.media) {
                const media = parseJson(row.media, `${mod.source} ${row.id}: invalid media JSON`, warnings);
                for (const entry of media.flatMap(flattenMediaEntries)) {
                    mediaTotal++;
                    const fullPath = resolveMediaPath(mediaRoot, entry);
                    if (!fullPath || !fs.existsSync(fullPath)) {
                        mediaMissing++;
                        failures.push({
                            area: 'media',
                            table: mod.source,
                            id: row.id,
                            message: `Missing media: ${entry}`,
                        });
                    }
                }
            }
        }

        return {
            ...mod,
            exists: true,
            sourceCount: rows.length,
            sourceTotal: money(rows.reduce((sum, row) => sum + Number(row.total || 0), 0)),
            sourceItems: itemCount,
            statusBuckets: status.buckets,
            mappedBuckets: status.mapped,
            mediaTotal,
            mediaMissing,
        };
    });

    return { modules, warnings, failures };
}

function collectTargetWorkflow(targetDb) {
    return WORKFLOW_TABLES.map((mod) => {
        if (!tableExists(targetDb, mod.target)) {
            return { ...mod, exists: false, targetCount: 0, targetTotal: 0, targetItems: 0, statusBuckets: { TODO: 0, IN_PROGRESS: 0, DONE: 0, unknown: 0 } };
        }
        const targetItems = tableExists(targetDb, mod.targetItems)
            ? scalar(targetDb, `SELECT COUNT(*) FROM ${mod.targetItems} WHERE deletedon IS NULL`, 0)
            : 0;
        return {
            ...mod,
            exists: true,
            targetCount: scalar(targetDb, `SELECT COUNT(*) FROM ${mod.target} WHERE deletedon IS NULL`, 0),
            targetTotal: money(scalar(targetDb, `SELECT COALESCE(SUM(total), 0) FROM ${mod.target} WHERE deletedon IS NULL`, 0)),
            targetItems,
            statusBuckets: statusBucketsFromTarget(targetDb, mod.target),
        };
    });
}

function collectLedger(db, side) {
    return LEDGER_TABLES.map((table) => {
        if (!tableExists(db, table[side])) {
            return { ...table, exists: false, count: 0, amountTotal: 0 };
        }
        const deletedFilter = columnExists(db, table[side], 'deletedon') ? ' WHERE deletedon IS NULL' : '';
        const amountColumn = columnExists(db, table[side], 'amount') ? 'amount' : null;
        return {
            ...table,
            exists: true,
            count: scalar(db, `SELECT COUNT(*) FROM ${table[side]}${deletedFilter}`, 0),
            amountTotal: amountColumn
                ? money(scalar(db, `SELECT COALESCE(SUM(${amountColumn}), 0) FROM ${table[side]}${deletedFilter}`, 0))
                : 0,
        };
    });
}

function collectSequences(sourceDb, targetDb) {
    const sourceGst = WORKFLOW_TABLES
        .filter((mod) => mod.source.includes('certificate') && tableExists(sourceDb, mod.source))
        .map((mod) => scalar(sourceDb, `SELECT COALESCE(MAX(CAST(gst_bill_number AS INTEGER)), 0) FROM ${mod.source} WHERE gst = 1`, 0));
    const sourceNonGst = WORKFLOW_TABLES
        .filter((mod) => mod.source.includes('certificate') && tableExists(sourceDb, mod.source))
        .map((mod) => scalar(sourceDb, `SELECT COALESCE(MAX(CAST(gst_bill_number AS INTEGER)), 0) FROM ${mod.source} WHERE COALESCE(gst, 0) = 0`, 0));

    const globalValue = (key) => tableExists(targetDb, 'globals')
        ? Number(scalar(targetDb, `SELECT value FROM globals WHERE key = '${key}'`, 0))
        : 0;

    return {
        sourceGstHighWater: Math.max(0, ...sourceGst),
        sourceNonGstHighWater: Math.max(0, ...sourceNonGst),
        targetGstSeq: globalValue('GST_CERT_SEQ'),
        targetNonGstSeq: globalValue('NON_GST_CERT_SEQ'),
    };
}

function compareModules(sourceModules, targetModules) {
    const byKey = new Map(targetModules.map((mod) => [mod.key, mod]));
    return sourceModules.map((source) => {
        const target = byKey.get(source.key);
        return {
            key: source.key,
            label: source.label,
            sourceExists: source.exists,
            targetExists: target?.exists || false,
            sourceCount: source.sourceCount,
            targetCount: target?.targetCount || 0,
            countDelta: (target?.targetCount || 0) - source.sourceCount,
            sourceItems: source.sourceItems,
            targetItems: target?.targetItems || 0,
            itemDelta: (target?.targetItems || 0) - source.sourceItems,
            sourceTotal: source.sourceTotal,
            targetTotal: target?.targetTotal || 0,
            totalDelta: money((target?.targetTotal || 0) - source.sourceTotal),
            sourceMappedStatus: source.mappedBuckets,
            targetStatus: target?.statusBuckets || { TODO: 0, IN_PROGRESS: 0, DONE: 0, unknown: 0 },
            mediaTotal: source.mediaTotal,
            mediaMissing: source.mediaMissing,
        };
    });
}

function buildReport({ sourcePath, targetPath, mediaRoot = null }) {
    const sourceDb = new Database(sourcePath, { readonly: true });
    const targetDb = targetPath ? new Database(targetPath, { readonly: true }) : null;

    try {
        const source = collectSourceWorkflow(sourceDb, mediaRoot);
        const targetWorkflow = targetDb ? collectTargetWorkflow(targetDb) : [];
        const moduleComparison = targetDb ? compareModules(source.modules, targetWorkflow) : [];
        const report = {
            generatedAt: new Date().toISOString(),
            sourcePath,
            targetPath,
            mediaRoot,
            canonicalStatusMap: PYTHON_TO_SERN_STATUS,
            sourceModules: source.modules,
            targetModules: targetWorkflow,
            moduleComparison,
            sourceLedger: collectLedger(sourceDb, 'source'),
            targetLedger: targetDb ? collectLedger(targetDb, 'target') : [],
            sequences: targetDb ? collectSequences(sourceDb, targetDb) : null,
            warnings: source.warnings,
            failures: source.failures,
        };
        report.acceptanceStatus = determineAcceptanceStatus(report);
        return report;
    } finally {
        sourceDb.close();
        if (targetDb) targetDb.close();
    }
}

function determineAcceptanceStatus(report) {
    if (report.failures.length > 0) return 'BLOCKED';
    if (report.moduleComparison.some((m) => m.countDelta !== 0 || m.itemDelta !== 0 || Math.abs(m.totalDelta) > 0.01)) return 'REVIEW';
    if (report.warnings.length > 0) return 'REVIEW';
    return 'PASS';
}

function fmtStatusBuckets(buckets) {
    return `TODO ${buckets.TODO || 0}, IN_PROGRESS ${buckets.IN_PROGRESS || 0}, DONE ${buckets.DONE || 0}, unknown ${buckets.unknown || 0}`;
}

function renderMarkdown(report) {
    const lines = [];
    lines.push('# Migration Acceptance Report');
    lines.push('');
    lines.push(`Generated: ${report.generatedAt}`);
    lines.push(`Acceptance status: **${report.acceptanceStatus}**`);
    lines.push('');
    lines.push('## Canonical Status Semantics');
    lines.push('');
    lines.push('| Python State | SERN State |');
    lines.push('| --- | --- |');
    for (const [python, sern] of Object.entries(report.canonicalStatusMap)) {
        lines.push(`| \`${python}\` | \`${sern}\` |`);
    }
    lines.push('');
    lines.push('## Module Continuity');
    lines.push('');
    lines.push('| Module | Source Count | Target Count | Count Delta | Source Items | Target Items | Item Delta | Source Total | Target Total | Total Delta | Target Status Buckets | Media Missing |');
    lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: |');
    for (const mod of report.moduleComparison) {
        lines.push(`| ${mod.label} | ${mod.sourceCount} | ${mod.targetCount} | ${mod.countDelta} | ${mod.sourceItems} | ${mod.targetItems} | ${mod.itemDelta} | ${mod.sourceTotal.toFixed(2)} | ${mod.targetTotal.toFixed(2)} | ${mod.totalDelta.toFixed(2)} | ${fmtStatusBuckets(mod.targetStatus)} | ${mod.mediaMissing || 0} |`);
    }
    if (report.moduleComparison.length === 0) {
        lines.push('| No target database supplied |  |  |  |  |  |  |  |  |  |  |  |');
    }
    lines.push('');
    lines.push('## Ledger Continuity');
    lines.push('');
    lines.push('| Ledger | Source Count | Target Count | Source Amount | Target Amount |');
    lines.push('| --- | ---: | ---: | ---: | ---: |');
    for (const source of report.sourceLedger) {
        const target = report.targetLedger.find((t) => t.key === source.key);
        lines.push(`| ${source.label} | ${source.count} | ${target?.count ?? 0} | ${source.amountTotal.toFixed(2)} | ${(target?.amountTotal ?? 0).toFixed(2)} |`);
    }
    lines.push('');
    lines.push('## Sequence Continuity');
    lines.push('');
    if (report.sequences) {
        lines.push(`- Source GST high-water: ${report.sequences.sourceGstHighWater}`);
        lines.push(`- Target GST sequence: ${report.sequences.targetGstSeq}`);
        lines.push(`- Source non-GST high-water: ${report.sequences.sourceNonGstHighWater}`);
        lines.push(`- Target non-GST sequence: ${report.sequences.targetNonGstSeq}`);
    } else {
        lines.push('- No target database supplied.');
    }
    lines.push('');
    lines.push('## Failures Requiring Action');
    lines.push('');
    if (report.failures.length === 0) {
        lines.push('No blocking failures found.');
    } else {
        lines.push('| Area | Table | ID | Message |');
        lines.push('| --- | --- | --- | --- |');
        for (const failure of report.failures) {
            lines.push(`| ${failure.area} | ${failure.table} | ${failure.id ?? ''} | ${failure.message} |`);
        }
    }
    lines.push('');
    lines.push('## Warnings For Review');
    lines.push('');
    if (report.warnings.length === 0) {
        lines.push('No warnings found.');
    } else {
        for (const warning of report.warnings) lines.push(`- ${warning}`);
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
        targetPath: getArg('--target'),
        mediaRoot: getArg('--media-root'),
        outPath: getArg('--out'),
        jsonPath: getArg('--json'),
    };
}

function main() {
    const opts = parseArgs(process.argv);
    if (!opts.sourcePath) {
        console.error('Usage: node backend/scripts/migration_acceptance_report.js --source <python.db> [--target <sern.db>] [--media-root <uploads>] [--out report.md] [--json report.json]');
        process.exit(1);
    }
    const report = buildReport(opts);
    const markdown = renderMarkdown(report);
    if (opts.outPath) {
        fs.mkdirSync(path.dirname(path.resolve(opts.outPath)), { recursive: true });
        fs.writeFileSync(opts.outPath, markdown, 'utf8');
        console.log(`Migration acceptance report written to ${opts.outPath}`);
    } else {
        process.stdout.write(markdown);
    }
    if (opts.jsonPath) {
        fs.mkdirSync(path.dirname(path.resolve(opts.jsonPath)), { recursive: true });
        fs.writeFileSync(opts.jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
        console.log(`Migration acceptance JSON written to ${opts.jsonPath}`);
    }
    if (report.acceptanceStatus === 'BLOCKED') process.exitCode = 2;
}

if (require.main === module) {
    main();
}

module.exports = {
    buildReport,
    renderMarkdown,
    determineAcceptanceStatus,
};
