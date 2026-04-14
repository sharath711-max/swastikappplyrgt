const express = require('express');
const router = express.Router();
const workflowService = require('../services/workflowService');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

const handleError = (res, error) => {
    if (error.message.startsWith('409')) {
        return res.status(409).json({ success: false, error: error.message.replace('409: ', '') });
    }
    res.status(400).json({ success: false, error: error.message });
};

// GET /api/workflow
router.get('/', async (req, res) => {
    try {
        const items = await workflowService.getAllItems();
        res.json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PATCH /api/workflow/:type/:id/status
router.patch('/:type/:id/status', async (req, res) => {
    try {
        const { type, id } = req.params;
        const { status } = req.body;
        const result = await workflowService.updateStatus(type, id, status);
        res.json({
            success: true,
            message: result.delivery?.message || 'Status updated',
            data: result
        });
    } catch (error) {
        handleError(res, error);
    }
});

// PATCH /api/workflow/bulk-status
// Move multiple items to the same status in one call.
// Body: { items: [{ type: 'gold', id: 'GTS...' }, ...], status: 'IN_PROGRESS' }
router.patch('/bulk-status', async (req, res) => {
    const { items, status } = req.body;
    if (!Array.isArray(items) || !items.length || !status) {
        return res.status(400).json({ success: false, error: 'items[] and status are required' });
    }
    if (items.length > 50) {
        return res.status(400).json({ success: false, error: 'Max 50 items per bulk update' });
    }

    const results = { ok: [], failed: [] };
    for (const item of items) {
        try {
            await workflowService.updateStatus(item.type, item.id, status);
            results.ok.push(item.id);
        } catch (e) {
            results.failed.push({ id: item.id, error: e.message });
        }
    }

    const allOk = results.failed.length === 0;
    res.status(allOk ? 200 : 207).json({
        success: allOk,
        data: results,
        message: allOk
            ? `${results.ok.length} items updated to ${status}`
            : `${results.ok.length} succeeded, ${results.failed.length} failed`,
    });
});

module.exports = router;
