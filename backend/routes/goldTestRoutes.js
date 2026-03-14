const express = require('express');
const router = express.Router();
const goldTestService = require('../services/goldTestService');
const { authMiddleware } = require('../middleware/authMiddleware');
const { immutabilityGuard } = require('../middleware/immutabilityGuard');
const { auditMiddleware } = require('../middleware/auditMiddleware');

router.use(authMiddleware);
router.use('/:id', immutabilityGuard('gold_test'));

// POST /api/gold-tests
router.post('/', async (req, res) => {
    try {
        const result = await goldTestService.createTest(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// GET /api/gold-tests
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, customer_id, search } = req.query;
        const filters = {
            page: parseInt(page),
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            status,
            customer_id,
            search
        };
        const result = await goldTestService.getTests(filters);
        res.json({ success: true, data: result.tests, pagination: { ...result.pagination, page: parseInt(page), limit: parseInt(limit) } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/gold-tests/stats/summary
router.get('/stats/summary', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const stats = await goldTestService.getSummaryStats(start_date, end_date);
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/gold-tests/:id
router.get('/:id', async (req, res) => {
    try {
        const test = await goldTestService.getTestDetails(req.params.id);
        res.json({ success: true, data: test });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
});

// DELETE /api/gold-tests/:id
router.delete('/:id', async (req, res) => {
    try {
        await goldTestService.deleteTest(req.params.id);
        res.json({ success: true, message: 'Test soft-deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// PATCH /api/gold-tests/:id/status
router.patch('/:id/status', async (req, res) => {
    try {
        await goldTestService.updateStatus(req.params.id, req.body.status);
        res.json({ success: true, message: 'Status updated' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// POST /api/gold-tests/:id/finalize
router.post('/:id/finalize', async (req, res) => {
    try {
        const result = await goldTestService.finalizeTest(req.params.id, req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// POST /api/gold-tests/:id/results
router.post('/:id/results', async (req, res) => {
    try {
        const result = await goldTestService.saveTestResults(req.params.id, req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// PUT /api/gold-tests/:id/items/:itemId
router.put('/:id/items/:itemId',
    auditMiddleware('UPDATE_GOLD_ITEM', 'gold_test_item', req => req.params.itemId, ['purity', 'gross_weight']),
    async (req, res) => {
        try {
            const { id, itemId } = req.params;
            const result = await goldTestService.updateItem(id, itemId, req.body);
            res.json({ success: true, message: 'Item updated successfully', data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    });

module.exports = router;
