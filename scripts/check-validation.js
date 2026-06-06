'use strict';

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

const SRC_DIR  = path.resolve(__dirname, '..', 'shared', 'domain', 'validation');
const DEST_DIR = path.resolve(__dirname, '..', 'frontend', 'src', 'shared', 'domain', 'validation');
const MANIFEST = path.join(DEST_DIR, '.checksum.json');

function sha256(buf) {
    return crypto.createHash('sha256').update(buf).digest('hex');
}

function fail(msg) {
    console.error(`[check-validation] FAIL: ${msg}`);
    console.error('[check-validation] run `npm run sync:validation` at repo root to fix.');
    process.exit(1);
}

function listSourceFiles() {
    return fs.readdirSync(SRC_DIR)
        .filter(f => f.endsWith('.js'))
        .sort();
}

function main() {
    if (!fs.existsSync(SRC_DIR))   fail(`source dir missing: ${SRC_DIR}`);
    if (!fs.existsSync(DEST_DIR))  fail(`frontend copy missing: ${DEST_DIR}`);
    if (!fs.existsSync(MANIFEST))  fail(`manifest missing: ${MANIFEST}`);

    const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    const files = listSourceFiles();

    const expected = new Set(Object.keys(manifest.files || {}));
    const actual   = new Set(files);

    for (const name of expected) {
        if (!actual.has(name)) fail(`source file present in manifest but missing on disk: ${name}`);
    }
    for (const name of actual) {
        if (!expected.has(name)) fail(`source file ${name} not in manifest`);
    }

    let mismatches = 0;
    for (const filename of files) {
        const srcContent = fs.readFileSync(path.join(SRC_DIR, filename), 'utf8');
        const expectedHash = manifest.files[filename];
        const actualHash   = sha256(srcContent);
        if (expectedHash !== actualHash) {
            console.error(`[check-validation] hash mismatch: ${filename}`);
            console.error(`  expected: ${expectedHash}`);
            console.error(`  actual:   ${actualHash}`);
            mismatches++;
        }
    }

    if (mismatches > 0) fail(`${mismatches} file(s) drifted from frontend copy`);
    console.log(`[check-validation] OK — ${files.length} validation files in sync`);
}

main();
