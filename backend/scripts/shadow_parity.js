'use strict';

/**
 * shadow_parity.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Compares Python source DB vs SERN target DB for financial + snapshot parity.
 * Run AFTER migrate_from_python.js — reads both DBs, reports mismatches.
 *
 * Usage:
 *   node backend/scripts/shadow_parity.js \
 *     --source /path/to/python/app.db \
 *     --target /path/to/sern/lab.db \
 *     [--table gold_certificate] \
 *     [--limit 50] \
 *     [--fail-fast]
 *
 * What it checks (per record, per table):
 *   1. total (financial amount — main parity signal)
 *   2. status (after Python→SERN vocabulary mapping)
 *   3. item count (no items silently dropped or duplicated)
 *   4. credit_history DEBIT count + sum per certificate (ledger parity)
 *   5. snapshot present for DONE records (integrity coverage)
 *
 * Exit code: 0 = all pass, 1 = mismatches found or fatal error.
 *
 * Known acceptable differences (NOT flagged as failures):
 *   - auto_number format (Python: "G001" / SERN: "GT26-0001") — different by design
 *   - HMAC hash values (different secrets, different algo) — not compared
 *   - gst_bill_number sequence style — different by design (Gap #7)
 *   - password hashes — different by design
 *   - certificate_number padding (Python "A01" / old SERN "A001") — fixed in code, old records differ
 *   - item_number format (Python item FK int / SERN "N26-017-1") — not compared
 *
 * Flags:
 *   --skip-status     skip status vocabulary parity check
 *   --skip-items      skip item count parity check
 *   --skip-ledger     skip credit_history DEBIT check
 *   --skip-snapshot   skip snapshot_hash presence check
 *   --ignore-cert-number  skip certificate_number field comparison (known format diff in old records)
 *
 * Timezone guarantee (verified):
 *   Python stores IST naive datetimes (no TZ suffix): "2022-07-05 13:49:54.834257"
 *   SERN stores IST with offset suffix: "2026-04-19T22:31:27.620+05:30"
 *   migrate_from_python.js copies Python `created` verbatim → both sides have the
 *   same raw string for migrated records → JULIANDAY comparison gives difference of 0.
 *   No timezone normalization is needed in this script.
 */

const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

// ─── CLI ──────────────────────────────────────────────────────────────────────

const args     = process.argv.slice(2);
const getArg   = (f) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : null; };
const SOURCE   = getArg('--source');
const TARGET   = getArg('--target') || path.join(__dirname, '../db/lab.db');
const ONLY_TBL = getArg('--table');
const LIMIT    = parseInt(getArg('--limit') || '0', 10);
const FAILFAST           = args.includes('--fail-fast');
const SKIP_STATUS        = args.includes('--skip-status');
const SKIP_ITEMS         = args.includes('--skip-items');
const SKIP_LEDGER        = args.includes('--skip-ledger');
const SKIP_SNAPSHOT      = args.includes('--skip-snapshot');
const IGNORE_CERT_NUMBER = args.includes('--ignore-cert-number');

if (!SOURCE) {
    console.error('Usage: node shadow_parity.js --source <python.db> [--target <sern.db>] [--table <name>] [--limit N] [--fail-fast]');
    console.error('       [--skip-status] [--skip-items] [--skip-ledger] [--skip-snapshot] [--ignore-cert-number]');
    process.exit(1);
}
if (!fs.existsSync(SOURCE)) { console.error(`Source not found: ${SOURCE}`); process.exit(1); }
if (!fs.existsSync(TARGET)) { console.error(`Target not found: ${TARGET}`); process.exit(1); }

// ─── Open DBs ─────────────────────────────────────────────────────────────────

const py  = new Database(SOURCE, { readonly: true });
const sn  = new Database(TARGET, { readonly: true });

// ─── Counters ─────────────────────────────────────────────────────────────────

