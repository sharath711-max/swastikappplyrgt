const express = require('express');
const router = express.Router();
const creditHistoryService = require('../services/creditHistoryService');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * POST /api/credit-history
 * Add a new transaction
 */
router.post('/', async (req, res) => {
    try {
        const result = await creditHistoryService.addTransaction(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/credit-history
 * Get transaction history (with optional customer_id filter)
 */
router.get('/', async (req, res) => {
    try {
        const { customer_id } = req.query;
        if (!customer_id) {
            return res.status(400).json({ success: false, error: 'customer_id is required' });
        }
        const result = await creditHistoryService.getCustomerHistory(customer_id, req.query);

        // Match frontend expected field names: created -> createdon, type -> lowercase for checks
        const records = result.records.map(r => ({
            ...r,
            type: r.type.toLowerCase(),
            createdon: r.created
        }));

        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/credit-history/customer/:id
 * Get transaction history for a customer (Alias)
 */
router.get('/customer/:id', async (req, res) => {
    try {
        const result = await creditHistoryService.getCustomerHistory(req.params.id, req.query);
        const records = result.records.map(r => ({
            ...r,
            type: r.type.toLowerCase(),
            createdon: r.created
        }));
        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
