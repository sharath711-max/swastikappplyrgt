const express = require('express');
const router = express.Router();
const workflowService = require('../services/workflowService');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

const handleError = (res, error) => {
    if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, error: error.message, code: error.code });
    }
    if (error.message.startsWith('403')) {
        return res.status(403).json({ success: false, error: error.message.replace('403: ', '') });
    }
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

// GET /api/workflow/kanban
router.get('/kanban', async (req, res) => {
    try {
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 200, 1), 200);
        const board = await workflowService.getKanbanBoard(limit);
        res.json({ success: true, data: board });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/workflow/move
// Body: { testId, type, toStatus, version? }
// version: optional OCC guard — client passes the version it last read;
//          if the row was modified concurrently a 409 is returned.
router.post('/move', async (req, res) => {
    try {
        const { testId, type, toStatus, version = null } = req.body;
        if (!testId || !type || !toStatus) {
            return res.status(400).json({ success: false, error: 'testId, type and toStatus are required' });
        }

        const result = await workflowService.moveItem(
            type, testId, toStatus,
            {
                userId   : req.user?.id,
                username : req.user?.username,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            },
            version !== null && version !== undefined ? Number(version) : null,
        );
        res.json({ success: true, data: result });
    } catch (error) {
        handleError(res, error);
    }
});

// POST /api/workflow/finalize
// Body: { testId, type, version?, mode_of_payment?, gst? }
// version: optional OCC guard (same as /move)
// mode_of_payment / gst: for certificate types only — persisted atomically before DONE transition
router.post('/finalize', async (req, res) => {
    try {
        const { testId, type, version = null, mode_of_payment, gst } = req.body;
        if (!testId || !type) {
            return res.status(400).json({ success: false, error: 'testId and type are required' });
        }

        const paymentOpts = (mode_of_payment !== undefined || gst !== undefined)
            ? { mode_of_payment, gst }
            : {};

        const result = await workflowService.finalizeItem(
            type, testId,
            {
                userId   : req.user?.id,
                username : req.user?.username,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            },
            version !== null && version !== undefined ? Number(version) : null,
            paymentOpts,
        );

        res.json({ success: true, data: result });
    } catch (error) {
        handleError(res, error);
    }
});

// PATCH /api/workflow/:type/:id/status
router.patch('/:type/:id/status', async (req, res) => {
    try {
        const { type, id } = req.params;
        const { status } = req.body;
        if (status === 'DONE') {
            return res.status(403).json({ success: false, error: 'Finalization requires explicit completion logic' });
        }
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
    if (status === 'DONE') {
        return res.status(403).json({ success: false, error: 'Finalization requires explicit completion logic' });
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