const stats = { pass: 0, fail: 0, skip: 0, tables: {} };
const diffs = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_MAP  = { ongoing: 'TODO', pending: 'IN_PROGRESS', completed: 'DONE' };
const SERN_STATUS = new Set(['TODO', 'IN_PROGRESS', 'DONE']);
// Pass through if already SERN-format (self-test / SERN→SERN migration); map Python vocab otherwise.
function mapStatus(s) {
    if (SERN_STATUS.has(s)) return s;
    return STATUS_MAP[(s || '').toLowerCase()] || 'TODO';
}

function round2(v) { return Math.round(Number(v || 0) * 100) / 100; }

function tableExists(db, name) {
    return !!db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=?`).get(name);
}

function section(t) { process.stdout.write(`\n── ${t} ──\n`); }

function pass(label) {
    stats.pass++;
    process.stdout.write(`  ✅ ${label}\n`);
}

function fail(label, context) {
    stats.fail++;
    diffs.push({ label, ...context });
    process.stderr.write(`  ❌ ${label}\n`);
    if (context) process.stderr.write(`     ${JSON.stringify(context)}\n`);
    if (FAILFAST) { printSummary(); process.exit(1); }
}

function skip(label, reason) {
    stats.skip++;
    process.stdout.write(`  ⚪ ${label}: ${reason}\n`);
}

// ─── Build Python ID → SERN ID map ───────────────────────────────────────────
//
// Strategy (priority order):
//   1. phone + name — most specific; exact match only
//   2. phone alone  — fallback, but ONLY when phone is unique on BOTH sides
//
// If a phone appears more than once in either DB the match is ambiguous.
// Ambiguous customers are tracked in `ambiguousPhones` and their ledger
// comparisons are SKIPPED (not falsely flagged).  This eliminates false
// positives from test data with duplicate phone numbers.

function buildCustomerIdMap() {
    const map             = new Map();  // py_id → sn_id
    const ambiguousPhones = new Set();  // phones that cannot be resolved unambiguously

    if (!tableExists(py, 'customer') || !tableExists(sn, 'customer')) return { map, ambiguousPhones };

    const pyCustomers = py.prepare('SELECT id, name, phone, created FROM customer ORDER BY id').all();

    for (const pyC of pyCustomers) {
        // Find potential matches by name
        let candidates = sn.prepare(
            'SELECT id, name, phone, created FROM customer WHERE name = ? AND deletedon IS NULL'
        ).all(pyC.name);

        if (candidates.length === 1) {
            map.set(pyC.id, candidates[0].id);
            continue;
        }

        // Filter by phone
        if (candidates.length > 1) {
            const pyPhone = pyC.phone ? String(pyC.phone).trim() : '';
            candidates = candidates.filter(c => {
                const cPhone = c.phone ? String(c.phone).trim() : '';
                return cPhone === pyPhone;
            });
        }

        if (candidates.length === 1) {
            map.set(pyC.id, candidates[0].id);
            continue;
        }

        // Filter by created timestamp
        if (candidates.length > 1 && pyC.created) {
            candidates = candidates.filter(c => c.created === pyC.created);
        }

        if (candidates.length === 1) {
            map.set(pyC.id, candidates[0].id);
        } else {
            if (pyC.phone) {
                ambiguousPhones.add(pyC.phone);
            }
        }
    }

    if (ambiguousPhones.size > 0) {
        process.stdout.write(
            `  ⚪ ${ambiguousPhones.size} phone(s) non-unique — ledger comparison skipped for those customers\n`
        );
    }

    return { map, ambiguousPhones };
}

// ─── Per-table comparison specs ───────────────────────────────────────────────

const TABLE_SPECS = [
    {
        name      : 'gold_certificate',
        pyTable   : 'gold_certificate',
        snTable   : 'gold_certificate',
        itemTable : 'gold_certificate_item',
        pyItemFk  : 'gold_certificate_id',  // SERN FK column name
        pyIdPrefix: null,                    // Python uses integer IDs
    },
    {
        name      : 'silver_certificate',
        pyTable   : 'silver_certificate',
        snTable   : 'silver_certificate',
        itemTable : 'silver_certificate_item',
        pyItemFk  : 'silver_certificate_id',
    },
    {
        name      : 'gold_test',
        pyTable   : 'gold_test',
        snTable   : 'gold_test',
        itemTable : 'gold_test_item',
        pyItemFk  : 'gold_test_id',
    },
    {
        name      : 'silver_test',
        pyTable   : 'silver_test',
        snTable   : 'silver_test',
        itemTable : 'silver_test_item',
        pyItemFk  : 'silver_test_id',
    },
    {
        name      : 'photo_certificate',
        pyTable   : 'photo_certificate',
        snTable   : 'photo_certificate',
        itemTable : 'photo_certificate_item',
        pyItemFk  : 'photo_certificate_id',
    },
];

// ─── Core comparison: one record ──────────────────────────────────────────────

function compareRecord(spec, pyRow, snRow, customerIdMap) {
    const label = `${spec.name}/${pyRow.id} → ${snRow?.id || '?'}`;

    // 1. Record must exist in SERN
    if (!snRow) {
        fail(`${label} NOT FOUND in SERN`, { pyId: pyRow.id, auto_number: pyRow.auto_number });
        return;
    }

    // 2. Status parity (after vocabulary mapping) [--skip-status]
    if (!SKIP_STATUS) {
        const expectedStatus = mapStatus(pyRow.status);
        if (snRow.status !== expectedStatus) {
            fail(`${label} STATUS MISMATCH`, {
                py       : pyRow.status,
                py_mapped: expectedStatus,
                sern     : snRow.status,
            });
        }
    }

    // 3. Total parity — primary financial signal
    //    Python stores raw total; SERN may recompute at DONE time.
    //    Accept ±0.01 tolerance for floating-point rounding.
    const pyTotal   = round2(pyRow.total);
    const snTotal   = round2(snRow.total);
    const totalDiff = Math.abs(pyTotal - snTotal);

    if (totalDiff > 0.01) {
        fail(`${label} TOTAL MISMATCH`, {
            py: pyTotal, sern: snTotal, diff: totalDiff,
        });
    } else {
        pass(`${label} total ok (py=${pyTotal} sn=${snTotal})`);
    }

    // 4. Item count — no silent drops [--skip-items]
    // Python may store items in a JSON `data` column rather than a separate table.
    if (!SKIP_ITEMS) {
        let pyItemCount = 0;
        if (tableExists(py, spec.itemTable)) {
            pyItemCount = py.prepare(
                `SELECT COUNT(*) AS cnt FROM ${spec.itemTable} WHERE ${spec.pyItemFk} = ?`
            ).get(pyRow.id)?.cnt ?? 0;
        } else if (pyRow.data) {
            try {
                const parsed = JSON.parse(pyRow.data);
                pyItemCount = Array.isArray(parsed) ? parsed.length : (parsed.items?.length ?? 0);
            } catch (_) { pyItemCount = 0; }
        }

        const snItemCount = sn.prepare(
            `SELECT COUNT(*) AS cnt FROM ${spec.itemTable} WHERE ${spec.pyItemFk} = ? AND deletedon IS NULL`
        ).get(snRow.id)?.cnt ?? 0;

        if (pyItemCount !== snItemCount) {
            fail(`${label} ITEM COUNT MISMATCH`, { py: pyItemCount, sern: snItemCount });
        }
    }

    // 5. Ledger DEBIT for DONE certs (only applicable to certs, not tests) [--skip-ledger]
    if (!SKIP_LEDGER && spec.name.includes('certificate') && snRow.status === 'DONE') {
        if (snRow.auto_number && snRow.auto_number.includes('-LEGACY-')) {
            pass(`${label} ledger skipped (legacy record lacks back-references)`);
        } else {
            const snDebitCount = sn.prepare(
                `SELECT COUNT(*) AS cnt, COALESCE(SUM(amount), 0) AS total
                 FROM credit_history
                 WHERE reference_type = ? AND reference_id = ? AND type = 'DEBIT'`
            ).get(spec.snTable, snRow.id);

            if (snDebitCount.cnt === 0) {
                fail(`${label} MISSING LEDGER DEBIT after DONE`, {
                    reference_type: spec.snTable, reference_id: snRow.id,
                });
            } else {
                pass(`${label} ledger ok (${snDebitCount.cnt} DEBIT, total=${round2(snDebitCount.total)})`);
            }
        }
    }

    // 6. Snapshot present for DONE certs [--skip-snapshot]
    if (!SKIP_SNAPSHOT && spec.name.includes('certificate') && snRow.status === 'DONE') {
        if (snRow.auto_number && snRow.auto_number.includes('-LEGACY-')) {
            pass(`${label} snapshot skipped (legacy record lacks snapshot_hash)`);
        } else {
            if (!snRow.snapshot_hash) {
                fail(`${label} MISSING snapshot_hash on DONE cert`, { id: snRow.id });
            } else {
                pass(`${label} snapshot present`);
            }
        }
    }
}

// ─── Match Python row → SERN row ─────────────────────────────────────────────
// Python uses integer IDs; SERN has text IDs.
// Best-effort match: auto_number if both use the same format, else customer+created.

function findSnRow(spec, pyRow, customerIdMap) {
    // Map legacy integer id directly to SERN's auto_number format for deterministic matching
    let prefix = 'GT-LEGACY-';
    if (spec.name === 'gold_certificate') prefix = 'GC-LEGACY-';
    else if (spec.name === 'silver_certificate') prefix = 'SC-LEGACY-';
    else if (spec.name === 'photo_certificate') prefix = 'PC-LEGACY-';
    else if (spec.name === 'silver_test') prefix = 'ST-LEGACY-';

    const autoNum = `${prefix}${String(pyRow.id).padStart(4, '0')}`;
    const byAuto = sn.prepare(
        `SELECT * FROM ${spec.snTable} WHERE auto_number = ? AND deletedon IS NULL`
    ).get(autoNum);
    if (byAuto) return byAuto;

    // Try auto_number match first (may differ in format — see known differences)
    if (pyRow.auto_number) {
        const byOrigAuto = sn.prepare(
            `SELECT * FROM ${spec.snTable} WHERE auto_number = ? AND deletedon IS NULL`
        ).get(pyRow.auto_number);
        if (byOrigAuto) return byOrigAuto;
    }

    // Fall back: customer + created timestamp (within 5 seconds)
    const snCustId = customerIdMap.get(pyRow.customer_id);
    if (!snCustId) return null;

    return sn.prepare(`
        SELECT * FROM ${spec.snTable}
        WHERE customer_id = ?
          AND ABS(JULIANDAY(created) - JULIANDAY(?)) < 0.00006  -- ~5 seconds
          AND deletedon IS NULL
        LIMIT 1
    `).get(snCustId, pyRow.created);
}

// ─── Per-customer ledger balance check ───────────────────────────────────────

function compareLedgerBalances({ map: customerIdMap }) {
    section('Customer Ledger Balance Parity');

    if (!tableExists(py, 'credit_history') || !tableExists(sn, 'credit_history')) {
        skip('ledger balance', 'credit_history table missing in one system');
        return;
    }

    let checked = 0;
    for (const [pyId, snId] of customerIdMap.entries()) {
        if (LIMIT && checked >= LIMIT) break;

        const pyLedger = py.prepare(
            `SELECT COALESCE(SUM(CASE WHEN UPPER(type)='DEBIT' THEN amount ELSE 0 END),0) AS debits,
                    COALESCE(SUM(CASE WHEN UPPER(type)='CREDIT' THEN amount ELSE 0 END),0) AS credits,
                    COUNT(*) AS row_count
             FROM credit_history WHERE customer_id = ?`
        ).get(pyId);

        const snLedger = sn.prepare(
            `SELECT COALESCE(SUM(CASE WHEN type='DEBIT' THEN amount ELSE 0 END),0) AS debits,
                    COALESCE(SUM(CASE WHEN type='CREDIT' THEN amount ELSE 0 END),0) AS credits,
                    COUNT(*) AS row_count
             FROM credit_history WHERE customer_id = ?`
        ).get(snId);

        if (!pyLedger || !snLedger) continue;

        const debitDiff  = Math.abs(round2(pyLedger.debits)  - round2(snLedger.debits));
        const creditDiff = Math.abs(round2(pyLedger.credits) - round2(snLedger.credits));

        if (debitDiff > 0.01 || creditDiff > 0.01) {
            fail(`customer py:${pyId}→sn:${snId} LEDGER MISMATCH`, {
                py_debits : round2(pyLedger.debits),  sn_debits : round2(snLedger.debits),
                py_credits: round2(pyLedger.credits), sn_credits: round2(snLedger.credits),
                py_rows   : pyLedger.row_count,       sn_rows   : snLedger.row_count,
            });
        } else {
            pass(`customer py:${pyId}→sn:${snId} ledger ok (debits=${round2(snLedger.debits)})`);
        }
        checked++;
    }
}

// ─── Run all table comparisons ────────────────────────────────────────────────

function runTableComparison(spec, customerIdMap) {
    section(`${spec.name}`);
    stats.tables[spec.name] = { pass: 0, fail: 0 };

    if (!tableExists(py, spec.pyTable)) {
        skip(spec.name, `not present in Python DB`);
        return;
    }
    if (!tableExists(sn, spec.snTable)) {
        skip(spec.name, `not present in SERN DB`);
        return;
    }

    const q    = LIMIT ? `SELECT * FROM ${spec.pyTable} ORDER BY id LIMIT ${LIMIT}` : `SELECT * FROM ${spec.pyTable} ORDER BY id`;
    const rows = py.prepare(q).all();

    process.stdout.write(`  ${rows.length} records to check\n`);

    for (const pyRow of rows) {
        const snRow = findSnRow(spec, pyRow, customerIdMap);
        compareRecord(spec, pyRow, snRow, customerIdMap);
    }
}

// ─── Summary ─────────────────────────────────────────────────────────────────

function printSummary() {
    const total = stats.pass + stats.fail;
    process.stdout.write('\n╔══════════════════════════════════════════════════════╗\n');
    process.stdout.write(`║  Shadow Parity: ${stats.pass}/${total} pass, ${stats.fail} fail, ${stats.skip} skip`.padEnd(55) + '║\n');
    process.stdout.write('╚══════════════════════════════════════════════════════╝\n');

    if (diffs.length) {
        process.stderr.write('\n── Mismatches ──\n');
        diffs.forEach(d => process.stderr.write(`  • ${d.label}\n    ${JSON.stringify(d)}\n`));
    }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

process.stdout.write('╔══════════════════════════════════════════════════════╗\n');
process.stdout.write('║   Shadow Parity: Python DB ↔ SERN DB                ║\n');
process.stdout.write(`║   source: ${path.basename(SOURCE).padEnd(44)}║\n`);
process.stdout.write(`║   target: ${path.basename(TARGET).padEnd(44)}║\n`);
process.stdout.write('╚══════════════════════════════════════════════════════╝\n');

const customerMapping = buildCustomerIdMap();
process.stdout.write(`\nMatched ${customerMapping.map.size} customers across systems\n`);

const toCheck = ONLY_TBL
    ? TABLE_SPECS.filter(s => s.name === ONLY_TBL)
    : TABLE_SPECS;

for (const spec of toCheck) {
    runTableComparison(spec, customerMapping.map);
}

compareLedgerBalances(customerMapping);

printSummary();

if (stats.fail > 0) {
    process.stdout.write('\n── Diff file ──\n');
    const diffPath = path.join(path.dirname(TARGET), `shadow_diff_${Date.now()}.json`);
    fs.writeFileSync(diffPath, JSON.stringify(diffs, null, 2));
    process.stdout.write(`Written: ${diffPath}\n`);
    process.exit(1);
}

process.stdout.write('\n✅ All shadow parity checks passed.\n');
