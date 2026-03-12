const express = require('express');
const router = express.Router();
const weightLossHistoryService = require('../services/weightLossHistoryService');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * GET /api/weight-loss
 * Get weight loss history (with optional customer_id filter)
 */
router.get('/', async (req, res) => {
    try {
        const { customer_id } = req.query;

        const result = await weightLossHistoryService.getCustomerHistory(customer_id, req.query);

        // Match frontend expected field names: created -> createdon
        const records = result.records.map(r => ({
            ...r,
            createdon: r.created
        }));

        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/weight-loss
 * Add a new weight loss entry
 */
router.post('/', async (req, res) => {
    try {
        const result = await weightLossHistoryService.addEntry(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
