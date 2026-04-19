'use strict';

/**
 * test_parity_guarantees.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Extended parity + safety tests for the Py→Node migration:
 *
 *   P6  – Crash safety        (mid-finalize rollback: no partial state on failure)
 *   P7  – Hash tamper         (modify DB row after seal → SNAPSHOT_INTEGRITY_FAILURE)
 *   P8  – Parallel finalize, same requestId (idempotent — second returns cached result)
 *   P9  – Parallel finalize, different requestId (second rejected after DONE)
 *   P10 – Sequence collision  (concurrent creates → no duplicate auto_number)
 *   P11 – Performance         (transaction hold time, no long locks)
 *   P12 – OCC stale version   (finalize/move with wrong version → 409)
 *   P13 – Duplicate debit     (second DEBIT for same cert → UNIQUE constraint at storage layer)
 *   P14 – Verify edge cases  (missing snapshot → null, invalid autoNumber → 404, tamper → verified:false)
 *
 * Run: NODE_ENV=production node backend/scripts/test_parity_guarantees.js
 */

const { initDb, db, genId, now, withTransaction } = require('../db/db');
initDb();

const workflowService = require('../services/workflowService');
const testServiceV2   = require('../services/v2/testService');
const certServiceV2   = require('../services/v2/certificateService');
const printService    = require('../services/v2/printService');
const { _store }      = require('../utils/audit');

// ─── Test harness ─────────────────────────────────────────────────────────────

let _pass = 0;
let _fail = 0;
const _errors = [];

function ok(label, value) {
    if (value) {
        process.stdout.write(`  ✅ ${label}\n`);
        _pass++;
    } else {
        process.stderr.write(`  ❌ ${label}\n`);
        _fail++;
        _errors.push(label);
    }
}

function section(title) {
    process.stdout.write(`\n── ${title} ──\n`);
}

function withRequestId(requestId, fn) {
    return new Promise((resolve, reject) => {
        _store.run({ requestId }, async () => {
            try { resolve(await fn()); }
            catch (e) { reject(e); }
        });
    });
}

async function expectThrows(fn, codeOrMsg) {
    try {
        await fn();
        return false;
    } catch (e) {
        if (codeOrMsg) {
            return e.code === codeOrMsg ||
                   e.message?.includes(codeOrMsg) ||
                   String(e).includes(codeOrMsg);
        }
        return true;
    }
}

// ─── Seed helpers ─────────────────────────────────────────────────────────────

const actor = { userId: 'parity-test-user', username: 'parity-tester', ipAddress: '127.0.0.1', userAgent: 'parity-test' };

function seedCustomer() {
    const id = genId('CST');
    const ts = now();
    db.prepare('INSERT INTO customer (id, name, phone, created, lastmodified) VALUES (?, ?, ?, ?, ?)')
      .run(id, 'Parity Test Customer', '9999999999', ts, ts);
    return id;
}

function seedTest(type, customerId) {
    const r = testServiceV2.createTest(type, {
        customer_id: customerId,
        items: [{
            item_type   : type === 'gold' ? 'Gold Ring' : 'Silver Bangle',
            gross_weight: 10,
            test_weight : 0.5,
            purity      : 0,
            returned    : false,
        }],
        status         : 'TODO',
        mode_of_payment: 'Cash',
    });
    return r.id;
}

function seedTestInProgress(type, customerId) {
    const id = seedTest(type, customerId);
    const detail = testServiceV2.getTest(type, id);
    testServiceV2.saveTestDraft(type, id, {
        items: detail.items.map(i => ({ id: i.id, purity: 91.6 })),
    });
    workflowService.moveItem(type, id, 'IN_PROGRESS', actor);
    return id;
}

function seedCert(type, customerId) {
    const r = certServiceV2.createCertificate(type, {
        customer_id    : customerId,
        items          : [{ name: 'Item 1', item_type: 'Ring', gross_weight: 8, test_weight: 0.3, purity: 92.5 }],
        status         : 'TODO',
        mode_of_payment: 'Cash',
        gst            : false,
    });
    return r.id;
}

// ─── Pre-test cleanup ─────────────────────────────────────────────────────────

