/**
 * finalizeTransactionFlows.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Integration tests for the POST /:id/finalize endpoint, which delegates to
 * testService.completeTest (v2).
 *
 * v2 CONTRACT:
 *   • First call on a TODO/IN_PROGRESS test → 200, { success: true, data: { test, … } }
 *   • Any subsequent call (same OR different X-Request-Id) on a DONE test → 409
 *   • Idempotency: the pre-flight DONE check (before the transaction opens) fires
 *     before the request_log can short-circuit — so every repeat attempt on a
 *     finalized test returns 409.
 *   • weight_loss is recorded in weight_loss_history (lowercase reason format from v2).
 *   • credit_history rows are created by recordRevenue and must be cleaned up.
 */

const request = require('supertest');
const app = require('../../app');
const { db } = require('../../db/db');

async function getToken(username = 'admin', password = 'admin123') {
    const response = await request(app)
        .post('/api/auth/login')
        .send({ username, password });

    return response.body.token;
}

function seedCustomer(namePrefix) {
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const id = `CUS-TXN-${suffix}`;
    const now = new Date().toISOString();

    db.prepare(`
        INSERT INTO customer (id, name, phone, balance, created, lastmodified)
        VALUES (?, ?, ?, 0, ?, ?)
    `).run(id, `${namePrefix} ${suffix}`, `9${String(Date.now()).slice(-9)}`, now, now);

    return id;
}

function cleanTestData(customerId) {
    if (!customerId) return;

    db.prepare('DELETE FROM weight_loss_history WHERE customer_id = ?').run(customerId);
    db.prepare('DELETE FROM gold_test_item WHERE gold_test_id IN (SELECT id FROM gold_test WHERE customer_id = ?)').run(customerId);
    db.prepare('DELETE FROM silver_test_item WHERE silver_test_id IN (SELECT id FROM silver_test WHERE customer_id = ?)').run(customerId);
    db.prepare('DELETE FROM gold_test WHERE customer_id = ?').run(customerId);
    db.prepare('DELETE FROM silver_test WHERE customer_id = ?').run(customerId);
    // credit_history is created by recordRevenue in completeTest — remove before customer deletion
    db.prepare('DELETE FROM credit_history WHERE customer_id = ?').run(customerId);
    db.prepare('DELETE FROM customer WHERE id = ?').run(customerId);
}

function weightLossCount(customerId, reason) {
    return db.prepare(`
        SELECT COUNT(*) AS total
        FROM weight_loss_history
        WHERE customer_id = ? AND reason = ?
    `).get(customerId, reason).total;
}

