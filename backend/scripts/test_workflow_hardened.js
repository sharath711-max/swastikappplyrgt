'use strict';

/**
 * test_workflow_hardened.js
 * ────────────────────────────────────────────────────────────────────────────��
 * Priority-ordered hardening tests:
 *   P1 – Idempotency   (completion_request_id, idempotency_keys, duplicate calls)
 *   P2 – Concurrency   (optimistic locking, version conflicts)
 *   P3 – Transaction   (status + audit + hash in one BEGIN/COMMIT)
 *   P4 – Retry         (runWithRetry isolation tests)
 *   P5 – Failure cases (invalid types, backward moves, missing items, etc.)
 *
 * Run: NODE_ENV=production node backend/scripts/test_workflow_hardened.js
 */

const { initDb, db, genId, now, getIdempotencyKey, runWithRetry } = require('../db/db');
initDb();

const workflowService  = require('../services/workflowService');
const testServiceV2    = require('../services/v2/testService');
const certServiceV2    = require('../services/v2/certificateService');
const photoCertRepo    = require('../repositories/photoCertificateRepository');
const { _store }       = require('../utils/audit');

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

/** Run fn inside an AsyncLocalStorage context carrying the given requestId. */
function withRequestId(requestId, fn) {
    return new Promise((resolve, reject) => {
        _store.run({ requestId }, async () => {
            try { resolve(await fn()); }
            catch (e) { reject(e); }
        });
    });
}

/** Run fn and expect it to throw with the given error code (or substring in message). */
async function expectThrows(fn, codeOrMsg) {
    try {
        await fn();
        return false;   // did NOT throw
    } catch (e) {
        if (codeOrMsg) {
            return e.code === codeOrMsg ||
                   e.message?.includes(codeOrMsg) ||
                   String(e).includes(codeOrMsg);
        }
        return true;    // threw anything
    }
}

// ─── Seed helpers ─────────────────────────────────────────────────────────────

function seedCustomer() {
    const id = genId('CST');
    const ts = now();
    db.prepare('INSERT INTO customer (id, name, phone, created, lastmodified) VALUES (?, ?, ?, ?, ?)')
      .run(id, 'Hardened Test Customer', '8888888888', ts, ts);
    return id;
}

