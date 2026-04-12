const express = require('express');
const router = express.Router();
const printService = require('../services/v2/printService');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET /api/print/:resourceType/:metalType/:id
router.get('/:resourceType/:metalType/:id', async (req, res) => {
    try {
        const { resourceType, metalType, id } = req.params;
        const layout = printService.getPrintLayout(resourceType, metalType, id);
        res.json({ success: true, data: layout });
    } catch (error) {
        if (error.message.startsWith('404')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
