const express = require('express');
const router = express.Router();
const customerService = require('../services/customerService');
const { authMiddleware } = require('../middleware/authMiddleware');
const { db } = require('../db/db');

// Apply auth middleware to all customer routes
router.use(authMiddleware);

// GET /api/customers
// Backwards-compatible: when no paging param is present, returns the legacy
// bare array shape. When any paging param (page / pageSize / search /
// balanceFilter / sortBy / sortOrder) is present, returns the paged shape
// { data: [...], pagination: { page, pageSize, total, totalPages } }.
//
// Note: sortBy=balance currently sorts by ABS(balance) DESC regardless of
// sortOrder, for parity with the legacy Customers.js Math.abs(balance) DESC
// behavior. Revisit post-cutover.
router.get('/', async (req, res) => {
    try {
        const PAGING_PARAMS = ['page', 'pageSize', 'search', 'balanceFilter', 'sortBy', 'sortOrder'];
        const isPaged = PAGING_PARAMS.some(k => req.query[k] !== undefined);

        if (!isPaged) {
            const customers = await customerService.getAllCustomers();
            return res.json(customers);
        }

        const result = await customerService.getCustomersPaged({
            page: req.query.page,
            pageSize: req.query.pageSize,
            search: req.query.search || '',
            balanceFilter: req.query.balanceFilter || 'all',
            sortBy: req.query.sortBy || 'name',
            sortOrder: req.query.sortOrder || 'asc',
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
    try {
        const customer = await customerService.getCustomerById(req.params.id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/customers/:id/statement
// Full balance statement: credit history + weight loss, chronological with running balance.
// Used by CustomerProfile balance tab.
router.get('/:id/statement', async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await customerService.getCustomerById(id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        const ledger = db.prepare(`
            SELECT
                id, 'ledger'    AS source,
                created         AS date,
                type,
                amount,
                mode_of_payment,
                description,
                NULL            AS reason
            FROM credit_history
            WHERE customer_id = ? AND deletedon IS NULL
            UNION ALL
            SELECT
                id, 'weight_loss' AS source,
                created           AS date,
                'WEIGHT_LOSS'     AS type,
                amount,
                mode_of_payment,
                NULL              AS description,
                reason
            FROM weight_loss_history
            WHERE customer_id = ? AND deletedon IS NULL
            ORDER BY date DESC
        `).all(id, id);

        // Running balance (most recent first, so reverse for calc then re-reverse)
        let running = 0;
        const withBalance = [...ledger].reverse().map(row => {
            if (row.type === 'DEBIT')        running += row.amount;
            else if (row.type === 'CREDIT')  running -= row.amount;
            return { ...row, running_balance: Math.round(running * 100) / 100 };
        }).reverse();

        res.json({
            success: true,
            data: {
                customer: { id: customer.id, name: customer.name, current_balance: customer.balance },
                entries: withBalance,
                total_entries: withBalance.length,
            }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/customers/:id/timeline
// Every event for a customer in one chronological feed.
// Types: gold_test, silver_test, gold_cert, silver_cert, photo_cert, payment, weight_loss
// Used by the TIMELINE tab on CustomerProfile.
router.get('/:id/timeline', async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await customerService.getCustomerById(id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        const timeline = db.prepare(`
            SELECT
                id,
                'gold_test'     AS event_type,
                auto_number     AS reference,
                status,
                total           AS amount,
                mode_of_payment,
                NULL            AS description,
                created         AS event_date
            FROM gold_test
            WHERE customer_id = ? AND deletedon IS NULL

            UNION ALL

            SELECT
                id,
                'silver_test'   AS event_type,
                auto_number     AS reference,
                status,
                total           AS amount,
                mode_of_payment,
                NULL            AS description,
                created         AS event_date
            FROM silver_test
            WHERE customer_id = ? AND deletedon IS NULL

            UNION ALL

            SELECT
                id,
                'gold_cert'     AS event_type,
                auto_number     AS reference,
                status,
                total           AS amount,
                mode_of_payment,
                NULL            AS description,
                created         AS event_date
            FROM gold_certificate
            WHERE customer_id = ? AND deletedon IS NULL

            UNION ALL

            SELECT
                id,
                'silver_cert'   AS event_type,
                auto_number     AS reference,
                status,
                total           AS amount,
                mode_of_payment,
                NULL            AS description,
                created         AS event_date
            FROM silver_certificate
            WHERE customer_id = ? AND deletedon IS NULL

            UNION ALL

            SELECT
                id,
                'photo_cert'    AS event_type,
                auto_number     AS reference,
                status,
                total           AS amount,
                mode_of_payment,
                NULL            AS description,
                created         AS event_date
            FROM photo_certificate
            WHERE customer_id = ? AND deletedon IS NULL

            UNION ALL

            SELECT
                id,
                'payment'       AS event_type,
                mode_of_payment AS reference,
                type            AS status,
                amount,
                mode_of_payment,
                description,
                created         AS event_date
            FROM credit_history
            WHERE customer_id = ? AND deletedon IS NULL

            UNION ALL

            SELECT
                id,
                'weight_loss'   AS event_type,
                'Weight Loss'   AS reference,
                NULL            AS status,
                amount,
                mode_of_payment,
                reason          AS description,
                created         AS event_date
            FROM weight_loss_history
            WHERE customer_id = ? AND deletedon IS NULL

            ORDER BY event_date DESC
        `).all(id, id, id, id, id, id, id);

        res.json({
            success: true,
            data: {
                customer: { id: customer.id, name: customer.name },
                events: timeline,
                total: timeline.length,
            }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/customers/search
router.post('/search', async (req, res) => {
    try {
        const { query } = req.body;
        const results = await customerService.searchCustomer(query);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/customers
router.post('/', async (req, res) => {
    try {
        const customer = await customerService.createCustomer(req.body);
        res.status(201).json(customer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/customers/:id
router.put('/:id', async (req, res) => {
    try {
        const customer = await customerService.updateCustomer(req.params.id, req.body);
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/customers/:id/toggle
router.put('/:id/toggle', async (req, res) => {
    try {
        const customer = await customerService.toggleStatus(req.params.id);
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
