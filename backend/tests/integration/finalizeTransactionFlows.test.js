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
        token = await getToken();
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

            expect(replayResponse.status).toBe(409);

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
});