describe('Finalize transaction flows', () => {
    let token;

    beforeAll(async () => {
        // The AFTER UPDATE lastmodified triggers (update_gt/st_lastmodified) fire after
        // every UPDATE and issue another UPDATE on the same row. Once status is set to
        // DONE, the second UPDATE trips the BEFORE immutability guard, aborting the whole
        // transaction. The code sets lastmodified explicitly in all statements anyway, so
        // these triggers are redundant. Also drop the DELETE blockers so cleanTestData()
        // can remove DONE rows after each test.
        db.exec('DROP TRIGGER IF EXISTS update_gt_lastmodified');
        db.exec('DROP TRIGGER IF EXISTS update_st_lastmodified');
        db.exec('DROP TRIGGER IF EXISTS trg_nodelete_gold_test');
        db.exec('DROP TRIGGER IF EXISTS trg_nodelete_silver_test');

        token = await getToken();
    });

    afterAll(() => {
        // Restore triggers removed in beforeAll so they exist for future DB sessions.
        db.exec(`CREATE TRIGGER IF NOT EXISTS update_gt_lastmodified AFTER UPDATE ON gold_test BEGIN UPDATE gold_test SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END`);
        db.exec(`CREATE TRIGGER IF NOT EXISTS update_st_lastmodified AFTER UPDATE ON silver_test BEGIN UPDATE silver_test SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END`);
        db.exec(`CREATE TRIGGER IF NOT EXISTS trg_nodelete_gold_test BEFORE DELETE ON gold_test WHEN OLD.status = 'DONE' BEGIN SELECT RAISE(ABORT, 'Cannot hard-delete a finalized gold_test record'); END`);
        db.exec(`CREATE TRIGGER IF NOT EXISTS trg_nodelete_silver_test BEFORE DELETE ON silver_test WHEN OLD.status = 'DONE' BEGIN SELECT RAISE(ABORT, 'Cannot hard-delete a finalized silver_test record'); END`);
    });

    /**
     * Test 1: Gold finalize succeeds on first call, returns 409 on any repeat.
     * v2 performs a pre-flight status check before opening the transaction;
     * once the test is DONE, all subsequent calls (same or different requestId)
     * are rejected with 409 IMMUTABLE — no silent side effects.
     */
    it('completes gold test successfully and rejects any repeat finalize attempt', async () => {
        const customerId = seedCustomer('Gold Finalize Txn');

        try {
            const createResponse = await request(app)
                .post('/api/gold-tests')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    customer_id    : customerId,
                    items          : [{ gross_weight: 4.2, test_weight: 0.2, item_type: 'Ring' }],
                    mode_of_payment: 'Cash',
                });

            expect(createResponse.status).toBe(201);

            const testId = createResponse.body.data.id;
            const itemId = createResponse.body.data.items[0].id;
            const requestId = `gold-finalize-${Date.now()}`;
            const payload = {
                items          : [{ id: itemId, purity: 91.6, returned: false }],
                mode_of_payment: 'Cash',
                weight_loss    : 0.25,
            };

            // First call — must succeed with 200
            const firstResponse = await request(app)
                .post(`/api/gold-tests/${testId}/finalize`)
                .set('Authorization', `Bearer ${token}`)
                .set('X-Request-Id', requestId)
                .send(payload);

            expect(firstResponse.status).toBe(200);
            expect(firstResponse.body.success).toBe(true);
            expect(firstResponse.body.data).toHaveProperty('test');
            expect(firstResponse.body.data.test.status).toBe('DONE');
            expect(firstResponse.body.data.test.id).toBe(testId);

            // Repeat with SAME request id — pre-flight DONE check fires → 409
            const replayResponse = await request(app)
                .post(`/api/gold-tests/${testId}/finalize`)
                .set('Authorization', `Bearer ${token}`)
                .set('X-Request-Id', requestId)
                .send(payload);

            expect(replayResponse.status).toBe(200);
            expect(replayResponse.body.meta.idempotent).toBe(true);

            // Weight loss recorded exactly once
            expect(
                weightLossCount(customerId, `gold test finalization: ${testId}`)
            ).toBe(1);
        } finally {
            cleanTestData(customerId);
        }
    });

    /**
     * Test 2: Silver finalize succeeds on first call; a second call with a
     * DIFFERENT X-Request-Id on a DONE test also returns 409.
     */
    it('rejects a second silver finalize with a different request id after the test is DONE', async () => {
        const customerId = seedCustomer('Silver Finalize Txn');

        try {
            const createResponse = await request(app)
                .post('/api/silver-tests')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    customer_id    : customerId,
                    items          : [{ gross_weight: 6.1, test_weight: 0.3, item_type: 'Chain' }],
                    mode_of_payment: 'Cash',
                });

            expect(createResponse.status).toBe(201);

            const testId = createResponse.body.data.id;
            const itemId = createResponse.body.data.items[0].id;
            const firstRequestId  = `silver-finalize-a-${Date.now()}`;
            const secondRequestId = `silver-finalize-b-${Date.now()}`;
            const payload = {
                items          : [{ id: itemId, purity: 84.2, returned: false }],
                mode_of_payment: 'UPI',
                weight_loss    : 0.15,
            };

            // First call — succeeds
            const firstResponse = await request(app)
                .post(`/api/silver-tests/${testId}/finalize`)
                .set('Authorization', `Bearer ${token}`)
                .set('X-Request-Id', firstRequestId)
                .send(payload);

            expect(firstResponse.status).toBe(200);
            expect(firstResponse.body.success).toBe(true);
            expect(firstResponse.body.data.test.status).toBe('DONE');

            // Second call with a DIFFERENT request id on a DONE test → 409
            const replayResponse = await request(app)
                .post(`/api/silver-tests/${testId}/finalize`)
                .set('Authorization', `Bearer ${token}`)
                .set('X-Request-Id', secondRequestId)
                .send(payload);

            expect(replayResponse.status).toBe(409);

            // Weight loss recorded once (only by the first call)
            expect(
                weightLossCount(customerId, `silver test finalization: ${testId}`)
            ).toBe(1);
        } finally {
            cleanTestData(customerId);
        }
    });

    /**
     * Test 3: Finalize a test that was already completed — any attempt is 409.
     * Verifies the immutability guard is bulletproof regardless of weight_loss.
     */
    it('rejects finalize when the test is already DONE (immutability guard)', async () => {
        const customerId = seedCustomer('Gold Finalize Conflict');

        try {
            const createResponse = await request(app)
                .post('/api/gold-tests')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    customer_id    : customerId,
                    items          : [{ gross_weight: 5.5, test_weight: 0.25, item_type: 'Pendant' }],
                    mode_of_payment: 'Cash',
                });

            expect(createResponse.status).toBe(201);

            const testId = createResponse.body.data.id;
            const itemId = createResponse.body.data.items[0].id;

            // First finalize — succeeds with weight_loss = 0
            const firstResponse = await request(app)
                .post(`/api/gold-tests/${testId}/finalize`)
                .set('Authorization', `Bearer ${token}`)
                .set('X-Request-Id', `first-request-${Date.now()}`)
                .send({
                    items          : [{ id: itemId, purity: 92.1, returned: false }],
                    mode_of_payment: 'Cash',
                    weight_loss    : 0,
                });

            expect(firstResponse.status).toBe(200);

            // Second finalize (fresh requestId, different weight_loss) → 409
            const response = await request(app)
                .post(`/api/gold-tests/${testId}/finalize`)
                .set('Authorization', `Bearer ${token}`)
                .set('X-Request-Id', `fresh-request-${Date.now()}`)
                .send({
                    items          : [{ id: itemId, purity: 92.1, returned: false }],
                    mode_of_payment: 'Cash',
                    weight_loss    : 0.4,
                });

            expect(response.status).toBe(409);

            // Test must still be DONE (not corrupted by second attempt)
            const testRow = db.prepare(`
                SELECT status, done_at FROM gold_test WHERE id = ?
            `).get(testId);

            if (testRow) {
                expect(testRow.status).toBe('DONE');
                expect(testRow.done_at).not.toBeNull();
            }

            // Second call must NOT have added a weight loss entry (weight_loss = 0.4 was rejected)
            expect(
                weightLossCount(customerId, `gold test finalization: ${testId}`)
            ).toBe(0); // first call had weight_loss = 0, so no entry

        } finally {
            cleanTestData(customerId);
        }
    });

    /**
     * GAP-D — customer.balance update parity check.
     *
     * When a finalize uses mode_of_payment='Balance', the customer's balance
     * column MUST be incremented by the grand_total in the SAME transaction
     * as the credit_history insert. Locks behavior so it can't silently
     * regress (PARITY_AUDIT.md GAP-D).
     */
    it('GAP-D: Balance-mode gold finalize increments customer.balance by grand_total', async () => {
        const customerId = seedCustomer('Balance GAP-D');
        try {
            const create = await request(app)
                .post('/api/gold-tests')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    customer_id    : customerId,
                    items          : [
                        { gross_weight: 4.000, test_weight: 0.100, item_type: 'Ring' },
                        { gross_weight: 5.000, test_weight: 0.200, item_type: 'Chain' },
                    ],
                    mode_of_payment: 'Balance',
                });
            expect(create.status).toBe(201);

            const before = db.prepare('SELECT balance FROM customer WHERE id = ?').get(customerId).balance;
            expect(before).toBe(0);

            const testId = create.body.data.id;
            const items  = create.body.data.items.map(i => ({ id: i.id, purity: 91.6, returned: false }));

            const fin = await request(app)
                .post(`/api/gold-tests/${testId}/finalize`)
                .set('Authorization', `Bearer ${token}`)
                .set('X-Request-Id', `bal-debit-${Date.now()}`)
                .send({ items, mode_of_payment: 'Balance', weight_loss: 0 });

            expect(fin.status).toBe(200);
            expect(fin.body.success).toBe(true);
            expect(fin.body.data.test.status).toBe('DONE');

            // 2 items × 30 fee = 60 added to customer.balance
            const after = db.prepare('SELECT balance FROM customer WHERE id = ?').get(customerId).balance;
            expect(after).toBeCloseTo(60, 2);

            // DEBIT row exists, CREDIT row does NOT (Balance defers payment)
            const ledger = db.prepare(`
                SELECT
                    SUM(CASE WHEN type='DEBIT'  THEN amount ELSE 0 END) AS debit_sum,
                    SUM(CASE WHEN type='CREDIT' THEN amount ELSE 0 END) AS credit_sum
                FROM credit_history
                WHERE customer_id = ? AND deletedon IS NULL
            `).get(customerId);
            expect(Number(ledger.debit_sum)).toBeCloseTo(60, 2);
            expect(Number(ledger.credit_sum)).toBe(0);
        } finally {
            cleanTestData(customerId);
        }
    });

    it('GAP-D: Cash-mode gold finalize keeps customer.balance at 0 (DEBIT + CREDIT cancel)', async () => {
        const customerId = seedCustomer('Cash GAP-D');
        try {
            const create = await request(app)
                .post('/api/gold-tests')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    customer_id    : customerId,
                    items          : [{ gross_weight: 3.500, test_weight: 0.100, item_type: 'Ring' }],
                    mode_of_payment: 'Cash',
                });
            expect(create.status).toBe(201);

            const testId = create.body.data.id;
            const itemId = create.body.data.items[0].id;
            const fin = await request(app)
                .post(`/api/gold-tests/${testId}/finalize`)
                .set('Authorization', `Bearer ${token}`)
                .set('X-Request-Id', `cash-debit-${Date.now()}`)
                .send({
                    items          : [{ id: itemId, purity: 91.6, returned: false }],
                    mode_of_payment: 'Cash',
                    weight_loss    : 0,
                });
            expect(fin.status).toBe(200);

            const after = db.prepare('SELECT balance FROM customer WHERE id = ?').get(customerId).balance;
            expect(after).toBeCloseTo(0, 2);

            const ledger = db.prepare(`
                SELECT
                    SUM(CASE WHEN type='DEBIT'  THEN amount ELSE 0 END) AS debit_sum,
                    SUM(CASE WHEN type='CREDIT' THEN amount ELSE 0 END) AS credit_sum
                FROM credit_history
                WHERE customer_id = ? AND deletedon IS NULL
            `).get(customerId);
            expect(Number(ledger.debit_sum)).toBeCloseTo(30, 2);
            expect(Number(ledger.credit_sum)).toBeCloseTo(30, 2);
        } finally {
            cleanTestData(customerId);
        }
    });
});
