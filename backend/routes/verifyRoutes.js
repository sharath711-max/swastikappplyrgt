'use strict';

const express     = require('express');
const router      = express.Router();
const { db }      = require('../db/db');
const printService = require('../services/v2/printService');

const TABLES = [
    { label: 'Gold Test',          table: 'gold_test',          itemsTable: 'gold_test_item',          isCert: false },
    { label: 'Silver Test',        table: 'silver_test',        itemsTable: 'silver_test_item',        isCert: false },
    { label: 'Gold Certificate',   table: 'gold_certificate',   itemsTable: 'gold_certificate_item',   isCert: true  },
    { label: 'Silver Certificate', table: 'silver_certificate', itemsTable: 'silver_certificate_item', isCert: true  },
    { label: 'Photo Certificate',  table: 'photo_certificate',  itemsTable: 'photo_certificate_item',  isCert: true  },
];

// GET /api/public/verify/:autoNumber
// Public — no auth required.
// Returns HMAC verification result for DONE records.
router.get('/:autoNumber', (req, res) => {
    try {
        const { autoNumber } = req.params;

        for (const t of TABLES) {
            const selectCols = t.isCert
                ? `c.name AS customer_name, t.created, t.status, t.total,
                   t.print_snapshot, t.snapshot_hash, t.snapshot_key_version`
                : `c.name AS customer_name, t.created, t.status, t.total,
                   t.print_snapshot, t.snapshot_hash, t.snapshot_key_version,
                   i.purity, i.gross_weight`;

            const joinClause = t.isCert
                ? ''
                : `LEFT JOIN ${t.itemsTable} i ON i.${t.table}_id = t.id`;

            const limitClause = t.isCert ? '' : 'LIMIT 1';

            const record = db.prepare(`
                SELECT ${selectCols}
                FROM ${t.table} t
                JOIN customer c ON t.customer_id = c.id
                ${joinClause}
                WHERE t.auto_number = ? AND t.deletedon IS NULL
                ${limitClause}
            `).get(autoNumber);

            if (!record) continue;

            if (record.status !== 'DONE') {
                return res.status(403).json({
                    success: false,
                    error: 'Certificate is still in progress and not yet verified.',
                });
            }

            // ── HMAC integrity check ──────────────────────────────────────────
            let hashVerified = null;   // null = no snapshot stored (legacy record)
            let tampered     = false;

            if (record.print_snapshot && record.snapshot_hash) {
                try {
                    printService.validateAndExtract(record);
                    hashVerified = true;
                } catch (err) {
                    hashVerified = false;
                    tampered     = err.message === 'SNAPSHOT_INTEGRITY_FAILURE' ||
                                   (err.code    === 'DB_CORRUPTION');
                }
            }

            // Mask customer name for privacy (Ramesh → R****h)
            const n          = record.customer_name || '';
            const maskedName = n.length > 2
                ? n[0] + '*'.repeat(n.length - 2) + n[n.length - 1]
                : 'Hidden';

            return res.json({
                success : hashVerified !== false,
                verified: hashVerified,
                tampered,
                data: {
                    autoNumber,
                    type    : t.label,
                    date    : record.created,
                    customer: maskedName,
                    purity  : record.purity      || 'N/A',
                    weight  : record.gross_weight || 'N/A',
                },
            });
        }

        return res.status(404).json({
            success: false,
            error  : 'Verification failed: Certificate not found.',
        });

    } catch (e) {
        console.error('[Verify API Error]', e.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

module.exports = router;