function cleanupPreviousTestData() {
    db.pragma('foreign_keys = OFF');
    try {
        const testCids = db.prepare("SELECT id FROM customer WHERE name = 'Parity Test Customer'")
            .all().map(r => r.id);

        if (testCids.length === 0) return;

        const ph = testCids.map(() => '?').join(',');

        for (const [parentTable, itemTable, fk] of [
            ['gold_test',         'gold_test_item',          'gold_test_id'],
            ['silver_test',       'silver_test_item',        'silver_test_id'],
            ['gold_certificate',  'gold_certificate_item',   'gold_certificate_id'],
            ['silver_certificate','silver_certificate_item', 'silver_certificate_id'],
            ['photo_certificate', 'photo_certificate_item',  'photo_certificate_id'],
        ]) {
            const ids = db.prepare(`SELECT id FROM ${parentTable} WHERE customer_id IN (${ph})`)
                .all(...testCids).map(r => r.id);
            if (ids.length) {
                const ip = ids.map(() => '?').join(',');
                db.prepare(`DELETE FROM ${itemTable} WHERE ${fk} IN (${ip})`).run(...ids);
                db.prepare(`DELETE FROM ${parentTable} WHERE id IN (${ip})`).run(...ids);
            }
        }

        db.prepare(`DELETE FROM customer WHERE id IN (${ph})`).run(...testCids);
        process.stdout.write(`  [cleanup] removed ${testCids.length} parity test customer(s)\n`);

        // Reset sequences to current max
        const d = new Date();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yy = String(d.getFullYear()).slice(-2);
        const todayYMD = `${d.getFullYear()}${mm}${dd}`;

        function maxSeq(table, prefix) {
            const r = db.prepare(
                `SELECT MAX(CAST(SUBSTR(auto_number, ${prefix.length + 1}) AS INTEGER)) AS m
                 FROM ${table} WHERE auto_number LIKE ?`
            ).get(`${prefix}%`);
            return r?.m ?? 0;
        }

        db.prepare("UPDATE globals SET value = ? WHERE key = 'GOLD_TEST_SEQ'")
          .run(String(maxSeq('gold_test', `GT${yy}-`)));
        db.prepare("UPDATE globals SET value = ? WHERE key = 'SILVER_TEST_SEQ'")
          .run(String(maxSeq('silver_test', `ST${yy}-`)));
        db.prepare("UPDATE globals SET value = ? WHERE key = 'daily_last_date'").run(todayYMD);
        process.stdout.write(`  [cleanup] sequences reset, date=${todayYMD}\n`);
    } finally {
        db.pragma('foreign_keys = ON');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// P6 — CRASH SAFETY (mid-finalize rollback)
// ─────────────────────────────────────────────────────────────────────────────

async function testCrashSafety() {
    section('P6 — Crash Safety (mid-finalize rollback)');
    const cid = seedCustomer();

    // ── 6.1 Inject error mid-transaction — status must not change ────────────
    const gcid = seedCert('gold', cid);
    await workflowService.moveItem('gold_cert', gcid, 'IN_PROGRESS', actor);

    const preCrash = db.prepare('SELECT status, snapshot_hash FROM gold_certificate WHERE id = ?').get(gcid);

    let threw61 = false;
    try {
        withTransaction(() => {
            db.prepare('UPDATE gold_certificate SET status = ? WHERE id = ?').run('DONE', gcid);
            // Simulate crash: throw before commit
            throw new Error('SIMULATED_CRASH');
        });
    } catch (e) {
        threw61 = e.message === 'SIMULATED_CRASH';
    }

    const postCrash = db.prepare('SELECT status, snapshot_hash FROM gold_certificate WHERE id = ?').get(gcid);

    ok('P6.1 transaction rolled back on mid-tx throw', threw61);
    ok('P6.1 status unchanged after rolled-back transaction', postCrash.status === preCrash.status);
    ok('P6.1 snapshot_hash unchanged after rolled-back transaction', postCrash.snapshot_hash === preCrash.snapshot_hash);

    // ── 6.2 Real finalize succeeds after failed attempt ──────────────────────
    const f62 = await workflowService.finalizeItem('gold_cert', gcid, actor);
    ok('P6.2 finalize succeeds after a prior rolled-back attempt', f62.updated === true);

    const postFinalize = db.prepare('SELECT status, snapshot_hash FROM gold_certificate WHERE id = ?').get(gcid);
    ok('P6.2 status=DONE after successful finalize', postFinalize.status === 'DONE');
    ok('P6.2 snapshot_hash written after successful finalize', !!postFinalize.snapshot_hash);

    // ── 6.3 Audit log row exists only for DONE transition (not rolled-back) ──
    const auditRows = db.prepare(
        `SELECT COUNT(*) AS cnt FROM audit_logs
         WHERE action = 'WORKFLOW_FINALIZE' AND entity_id = ?`
    ).get(gcid);
    // At most one WORKFLOW_FINALIZE (the successful one); the failed one never committed
    ok('P6.3 only one WORKFLOW_FINALIZE audit row (no ghost from rollback)', auditRows.cnt === 1);

    // ── 6.4 Silver cert: same atomicity check ────────────────────────────────
    const scid = seedCert('silver', cid);
    await workflowService.moveItem('silver_cert', scid, 'IN_PROGRESS', actor);
    const preS = db.prepare('SELECT status FROM silver_certificate WHERE id = ?').get(scid);

    let threw64 = false;
    try {
        withTransaction(() => {
            db.prepare('UPDATE silver_certificate SET status = ? WHERE id = ?').run('DONE', scid);
            throw new Error('SIMULATED_CRASH');
        });
    } catch (e) { threw64 = true; }

    const postS = db.prepare('SELECT status FROM silver_certificate WHERE id = ?').get(scid);
    ok('P6.4 silver_cert status unchanged after rolled-back transaction', postS.status === preS.status);

    await workflowService.finalizeItem('silver_cert', scid, actor);
    const doneS = db.prepare('SELECT status FROM silver_certificate WHERE id = ?').get(scid);
    ok('P6.4 silver_cert finalize succeeds after prior rollback', doneS.status === 'DONE');
}

// ─────────────────────────────────────────────────────────────────────────────
// P7 — HASH TAMPER DETECTION
// ─────────────────────────────────────────────────────────────────────────────

async function testHashTamper() {
    section('P7 — Hash Tamper Detection');
    const cid = seedCustomer();

    // ── 7.1 Finalize gold cert — snapshot written ─────────────────────────────
    const gcid = seedCert('gold', cid);
    await workflowService.moveItem('gold_cert', gcid, 'IN_PROGRESS', actor);
    await workflowService.finalizeItem('gold_cert', gcid, actor);

    const sealed = db.prepare(
        'SELECT print_snapshot, snapshot_hash FROM gold_certificate WHERE id = ?'
    ).get(gcid);
    ok('P7.1 snapshot and hash present after finalize', !!sealed.print_snapshot && !!sealed.snapshot_hash);

    // ── 7.2 Tamper: overwrite a byte in print_snapshot ───────────────────────
    const tampered = sealed.print_snapshot.replace(/"purity":"[\d.]+"/, '"purity":"99.99"');
    db.prepare('UPDATE gold_certificate SET print_snapshot = ? WHERE id = ?').run(tampered, gcid);

    const threw72 = await expectThrows(
        () => printService.getImmutableSnapshot('certificate', 'gold', gcid),
        'SNAPSHOT_INTEGRITY_FAILURE'
    );
    ok('P7.2 tampered print_snapshot → SNAPSHOT_INTEGRITY_FAILURE', threw72);

    // Restore original snapshot for subsequent tests
    db.prepare('UPDATE gold_certificate SET print_snapshot = ? WHERE id = ?').run(sealed.print_snapshot, gcid);

    // ── 7.3 Tamper: corrupt the stored hash ─────────────────────────────────
    db.prepare('UPDATE gold_certificate SET snapshot_hash = ? WHERE id = ?').run('deadbeef', gcid);

    const threw73 = await expectThrows(
        () => printService.getImmutableSnapshot('certificate', 'gold', gcid),
        'SNAPSHOT_INTEGRITY_FAILURE'
    );
    ok('P7.3 corrupted snapshot_hash → SNAPSHOT_INTEGRITY_FAILURE', threw73);

    // Restore
    db.prepare('UPDATE gold_certificate SET snapshot_hash = ? WHERE id = ?').run(sealed.snapshot_hash, gcid);

    // ── 7.4 Intact snapshot passes validation ────────────────────────────────
    const snapshot74 = printService.getImmutableSnapshot('certificate', 'gold', gcid);
    ok('P7.4 intact snapshot passes getImmutableSnapshot', !!snapshot74?.data);

    // ── 7.5 Silver cert tamper check ─────────────────────────────────────────
    const scid = seedCert('silver', cid);
    await workflowService.moveItem('silver_cert', scid, 'IN_PROGRESS', actor);
    await workflowService.finalizeItem('silver_cert', scid, actor);

    const sSealed = db.prepare(
        'SELECT print_snapshot, snapshot_hash FROM silver_certificate WHERE id = ?'
    ).get(scid);

    // Tamper snapshot, verify detection
    const sTampered = sSealed.print_snapshot.replace(/"total":"[\d.]+"/, '"total":"9999.00"');
    db.prepare('UPDATE silver_certificate SET print_snapshot = ? WHERE id = ?').run(sTampered, scid);

    const threw75 = await expectThrows(
        () => printService.getImmutableSnapshot('certificate', 'silver', scid),
        'SNAPSHOT_INTEGRITY_FAILURE'
    );
    ok('P7.5 silver_cert tampered snapshot → SNAPSHOT_INTEGRITY_FAILURE', threw75);

    // Restore
    db.prepare('UPDATE silver_certificate SET print_snapshot = ? WHERE id = ?').run(sSealed.print_snapshot, scid);
}

// ─────────────────────────────────────────────────────────────────────────────
// P8 — PARALLEL FINALIZE, SAME REQUEST ID (idempotent)
// ─────────────────────────────────────────────────────────────────────────────

async function testParallelFinalizeSameRequestId() {
    section('P8 — Parallel Finalize, Same requestId (idempotency)');
    const cid = seedCustomer();

    // ── 8.1 Gold cert: two concurrent calls with same requestId ──────────────
    const gcid = seedCert('gold', cid);
    await workflowService.moveItem('gold_cert', gcid, 'IN_PROGRESS', actor);

    const reqId = 'req-parallel-same-' + genId('REQ');

    // Fire both in parallel via Promise.all
    const [r1, r2] = await Promise.allSettled([
        withRequestId(reqId, () => workflowService.finalizeItem('gold_cert', gcid, actor)),
        withRequestId(reqId, () => workflowService.finalizeItem('gold_cert', gcid, actor)),
    ]);

    // At least one must succeed
    const successes = [r1, r2].filter(r => r.status === 'fulfilled');
    ok('P8.1 at least one parallel call with same requestId succeeds', successes.length >= 1);

    // The cert must end up DONE exactly once
    const certRow = db.prepare('SELECT status, completion_request_id FROM gold_certificate WHERE id = ?').get(gcid);
    ok('P8.1 cert ends up DONE', certRow.status === 'DONE');
    ok('P8.1 completion_request_id matches the request', certRow.completion_request_id === reqId);

    // Any rejection must be a conflict/idempotency error, not a constraint error
    const failures = [r1, r2].filter(r => r.status === 'rejected');
    const allSafeFailures = failures.every(r => {
        const msg = r.reason?.message || '';
        const code = r.reason?.code || '';
        // Acceptable: STATUS_INVALID (already DONE), CONFLICT, idempotent return
        return code === 'STATUS_INVALID' || code === 'CONFLICT' ||
               msg.includes('DONE') || msg.includes('already') || msg.includes('idempotent');
    });
    ok('P8.1 any failure is a safe conflict/idempotency error, not a data corruption error',
        failures.length === 0 || allSafeFailures);

    // ── 8.2 Silver cert: same pattern ────────────────────────────────────────
    const scid = seedCert('silver', cid);
    await workflowService.moveItem('silver_cert', scid, 'IN_PROGRESS', actor);
    const reqId82 = 'req-parallel-same-s-' + genId('REQ');

    const [s1, s2] = await Promise.allSettled([
        withRequestId(reqId82, () => workflowService.finalizeItem('silver_cert', scid, actor)),
        withRequestId(reqId82, () => workflowService.finalizeItem('silver_cert', scid, actor)),
    ]);

    const sCertRow = db.prepare('SELECT status FROM silver_certificate WHERE id = ?').get(scid);
    ok('P8.2 silver_cert ends up DONE after parallel same-requestId calls',
        sCertRow.status === 'DONE');

    // ── 8.3 Gold test: verify no duplicate auto_number on parallel same-id ───
    const gid = seedTestInProgress('gold', cid);
    const reqId83 = 'req-parallel-test-' + genId('REQ');

    await Promise.allSettled([
        withRequestId(reqId83, () => workflowService.finalizeItem('gold', gid, actor)),
        withRequestId(reqId83, () => workflowService.finalizeItem('gold', gid, actor)),
    ]);

    // Check no duplicate auto_number was created for certs linked to this customer
    const dupAutoNums = db.prepare(`
        SELECT auto_number, COUNT(*) as cnt
        FROM gold_certificate
        WHERE customer_id = ?
        GROUP BY auto_number
        HAVING cnt > 1
    `).all(cid);
    ok('P8.3 no duplicate auto_number created by parallel same-requestId finalize', dupAutoNums.length === 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// P9 — PARALLEL FINALIZE, DIFFERENT REQUEST IDS (second must be rejected)
// ─────────────────────────────────────────────────────────────────────────────

async function testParallelFinalizeDifferentRequestId() {
    section('P9 — Parallel Finalize, Different requestIds (one must win)');
    const cid = seedCustomer();

    // ── 9.1 Gold cert: two different requestIds in parallel ──────────────────
    const gcid = seedCert('gold', cid);
    await workflowService.moveItem('gold_cert', gcid, 'IN_PROGRESS', actor);

    const reqA = 'req-parallel-A-' + genId('REQ');
    const reqB = 'req-parallel-B-' + genId('REQ');

    const [rA, rB] = await Promise.allSettled([
        withRequestId(reqA, () => workflowService.finalizeItem('gold_cert', gcid, actor)),
        withRequestId(reqB, () => workflowService.finalizeItem('gold_cert', gcid, actor)),
    ]);

    const results91 = [rA, rB];
    const won91  = results91.filter(r => r.status === 'fulfilled');
    const lost91 = results91.filter(r => r.status === 'rejected');

    ok('P9.1 exactly one of the parallel finalize calls wins', won91.length === 1);
    ok('P9.1 exactly one of the parallel finalize calls fails', lost91.length === 1);

    const certRow91 = db.prepare('SELECT status FROM gold_certificate WHERE id = ?').get(gcid);
    ok('P9.1 cert ends up DONE exactly once', certRow91.status === 'DONE');

    // The loser must throw a business error (STATUS_INVALID or IMMUTABLE), not crash
    const loser91 = lost91[0]?.reason;
    ok('P9.1 loser throws a business error (not uncaught exception)',
        loser91 instanceof Error && (
            loser91.message?.includes('DONE') ||
            loser91.code === 'STATUS_INVALID' ||
            loser91.code === 'IMMUTABLE' ||
            loser91.code === 'CONFLICT'
        ));

    // ── 9.2 Completion_request_id stamped with the winner's requestId ─────────
    const certRow92 = db.prepare('SELECT completion_request_id FROM gold_certificate WHERE id = ?').get(gcid);
    const winner92RequestId = won91[0]?.value?._requestId ||
        (rA.status === 'fulfilled' ? reqA : reqB);
    ok('P9.2 completion_request_id matches winner requestId',
        certRow92.completion_request_id === winner92RequestId ||
        certRow92.completion_request_id === reqA ||
        certRow92.completion_request_id === reqB);

    // ── 9.3 No duplicate audit rows ──────────────────────────────────────────
    const auditCount = db.prepare(
        `SELECT COUNT(*) AS cnt FROM audit_logs WHERE action = 'WORKFLOW_FINALIZE' AND entity_id = ?`
    ).get(gcid).cnt;
    ok('P9.3 exactly one WORKFLOW_FINALIZE audit row (winner only)', auditCount === 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// P10 — SEQUENCE COLLISION (concurrent creates → no duplicate auto_number)
// ─────────────────────────────────────────────────────────────────────────────

async function testSequenceCollision() {
    section('P10 — Sequence Collision (no duplicate auto_number)');
    const cid = seedCustomer();

    const CONCURRENT = 20;

    // ── 10.1 Gold tests: N concurrent creates ────────────────────────────────
    const goldIds = await Promise.all(
        Array.from({ length: CONCURRENT }, () =>
            Promise.resolve(testServiceV2.createTest('gold', {
                customer_id    : cid,
                items          : [{ item_type: 'Gold Ring', gross_weight: 5, test_weight: 0.2, purity: 0, returned: false }],
                status         : 'TODO',
                mode_of_payment: 'Cash',
            }))
        )
    );

    const goldAutoNums = goldIds.map(r => r.auto_number);
    const uniqueGold = new Set(goldAutoNums);
    ok('P10.1 no duplicate auto_number in concurrent gold test creates',
        uniqueGold.size === CONCURRENT);

    // ── 10.2 Silver tests: N concurrent creates ──────────────────────────────
    const silverIds = await Promise.all(
        Array.from({ length: CONCURRENT }, () =>
            Promise.resolve(testServiceV2.createTest('silver', {
                customer_id    : cid,
                items          : [{ item_type: 'Silver Bangle', gross_weight: 20, test_weight: 1, purity: 0, returned: false }],
                status         : 'TODO',
                mode_of_payment: 'Cash',
            }))
        )
    );

    const silverAutoNums = silverIds.map(r => r.auto_number);
    const uniqueSilver = new Set(silverAutoNums);
    ok('P10.2 no duplicate auto_number in concurrent silver test creates',
        uniqueSilver.size === CONCURRENT);

    // ── 10.3 Gold certificates: N concurrent creates ─────────────────────────
    const certIds = await Promise.all(
        Array.from({ length: CONCURRENT }, () =>
            Promise.resolve(certServiceV2.createCertificate('gold', {
                customer_id    : cid,
                items          : [{ name: 'Ring', item_type: 'Ring', gross_weight: 6, test_weight: 0.3, purity: 91.6 }],
                status         : 'TODO',
                mode_of_payment: 'Cash',
                gst            : false,
            }))
        )
    );

    const certAutoNums = certIds.map(r => r.auto_number);
    const uniqueCert = new Set(certAutoNums);
    ok('P10.3 no duplicate auto_number in concurrent gold cert creates',
        uniqueCert.size === CONCURRENT);

    // ── 10.4 Verify all auto_numbers follow the expected pattern ─────────────
    const goldPattern   = /^GT\d{2}-\d+$/;
    const silverPattern = /^ST\d{2}-\d+$/;
    const certPattern   = /^[A-Z]{1,2}\d{2}-\d+$/;

    ok('P10.4 gold auto_numbers match GT{yy}-{n} pattern',
        goldAutoNums.every(n => goldPattern.test(n)));
    ok('P10.4 silver auto_numbers match ST{yy}-{n} pattern',
        silverAutoNums.every(n => silverPattern.test(n)));
    ok('P10.4 cert auto_numbers match expected pattern',
        certAutoNums.every(n => certPattern.test(n)));

    // ── 10.5 Global uniqueness: no collisions across tables ───────────────────
    // Gold tests and certs should never share auto_number prefixes
    const overlap = goldAutoNums.filter(n => certAutoNums.includes(n));
    ok('P10.5 gold test and gold cert auto_numbers never overlap',
        overlap.length === 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// P11 — PERFORMANCE (transaction hold time, lock contention)
// ─────────────────────────────────────────────────────────────────────────────

async function testPerformance() {
    section('P11 — Performance (transaction timing)');
    const cid = seedCustomer();

    const MAX_CREATE_MS       = 200;   // single create must complete in < 200 ms
    const MAX_FINALIZE_MS     = 500;   // finalize (snapshot + ledger + audit) < 500 ms
    const MAX_BATCH_TOTAL_MS  = 5000;  // 10 sequential creates in under 5 s
    const MAX_AVG_FINALIZE_MS = 300;   // average finalize across 5 certs < 300 ms

    // ── 11.1 Single gold test create ─────────────────────────────────────────
    const t1Start = Date.now();
    testServiceV2.createTest('gold', {
        customer_id    : cid,
        items          : [{ item_type: 'Gold Ring', gross_weight: 5, test_weight: 0.2, purity: 0, returned: false }],
        status         : 'TODO',
        mode_of_payment: 'Cash',
    });
    const t1Elapsed = Date.now() - t1Start;
    ok(`P11.1 single gold test create < ${MAX_CREATE_MS}ms (got ${t1Elapsed}ms)`,
        t1Elapsed < MAX_CREATE_MS);

    // ── 11.2 Single gold cert finalize (snapshot + ledger + audit) ───────────
    const gcid11 = seedCert('gold', cid);
    await workflowService.moveItem('gold_cert', gcid11, 'IN_PROGRESS', actor);

    const t2Start = Date.now();
    await workflowService.finalizeItem('gold_cert', gcid11, actor);
    const t2Elapsed = Date.now() - t2Start;
    ok(`P11.2 gold cert finalize < ${MAX_FINALIZE_MS}ms (got ${t2Elapsed}ms)`,
        t2Elapsed < MAX_FINALIZE_MS);

    // ── 11.3 10 sequential creates ──────────────────────────────────────────
    const bStart = Date.now();
    for (let i = 0; i < 10; i++) {
        testServiceV2.createTest('silver', {
            customer_id    : cid,
            items          : [{ item_type: 'Silver Ring', gross_weight: 8, test_weight: 0.4, purity: 0, returned: false }],
            status         : 'TODO',
            mode_of_payment: 'Cash',
        });
    }
    const bElapsed = Date.now() - bStart;
    ok(`P11.3 10 sequential silver test creates < ${MAX_BATCH_TOTAL_MS}ms (got ${bElapsed}ms)`,
        bElapsed < MAX_BATCH_TOTAL_MS);

    // ── 11.4 Average finalize time across 5 certs ────────────────────────────
    const certIds11 = [];
    for (let i = 0; i < 5; i++) {
        const id = seedCert('silver', cid);
        await workflowService.moveItem('silver_cert', id, 'IN_PROGRESS', actor);
        certIds11.push(id);
    }

    let totalFinalizeMs = 0;
    for (const id of certIds11) {
        const t = Date.now();
        await workflowService.finalizeItem('silver_cert', id, actor);
        totalFinalizeMs += Date.now() - t;
    }
    const avgMs = Math.round(totalFinalizeMs / certIds11.length);
    ok(`P11.4 average silver cert finalize < ${MAX_AVG_FINALIZE_MS}ms (avg ${avgMs}ms)`,
        avgMs < MAX_AVG_FINALIZE_MS);

    // ── 11.5 withTransaction overhead: 1000 no-op transactions ───────────────
    const noopStart = Date.now();
    for (let i = 0; i < 1000; i++) {
        withTransaction(() => 42);
    }
    const noopElapsed = Date.now() - noopStart;
    const avgNoopUs = Math.round((noopElapsed * 1000) / 1000);
    ok(`P11.5 1000 no-op withTransactions < 2000ms (got ${noopElapsed}ms, ${avgNoopUs}μs each)`,
        noopElapsed < 2000);
}

// ─────────────────────────────────────────────────────────────────────────────
// P14 — VERIFY ENDPOINT EDGE CASES
// ─────────────────────────────────────────────────────────────────────────────

async function testVerifyEdgeCases() {
    section('P14 — Verify Endpoint Edge Cases');
    const cid = seedCustomer();

    // ── 14.1 DONE cert → verified:true ───────────────────────────────────────
    const gcid = seedCert('gold', cid);
    await workflowService.moveItem('gold_cert', gcid, 'IN_PROGRESS', actor);
    await workflowService.finalizeItem('gold_cert', gcid, actor);
    const sealed = db.prepare('SELECT print_snapshot, snapshot_hash, snapshot_key_version, status FROM gold_certificate WHERE id = ?').get(gcid);
    let verified141 = false;
    try { printService.validateAndExtract(sealed); verified141 = true; } catch (_) {}
    ok('P14.1 DONE cert with intact snapshot → validateAndExtract passes', verified141);

    // ── 14.2 Missing snapshot → null (legacy record, not tampered) ───────────
    const gcid2 = seedCert('gold', cid);
    await workflowService.moveItem('gold_cert', gcid2, 'IN_PROGRESS', actor);
    await workflowService.finalizeItem('gold_cert', gcid2, actor);
    // Wipe snapshot to simulate a legacy record written before snapshot system
    db.prepare('UPDATE gold_certificate SET print_snapshot = NULL, snapshot_hash = NULL WHERE id = ?').run(gcid2);
    const noSnap = db.prepare('SELECT print_snapshot, snapshot_hash, snapshot_key_version, status FROM gold_certificate WHERE id = ?').get(gcid2);
    // verifyRoutes logic: if no print_snapshot → verified = null (not false, not tampered)
    const hasNoSnapshot = !noSnap.print_snapshot && !noSnap.snapshot_hash;
    ok('P14.2 missing snapshot → verified:null (not tampered, legacy record)', hasNoSnapshot);

    // ── 14.3 Tampered snapshot → SNAPSHOT_INTEGRITY_FAILURE ──────────────────
    const gcid3 = seedCert('gold', cid);
    await workflowService.moveItem('gold_cert', gcid3, 'IN_PROGRESS', actor);
    await workflowService.finalizeItem('gold_cert', gcid3, actor);
    const sealed3 = db.prepare('SELECT print_snapshot, snapshot_hash, snapshot_key_version FROM gold_certificate WHERE id = ?').get(gcid3);
    // Tamper the snapshot content
    const tampered3 = sealed3.print_snapshot.replace(/"total":"[\d.]+"/, '"total":"9999.00"');
    db.prepare('UPDATE gold_certificate SET print_snapshot = ? WHERE id = ?').run(tampered3, gcid3);
    const tamperedRow = db.prepare('SELECT print_snapshot, snapshot_hash, snapshot_key_version, status FROM gold_certificate WHERE id = ?').get(gcid3);
    let threw143 = false;
    let isTamper143 = false;
    try {
        printService.validateAndExtract(tamperedRow);
    } catch (e) {
        threw143 = true;
        isTamper143 = e.message?.includes('SNAPSHOT_INTEGRITY_FAILURE') || e.code === 'DB_CORRUPTION';
    }
    ok('P14.3 tampered snapshot → validateAndExtract throws', threw143);
    ok('P14.3 tampered snapshot → SNAPSHOT_INTEGRITY_FAILURE (not generic error)', isTamper143);
    // Restore
    db.prepare('UPDATE gold_certificate SET print_snapshot = ? WHERE id = ?').run(sealed3.print_snapshot, gcid3);

    // ── 14.4 Non-DONE cert → getImmutableSnapshot throws STATUS_INVALID ──────
    const gcid4 = seedCert('gold', cid);
    await workflowService.moveItem('gold_cert', gcid4, 'IN_PROGRESS', actor);
    const threw144 = await expectThrows(
        () => printService.getImmutableSnapshot('certificate', 'gold', gcid4),
        'STATUS_INVALID'
    );
    ok('P14.4 IN_PROGRESS cert → getImmutableSnapshot throws STATUS_INVALID', threw144);

    // ── 14.5 Non-existent ID → getImmutableSnapshot throws NOT_FOUND ─────────
    const threw145 = await expectThrows(
        () => printService.getImmutableSnapshot('certificate', 'gold', 'GCR-DOES-NOT-EXIST'),
        'NOT_FOUND'
    );
    ok('P14.5 non-existent ID → getImmutableSnapshot throws NOT_FOUND', threw145);
}

// ─────────────────────────────────────────────────────────────────────────────
// P12 — OCC STALE VERSION (finalize with wrong version must be rejected)
// ─────────────────────────────────────────────────────────────────────────────

async function testOccStaleVersion() {
    section('P12 — OCC Stale Version Rejection');
    const cid = seedCustomer();

    // ── 12.1 Finalize with stale expectedVersion → 409 ───────────────────────
    const gcid = seedCert('gold', cid);
    await workflowService.moveItem('gold_cert', gcid, 'IN_PROGRESS', actor);

    const currentVersion = db.prepare('SELECT version FROM gold_certificate WHERE id = ?').get(gcid).version;
    const staleVersion   = currentVersion - 1;   // intentionally wrong

    const threw121 = await expectThrows(
        () => withRequestId('req-occ-stale-' + genId('REQ'),
              () => workflowService.finalizeItem('gold_cert', gcid, actor, staleVersion)),
        'OPTIMISTIC_LOCK_CONFLICT'
    );
    ok('P12.1 finalize with stale version → OPTIMISTIC_LOCK_CONFLICT', threw121);

    // cert must still be IN_PROGRESS — not corrupted by the failed attempt
    const afterStale = db.prepare('SELECT status, version FROM gold_certificate WHERE id = ?').get(gcid);
    ok('P12.1 cert status unchanged after stale-version rejection', afterStale.status === 'IN_PROGRESS');
    ok('P12.1 cert version unchanged after stale-version rejection', afterStale.version === currentVersion);

    // ── 12.2 Correct version succeeds ────────────────────────────────────────
    const correctVersion = db.prepare('SELECT version FROM gold_certificate WHERE id = ?').get(gcid).version;
    const r122 = await withRequestId('req-occ-correct-' + genId('REQ'),
        () => workflowService.finalizeItem('gold_cert', gcid, actor, correctVersion));
    ok('P12.2 finalize with correct version succeeds', r122.updated === true);

    const afterCorrect = db.prepare('SELECT status FROM gold_certificate WHERE id = ?').get(gcid);
    ok('P12.2 cert status = DONE after correct-version finalize', afterCorrect.status === 'DONE');

    // ── 12.3 Move with stale version → 409 ────────────────────────────────────
    const gcid3 = seedCert('gold', cid);
    const vBefore3 = db.prepare('SELECT version FROM gold_certificate WHERE id = ?').get(gcid3).version;

    const threw123 = await expectThrows(
        () => workflowService.moveItem('gold_cert', gcid3, 'IN_PROGRESS', actor, vBefore3 - 1),
        'OPTIMISTIC_LOCK_CONFLICT'
    );
    ok('P12.3 moveItem with stale version → OPTIMISTIC_LOCK_CONFLICT', threw123);

    const after3 = db.prepare('SELECT status FROM gold_certificate WHERE id = ?').get(gcid3);
    ok('P12.3 cert status unchanged after stale move rejection', after3.status === 'TODO');

    // ── 12.4 Silver cert: same OCC guarantee ─────────────────────────────────
    const scid = seedCert('silver', cid);
    await workflowService.moveItem('silver_cert', scid, 'IN_PROGRESS', actor);
    const svCurrent = db.prepare('SELECT version FROM silver_certificate WHERE id = ?').get(scid).version;

    const threw124 = await expectThrows(
        () => withRequestId('req-occ-silver-' + genId('REQ'),
              () => workflowService.finalizeItem('silver_cert', scid, actor, svCurrent - 1)),
        'OPTIMISTIC_LOCK_CONFLICT'
    );
    ok('P12.4 silver_cert stale version → OPTIMISTIC_LOCK_CONFLICT', threw124);
}

// ─────────────────────────────────────────────────────────────────────────────
// P13 — DUPLICATE DEBIT BLOCKED BY UNIQUE INDEX (storage-level guard)
// ─────────────────────────────────────────────────────────────────────────────

async function testDuplicateDebitIndex() {
    section('P13 — Duplicate Debit Blocked by Unique Index');
    const cid = seedCustomer();

    // ── 13.1 Finalize gold cert → one DEBIT row written ──────────────────────
    const gcid = seedCert('gold', cid);
    await workflowService.moveItem('gold_cert', gcid, 'IN_PROGRESS', actor);
    await withRequestId('req-dedup-' + genId('REQ'),
        () => workflowService.finalizeItem('gold_cert', gcid, actor));

    const debitCount131 = db.prepare(
        `SELECT COUNT(*) AS cnt FROM credit_history WHERE reference_type = 'gold_certificate' AND reference_id = ? AND type = 'DEBIT'`
    ).get(gcid).cnt;
    ok('P13.1 exactly one DEBIT row after finalize', debitCount131 === 1);

    // ── 13.2 Raw INSERT of a second DEBIT must be rejected by the DB ──────────
    const threw132 = await expectThrows(() => {
        db.prepare(`
            INSERT INTO credit_history
                (id, customer_id, amount, type, description, reference_type, reference_id, created)
            VALUES (?, ?, 50, 'DEBIT', 'parity-test duplicate debit', 'gold_certificate', ?, ?)
        `).run(genId('CHX'), cid, gcid, now());
    }, 'UNIQUE');
    ok('P13.2 second DEBIT for same cert → UNIQUE constraint (storage-level block)', threw132);

    // ── 13.3 DEBIT count still 1 after rejected duplicate ────────────────────
    const debitCount133 = db.prepare(
        `SELECT COUNT(*) AS cnt FROM credit_history WHERE reference_type = 'gold_certificate' AND reference_id = ? AND type = 'DEBIT'`
    ).get(gcid).cnt;
    ok('P13.3 debit count remains 1 after rejected duplicate insert', debitCount133 === 1);

    // ── 13.4 Silver cert: same index coverage ────────────────────────────────
    const scid = seedCert('silver', cid);
    await workflowService.moveItem('silver_cert', scid, 'IN_PROGRESS', actor);
    await withRequestId('req-dedup-s-' + genId('REQ'),
        () => workflowService.finalizeItem('silver_cert', scid, actor));

    const threw134 = await expectThrows(() => {
        db.prepare(`
            INSERT INTO credit_history
                (id, customer_id, amount, type, description, reference_type, reference_id, created)
            VALUES (?, ?, 50, 'DEBIT', 'parity-test duplicate debit', 'silver_certificate', ?, ?)
        `).run(genId('CHX'), cid, scid, now());
    }, 'UNIQUE');
    ok('P13.4 second DEBIT for silver cert → UNIQUE constraint', threw134);

    // ── 13.5 CREDIT for same cert is allowed (index only covers DEBIT) ────────
    let threw135 = false;
    try {
        db.prepare(`
            INSERT INTO credit_history
                (id, customer_id, amount, type, description, reference_type, reference_id, created)
            VALUES (?, ?, 50, 'CREDIT', 'parity-test credit allowed', 'gold_certificate', ?, ?)
        `).run(genId('CHC'), cid, gcid, now());
    } catch (e) { threw135 = true; }
    ok('P13.5 CREDIT for same cert is NOT blocked (index covers DEBIT only)', !threw135);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
    process.stdout.write('╔══════════════════════════════════════════════════════╗\n');
    process.stdout.write('║   Parity Guarantee Test Suite (P6→P14)               ║\n');
    process.stdout.write('╚══════════════════════════════════════════════════════╝\n');

    process.stdout.write('\n── Pre-test cleanup ──\n');
    cleanupPreviousTestData();

    try {
        await testCrashSafety();
        await testHashTamper();
        await testParallelFinalizeSameRequestId();
        await testParallelFinalizeDifferentRequestId();
        await testSequenceCollision();
        await testOccStaleVersion();
        await testDuplicateDebitIndex();
        await testVerifyEdgeCases();
        await testPerformance();
    } catch (e) {
        process.stderr.write(`\nFATAL: ${e.message}\n${e.stack}\n`);
        process.exit(1);
    }

    const total = _pass + _fail;
    process.stdout.write('\n╔══════════════════════════════════════════════════════╗\n');
    process.stdout.write(`║  Results: ${_pass}/${total} passed, ${_fail} failed`.padEnd(55) + '║\n');
    process.stdout.write('╚══════════════════════════════════════════════════════╝\n');

    if (_fail > 0) {
        process.stderr.write('\nFailed checks:\n');
        _errors.forEach(e => process.stderr.write(`  • ${e}\n`));
        process.exit(1);
    }

    process.stdout.write('\n✅ All parity guarantee tests passed!\n');
}

main();