function seedTest(type, customerId) {
    const r = testServiceV2.createTest(type, {
        customer_id: customerId,
        items: [{
            item_type   : type === 'gold' ? 'Gold Ring' : 'Silver Ring',
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
    // Set purity so finalization succeeds
    const detail = testServiceV2.getTest(type, id);
    testServiceV2.saveTestDraft(type, id, {
        items: detail.items.map(i => ({ id: i.id, purity: 91.6 })),
    });
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

async function seedPhotoCert(customerId) {
    const r = await photoCertRepo.create(customerId, [{
        name: 'Photo Item', item_type: 'Ring', certificate_number: 'A01',
        gross_weight: 5, test_weight: 0.2, net_weight: 4.8,
        purity: 95, fine_weight: 4.56, item_total: 50,
        returned: 0, media_path: '/uploads/test.jpg',
    }], { mode_of_payment: 'Cash', gst: 0, gst_bill_number: '', total_tax: 0, total: 50 }, 'TODO');
    return r.id;
}

const actor = { userId: 'test-user', username: 'tester', ipAddress: '127.0.0.1', userAgent: 'hardened-test' };

// ─── Cleanup: remove all data from previous test runs ─────────────────────────

function cleanupPreviousTestData() {
    db.pragma('foreign_keys = OFF');
    try {
        // Find all test customer IDs
        const testCids = db.prepare("SELECT id FROM customer WHERE name = 'Hardened Test Customer'")
            .all().map(r => r.id);

        if (testCids.length > 0) {
            const placeholders = testCids.map(() => '?').join(',');

            // Gold tests + items
            const gtIds = db.prepare(`SELECT id FROM gold_test WHERE customer_id IN (${placeholders})`)
                .all(...testCids).map(r => r.id);
            if (gtIds.length) {
                const gtp = gtIds.map(() => '?').join(',');
                db.prepare(`DELETE FROM gold_test_item WHERE gold_test_id IN (${gtp})`).run(...gtIds);
            }
            db.prepare(`DELETE FROM gold_test WHERE customer_id IN (${placeholders})`).run(...testCids);

            // Silver tests + items
            const stIds = db.prepare(`SELECT id FROM silver_test WHERE customer_id IN (${placeholders})`)
                .all(...testCids).map(r => r.id);
            if (stIds.length) {
                const stp = stIds.map(() => '?').join(',');
                db.prepare(`DELETE FROM silver_test_item WHERE silver_test_id IN (${stp})`).run(...stIds);
            }
            db.prepare(`DELETE FROM silver_test WHERE customer_id IN (${placeholders})`).run(...testCids);

            // Gold certs + items
            const gcIds = db.prepare(`SELECT id FROM gold_certificate WHERE customer_id IN (${placeholders})`)
                .all(...testCids).map(r => r.id);
            if (gcIds.length) {
                const gcp = gcIds.map(() => '?').join(',');
                db.prepare(`DELETE FROM gold_certificate_item WHERE gold_certificate_id IN (${gcp})`).run(...gcIds);
            }
            db.prepare(`DELETE FROM gold_certificate WHERE customer_id IN (${placeholders})`).run(...testCids);

            // Silver certs + items
            const scIds = db.prepare(`SELECT id FROM silver_certificate WHERE customer_id IN (${placeholders})`)
                .all(...testCids).map(r => r.id);
            if (scIds.length) {
                const scp = scIds.map(() => '?').join(',');
                db.prepare(`DELETE FROM silver_certificate_item WHERE silver_certificate_id IN (${scp})`).run(...scIds);
            }
            db.prepare(`DELETE FROM silver_certificate WHERE customer_id IN (${placeholders})`).run(...testCids);

            // Photo certs + items
            const pcIds = db.prepare(`SELECT id FROM photo_certificate WHERE customer_id IN (${placeholders})`)
                .all(...testCids).map(r => r.id);
            if (pcIds.length) {
                const pcp = pcIds.map(() => '?').join(',');
                db.prepare(`DELETE FROM photo_certificate_item WHERE photo_certificate_id IN (${pcp})`).run(...pcIds);
            }
            db.prepare(`DELETE FROM photo_certificate WHERE customer_id IN (${placeholders})`).run(...testCids);

            // Customers
            db.prepare(`DELETE FROM customer WHERE id IN (${placeholders})`).run(...testCids);

            process.stdout.write(`  [cleanup] removed ${testCids.length} test customer(s) and all related records\n`);
        }

        // Set sequences to current DB max so next auto_number won't collide.
        // Use YYYYMMDD format to match sequenceService._todayStr().
        const d  = new Date();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const todayYMD = `${d.getFullYear()}${mm}${dd}`;

        function maxSeqFrom(table, prefix) {
            const r = db.prepare(
                `SELECT MAX(CAST(SUBSTR(auto_number, ${prefix.length + 1}) AS INTEGER)) AS m
                 FROM ${table} WHERE auto_number LIKE ?`
            ).get(`${prefix}%`);
            return r?.m ?? 0;
        }
        const yy = String(d.getFullYear()).slice(-2);
        const goldMax  = maxSeqFrom('gold_test',         `GT${yy}-`);
        const silvMax  = maxSeqFrom('silver_test',        `ST${yy}-`);
        const gcMax    = Math.max(
            maxSeqFrom('gold_certificate',   `G${yy}-`),
            maxSeqFrom('silver_certificate', `N${yy}-`),
            maxSeqFrom('photo_certificate',  `N${yy}-`)
        );
        const ngcMax   = Math.max(
            maxSeqFrom('gold_certificate',   `N${yy}-`),
            maxSeqFrom('silver_certificate', `N${yy}-`),
            maxSeqFrom('photo_certificate',  `N${yy}-`)
        );

        db.prepare("UPDATE globals SET value = ? WHERE key = 'GOLD_TEST_SEQ'").run(String(goldMax));
        db.prepare("UPDATE globals SET value = ? WHERE key = 'SILVER_TEST_SEQ'").run(String(silvMax));
        db.prepare("UPDATE globals SET value = ? WHERE key = 'GST_CERT_SEQ'").run(String(gcMax));
        db.prepare("UPDATE globals SET value = ? WHERE key = 'NON_GST_CERT_SEQ'").run(String(ngcMax));
        db.prepare("UPDATE globals SET value = ? WHERE key = 'daily_last_date'").run(todayYMD);
        process.stdout.write(`  [cleanup] sequences set to gold=${goldMax}, silver=${silvMax}, gst_cert=${gcMax}, non_gst_cert=${ngcMax}, date=${todayYMD}\n`);

    } finally {
        db.pragma('foreign_keys = ON');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// P1 — IDEMPOTENCY
// ─────────────────────────────────────────────────────────────────────────────

async function testIdempotency() {
    section('P1 — Idempotency');
    const cid = seedCustomer();

    // ── 1.1 Duplicate moveItem with same X-Request-Id ────────────���────────────
    const gid = seedTest('gold', cid);
    const reqMoveId = 'req-idem-move-' + genId('REQ');

    const r1 = await withRequestId(reqMoveId, () =>
        workflowService.moveItem('gold', gid, 'IN_PROGRESS', actor));
    const r2 = await withRequestId(reqMoveId, () =>
        workflowService.moveItem('gold', gid, 'IN_PROGRESS', actor));

    ok('P1.1 moveItem: both calls succeed', r1.updated && r2.updated);
    ok('P1.1 moveItem: second call is idempotent', r2._idempotent === true);
    ok('P1.1 moveItem: idempotency_keys stored', !!getIdempotencyKey(
        `workflow:move:gold:${gid}:IN_PROGRESS:${reqMoveId}`
    ));

    // ── 1.2 Duplicate finalizeItem with same X-Request-Id ─────────────────────
    const gid2 = seedTestInProgress('gold', cid);
    const reqFinalId = 'req-idem-final-' + genId('REQ');

    const f1 = await withRequestId(reqFinalId, () =>
        workflowService.finalizeItem('gold', gid2, actor));
    const f2 = await withRequestId(reqFinalId, () =>
        workflowService.finalizeItem('gold', gid2, actor));

    ok('P1.2 finalizeItem: first call succeeds', f1.updated && f1.toStatus === 'DONE');
    ok('P1.2 finalizeItem: second call is idempotent', f2._idempotent === true);
    ok('P1.2 finalizeItem: idempotency_keys stored', !!getIdempotencyKey(
        `workflow:finalize:gold:${gid2}:${reqFinalId}`
    ));

    // ── 1.3 completion_request_id stamped on cert row ─────────────────────────
    const gcid = seedCert('gold', cid);
    await workflowService.moveItem('gold_cert', gcid, 'IN_PROGRESS', actor);
    const reqCertFinalId = 'req-idem-cert-' + genId('REQ');

    await withRequestId(reqCertFinalId, () =>
        workflowService.finalizeItem('gold_cert', gcid, actor));

    const certRow = db.prepare('SELECT completion_request_id, status FROM gold_certificate WHERE id = ?').get(gcid);
    ok('P1.3 completion_request_id stamped on cert row', certRow.completion_request_id === reqCertFinalId);
    ok('P1.3 cert status is DONE', certRow.status === 'DONE');

    // ── 1.4 Different requestId after cert is DONE → STATUS_INVALID (already done)
    // Note: status='DONE' check fires before the completion_request_id IMMUTABLE
    // check, so the error code is STATUS_INVALID.
    const threw = await expectThrows(
        () => withRequestId('req-different-' + genId('REQ'), () =>
            workflowService.finalizeItem('gold_cert', gcid, actor)),
        'STATUS_INVALID'
    );
    ok('P1.4 different requestId on DONE cert → STATUS_INVALID (already done)', threw);

    // ── 1.5 No requestId in context — no idempotency key saved, still works ───
    const gid3 = seedTestInProgress('gold', cid);
    const f3 = await workflowService.finalizeItem('gold', gid3, actor);
    ok('P1.5 finalize without requestId succeeds', f3.updated === true);
}

// ─────────────────────────────────────────────────────────────────────────────
// P2 — CONCURRENCY (Optimistic Locking)
// ─────────────────────────────────────────────────────────────────────────────

async function testConcurrency() {
    section('P2 — Concurrency (Optimistic Locking)');
    const cid = seedCustomer();

    // ── 2.1 moveItem with correct version → succeeds ─────────────────────────
    const gid = seedTest('gold', cid);
    const row = db.prepare('SELECT version FROM gold_test WHERE id = ?').get(gid);
    const moved = await workflowService.moveItem('gold', gid, 'IN_PROGRESS', actor, row.version);
    ok('P2.1 moveItem with correct version succeeds', moved.updated === true);

    // ── 2.2 moveItem with stale version → 409 ────────────────────────────────
    // Create a fresh TODO item, bump its version without changing status,
    // then try to move with the pre-bump version number.
    const gid22 = seedTest('gold', cid);
    const snap22 = db.prepare('SELECT version FROM gold_test WHERE id = ?').get(gid22);
    db.prepare('UPDATE gold_test SET version = version + 1, lastmodified = ? WHERE id = ?')
      .run(now(), gid22);

    const threw22 = await expectThrows(
        () => workflowService.moveItem('gold', gid22, 'IN_PROGRESS', actor, snap22.version),
        'OPTIMISTIC_LOCK_CONFLICT'
    );
    ok('P2.2 moveItem with stale version → OPTIMISTIC_LOCK_CONFLICT', threw22);

    // ── 2.3 finalizeItem with correct version → succeeds ─────────────────────
    const gid2 = seedTestInProgress('gold', cid);
    const snap2 = db.prepare('SELECT version FROM gold_test WHERE id = ?').get(gid2);
    const finalized = await workflowService.finalizeItem('gold', gid2, actor, snap2.version);
    ok('P2.3 finalizeItem with correct version succeeds', finalized.updated === true);

    // ── 2.4 finalizeItem with stale version → 409 ────────────────────────────
    const gid3 = seedTestInProgress('gold', cid);
    const snap3 = db.prepare('SELECT version FROM gold_test WHERE id = ?').get(gid3);
    // Manually bump version to simulate concurrent modification
    db.prepare('UPDATE gold_test SET version = version + 1, lastmodified = ? WHERE id = ?')
      .run(now(), gid3);

    const threw24 = await expectThrows(
        () => workflowService.finalizeItem('gold', gid3, actor, snap3.version),
        'OPTIMISTIC_LOCK_CONFLICT'
    );
    ok('P2.4 finalizeItem with stale version → OPTIMISTIC_LOCK_CONFLICT', threw24);

    // ── 2.5 cert finalizeItem with stale version → 409 ───────────────────────
    const gcid = seedCert('gold', cid);
    await workflowService.moveItem('gold_cert', gcid, 'IN_PROGRESS', actor);
    const snapC = db.prepare('SELECT version FROM gold_certificate WHERE id = ?').get(gcid);
    db.prepare('UPDATE gold_certificate SET version = version + 1, lastmodified = ? WHERE id = ?')
      .run(now(), gcid);

    const threw25 = await expectThrows(
        () => workflowService.finalizeItem('gold_cert', gcid, actor, snapC.version),
        'OPTIMISTIC_LOCK_CONFLICT'
    );
    ok('P2.5 cert finalizeItem with stale version → OPTIMISTIC_LOCK_CONFLICT', threw25);

    // ── 2.6 null version → OCC skipped, always succeeds ─────────────────────
    const gid4 = seedTestInProgress('gold', cid);
    const f4 = await workflowService.finalizeItem('gold', gid4, actor, null);
    ok('P2.6 null version (OCC skip) → succeeds', f4.updated === true);
}

// ─────────────────────────────────────────────────────────────────────────────
// P3 — TRANSACTION ATOMICITY
// ─────────────────────────────────────────────────────────────────────────────

async function testTransactionAtomicity() {
    section('P3 — Transaction Atomicity (status + completion_request_id + audit)');
    const cid = seedCustomer();

    // ── 3.1 After finalizeItem, cert row has status=DONE AND completion_request_id ─
    const gcid = seedCert('silver', cid);
    await workflowService.moveItem('silver_cert', gcid, 'IN_PROGRESS', actor);

    const reqId31 = 'req-atomic-' + genId('REQ');
    await withRequestId(reqId31, () =>
        workflowService.finalizeItem('silver_cert', gcid, actor));

    const certRow31 = db.prepare('SELECT status, completion_request_id FROM silver_certificate WHERE id = ?').get(gcid);
    ok('P3.1 status = DONE and completion_request_id set atomically',
        certRow31.status === 'DONE' && certRow31.completion_request_id === reqId31);

    // ── 3.2 Audit log entry exists for WORKFLOW_FINALIZE ─────────────────────
    const auditRow = db.prepare(
        `SELECT id FROM audit_logs
         WHERE action = 'WORKFLOW_FINALIZE' AND entity_id = ?
         ORDER BY rowid DESC LIMIT 1`
    ).get(gcid);
    ok('P3.2 audit_log WORKFLOW_FINALIZE row written', !!auditRow);

    // ── 3.3 photo_cert: status + completion_request_id + audit in one txn ────
    const pcid = await seedPhotoCert(cid);
    await workflowService.moveItem('photo_cert', pcid, 'IN_PROGRESS', actor);

    const reqId33 = 'req-photo-atomic-' + genId('REQ');
    await withRequestId(reqId33, () =>
        workflowService.finalizeItem('photo_cert', pcid, actor));

    const pcRow = db.prepare('SELECT status, completion_request_id FROM photo_certificate WHERE id = ?').get(pcid);
    ok('P3.3 photo_cert status = DONE and completion_request_id set atomically',
        pcRow.status === 'DONE' && pcRow.completion_request_id === reqId33);

    // ── 3.4 After gold test finalize, print_snapshot is written ──────────────
    const gid = seedTestInProgress('gold', cid);
    const reqId34 = 'req-snap-' + genId('REQ');
    const fr34 = await withRequestId(reqId34, () =>
        workflowService.finalizeItem('gold', gid, actor));

    // The test might be deleted (isFullConvert), or snapshot is on the cert
    const certId34 = fr34.immutableIds?.certificateId;
    if (certId34) {
        const certSnap = db.prepare('SELECT snapshot_hash FROM gold_certificate WHERE id = ?').get(certId34);
        ok('P3.4 print snapshot_hash written on cert after gold test finalize', !!certSnap?.snapshot_hash);
    } else {
        // non-full-convert path: snapshot is on the test row (which may survive)
        const testRow34 = db.prepare('SELECT snapshot_hash FROM gold_test WHERE id = ?').get(gid);
        ok('P3.4 print snapshot_hash written on test after finalize',
            testRow34 ? !!testRow34.snapshot_hash : true /* deleted row is fine */);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// P4 — RETRY LOGIC (runWithRetry isolation)
// ─────────────────────────────────────────────────────────────────────────────

async function testRetry() {
    section('P4 — Retry Logic (runWithRetry)');

    // ── 4.1 Succeeds on first attempt ────────────────────────────────────────
    let calls4_1 = 0;
    const val41 = runWithRetry(() => { calls4_1++; return 'ok'; });
    ok('P4.1 success on first attempt, no retry', calls4_1 === 1 && val41 === 'ok');

    // ── 4.2 Non-SQLITE_BUSY error is NOT retried ──────────────────────────────
    let calls4_2 = 0;
    const threw42 = await expectThrows(() =>
        runWithRetry(() => {
            calls4_2++;
            const e = new Error('boom'); e.code = 'CONSTRAINT_FAILED';
            throw e;
        }, { maxRetries: 3 }),
        'boom'
    );
    ok('P4.2 non-SQLITE_BUSY error not retried (1 attempt)', calls4_2 === 1 && threw42);

    // ── 4.3 SQLITE_BUSY retried up to maxRetries then re-thrown ──────────────
    let calls4_3 = 0;
    const threw43 = await expectThrows(() =>
        runWithRetry(() => {
            calls4_3++;
            const e = new Error('database is locked');
            e.code = 'SQLITE_BUSY';
            throw e;
        }, { maxRetries: 2, baseDelayMs: 1 }),
        'SQLITE_BUSY'
    );
    ok('P4.3 SQLITE_BUSY retried 3× total (2 retries) then thrown', calls4_3 === 3 && threw43);

    // ── 4.4 Succeeds on second attempt after transient SQLITE_BUSY ───────────
    let calls4_4 = 0;
    const val44 = runWithRetry(() => {
        calls4_4++;
        if (calls4_4 < 2) {
            const e = new Error('busy'); e.code = 'SQLITE_BUSY'; throw e;
        }
        return 'recovered';
    }, { maxRetries: 3, baseDelayMs: 1 });
    ok('P4.4 recovers on second attempt after transient SQLITE_BUSY', val44 === 'recovered' && calls4_4 === 2);

    // ── 4.5 SQLITE_LOCKED also retried ───────────────────────────────────────
    let calls4_5 = 0;
    const threw45 = await expectThrows(() =>
        runWithRetry(() => {
            calls4_5++;
            const e = new Error('locked'); e.code = 'SQLITE_LOCKED'; throw e;
        }, { maxRetries: 1, baseDelayMs: 1 }),
        'SQLITE_LOCKED'
    );
    ok('P4.5 SQLITE_LOCKED also retried (2 total attempts)', calls4_5 === 2 && threw45);
}

// ─────────────────────────────────────────────────────────────────────────────
// P5 — FAILURE CASES
// ─────────────────────────────────────────────────────────────────────────────

async function testFailureCases() {
    section('P5 — Failure Cases');
    const cid = seedCustomer();

    // ── 5.1 Unknown type ─────────────────────────────────────────────────────
    const threw51 = await expectThrows(
        () => workflowService.moveItem('platinum', 'fake-id', 'IN_PROGRESS', actor),
        'INVALID_TYPE'
    );
    ok('P5.1 unknown type → INVALID_TYPE', threw51);

    // ── 5.2 moveItem on non-existent id ──────────────────────────────────────
    const threw52 = await expectThrows(
        () => workflowService.moveItem('gold', 'GTS-NONEXISTENT', 'IN_PROGRESS', actor),
        'NOT_FOUND'
    );
    ok('P5.2 moveItem on non-existent id → NOT_FOUND', threw52);

    // ── 5.3 moveItem to DONE directly (blocked) ───────────────────────────────
    const gid53 = seedTest('gold', cid);
    const threw53 = await expectThrows(
        () => workflowService.moveItem('gold', gid53, 'DONE', actor),
        'STATUS_INVALID'
    );
    ok('P5.3 moveItem to DONE directly → STATUS_INVALID', threw53);

    // ── 5.4 finalizeItem on TODO item (not yet IN_PROGRESS) ──────────────────
    const gid54 = seedTest('gold', cid);
    const threw54 = await expectThrows(
        () => workflowService.finalizeItem('gold', gid54, actor),
        'STATUS_INVALID'
    );
    ok('P5.4 finalizeItem on TODO item → STATUS_INVALID', threw54);

    // ── 5.5 finalizeItem on already-DONE item ─────────────────────────────────
    const gid55 = seedTestInProgress('gold', cid);
    await workflowService.finalizeItem('gold', gid55, actor);
    // Row may be deleted (isFullConvert) or status=DONE
    const row55 = db.prepare('SELECT status FROM gold_test WHERE id = ?').get(gid55);
    if (!row55) {
        // isFullConvert: row deleted → NOT_FOUND
        const threw55b = await expectThrows(
            () => workflowService.finalizeItem('gold', gid55, actor), null
        );
        ok('P5.5 finalizeItem on deleted test (isFullConvert) → error', threw55b);
    } else {
        const threw55a = await expectThrows(
            () => workflowService.finalizeItem('gold', gid55, actor),
            'STATUS_INVALID'
        );
        ok('P5.5 finalizeItem on DONE gold test → STATUS_INVALID', threw55a);
    }

    // ── 5.6 moveItem when already IN_PROGRESS ────────────────────────────────
    const gid56 = seedTest('gold', cid);
    await workflowService.moveItem('gold', gid56, 'IN_PROGRESS', actor);
    const threw56 = await expectThrows(
        () => workflowService.moveItem('gold', gid56, 'IN_PROGRESS', actor),
        'STATUS_INVALID'
    );
    ok('P5.6 moveItem on IN_PROGRESS item → STATUS_INVALID', threw56);

    // ── 5.7 gold test: purity=0 on non-returned item blocks finalize ──────────
    // Re-use gid56: it is IN_PROGRESS and purity was never set (0).
    const threw57 = await expectThrows(
        () => workflowService.finalizeItem('gold', gid56, actor), null
    );
    ok('P5.7 finalize with purity=0 on non-returned item → error', threw57);

    // ── 5.8 silver_cert: finalizeItem on non-existent id ─────────────────────
    const threw58 = await expectThrows(
        () => workflowService.finalizeItem('silver_cert', 'SCR-NONEXISTENT', 'IN_PROGRESS', actor),
        null
    );
    ok('P5.8 finalizeItem on non-existent cert id → error', threw58);

    // ── 5.9 updateStatus with DONE blocked at route level ────────────────────
    const threw59 = await expectThrows(
        () => workflowService.updateStatus('gold', 'anything', 'DONE'),
        'STATUS_INVALID'
    );
    ok('P5.9 updateStatus with DONE → STATUS_INVALID', threw59);

    // ── 5.10 All 5 types: double-finalize by different requests ───────────────
    const types5_10 = [
        { type: 'silver', seed: () => seedTestInProgress('silver', cid) },
        { type: 'gold_cert',   seed: async () => { const id = seedCert('gold',   cid); await workflowService.moveItem('gold_cert',   id, 'IN_PROGRESS', actor); return id; } },
        { type: 'silver_cert', seed: async () => { const id = seedCert('silver', cid); await workflowService.moveItem('silver_cert', id, 'IN_PROGRESS', actor); return id; } },
        { type: 'photo_cert',  seed: async () => { const id = await seedPhotoCert(cid); await workflowService.moveItem('photo_cert', id, 'IN_PROGRESS', actor); return id; } },
    ];

    for (const { type, seed } of types5_10) {
        const itemId = await seed();
        const firstReqId  = 'req-first-'  + genId('REQ');
        const secondReqId = 'req-second-' + genId('REQ');

        await withRequestId(firstReqId, () => workflowService.finalizeItem(type, itemId, actor));

        const threwDouble = await expectThrows(
            () => withRequestId(secondReqId, () =>
                workflowService.finalizeItem(type, itemId, actor)),
            null  // IMMUTABLE or STATUS_INVALID depending on row existence
        );
        ok(`P5.10 double-finalize by different requests (${type}) → rejected`, threwDouble);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
    process.stdout.write('╔══════════════════════════════════════════════════════╗\n');
    process.stdout.write('║   Workflow Hardening Test Suite (P1→P5)              ║\n');
    process.stdout.write('╚══════════════════════════════════════════════════════╝\n');

    process.stdout.write('\n── Pre-test cleanup ──\n');
    cleanupPreviousTestData();

    try {
        await testIdempotency();
        await testConcurrency();
        await testTransactionAtomicity();
        await testRetry();
        await testFailureCases();
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

    process.stdout.write('\n✅ All hardening tests passed!\n');
}

main();
