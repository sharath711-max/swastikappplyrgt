const express = require('express');
const router = express.Router({ mergeParams: true });
const GoldCertificateItemRepository = require('../repositories/goldCertificateItemRepository');
const SilverCertificateItemRepository = require('../repositories/SilverCertificateItemRepository');
const { immutabilityGuard } = require('../middleware/immutabilityGuard');

// We have 3 distinct tableNames to guard based on ID prefixes. We will create a dynamic guard for certificates:
const dynamicCertGuard = (req, res, next) => {
    let tableName = null;
    const id = req.params.id || req.body.id;
    if (id) {
        if (id.startsWith('GCR')) tableName = 'gold_certificate';
        else if (id.startsWith('SCR')) tableName = 'silver_certificate';
        else if (id.startsWith('PCR')) tableName = 'photo_certificate';
    }

    if (tableName) {
        return immutabilityGuard(tableName)(req, res, next);
    }
    next();
};

router.use(dynamicCertGuard);

/**
 * Helper to get the correct repository based on certificate ID prefix
 */
const getRepo = (certificateId) => {
    if (certificateId.startsWith('GCR')) return GoldCertificateItemRepository;
    if (certificateId.startsWith('SCR')) return SilverCertificateItemRepository;
    // Fallback or Photo
    return GoldCertificateItemRepository;
};

/**
 * POST /api/certificates/:id/items
 */
router.post('/items', async (req, res, next) => {
    try {
        const { id } = req.params;
        const clientData = req.body;
        const repo = getRepo(id);

        // Security: REJECT any attempts to send calculated values
        const forbiddenFields = ['net_weight', 'fine_weight', 'item_total', 'amount', 'calculated_at'];
        const detectedForbidden = forbiddenFields.filter(f => clientData[f] !== undefined);

        if (detectedForbidden.length > 0) {
            return res.status(400).json({
                error: 'CALCULATION_ATTEMPT',
                message: `Field(s) '${detectedForbidden.join(', ')}' cannot be sent by client.`
            });
        }

        const result = repo.createItem(id, clientData);

        res.status(201).json({
            success: true,
            message: 'Item created with server-side calculations',
            data: result
        });
    } catch (error) {
        if (error.message.startsWith('409:')) {
            return res.status(409).json({ error: error.message.replace('409: ', '') });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message, details: error.details });
        }
        next(error);
    }
});

/**
 * PUT /api/certificates/:id/items/:itemId
 */
router.put('/items/:itemId', async (req, res, next) => {
    try {
        const { id, itemId } = req.params;
        const repo = getRepo(id);

        const result = repo.updateItem(itemId, req.body);

        res.json({
            success: true,
            message: 'Item updated and recalculated',
            data: result
        });
    } catch (error) {
        if (error.message.startsWith('409:')) {
            return res.status(409).json({ error: error.message.replace('409: ', '') });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message, details: error.details });
        }
        next(error);
    }
});

/**
 * DELETE /api/certificates/:id/items/:itemId
 */
router.delete('/items/:itemId', async (req, res, next) => {
    try {
        const { id, itemId } = req.params;
        const repo = getRepo(id);

        const result = repo.deleteItem(itemId);

        res.json({
            success: true,
            message: 'Item deleted successfully',
            data: result
        });
    } catch (error) {
        if (error.message.startsWith('409:')) {
            return res.status(409).json({ error: error.message.replace('409: ', '') });
        }
        next(error);
    }
});

module.exports = router;
