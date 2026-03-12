const request = require('supertest');
const app = require('../../app');

describe('Customer API Routes', () => {
    it('should return 401 Unauthorized for GET /api/customers without authentication', async () => {
        const response = await request(app).get('/api/customers');
        expect(response.status).toBe(401);
    });

    it('should return 200 for GET /api/customers with valid authentication', async () => {
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({ username: 'admin', password: 'admin123' });

        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body).toHaveProperty('token');

        const response = await request(app)
            .get('/api/customers')
            .set('Authorization', `Bearer ${loginResponse.body.token}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});
