const request = require('supertest');
const app = require('../../app');

describe('Workflow API Authentication', () => {
    it('GET /api/workflow should return 401 Unauthorized if no token is provided', async () => {
        const response = await request(app).get('/api/workflow');
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Access denied. No token provided.');
    });

    it('PATCH /api/workflow/:type/:id/status should return 401 Unauthorized if no token is provided', async () => {
        const response = await request(app)
            .patch('/api/workflow/gold/test-id-123/status')
            .send({ status: 'DONE' });
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Access denied. No token provided.');
    });
});
