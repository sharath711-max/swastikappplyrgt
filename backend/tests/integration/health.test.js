const request = require('supertest');
const app = require('../../app');

describe('Health and Status API', () => {
    it('GET /health should return 200 indicating API is running', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
        expect(response.body).toHaveProperty('message', 'Swastik API is running');
    });

    it('GET to unknown API route should return 404', async () => {
        const response = await request(app).get('/api/unknown_route_does_not_exist');
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'API endpoint not found');
    });
});
