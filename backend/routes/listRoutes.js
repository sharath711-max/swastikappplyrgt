const express = require('express');
const router = express.Router();
const listService = require('../services/listService');

router.get('/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const result = await listService.getList(type, req.query);
        res.json(result);
    } catch (error) {
        if (error.message === 'Invalid list type') {
            res.status(400).json({ error: error.message });
        } else {
            console.error('List API Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

module.exports = router;
