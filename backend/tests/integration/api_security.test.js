/**
 * SwastikCore — Domain 1: API & Security Tests
 * Test Matrix IDs: API-01 to API-20
 * Runner: Jest + Supertest
 *
 * Pre-condition: DB is initialized via force_init_db.js + seed_admin.js
 * The app module auto-calls initDb() on load.
 */

const request = require('supertest');
const app = require('../../app');
const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DB_PATH = path.join(__dirname, '../../db/lab.db');

/** Login and return a JWT token */
async function getToken(username = 'admin', password = 'admin123') {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ username, password });
    return res.body.token;
}

/** Create a customer directly in DB and return its id */
function seedCustomer(name = 'Test Customer', phone = '9999999999') {
    const db = new Database(DB_PATH);
    const id = `CUS-TEST-${Date.now()}`;
    const now = new Date().toISOString();
    db.prepare(
        `INSERT INTO customer (id, name, phone, balance, created, lastmodified)
         VALUES (?, ?, ?, 0, ?, ?)`
    ).run(id, name, phone, now, now);
    db.close();
    return id;
}

/** Delete test data after each suite */
function cleanTestData(customerId) {
    const db = new Database(DB_PATH);
    if (customerId) {
        db.prepare('DELETE FROM gold_test_item WHERE gold_test_id IN (SELECT id FROM gold_test WHERE customer_id = ?)').run(customerId);
        db.prepare('DELETE FROM silver_test_item WHERE silver_test_id IN (SELECT id FROM silver_test WHERE customer_id = ?)').run(customerId);
        db.prepare('DELETE FROM gold_test WHERE customer_id = ?').run(customerId);
        db.prepare('DELETE FROM silver_test WHERE customer_id = ?').run(customerId);
        db.prepare('DELETE FROM customer WHERE id = ?').run(customerId);
    }
    db.close();
}

// ─── Suite 1: Auth (API-01 to API-07) ─────────────────────────────────────────

describe('Auth API (API-01 to API-07)', () => {
    // API-01
    it('API-01: POST /api/auth/login — valid credentials returns 200 + token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'admin', password: 'admin123' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(typeof res.body.token).toBe('string');
        expect(res.body.token.length).toBeGreaterThan(20);
    });

    // API-02
    it('API-02: POST /api/auth/login — wrong password returns 401', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'admin', password: 'wrong_password_XYZ' });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    // API-03
    it('API-03: POST /api/auth/login — missing body returns 400 or 401', async () => {
        const res = await request(app).post('/api/auth/login').send({});
        expect([400, 401]).toContain(res.status);
    });

    // API-04
    it('API-04: GET /api/customers — no token returns 401', async () => {
        const res = await request(app).get('/api/customers');
        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/access denied|no token/i);
    });

    // API-05
    it('API-05: GET /api/customers — invalid token returns 401/403', async () => {
        const res = await request(app)
            .get('/api/customers')
            .set('Authorization', 'Bearer completely.invalid.token');
        expect([401, 403]).toContain(res.status);
    });

    // API-06
    it('API-06: GET /api/customers — valid token returns 200', async () => {
        const token = await getToken();
        const res = await request(app)
            .get('/api/customers')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    // API-07 (workflow is admin-protected based on middleware)
    it('API-07: GET /api/workflow — no token returns 401', async () => {
        const res = await request(app).get('/api/workflow');
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error', 'Access denied. No token provided.');
    });
});

// ─── Suite 2: Health & Routing (API-20) ───────────────────────────────────────

describe('Health & Routing', () => {
    // API-20
    it('API-20: GET /health returns 200 + ok status', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('message', 'Swastik API is running');
    });

    it('GET /api/nonexistent returns 404', async () => {
        const res = await request(app).get('/api/nonexistent_endpoint_xyz');
        expect(res.status).toBe(404);
    });
});

// ─── Suite 3: CRUD Operations (API-08 to API-13) ─────────────────────────────

describe('CRUD Operations — Gold Test (API-08 to API-13)', () => {
    let token;
    let customerId;
    let createdTestId;

    beforeAll(async () => {
        token = await getToken();
        customerId = seedCustomer('GT CRUD Test Customer', '1111111111');
    });

    afterAll(() => {
        cleanTestData(customerId);
    });

    // API-10 — Customer
    it('API-10: POST /api/customers — creates customer successfully', async () => {
        const res = await request(app)
            .post('/api/customers')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'API Test Customer', phone: '8888888888' });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('API Test Customer');

        // Cleanup
        cleanTestData(res.body.id);
    });

    // API-08 — Create Gold Test
    it('API-08: POST /api/gold-tests — creates gold test with auto_number', async () => {
        const res = await request(app)
            .post('/api/gold-tests')
            .set('Authorization', `Bearer ${token}`)
            .send({
                customer_id: customerId,
                items: [{ gross_weight: 10.5, test_weight: 0.5, item_type: 'Gatti' }],
                mode_of_payment: 'Cash'
            });

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('auto_number');
        expect(res.body.data.auto_number).toMatch(/^\d{8}-\d{3}$/); // YYYYMMDD-NNN format
        createdTestId = res.body.data.id;
    });

    // API-11 — Read list
    it('API-11: GET /api/gold-tests — returns array of gold tests', async () => {
        const res = await request(app)
            .get('/api/gold-tests')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    // API-12 — Read single
    it('API-12: GET /api/gold-tests/:id — returns specific test with items', async () => {
        if (!createdTestId) return;

        const res = await request(app)
            .get(`/api/gold-tests/${createdTestId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('id', createdTestId);
        expect(res.body.data).toHaveProperty('items');
        expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    // API-13 — Status update
    it('API-13: PATCH /api/workflow/gold/:id/status — moves TODO to IN_PROGRESS', async () => {
        if (!createdTestId) return;

        const res = await request(app)
            .patch(`/api/workflow/gold/${createdTestId}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'IN_PROGRESS' });

        expect(res.status).toBe(200);
    });
});

