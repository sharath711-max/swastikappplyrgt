const express = require('express');
const path = require('path');
const documentDeliveryService = require('../services/documentDeliveryService');

const router = express.Router();

router.get('/:token', async (req, res) => {
    try {
        const document = await documentDeliveryService.getPdfByToken(req.params.token);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${path.basename(document.filename)}"`);
        res.setHeader('Cache-Control', 'private, no-store, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

        res.sendFile(document.filePath);
    } catch (error) {
        if (/token|jwt|expired/i.test(error.message)) {
            return res.status(401).json({ success: false, error: 'This delivery link is invalid or has expired.' });
        }

        if (/not found|not complete/i.test(error.message)) {
            return res.status(404).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: 'Unable to prepare the secure PDF right now.' });
    }
});

module.exports = router;
