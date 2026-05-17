'use strict';

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

const SRC_DIR  = path.resolve(__dirname, '..', 'shared', 'domain', 'validation');
const DEST_DIR = path.resolve(__dirname, '..', 'frontend', 'src', 'shared', 'domain', 'validation');
const MANIFEST = path.join(DEST_DIR, '.checksum.json');

const HEADER = (relPath) => (
`// ===========================================================================
// AUTO-GENERATED FROM /shared/domain/validation/${relPath}
// DO NOT EDIT — run \`npm run sync:validation\` at repo root to regenerate.
// Hash verified by scripts/check-validation.js (pre-build, pre-test).
// ===========================================================================
`
);

function sha256(buf) {
    return crypto.createHash('sha256').update(buf).digest('hex');
}

function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

function listSourceFiles() {
    return fs.readdirSync(SRC_DIR)
        .filter(f => f.endsWith('.js'))
        .sort();
}

function main() {
    if (!fs.existsSync(SRC_DIR)) {
        console.error(`[sync-validation] source dir missing: ${SRC_DIR}`);
        process.exit(2);
    }
    ensureDir(DEST_DIR);

    const files = listSourceFiles();
    const manifest = { generated_at: new Date().toISOString(), files: {} };

    for (const filename of files) {
        const srcPath = path.join(SRC_DIR, filename);
        const destPath = path.join(DEST_DIR, filename);
        const srcContent = fs.readFileSync(srcPath, 'utf8');
        const outContent = HEADER(filename) + srcContent;
        fs.writeFileSync(destPath, outContent, 'utf8');
        manifest.files[filename] = sha256(srcContent);
        console.log(`[sync-validation] wrote ${path.relative(process.cwd(), destPath)}`);
    }

    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    console.log(`[sync-validation] manifest at ${path.relative(process.cwd(), MANIFEST)} (${files.length} files)`);
}

main();
