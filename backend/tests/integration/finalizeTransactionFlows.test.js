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

    it('replays gold finalize idempotently for the same request id without duplicating side effects', async () => {
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

            const firstResponse = await request(app)
                .post(`/api/gold-tests/${testId}/finalize`)
                .set('Authorization', `Bearer ${token}`)
                .set('X-Request-Id', requestId)
                .send(payload);

            expect(firstResponse.status).toBe(200);
            expect(firstResponse.body.data).toMatchObject({
                success   : true,
                idempotent: false,
                requestId,
            });

            const replayResponse = await request(app)
                .post(`/api/gold-tests/${testId}/finalize`)
                .set('Authorization', `Bearer ${token}`)
                .set('X-Request-Id', requestId)
                .send(payload);

            expect(replayResponse.status).toBe(200);
            expect(replayResponse.body.data).toMatchObject({
                success    : true,
                idempotent : true,
                alreadyDone: true,
                requestId,
            });

            const testRow = db.prepare(`
                SELECT status, completion_request_id
                FROM gold_test
                WHERE id = ?
            `).get(testId);

            expect(testRow.status).toBe('DONE');
            expect(testRow.completion_request_id).toBe(requestId);
            expect(weightLossCount(customerId, `Gold Test Finalization: ${testId}`)).toBe(1);
        } finally {
            cleanTestData(customerId);
        }
    });

    it('treats a repeated silver finalize with a different request id as an idempotent replay', async () => {
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
            const firstRequestId = `silver-finalize-a-${Date.now()}`;
            const secondRequestId = `silver-finalize-b-${Date.now()}`;
            const payload = {
                items          : [{ id: itemId, purity: 84.2, returned: false }],
                mode_of_payment: 'UPI',
                weight_loss    : 0.15,
            };

            const firstResponse = await request(app)
                .post(`/api/silver-tests/${testId}/finalize`)
                .set('Authorization', `Bearer ${token}`)
                .set('X-Request-Id', firstRequestId)
                .send(payload);

            expect(firstResponse.status).toBe(200);
            expect(firstResponse.body.data).toMatchObject({
                success   : true,
                idempotent: false,
                requestId : firstRequestId,
            });

            const replayResponse = await request(app)
                .post(`/api/silver-tests/${testId}/finalize`)
                .set('Authorization', `Bearer ${token}`)
                .set('X-Request-Id', secondRequestId)
                .send(payload);

            expect(replayResponse.status).toBe(200);
            expect(replayResponse.body.data).toMatchObject({
                success    : true,
                idempotent : true,
                alreadyDone: true,
                requestId  : firstRequestId,
            });

            const testRow = db.prepare(`
                SELECT status, completion_request_id
                FROM silver_test
                WHERE id = ?
            `).get(testId);

            expect(testRow.status).toBe('DONE');
            expect(testRow.completion_request_id).toBe(firstRequestId);
            expect(weightLossCount(customerId, `Silver Test Finalization: ${testId}`)).toBe(1);
        } finally {
            cleanTestData(customerId);
        }
    });

    it('rejects finalize when another completion request already holds the claim', async () => {
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

            db.prepare(`
                UPDATE gold_test
                SET status = 'IN_PROGRESS', completion_request_id = ?
                WHERE id = ?
            `).run('existing-request-claim', testId);

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
            expect(response.body.error).toMatch(/already in progress/i);

            const testRow = db.prepare(`
                SELECT status, completion_request_id, done_at
                FROM gold_test
                WHERE id = ?
            `).get(testId);

            expect(testRow.status).toBe('IN_PROGRESS');
            expect(testRow.completion_request_id).toBe('existing-request-claim');
            expect(testRow.done_at).toBeNull();
            expect(weightLossCount(customerId, `Gold Test Finalization: ${testId}`)).toBe(0);
        } finally {
            cleanTestData(customerId);
        }
    });
});
