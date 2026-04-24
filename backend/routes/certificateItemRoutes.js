'use strict';

const express = require('express');
const router = express.Router({ mergeParams: true });
const certServiceV2 = require('../services/v2/certificateService');
const { authMiddleware } = require('../middleware/authMiddleware');
const { immutabilityGuard } = require('../middleware/immutabilityGuard');

const dynamicCertGuard = (req, res, next) => {
    let tableName = null;
    const id = req.params.id || req.body.id;
    if (id) {
        if (id.startsWith('GCR')) tableName = 'gold_certificate';
        else if (id.startsWith('SCR')) tableName = 'silver_certificate';
        else if (id.startsWith('PCR')) tableName = 'photo_certificate';
    }
    if (tableName) return immutabilityGuard(tableName)(req, res, next);
    next();
};

router.use(authMiddleware);
router.use(dynamicCertGuard);

function inferType(certId) {
    if (certId.startsWith('GCR')) return 'gold';
    if (certId.startsWith('SCR')) return 'silver';
    return null;
}

const handleError = (res, error, next) => {
    if (error.statusCode) {
        return res.status(error.statusCode).json({ error: error.message, code: error.code });
    }
    if (error.message?.startsWith('409')) {
        return res.status(409).json({ error: error.message.replace('409: ', '') });
    }
    next(error);
};

/**
 * POST /api/certificates/:id/items
 */
router.post('/items', async (req, res, next) => {
    try {
        const { id } = req.params;
        const clientData = req.body;

        const type = inferType(id);
        if (!type) return res.status(400).json({ error: 'Cannot infer certificate type from ID' });

        const forbiddenFields = ['net_weight', 'fine_weight', 'item_total', 'amount', 'calculated_at'];
        const detectedForbidden = forbiddenFields.filter(f => clientData[f] !== undefined);
        if (detectedForbidden.length > 0) {
            return res.status(400).json({
                error: 'CALCULATION_ATTEMPT',
                message: `Field(s) '${detectedForbidden.join(', ')}' cannot be sent by client.`
            });
        }

        const result = certServiceV2.addItems(type, id, [clientData]);

        res.status(201).json({
            success: true,
            message: 'Item created with server-side calculations',
            data: result.added[0] ?? result
        });
    } catch (error) {
        handleError(res, error, next);
    }
});

/**
 * PUT /api/certificates/:id/items/:itemId
 */
router.put('/items/:itemId', async (req, res, next) => {
    try {
        const { id, itemId } = req.params;
        const type = inferType(id);
        if (!type) return res.status(400).json({ error: 'Cannot infer certificate type from ID' });

        const result = certServiceV2.updateItem(type, id, itemId, req.body);

        res.json({
            success: true,
            message: 'Item updated and recalculated',
            data: result
        });
    } catch (error) {
        handleError(res, error, next);
    }
});

/**
 * DELETE /api/certificates/:id/items/:itemId
 */
router.delete('/items/:itemId', async (req, res, next) => {
    try {
        const { id, itemId } = req.params;
        const type = inferType(id);
        if (!type) return res.status(400).json({ error: 'Cannot infer certificate type from ID' });

        const result = certServiceV2.removeItem(type, id, itemId);

        res.json({
            success: true,
            message: 'Item deleted successfully',
            data: result
        });
    } catch (error) {
        handleError(res, error, next);
    }
});

module.exports = router;
