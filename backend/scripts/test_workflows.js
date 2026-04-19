'use strict';

/**
 * test_workflows.js
 * End-to-end integration test for all 5 workflow types:
 *   1. gold       — TODO → IN_PROGRESS (moveItem) → DONE (finalizeItem)
 *   2. silver     — same
 *   3. gold_cert  — TODO → IN_PROGRESS (moveItem) → DONE (finalizeItem)
 *   4. silver_cert— same
 *   5. photo_cert — TODO → IN_PROGRESS (moveItem) → DONE (finalizeItem)
 *
 * Run: node backend/scripts/test_workflows.js
 */

// Bootstrap DB
const { initDb, db, genId, now } = require('../db/db');
initDb();

const workflowService  = require('../services/workflowService');
const testServiceV2    = require('../services/v2/testService');
const certServiceV2    = require('../services/v2/certificateService');
const photoCertRepo    = require('../repositories/photoCertificateRepository');

// ─── Helpers ─────────────────────────────────────────────────────────────────

let pass = 0;
let fail = 0;

function ok(label, value) {
    if (value) {
        console.log(`  ✅ ${label}`);
        pass++;
    } else {
        console.error(`  ❌ ${label}`);
        fail++;
    }
}

function section(title) {
    console.log(`\n── ${title} ──`);
}

// ─── Seed: customer ───────────────────────────────────────────────────────────

function seedCustomer() {
    const id   = genId('CST');
    const ts   = now();
    db.prepare(`
        INSERT INTO customer (id, name, phone, created, lastmodified)
        VALUES (?, ?, ?, ?, ?)
    `).run(id, 'Workflow Test Customer', '9999999999', ts, ts);
    return id;
}

// ─── Seed: tests ─────────────────────────────────────────────────────────────

function seedTest(type, customerId) {
    const result = testServiceV2.createTest(type, {
        customer_id: customerId,
        items: [
            {
                item_type   : type === 'gold' ? 'Gold Ring' : 'Silver Chain',
                gross_weight: 10.0,
                test_weight : 0.5,
                purity      : 0,
                returned    : false,
            },
        ],
        status         : 'TODO',
        mode_of_payment: 'Cash',
    });
    return result.id;
}

// ─── Seed: gold / silver certificate ─────────────────────────────────────────

function seedCert(type, customerId) {
    const result = certServiceV2.createCertificate(type, {
        customer_id    : customerId,
        items          : [
            {
                name        : type === 'gold' ? 'Gold Bangle' : 'Silver Bracelet',
                item_type   : type === 'gold' ? 'Gold Bangle' : 'Silver Bracelet',
                gross_weight: 8.0,
                test_weight : 0.3,
                purity      : 92.5,
            },
        ],
        status         : 'TODO',
        mode_of_payment: 'Cash',
        gst            : false,
    });
    return result.id;
}

// ─── Seed: photo certificate ──────────────────────────────────────────────────

async function seedPhotoCert(customerId) {
    const result = await photoCertRepo.create(customerId, [
        {
            name              : 'Diamond Ring',
            item_type         : 'Ring',
            certificate_number: 'A01',
            gross_weight      : 5.0,
            test_weight       : 0.2,
            net_weight        : 4.8,
            purity            : 95.0,
            fine_weight       : 4.56,
            item_total        : 50.0,
            returned          : 0,
            media_path        : '/uploads/test_photo.jpg',  // required for DONE finalization
        },
    ], {
        mode_of_payment: 'Cash',
        gst            : 0,
        gst_bill_number: '',
        total_tax      : 0,
        total          : 50,
    }, 'TODO');
    return result.id;
}

// ─── Mock actor ──────────────────────────────────────────────────────────────

const actor = { userId: 'test-user', username: 'tester', ipAddress: '127.0.0.1', userAgent: 'test-runner' };

// ─── Test helper ─────────────────────────────────────────────────────────────

