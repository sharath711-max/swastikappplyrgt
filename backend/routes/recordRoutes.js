const express = require('express');
const router = express.Router();
const recordService = require('../services/recordService');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET /api/records/:type/:id
router.get('/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const result = await recordService.getRecord(type, id);

        if (!result) {
            return res.status(404).json({ success: false, error: 'Record not found' });
        }

        res.json({ success: true, data: result.data, type: result.type });
    } catch (error) {
        console.error('Record Fetch Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch record' });
    }
});

module.exports = router;
