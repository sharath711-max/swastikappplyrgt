'use strict';

const express = require('express');
const router  = express.Router();
const { db }  = require('../db/db');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * GET /api/bills?module=gold_cert|silver_cert|photo_cert|gold_test|silver_test
 *              &gst=1|0         (optional — omit for all)
 *              &start_date=YYYY-MM-DD
 *              &end_date=YYYY-MM-DD
 *
 * Returns a flat list of completed bills for the requested module.
 */
router.get('/', (req, res) => {
    try {
        const { module: mod, gst, start_date, end_date } = req.query;

        if (!mod) return res.status(400).json({ error: 'module query param is required' });

        const params  = [];
        const filters = ['p.deletedon IS NULL', "p.status = 'DONE'"];

        if (gst !== undefined && gst !== '') {
            filters.push('p.gst = ?');
            params.push(gst === '1' || gst === 'true' ? 1 : 0);
        }
        if (start_date) { filters.push("date(p.created) >= date(?)"); params.push(start_date); }
        if (end_date)   { filters.push("date(p.created) <= date(?)"); params.push(end_date); }

        const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

        let rows;

        if (mod === 'gold_cert') {
            rows = db.prepare(`
                SELECT p.id, p.auto_number AS bill_number, c.name AS customer_name, c.phone,
                       p.gst, p.total, p.total_tax, p.mode_of_payment,
                       p.created AS date, 'gold_cert' AS module
                FROM gold_certificate p
                JOIN customer c ON p.customer_id = c.id
                ${where}
                ORDER BY p.created DESC
            `).all(...params);
        } else if (mod === 'silver_cert') {
            rows = db.prepare(`
                SELECT p.id, p.auto_number AS bill_number, c.name AS customer_name, c.phone,
                       p.gst, p.total, p.total_tax, p.mode_of_payment,
                       p.created AS date, 'silver_cert' AS module
                FROM silver_certificate p
                JOIN customer c ON p.customer_id = c.id
                ${where}
                ORDER BY p.created DESC
            `).all(...params);
        } else if (mod === 'photo_cert') {
            rows = db.prepare(`
                SELECT p.id, p.auto_number AS bill_number, c.name AS customer_name, c.phone,
                       p.gst, p.total, p.total_tax, p.mode_of_payment,
                       p.created AS date, 'photo_cert' AS module
                FROM photo_certificate p
                JOIN customer c ON p.customer_id = c.id
                ${where}
                ORDER BY p.created DESC
            `).all(...params);
        } else if (mod === 'gold_test') {
            const testFilters = ['p.deletedon IS NULL', "p.status = 'DONE'"];
            const testParams  = [];
            if (start_date) { testFilters.push("date(p.created) >= date(?)"); testParams.push(start_date); }
            if (end_date)   { testFilters.push("date(p.created) <= date(?)"); testParams.push(end_date); }
            const testWhere = `WHERE ${testFilters.join(' AND ')}`;
            rows = db.prepare(`
                SELECT p.id, p.auto_number AS bill_number, c.name AS customer_name, c.phone,
                       0 AS gst, p.total, 0 AS total_tax, p.mode_of_payment,
                       p.created AS date, 'gold_test' AS module
                FROM gold_test p
                JOIN customer c ON p.customer_id = c.id
                ${testWhere}
                ORDER BY p.created DESC
            `).all(...testParams);
        } else if (mod === 'silver_test') {
            const testFilters = ['p.deletedon IS NULL', "p.status = 'DONE'"];
            const testParams  = [];
            if (start_date) { testFilters.push("date(p.created) >= date(?)"); testParams.push(start_date); }
            if (end_date)   { testFilters.push("date(p.created) <= date(?)"); testParams.push(end_date); }
            const testWhere = `WHERE ${testFilters.join(' AND ')}`;
            rows = db.prepare(`
                SELECT p.id, p.auto_number AS bill_number, c.name AS customer_name, c.phone,
                       0 AS gst, p.total, 0 AS total_tax, p.mode_of_payment,
                       p.created AS date, 'silver_test' AS module
                FROM silver_test p
                JOIN customer c ON p.customer_id = c.id
                ${testWhere}
                ORDER BY p.created DESC
            `).all(...testParams);
        } else {
            return res.status(400).json({ error: `Unknown module: ${mod}` });
        }

        const grandTotal = rows.reduce((s, r) => s + (r.total || 0), 0);
        res.json({ success: true, data: rows, meta: { count: rows.length, grandTotal } });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
