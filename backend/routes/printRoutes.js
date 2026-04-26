const express = require('express');
const router = express.Router();
const printService = require('../services/v2/printService');
const { authMiddleware } = require('../middleware/authMiddleware');
const { db } = require('../db/db');
const { writeAuditLog } = require('../services/auditLogService');

router.use(authMiddleware);

// GET /api/print/:resourceType/:metalType/:id
// GET /api/print/:resourceType/:metalType/:id/item/:index   (legacy — index-based)
// Query params:
//   ?itemId=<item-id>   (preferred — stable ID-based single-item)
//   ?itemIndex=<n>      (legacy alias for positional index; also accepted as path :index)
const handlePrintSnapshot = async (req, res) => {
    try {
        const { resourceType, metalType, id, index } = req.params;
        // itemId takes precedence; fall back to path :index or ?itemIndex for legacy callers
        const itemId    = req.query.itemId    || null;
        const itemIndex = itemId ? null : (index ?? req.query.itemIndex ?? null);

        const resolvedId = printService.resolveCanonicalId(resourceType, metalType, id);

        // Determine table — photo_certificate is its own table
        const table = (() => {
            if (resourceType === 'test') {
                return metalType === 'gold' ? 'gold_test' : 'silver_test';
            }
            if (metalType === 'photo') return 'photo_certificate';
            return metalType === 'gold' ? 'gold_certificate' : 'silver_certificate';
        })();

        const row = db.prepare(
            `SELECT print_snapshot, snapshot_hash, snapshot_key_version, status
             FROM ${table} WHERE id = ? AND deletedon IS NULL`
        ).get(resolvedId);

        if (!row) {
            return res.status(404).json({ success: false, error: 'NOT_FOUND', code: 'NOT_FOUND' });
        }

        let snapshot;
        const expectedRoute = `${metalType}-${resourceType}`;

        if (row.status === 'DONE') {
            // Immutable snapshots are preferred for finalized records
            snapshot = printService.validateAndExtract(row, itemIndex, itemId, expectedRoute);
            // Cache immutable snapshots
            res.set('Cache-Control', 'public, max-age=31536000, immutable');
        } else {
            // Non-finalized records use live generation (preview mode)
            const liveLayout = printService.getPrintLayout(resourceType, metalType, resolvedId, true);
            
            // Filter live layout items if requested
            let targetItems = liveLayout.items;
            if (itemId) {
                targetItems = liveLayout.items.filter(i => String(i.id) === String(itemId));
            } else if (itemIndex != null) {
                const idx = parseInt(itemIndex, 10);
                targetItems = (idx >= 0 && idx < liveLayout.items.length) ? [liveLayout.items[idx]] : [];
            }

            snapshot = {
                version: printService.SNAPSHOT_VERSION,
                schema_version: printService.SCHEMA_VERSION,
                serialization_version: printService.SERIALIZATION_VERSION,
                hash_algorithm: printService.HASH_ALGORITHM,
                generated_at: new Date().toISOString(),
                is_preview: true,
                data: { ...liveLayout, items: targetItems }
            };

            // No caching for live previews
            res.set('Cache-Control', 'no-store');
        }

        // Structured audit log
        writeAuditLog({
            userId   : req.user?.id       || 'unknown',
            username : req.user?.username || 'unknown',
            action   : 'PRINT_TRIGGERED',
            event    : 'READ',
            operation: 'printRoutes.getSnapshot',
            entityType: table,
            entityId  : resolvedId,
            metadata  : {
                resourceType,
                metalType,
                item_id    : itemId    || null,
                item_index : itemIndex ?? 'ALL',
                route      : expectedRoute,
                user_agent : req.headers['user-agent'] || null,
                ip_address : req.ip,
                snapshot_hash        : row.snapshot_hash,
                snapshot_key_version : row.snapshot_key_version || 'v1',
            },
            ipAddress: req.ip,
        });

        // DONE snapshots are immutable — safe to cache forever at the CDN/browser
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
        res.json({ success: true, data: snapshot });
    } catch (error) {
        const status = error.statusCode || 400;
        res.status(status).json({ success: false, error: error.message, code: error.code });
    }
};

router.get('/:resourceType/:metalType/:id', handlePrintSnapshot);
router.get('/:resourceType/:metalType/:id/item/:index?', handlePrintSnapshot);

module.exports = router;
