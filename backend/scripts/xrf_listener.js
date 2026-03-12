/**
 * SwastikCore - Enterprise XRF Bridge Service v2
 *
 * GAP 2 FIX: "Hardware Failover Gap"
 *   - Uses native fs.watch (no ESM chokidar dependency)
 *   - Writes heartbeat timestamps to a status file every time it detects a file
 *   - Heartbeat is polled by the backend /api/analytics/xrf-status endpoint
 *   - Dashboard UI reads it and shows a red badge if stale > 24 h
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '../db/lab.db');
const HEARTBEAT_FILE = path.join(__dirname, '../db/xrf_heartbeat.json');
const CSV_DIRECTORY = 'C:\\XRF_Exports';

// Open the sqlite db (shared connection is fine for a daemon)
const db = new Database(DB_PATH);

// ── Heartbeat helpers ─────────────────────────────────────────────────────────

function writeHeartbeat(status, lastFile = null, error = null) {
    const payload = {
        status,           // 'ALIVE' | 'ERROR' | 'WAITING'
        ts: new Date().toISOString(),
        lastFile,
        error
    };
    try { fs.writeFileSync(HEARTBEAT_FILE, JSON.stringify(payload, null, 2)); }
    catch (e) { console.error('[XRF] Heartbeat write failed:', e.message); }
}

// Initialise heartbeat as WAITING
writeHeartbeat('WAITING');

// ── Watch directory ───────────────────────────────────────────────────────────

if (!fs.existsSync(CSV_DIRECTORY)) {
    fs.mkdirSync(CSV_DIRECTORY, { recursive: true });
    console.log(`[XRF] Created watch directory: ${CSV_DIRECTORY}`);
}

console.log(`[XRF] Watching: ${CSV_DIRECTORY}`);

let debounce = {};

try {
    fs.watch(CSV_DIRECTORY, { persistent: true }, (event, filename) => {
        if (!filename || !filename.endsWith('.csv')) return;
        const filePath = path.join(CSV_DIRECTORY, filename);

        // Debounce — fire once per file write
        clearTimeout(debounce[filename]);
        debounce[filename] = setTimeout(() => {
            console.log(`[XRF] File detected: ${filename}`);
            processCSV(filePath, filename);
        }, 800);
    });
} catch (watchErr) {
    console.error('[XRF] fs.watch failed:', watchErr.message);
    writeHeartbeat('ERROR', null, watchErr.message);
}

// ── CSV processor ─────────────────────────────────────────────────────────────

function processCSV(filePath, filename) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        let auPurity = null;
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('Au,') || trimmed.startsWith('AU,')) {
                const parts = trimmed.split(',');
                if (parts.length >= 2) {
                    const parsed = parseFloat(parts[1].trim());
                    if (!isNaN(parsed)) { auPurity = parsed; break; }
                }
            }
        }

        if (auPurity !== null) {
            console.log(`[XRF] Gold purity extracted: ${auPurity}%`);

            const item = db.prepare(`
                SELECT id, item_no
                FROM gold_test_item
                WHERE (purity IS NULL OR purity = 0)
                ORDER BY rowid DESC LIMIT 1
            `).get();

            if (item) {
                db.prepare('UPDATE gold_test_item SET purity = ? WHERE id = ?').run(auPurity, item.id);
                console.log(`[XRF] Mapped ${auPurity}% → item #${item.item_no} (id: ${item.id})`);
            } else {
                console.log(`[XRF] No IN_PROGRESS item awaiting purity.`);
            }

            writeHeartbeat('ALIVE', filename);
        } else {
            console.log(`[XRF] No 'Au' row found in ${filename}`);
            writeHeartbeat('ALIVE', filename);   // still alive, just no Au
        }

    } catch (err) {
        console.error(`[XRF] processCSV error:`, err.message);
        writeHeartbeat('ERROR', filename, err.message);
    }
}

// ── Keep-alive (also refreshes WAITING heartbeat every 10 min if no files) ───
setInterval(() => {
    const beat = JSON.parse(fs.readFileSync(HEARTBEAT_FILE, 'utf8'));
    if (beat.status === 'WAITING') writeHeartbeat('WAITING');
}, 10 * 60 * 1000);

console.log('[XRF] Bridge running. Drop a .csv into', CSV_DIRECTORY);
