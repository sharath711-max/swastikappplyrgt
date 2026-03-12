const express = require('express');
const router = express.Router();
const customerService = require('../services/customerService');
const { authMiddleware } = require('../middleware/authMiddleware');

// Apply auth middleware to all customer routes
router.use(authMiddleware);

// GET /api/customers
router.get('/', async (req, res) => {
    try {
        const customers = await customerService.getAllCustomers();
        res.json(customers);
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
