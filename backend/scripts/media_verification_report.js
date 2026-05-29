'use strict';

const Database = require('better-sqlite3');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const IMAGE_EXTENSIONS = /\.(png|jpe?g|webp|gif|bmp|tiff?)$/i;

function tableExists(db, table) {
    return !!db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(table);
}

function fileHash(filePath) {
    const hash = crypto.createHash('sha256');
    hash.update(fs.readFileSync(filePath));
    return hash.digest('hex');
}

function normalizeRelativePath(raw) {
    if (!raw) return null;
    return String(raw)
        .replace(/\\/g, '/')
        .replace(/^.*?app\/static\/uploads\//i, '')
        .replace(/^.*?backend\/uploads\//i, '')
        .replace(/^\/?static\/uploads\//i, '')
        .replace(/^\/?uploads\//i, '')
        .replace(/^\/+/, '');
}

function resolveMediaPath(root, raw) {
    if (!raw) return null;
    const value = String(raw).replace(/\\/g, path.sep);
    if (path.isAbsolute(value) && fs.existsSync(value)) return value;
    if (!root) return value;
    return path.resolve(root, normalizeRelativePath(raw) || value);
}

function flattenMedia(value) {
    if (!value) return [];
    if (typeof value === 'string') {
        if (IMAGE_EXTENSIONS.test(value)) return [value];
        try {
            return flattenMedia(JSON.parse(value));
        } catch {
            return [];
        }
    }
    if (Array.isArray(value)) return value.flatMap(flattenMedia);
    if (typeof value === 'object') {
        return Object.values(value)
            .flatMap(flattenMedia)
            .filter(Boolean);
    }
    return [];
}

function parseJson(raw, warnings, context) {
    if (!raw) return [];
    try {
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
        warnings.push(`${context}: invalid media JSON`);
        return [];
    }
}

function walkFiles(root) {
    if (!root || !fs.existsSync(root)) return [];
    const out = [];
    const stack = [root];
    while (stack.length) {
        const current = stack.pop();
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const full = path.join(current, entry.name);
            if (entry.isDirectory()) stack.push(full);
            else if (IMAGE_EXTENSIONS.test(entry.name)) out.push(full);
        }
    }
    return out;
}

function collectLegacyReferences(db, sourceMediaRoot) {
    const warnings = [];
    const refs = [];
    if (!tableExists(db, 'photo_certificate')) {
        return { refs, warnings };
    }

    const rows = db.prepare('SELECT id, media FROM photo_certificate ORDER BY id').all();
    for (const row of rows) {
        const media = parseJson(row.media, warnings, `photo_certificate ${row.id}`);
        for (const rawPath of flattenMedia(media)) {
            const relativePath = normalizeRelativePath(rawPath);
            const fullPath = resolveMediaPath(sourceMediaRoot, rawPath);
            const exists = !!fullPath && fs.existsSync(fullPath);
            refs.push({
                source: 'python',
                certificateId: row.id,
                itemId: null,
                rawPath,
                relativePath,
                fullPath,
                exists,
                size: exists ? fs.statSync(fullPath).size : 0,
                sha256: exists ? fileHash(fullPath) : null,
            });
        }
    }
    return { refs, warnings };
}

function collectSernReferences(db, targetMediaRoot) {
    const warnings = [];
    const refs = [];
    if (!tableExists(db, 'photo_certificate_item')) {
        return { refs, warnings };
    }

    const rows = db.prepare(`
        SELECT id, photo_certificate_id, media_path
        FROM photo_certificate_item
        WHERE COALESCE(deletedon, '') = ''
        ORDER BY photo_certificate_id, id
    `).all();

    for (const row of rows) {
        if (!row.media_path) continue;
        const relativePath = normalizeRelativePath(row.media_path);
        const fullPath = resolveMediaPath(targetMediaRoot, row.media_path);
        const exists = !!fullPath && fs.existsSync(fullPath);
        refs.push({
            source: 'sern',
            certificateId: row.photo_certificate_id,
            itemId: row.id,
            rawPath: row.media_path,
            relativePath,
            fullPath,
            exists,
            size: exists ? fs.statSync(fullPath).size : 0,
            sha256: exists ? fileHash(fullPath) : null,
        });
    }
    return { refs, warnings };
}

function collectOrphans(root, refs) {
    const referenced = new Set(refs.map((r) => normalizeRelativePath(r.relativePath)).filter(Boolean));
    return walkFiles(root)
        .map((filePath) => ({
            fullPath: filePath,
            relativePath: normalizeRelativePath(path.relative(root, filePath)),
            size: fs.statSync(filePath).size,
            sha256: fileHash(filePath),
        }))
        .filter((file) => !referenced.has(file.relativePath));
}

function compareReferences(legacyRefs, sernRefs) {
    const sernByRelative = new Map();
    for (const ref of sernRefs) {
        if (!ref.relativePath) continue;
        if (!sernByRelative.has(ref.relativePath)) sernByRelative.set(ref.relativePath, []);
        sernByRelative.get(ref.relativePath).push(ref);
    }

    return legacyRefs.map((legacy) => {
        const candidates = sernByRelative.get(legacy.relativePath) || [];
        const copied = candidates.length > 0;
        const checksumMatch = copied && legacy.exists && candidates.some((candidate) => candidate.exists && candidate.sha256 === legacy.sha256);
        return {
            certificateId: legacy.certificateId,
            rawPath: legacy.rawPath,
            relativePath: legacy.relativePath,
            sourceExists: legacy.exists,
            targetReferenced: copied,
            checksumMatch,
            targetExists: candidates.some((candidate) => candidate.exists),
        };
    });
}

function determineStatus(report) {
    if (report.missingSource.length || report.missingTarget.length || report.brokenCopies.length) return 'BLOCKED';
    if (report.orphanSourceFiles.length || report.orphanTargetFiles.length || report.warnings.length) return 'REVIEW';
    return 'PASS';
}

function buildReport({ sourcePath = null, targetPath = null, sourceMediaRoot = null, targetMediaRoot = null }) {
    let legacy = { refs: [], warnings: [] };
    let sern = { refs: [], warnings: [] };

    if (sourcePath) {
        const db = new Database(sourcePath, { readonly: true });
        try {
            legacy = collectLegacyReferences(db, sourceMediaRoot);
        } finally {
            db.close();
        }
    }

    if (targetPath) {
        const db = new Database(targetPath, { readonly: true });
        try {
            sern = collectSernReferences(db, targetMediaRoot);
        } finally {
            db.close();
        }
    }

    const comparisons = compareReferences(legacy.refs, sern.refs);
    const report = {
        generatedAt: new Date().toISOString(),
        sourcePath,
        targetPath,
        sourceMediaRoot,
        targetMediaRoot,
        summary: {
            legacyReferences: legacy.refs.length,
            sernReferences: sern.refs.length,
            legacyFilesPresent: legacy.refs.filter((r) => r.exists).length,
            sernFilesPresent: sern.refs.filter((r) => r.exists).length,
        },
        comparisons,
        missingSource: legacy.refs.filter((r) => !r.exists),
        missingTarget: sern.refs.filter((r) => !r.exists),
        brokenCopies: comparisons.filter((c) => c.sourceExists && (!c.targetReferenced || !c.targetExists || !c.checksumMatch)),
        orphanSourceFiles: collectOrphans(sourceMediaRoot, legacy.refs),
        orphanTargetFiles: collectOrphans(targetMediaRoot, sern.refs),
        warnings: [...legacy.warnings, ...sern.warnings],
    };
    report.acceptanceStatus = determineStatus(report);
    return report;
}

function renderMarkdown(report) {
    const lines = [];
    lines.push('# Media Verification Report');
    lines.push('');
    lines.push(`Generated: ${report.generatedAt}`);
    lines.push(`Acceptance status: **${report.acceptanceStatus}**`);
    lines.push('');
    lines.push('## Summary');
    lines.push('');
    lines.push('| Metric | Count |');
    lines.push('| --- | ---: |');
    lines.push(`| Legacy media references | ${report.summary.legacyReferences} |`);
    lines.push(`| SERN media references | ${report.summary.sernReferences} |`);
    lines.push(`| Legacy files present | ${report.summary.legacyFilesPresent} |`);
    lines.push(`| SERN files present | ${report.summary.sernFilesPresent} |`);
    lines.push(`| Broken/mismatched copies | ${report.brokenCopies.length} |`);
    lines.push(`| Orphan source files | ${report.orphanSourceFiles.length} |`);
    lines.push(`| Orphan target files | ${report.orphanTargetFiles.length} |`);
    lines.push('');
    lines.push('## Copy Integrity');
    lines.push('');
    lines.push('| Certificate | Path | Source Exists | Target Referenced | Target Exists | Checksum Match |');
    lines.push('| --- | --- | --- | --- | --- | --- |');
    for (const row of report.comparisons) {
        lines.push(`| ${row.certificateId} | ${row.relativePath || row.rawPath} | ${row.sourceExists ? 'yes' : 'no'} | ${row.targetReferenced ? 'yes' : 'no'} | ${row.targetExists ? 'yes' : 'no'} | ${row.checksumMatch ? 'yes' : 'no'} |`);
    }
    if (report.comparisons.length === 0) {
        lines.push('| No legacy media references found |  |  |  |  |  |');
    }
    lines.push('');
    lines.push('## Blocking Failures');
    lines.push('');
    if (!report.missingSource.length && !report.missingTarget.length && !report.brokenCopies.length) {
        lines.push('No blocking media failures found.');
    } else {
        for (const ref of report.missingSource) lines.push(`- Missing legacy source file: ${ref.rawPath}`);
        for (const ref of report.missingTarget) lines.push(`- Missing SERN target file: ${ref.rawPath}`);
        for (const copy of report.brokenCopies) lines.push(`- Broken copy for certificate ${copy.certificateId}: ${copy.relativePath || copy.rawPath}`);
    }
    lines.push('');
    lines.push('## Orphan Files For Review');
    lines.push('');
    if (!report.orphanSourceFiles.length && !report.orphanTargetFiles.length) {
        lines.push('No orphan media files found.');
    } else {
        for (const file of report.orphanSourceFiles) lines.push(`- Source orphan: ${file.relativePath}`);
        for (const file of report.orphanTargetFiles) lines.push(`- Target orphan: ${file.relativePath}`);
    }
    lines.push('');
    lines.push('## Warnings');
    lines.push('');
    if (!report.warnings.length) lines.push('No warnings found.');
    else for (const warning of report.warnings) lines.push(`- ${warning}`);
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
        sourceMediaRoot: getArg('--source-media-root'),
        targetMediaRoot: getArg('--target-media-root'),
        outPath: getArg('--out'),
        jsonPath: getArg('--json'),
    };
}

function main() {
    const opts = parseArgs(process.argv);
    if (!opts.sourcePath && !opts.targetPath) {
        console.error('Usage: node backend/scripts/media_verification_report.js --source <python.db> --target <sern.db> --source-media-root <legacy uploads> --target-media-root <sern uploads> [--out report.md] [--json report.json]');
        process.exit(1);
    }

    const report = buildReport(opts);
    const markdown = renderMarkdown(report);
    if (opts.outPath) {
        fs.mkdirSync(path.dirname(path.resolve(opts.outPath)), { recursive: true });
        fs.writeFileSync(opts.outPath, markdown, 'utf8');
        console.log(`Media verification report written to ${opts.outPath}`);
    } else {
        process.stdout.write(markdown);
    }
    if (opts.jsonPath) {
        fs.mkdirSync(path.dirname(path.resolve(opts.jsonPath)), { recursive: true });
        fs.writeFileSync(opts.jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
        console.log(`Media verification JSON written to ${opts.jsonPath}`);
    }
    if (report.acceptanceStatus === 'BLOCKED') process.exitCode = 2;
}

if (require.main === module) {
    main();
}

module.exports = {
    buildReport,
    renderMarkdown,
    normalizeRelativePath,
};