// ─── Suite 4: Immutability Guard (API-14 to API-16) ─────────────────────────

describe('Immutability Guard (API-14 to API-16)', () => {
    let token;
    let customerId;
    let doneTestId;

    beforeAll(async () => {
        token = await getToken();
        customerId = seedCustomer('Immutability Test Customer', '2222222222');

        // Create a gold test
        const createRes = await request(app)
            .post('/api/gold-tests')
            .set('Authorization', `Bearer ${token}`)
            .send({
                customer_id: customerId,
                items: [{ gross_weight: 5.0, test_weight: 0.2, item_type: 'Ring' }],
                mode_of_payment: 'Cash'
            });

        if (createRes.status === 201) {
            doneTestId = createRes.body.data.id;

            // Move to IN_PROGRESS
            await request(app)
                .patch(`/api/workflow/gold/${doneTestId}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ status: 'IN_PROGRESS' });

            // Move to DONE
            await request(app)
                .patch(`/api/workflow/gold/${doneTestId}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ status: 'DONE' });
        }
    });

    afterAll(() => cleanTestData(customerId));

    // API-14
    it('API-14: PATCH status on DONE test — returns 409 Conflict', async () => {
        if (!doneTestId) return;

        const res = await request(app)
            .patch(`/api/workflow/gold/${doneTestId}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'DONE' });

        expect(res.status).toBe(409);
    });

    // API-16
    it('API-16: Backward move IN_PROGRESS → TODO — rejected (400 or 409)', async () => {
        // Create fresh test and move to IN_PROGRESS
        const createRes = await request(app)
            .post('/api/gold-tests')
            .set('Authorization', `Bearer ${token}`)
            .send({
                customer_id: customerId,
                items: [{ gross_weight: 3.0, test_weight: 0.1, item_type: 'Chain' }],
                mode_of_payment: 'Cash'
            });

        if (createRes.status !== 201) return;
        const id = createRes.body.data.id;

        await request(app)
            .patch(`/api/workflow/gold/${id}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'IN_PROGRESS' });

        // Try backward move
        const res = await request(app)
            .patch(`/api/workflow/gold/${id}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'TODO' });

        expect([400, 409]).toContain(res.status);
    });
});

// ─── Suite 5: Soft Delete & Data Integrity (API-17 to API-19) ────────────────

describe('Soft Delete & Data Integrity (API-17 to API-19)', () => {
    let token;
    let customerId;
    let testId;

    beforeAll(async () => {
        token = await getToken();
        customerId = seedCustomer('Soft Delete Customer', '3333333333');

        const createRes = await request(app)
            .post('/api/gold-tests')
            .set('Authorization', `Bearer ${token}`)
            .send({
                customer_id: customerId,
                items: [{ gross_weight: 8.0, test_weight: 0.3, item_type: 'Bangle' }],
                mode_of_payment: 'Cash'
            });

        if (createRes.status === 201) testId = createRes.body.data.id;
    });

    afterAll(() => cleanTestData(customerId));

    // API-17
    it('API-17: DELETE /api/gold-tests/:id — sets deletedon, row not dropped', async () => {
        if (!testId) return;

        const res = await request(app)
            .delete(`/api/gold-tests/${testId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);

        // Verify row still exists in DB with deletedon set
        const db = new Database(DB_PATH);
        const row = db.prepare('SELECT * FROM gold_test WHERE id = ?').get(testId);
        db.close();

        expect(row).not.toBeNull();
        expect(row.deletedon).not.toBeNull();
    });

    // API-18
    it('API-18: GET /api/gold-tests — deleted record absent from list', async () => {
        if (!testId) return;

        const res = await request(app)
            .get('/api/gold-tests')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        const found = res.body.data.find(t => t.id === testId);
        expect(found).toBeUndefined();
    });
});

// ─── Suite 6: Silver Test CRUD (API-09) ──────────────────────────────────────

describe('Silver Test CRUD (API-09)', () => {
    let token;
    let customerId;

    beforeAll(async () => {
        token = await getToken();
        customerId = seedCustomer('Silver Test Customer', '4444444444');
    });

    afterAll(() => cleanTestData(customerId));

    it('API-09: POST /api/silver-tests — creates silver test successfully', async () => {
        const res = await request(app)
            .post('/api/silver-tests')
            .set('Authorization', `Bearer ${token}`)
            .send({
                customer_id: customerId,
                items: [{ gross_weight: 50.0, test_weight: 2.0, item_type: 'Silver Bar' }],
                mode_of_payment: 'Cash'
            });

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('auto_number');
        expect(res.body.data.auto_number).toMatch(/^\d{8}-\d{3}$/);
    });
});
