const express = require('express');
const router = express.Router();
const creditHistoryService = require('../services/creditHistoryService');
const creditHistoryRepository = require('../repositories/creditHistoryRepository');
const customerRepository = require('../repositories/customerRepository');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * POST /api/credit-history
 * Add a new transaction
 */
router.post('/', async (req, res) => {
    try {
        const result = await creditHistoryService.addTransaction(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/credit-history
 * Get transaction history (with optional customer_id filter)
 */
router.get('/', async (req, res) => {
    try {
        const { customer_id } = req.query;
        if (!customer_id) {
            return res.status(400).json({ success: false, error: 'customer_id is required' });
        }
        const result = await creditHistoryService.getCustomerHistory(customer_id, req.query);

        // Match frontend expected field names: created -> createdon, type -> lowercase for checks
        const records = result.records.map(r => ({
            ...r,
            type: r.type.toLowerCase(),
            createdon: r.created
        }));

        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/credit-history/customer/:id
 * Get transaction history for a customer (Alias)
 */
router.get('/customer/:id', async (req, res) => {
    try {
        const result = await creditHistoryService.getCustomerHistory(req.params.id, req.query);
        const records = result.records.map(r => ({
            ...r,
            type: r.type.toLowerCase(),
            createdon: r.created
        }));
        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/credit-history/export
 * Stream a CSV statement for a customer with optional filters.
 * Query params: customer_id (required), type, start_date, end_date, min_amount, max_amount
 */
router.get('/export', (req, res) => {
    const { customer_id } = req.query;
    if (!customer_id) {
        return res.status(400).json({ error: 'customer_id is required' });
    }

    const customer = customerRepository.findById(customer_id);
    if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
    }

    const rows = creditHistoryService.getCustomerHistoryAll(customer_id, req.query);

    const safeName = (customer.name || customer_id).replace(/[^a-zA-Z0-9_\- ]/g, '').trim().replace(/\s+/g, '_');
    const filename = `statement_${safeName}_${new Date().toISOString().slice(0, 10)}.csv`;

    const escape = (v) => {
        if (v === null || v === undefined) return '';
        const s = String(v);
        return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };

    // Customer-centric history only — no workflow back-references in CSV.
    const header = 'Date,Type,Amount,Mode,Description';
    const lines = rows.map(r => [
        r.created, r.type, r.amount, r.mode_of_payment, r.description
    ].map(escape).join(','));

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send([header, ...lines].join('\r\n'));
});

/**
 * DELETE /api/credit-history/:id
 * Soft-delete a CH row. Re-runs the customer balance roll-up, so the
 * deleted entry is removed from the total. Idempotent.
 */
router.delete('/:id', (req, res) => {
    try {
        const result = creditHistoryRepository.softDelete(req.params.id);
        if (!result.success) {
            return res.status(404).json({ success: false, error: result.reason || 'not_found' });
        }
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
