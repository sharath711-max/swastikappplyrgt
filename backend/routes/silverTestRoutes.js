const express = require('express');
const router = express.Router();
const silverTestService = require('../services/silverTestService');
const { authMiddleware } = require('../middleware/authMiddleware');
const { immutabilityGuard } = require('../middleware/immutabilityGuard');
const { auditMiddleware } = require('../middleware/auditMiddleware');

router.use(authMiddleware);
router.use('/:id', immutabilityGuard('silver_test'));

const handleError = (res, error) => {
    if (error.message.startsWith('409')) {
        return res.status(409).json({ success: false, error: error.message.replace('409: ', '') });
    }
    res.status(400).json({ success: false, error: error.message });
};

router.post('/', async (req, res) => {
    try {
        const result = await silverTestService.createTest(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        handleError(res, error);
    }
});

router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, customer_id, search } = req.query;
        const filters = {
            page: parseInt(page),
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            status, customer_id, search
        };
        const result = await silverTestService.getTests(filters);
        res.json({ success: true, data: result.tests, pagination: { ...result.pagination, page: parseInt(page) } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const test = await silverTestService.getTestDetails(req.params.id);
        res.json({ success: true, data: test });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
});

router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await silverTestService.updateStatus(req.params.id, status);
        res.json({ success: true, message: 'Status updated' });
    } catch (error) {
        handleError(res, error);
    }
});

router.post('/:id/finalize', async (req, res) => {
    try {
        const result = await silverTestService.finalizeTest(req.params.id, req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        handleError(res, error);
    }
});

router.post('/:id/results', async (req, res) => {
    try {
        const result = await silverTestService.saveTestResults(req.params.id, req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        handleError(res, error);
    }
});

router.put('/:id/items/:itemId',
    auditMiddleware('UPDATE_SILVER_ITEM', 'silver_test_item', req => req.params.itemId, ['purity', 'gross_weight']),
    async (req, res) => {
        try {
            const { id, itemId } = req.params;
            const result = await silverTestService.updateItem(id, itemId, req.body);
            res.json({ success: true, message: 'Item updated successfully', data: result });
        } catch (error) {
            handleError(res, error);
        }
    });

router.delete('/:id', async (req, res) => {
    try {
        await silverTestService.deleteTest(req.params.id);
        res.json({ success: true, message: 'Record deleted' });
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = router;
