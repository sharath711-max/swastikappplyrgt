const request = require('supertest');
const app = require('../../app');
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../db/lab.db');

async function getToken(username = 'admin', password = 'admin123') {
    const response = await request(app)
        .post('/api/auth/login')
        .send({ username, password });

    return response.body.token;
}

function seedCustomer(name = 'Security Hotfix Customer', phone = '7777777777') {
    const db = new Database(DB_PATH);
    const id = `CUS-HOTFIX-${Date.now()}`;
    const now = new Date().toISOString();

    db.prepare(`
        INSERT INTO customer (id, name, phone, balance, created, lastmodified)
        VALUES (?, ?, ?, 0, ?, ?)
    `).run(id, name, phone, now, now);

    db.close();
    return id;
}

function cleanTestData(customerId) {
    const db = new Database(DB_PATH);

    if (customerId) {
        db.prepare('DELETE FROM gold_test_item WHERE gold_test_id IN (SELECT id FROM gold_test WHERE customer_id = ?)').run(customerId);
        db.prepare('DELETE FROM gold_test WHERE customer_id = ?').run(customerId);
        db.prepare('DELETE FROM customer WHERE id = ?').run(customerId);
    }

    db.close();
}

function cleanUser(username) {
    const db = new Database(DB_PATH);
    db.prepare('DELETE FROM users WHERE username = ?').run(username);
    db.close();
}

describe('Security hotfix regression coverage', () => {
    it('blocks disallowed cross-origin requests', async () => {
        const response = await request(app)
            .get('/health')
            .set('Origin', 'http://evil.example');

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('CORS origin not allowed.');
    });

    it('allows the configured frontend origin', async () => {
        const response = await request(app)
            .get('/health')
            .set('Origin', 'http://localhost:3000');

        expect(response.status).toBe(200);
        expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('requires auth for list views', async () => {
        const response = await request(app).get('/api/list/gold-tests');

        expect(response.status).toBe(401);
        expect(response.body.error).toMatch(/access denied|no token/i);
    });

    it('requires auth for certificate item mutations', async () => {
        const response = await request(app)
            .post('/api/certificates/GCR-TEST-1/items')
            .send({ item_name: 'Ring', gross_weight: 1.25 });

        expect(response.status).toBe(401);
        expect(response.body.error).toMatch(/access denied|no token/i);
    });

    it('requires auth for certificate print routes', async () => {
        const response = await request(app).get('/api/certificates/20240101-001/print');

        expect(response.status).toBe(401);
        expect(response.body.error).toMatch(/access denied|no token/i);
    });

    it('blocks public registration after bootstrap user setup', async () => {
        const username = `hotfix_public_${Date.now()}`;

        try {
            const response = await request(app)
                .post('/api/auth/register')
                .send({ username, password: 'Public123!', role: 'admin' });

            expect(response.status).toBe(401);
            expect(response.body.error).toMatch(/access denied|no token/i);
        } finally {
            cleanUser(username);
        }
    });

    it('still allows admin-driven registration after bootstrap', async () => {
        const token = await getToken();
        const username = `hotfix_admin_${Date.now()}`;

        try {
            const response = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${token}`)
                .send({ username, password: 'Admin123!', role: 'staff' });

            expect(response.status).toBe(201);
            expect(response.body.username).toBe(username);
        } finally {
            cleanUser(username);
        }
    });

    it('caps list pagination to 500 records', async () => {
        const token = await getToken();
        const response = await request(app)
            .get('/api/list/gold-tests?limit=1000000')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.pagination.limit).toBe(500);
    });

    it('resolves /stats/summary before treating the path as an id', async () => {
        const token = await getToken();
        const response = await request(app)
            .get('/api/gold-tests/stats/summary')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body).toHaveProperty('data');
    });

    it('still allows fetching a real gold test by id after the route reorder', async () => {
        const token = await getToken();
        const customerId = seedCustomer();

        try {
            const createResponse = await request(app)
                .post('/api/gold-tests')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    customer_id: customerId,
                    items: [{ gross_weight: 4.2, test_weight: 0.2, item_type: 'Ring' }],
                    mode_of_payment: 'Cash'
                });

            expect(createResponse.status).toBe(201);

            const testId = createResponse.body.data.id;
            const detailResponse = await request(app)
                .get(`/api/gold-tests/${testId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(detailResponse.status).toBe(200);
            expect(detailResponse.body.success).toBe(true);
            expect(detailResponse.body.data.id).toBe(testId);
        } finally {
            cleanTestData(customerId);
        }
    });
});
