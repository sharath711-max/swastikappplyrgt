const express = require('express');
const router = express.Router();
const printService = require('../services/v2/printService');
const { authMiddleware } = require('../middleware/authMiddleware');
const { db } = require('../db/db');
const { writeAuditLog } = require('../services/auditLogService');

router.use(authMiddleware);

// GET /api/print/:resourceType/:metalType/:id
// GET /api/print/:resourceType/:metalType/:id/item/:index
router.get('/:resourceType/:metalType/:id/item/:index?', async (req, res) => {
    try {
        const { resourceType, metalType, id, index } = req.params;
        const resolvedId = printService.resolveCanonicalId(resourceType, metalType, id);
        const table = resourceType === 'test'
            ? (metalType === 'gold' ? 'gold_test' : 'silver_test')
            : (metalType === 'gold' ? 'gold_certificate' : 'silver_certificate');
        const row = db.prepare(
            `SELECT print_snapshot, snapshot_hash, snapshot_key_version, status FROM ${table} WHERE id = ? AND deletedon IS NULL`
        ).get(resolvedId);

        if (!row) {
            return res.status(404).json({ success: false, error: 'NOT_FOUND', code: 'NOT_FOUND' });
        }

        if (row.status !== 'DONE') {
            return res.status(409).json({ success: false, error: 'NOT_FINALIZED', code: 'NOT_FINALIZED' });
        }

        const snapshot = printService.validateAndExtract(row, index ?? null);

        writeAuditLog({
            userId: req.user?.id || 'unknown',
            username: req.user?.username || 'unknown',
            action: 'PRINT_RECORD',
            event: 'READ',
            operation: 'printRoutes.getSnapshot',
            entityType: table,
            entityId: resolvedId,
            metadata: {
                resourceType,
                metalType,
                item_index: index ?? 'ALL',
                user_agent: req.headers['user-agent'] || null,
                ip_address: req.ip,
                resource: `${table}:${resolvedId}`,
                snapshot_hash: row.snapshot_hash,
                snapshot_key_version: row.snapshot_key_version || 'v1',
            },
            ipAddress: req.ip,
        });

        res.set('Cache-Control', 'public, max-age=31536000, immutable');
        res.json({ success: true, data: snapshot });
    } catch (error) {
        const status = error.statusCode || 400;
        res.status(status).json({ success: false, error: error.message, code: error.code });
    }
});

module.exports = router;
