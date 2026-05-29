const fs = require('fs');
const os = require('os');
const path = require('path');
const Database = require('better-sqlite3');
const { buildReport, renderMarkdown, normalizeRelativePath } = require('../../scripts/media_verification_report');

function tempDir() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'media-report-'));
}

function createLegacyDb(file, mediaPath = 'photo-one.jpg') {
    const db = new Database(file);
    db.exec('CREATE TABLE photo_certificate (id INTEGER PRIMARY KEY, media TEXT)');
    db.prepare('INSERT INTO photo_certificate VALUES (?, ?)').run(1, JSON.stringify([mediaPath]));
    db.close();
}

function createSernDb(file, mediaPath = 'photo-one.jpg') {
    const db = new Database(file);
    db.exec('CREATE TABLE photo_certificate_item (id TEXT PRIMARY KEY, photo_certificate_id TEXT, media_path TEXT, deletedon TEXT)');
    db.prepare('INSERT INTO photo_certificate_item VALUES (?, ?, ?, NULL)').run('PCI-1', 'PCR-1', mediaPath);
    db.close();
}

describe('media verification report', () => {
    test('normalizes legacy and SERN upload paths', () => {
        expect(normalizeRelativePath('/static/uploads/a/b.jpg')).toBe('a/b.jpg');
        expect(normalizeRelativePath('uploads/a/b.jpg')).toBe('a/b.jpg');
        expect(normalizeRelativePath('backend/uploads/a/b.jpg')).toBe('a/b.jpg');
    });

    test('passes when copied media exists and checksum matches', () => {
        const root = tempDir();
        const sourceDb = path.join(root, 'python.db');
        const targetDb = path.join(root, 'sern.db');
        const sourceMedia = path.join(root, 'source_uploads');
        const targetMedia = path.join(root, 'target_uploads');
        fs.mkdirSync(sourceMedia);
        fs.mkdirSync(targetMedia);
        fs.writeFileSync(path.join(sourceMedia, 'photo-one.jpg'), 'same bytes');
        fs.writeFileSync(path.join(targetMedia, 'photo-one.jpg'), 'same bytes');
        createLegacyDb(sourceDb);
        createSernDb(targetDb);

        const report = buildReport({
            sourcePath: sourceDb,
            targetPath: targetDb,
            sourceMediaRoot: sourceMedia,
            targetMediaRoot: targetMedia,
        });
        const markdown = renderMarkdown(report);

        expect(report.acceptanceStatus).toBe('PASS');
        expect(report.brokenCopies).toHaveLength(0);
        expect(markdown).toContain('Media Verification Report');
        expect(markdown).toContain('Business Sign-Off');
    });

    test('blocks missing target and checksum mismatch', () => {
        const root = tempDir();
        const sourceDb = path.join(root, 'python.db');
        const targetDb = path.join(root, 'sern.db');
        const sourceMedia = path.join(root, 'source_uploads');
        const targetMedia = path.join(root, 'target_uploads');
        fs.mkdirSync(sourceMedia);
        fs.mkdirSync(targetMedia);
        fs.writeFileSync(path.join(sourceMedia, 'photo-one.jpg'), 'source bytes');
        fs.writeFileSync(path.join(targetMedia, 'photo-one.jpg'), 'different bytes');
        createLegacyDb(sourceDb);
        createSernDb(targetDb);

        const report = buildReport({
            sourcePath: sourceDb,
            targetPath: targetDb,
            sourceMediaRoot: sourceMedia,
            targetMediaRoot: targetMedia,
        });

        expect(report.acceptanceStatus).toBe('BLOCKED');
        expect(report.brokenCopies).toHaveLength(1);
        expect(report.brokenCopies[0].checksumMatch).toBe(false);
    });

    test('surfaces orphan files for review', () => {
        const root = tempDir();
        const sourceDb = path.join(root, 'python.db');
        const targetDb = path.join(root, 'sern.db');
        const sourceMedia = path.join(root, 'source_uploads');
        const targetMedia = path.join(root, 'target_uploads');
        fs.mkdirSync(sourceMedia);
        fs.mkdirSync(targetMedia);
        fs.writeFileSync(path.join(sourceMedia, 'photo-one.jpg'), 'same bytes');
        fs.writeFileSync(path.join(targetMedia, 'photo-one.jpg'), 'same bytes');
        fs.writeFileSync(path.join(targetMedia, 'orphan.jpg'), 'unused');
        createLegacyDb(sourceDb);
        createSernDb(targetDb);

        const report = buildReport({
            sourcePath: sourceDb,
            targetPath: targetDb,
            sourceMediaRoot: sourceMedia,
            targetMediaRoot: targetMedia,
        });

        expect(report.acceptanceStatus).toBe('REVIEW');
        expect(report.orphanTargetFiles.map((f) => f.relativePath)).toContain('orphan.jpg');
    });
});