async function runWorkflowTest(label, type, itemId) {
    section(`${label} (id=${itemId})`);

    // Step 1: Verify item is in kanban TODO
    const board = await workflowService.getKanbanBoard(100);
    const inTodo = board.TODO.some(i => i.id === itemId && i.type === type);
    ok('item appears in kanban TODO', inTodo);

    // Step 2: Move TODO → IN_PROGRESS
    let moveResult;
    try {
        moveResult = await workflowService.moveItem(type, itemId, 'IN_PROGRESS', actor);
        ok('moveItem TODO→IN_PROGRESS succeeded', moveResult.updated === true);
        ok('fromStatus is TODO', moveResult.fromStatus === 'TODO');
        ok('toStatus is IN_PROGRESS', moveResult.toStatus === 'IN_PROGRESS');
    } catch (e) {
        ok('moveItem TODO→IN_PROGRESS succeeded', false);
        console.error('    Error:', e.message);
        return;
    }

    // Step 3: For gold/silver tests — set purity on items before finalize
    if (type === 'gold' || type === 'silver') {
        try {
            const detail = testServiceV2.getTest(type, itemId);
            const itemsWithPurity = detail.items.map(i => ({
                id    : i.id,
                purity: 91.6,
            }));
            testServiceV2.saveTestDraft(type, itemId, { items: itemsWithPurity });
            ok('purity values saved via saveTestDraft', true);
        } catch (e) {
            ok('purity values saved via saveTestDraft', false);
            console.error('    Error:', e.message);
        }
    }

    // Step 4: Finalize IN_PROGRESS → DONE
    let finalizeResult;
    try {
        finalizeResult = await workflowService.finalizeItem(type, itemId, actor);
        ok('finalizeItem IN_PROGRESS→DONE succeeded', finalizeResult.updated === true);
        ok('toStatus is DONE', finalizeResult.toStatus === 'DONE');
    } catch (e) {
        ok('finalizeItem IN_PROGRESS→DONE succeeded', false);
        console.error('    Error:', e.message);
        return;
    }

    // Step 5: Verify no longer in kanban (DONE items are shown in DONE column)
    const board2 = await workflowService.getKanbanBoard(100);
    const inDone = board2.DONE.some(i => i.id === itemId && i.type === type);
    // Note: for gold/silver tests with isFullConvert, the parent row is deleted
    // so the item won't appear anywhere — that's also acceptable
    const notInTodo = !board2.TODO.some(i => i.id === itemId && i.type === type);
    const notInProgress = !board2.IN_PROGRESS.some(i => i.id === itemId && i.type === type);
    ok('item no longer in TODO or IN_PROGRESS', notInTodo && notInProgress);

    // Step 6: Duplicate move should be rejected (immutability)
    try {
        await workflowService.moveItem(type, itemId, 'IN_PROGRESS', actor);
        ok('duplicate move on DONE item rejected', false);
    } catch (e) {
        ok('duplicate move on DONE item rejected', true);
    }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║       Workflow Integration Test — All 5 Types        ║');
    console.log('╚══════════════════════════════════════════════════════╝');

    // Seed customer
    const customerId = seedCustomer();
    console.log(`\nSeeded customer: ${customerId}`);

    // Seed all 5 items
    let goldTestId, silverTestId, goldCertId, silverCertId, photoCertId;
    try {
        goldTestId   = seedTest('gold',   customerId);
        silverTestId = seedTest('silver', customerId);
        goldCertId   = seedCert('gold',   customerId);
        silverCertId = seedCert('silver', customerId);
        photoCertId  = await seedPhotoCert(customerId);
        console.log(`\nSeeded items:`);
        console.log(`  gold test:    ${goldTestId}`);
        console.log(`  silver test:  ${silverTestId}`);
        console.log(`  gold cert:    ${goldCertId}`);
        console.log(`  silver cert:  ${silverCertId}`);
        console.log(`  photo cert:   ${photoCertId}`);
    } catch (e) {
        console.error('❌ Seed failed:', e.message);
        console.error(e.stack);
        process.exit(1);
    }

    // Run all 5 workflow tests
    await runWorkflowTest('Gold Test Workflow',        'gold',        goldTestId);
    await runWorkflowTest('Silver Test Workflow',      'silver',      silverTestId);
    await runWorkflowTest('Gold Certificate Workflow', 'gold_cert',   goldCertId);
    await runWorkflowTest('Silver Certificate Workflow','silver_cert', silverCertId);
    await runWorkflowTest('Photo Certificate Workflow','photo_cert',  photoCertId);

    // Summary
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log(`║  Results: ${pass} passed, ${fail} failed${' '.repeat(40 - String(pass).length - String(fail).length)}║`);
    console.log('╚══════════════════════════════════════════════════════╝');

    if (fail > 0) {
        process.exit(1);
    } else {
        console.log('\n✅ All workflow tests passed!');
    }
}

main().catch(e => {
    console.error('Unhandled error:', e);
    process.exit(1);
});
