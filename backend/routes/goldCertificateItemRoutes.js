const express = require('express');
const router = express.Router();
const GoldCertificateItemRepository = require('../repositories/goldCertificateItemRepository');
const { ValidationError } = require('../services/certificateCalculationService');

// Repository is already instantiated in the module export
const repo = GoldCertificateItemRepository;

/**
 * POST /api/certificates/:certificateId/items
 * Create a new gold certificate item with server-side calculation
 */
router.post('/:certificateId/items', async (req, res, next) => {
    try {
        const { certificateId } = req.params;
        const clientData = req.body;
        const userId = req.user?.id || 'system';

        // SECURITY: Strip any calculated fields sent by client
        const allowedFields = [
            'gross_weight', 'test_weight', 'purity', 'rate_per_gram',
            'item_name', 'sub_certificate_number', 'certificate_required', 'is_returned'
        ];

        const sanitizedInput = {};
        allowedFields.forEach(field => {
            if (clientData[field] !== undefined) {
                sanitizedInput[field] = clientData[field];
            }
        });

        // REJECT any attempts to send calculated values
        const forbiddenFields = [
            'net_weight', 'fine_weight', 'item_total', 'amount',
            'calculated_at', 'calculation_version'
        ];

        const detectedForbidden = forbiddenFields.filter(f => clientData[f] !== undefined);

        if (detectedForbidden.length > 0) {
            return res.status(400).json({
                error: 'CALCULATION_ATTEMPT',
                message: `Field(s) '${detectedForbidden.join(', ')}' cannot be sent by client`,
                details: 'All calculations are performed by the backend for accuracy and security',
                forbidden_fields: detectedForbidden
            });
        }

        // Add user context for audit
        sanitizedInput.userId = userId;

        // Create item with authoritative backend calculation
        const result = repo.createItem(certificateId, sanitizedInput);

        res.status(201).json({
            success: true,
            message: 'Gold certificate item created with server-side calculations',
            data: {
                id: result.itemId,
                item_name: result.item_name,
                calculated_values: {
                    net_weight: result.net_weight,
                    fine_weight: result.fine_weight,
                    item_total: result.item_total
                },
                inputs: {
                    gross_weight: result.gross_weight,
                    test_weight: result.test_weight,
                    purity: result.purity,
                    rate_per_gram: result.rate_per_gram
                },
                note: 'All financial calculations performed by backend service',
                calculation_version: result.calculation_version,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'VALIDATION_FAILED',
                message: error.message,
                details: error.details
            });
        }
        next(error);
    }
});

/**
 * GET /api/certificates/:certificateId/items
 * Get all items for a certificate
 */
router.get('/:certificateId/items', async (req, res, next) => {
    try {
        const { certificateId } = req.params;
        const items = repo.getCertificateItems(certificateId);

        res.json({
            success: true,
            count: items.length,
            data: items,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/certificates/:certificateId/items/:itemId
 * Update an item (recalculates automatically)
 */
router.put('/:certificateId/items/:itemId', async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const updates = req.body;

        // Same security checks as POST
        const forbiddenFields = ['net_weight', 'fine_weight', 'item_total', 'amount'];
        const detectedForbidden = forbiddenFields.filter(f => updates[f] !== undefined);

        if (detectedForbidden.length > 0) {
            return res.status(400).json({
                error: 'CALCULATION_ATTEMPT',
                message: `Cannot update calculated fields: ${detectedForbidden.join(', ')}`,
                details: 'Values will be recalculated automatically based on your inputs'
            });
        }

        const result = repo.updateItem(itemId, updates);

        res.json({
            success: true,
            message: 'Item updated and recalculated',
            data: result,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'VALIDATION_FAILED',
                message: error.message,
                details: error.details
            });
        }
        next(error);
    }
});

/**
 * DELETE /api/certificates/:certificateId/items/:itemId
 * Soft delete an item
 */
router.delete('/:certificateId/items/:itemId', async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const result = repo.deleteItem(itemId);

        res.json({
            success: true,
            message: 'Item deleted successfully',
            data: result,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
