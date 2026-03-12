const express = require('express');
const router = express.Router();
const { db } = require('../db/db');

// GET /api/public/verify/:autoNumber
// No auth middleware! This is a public gap-4 self-service endpoint.
router.get('/:autoNumber', (req, res) => {
    try {
        const { autoNumber } = req.params;

        // Sequence of tables to search
        const tables = [
            { type: 'Gold Test', table: 'gold_test', itemsTable: 'gold_test_item' },
            { type: 'Silver Test', table: 'silver_test', itemsTable: 'silver_test_item' },
            { type: 'Gold Certificate', table: 'gold_certificate', itemsTable: 'gold_certificate_item' },
            { type: 'Silver Certificate', table: 'silver_certificate', itemsTable: 'silver_certificate_item' },
            { type: 'Photo Certificate', table: 'photo_certificate', itemsTable: 'photo_certificate_item' }
        ];

        for (const t of tables) {
            const isCert = t.type.includes('Certificate');

            // For tests, we want purity from the first item
            let query;
            if (isCert) {
                query = `
                    SELECT c.name as customer_name, t.created, t.status, t.total
                    FROM ${t.table} t
                    JOIN customer c ON t.customer_id = c.id
                    WHERE t.auto_number = ? AND t.deletedon IS NULL
                `;
            } else {
                query = `
                    SELECT c.name as customer_name, t.created, t.status, t.total, i.purity, i.gross_weight
                    FROM ${t.table} t
                    JOIN customer c ON t.customer_id = c.id
                    LEFT JOIN ${t.itemsTable} i ON i.${t.table}_id = t.id
                    WHERE t.auto_number = ? AND t.deletedon IS NULL
                    LIMIT 1
                `;
            }

            const record = db.prepare(query).get(autoNumber);
            if (record) {
                // If it's not marked DONE, we shouldn't show the full verified cert publicly
                if (record.status !== 'DONE') {
                    return res.status(403).json({ success: false, error: 'Certificate is still in progress and not yet verified.' });
                }

                // Mask customer name for privacy online (e.g. Ramesh -> R****h)
                let maskedName = 'Hidden';
                if (record.customer_name && record.customer_name.length > 2) {
                    const n = record.customer_name;
                    maskedName = n[0] + '*'.repeat(n.length - 2) + n[n.length - 1];
                }

                return res.json({
                    success: true,
                    data: {
                        autoNumber,
                        type: t.type,
                        date: record.created,
                        customer: maskedName,
                        purity: record.purity || 'N/A',
                        weight: record.gross_weight || 'N/A'
                    }
                });
            }
        }

        return res.status(404).json({ success: false, error: 'Verification failed: Certificate not found.' });
    } catch (e) {
        console.error('[Verify API Error]', e.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

module.exports = router;
