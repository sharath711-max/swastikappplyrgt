const express = require('express');
const router = express.Router();
const { db, now } = require('../db/db');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * Ensure cash_register table exists for older databases.
 */
const ensureCashRegisterSchema = () => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS cash_register (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATETIME NOT NULL,
            type TEXT CHECK (type IN ('IN','OUT')) NOT NULL,
            amount REAL NOT NULL,
            description TEXT,
            created_at DATETIME NOT NULL
        )
    `);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_cash_register_date ON cash_register(date)`);
};

ensureCashRegisterSchema();

/**
 * GET /api/cash-register/summary
 * Fetch current and today's balance summary.
 */
router.get('/summary', (req, res) => {
    try {
        const overall = db.prepare(`
            SELECT
                COALESCE(SUM(CASE WHEN UPPER(type) = 'IN' THEN amount ELSE 0 END), 0) AS total_in,
                COALESCE(SUM(CASE WHEN UPPER(type) = 'OUT' THEN amount ELSE 0 END), 0) AS total_out
            FROM cash_register
        `).get();

        const today = db.prepare(`
            SELECT
                COALESCE(SUM(CASE WHEN UPPER(type) = 'IN' THEN amount ELSE 0 END), 0) AS total_in,
                COALESCE(SUM(CASE WHEN UPPER(type) = 'OUT' THEN amount ELSE 0 END), 0) AS total_out
            FROM cash_register
            WHERE DATE(date) = DATE('now')
        `).get();

        res.json({
            success: true,
            data: {
                current_balance: (overall.total_in || 0) - (overall.total_out || 0),
                today_in: today.total_in || 0,
                today_out: today.total_out || 0,
                today_balance: (today.total_in || 0) - (today.total_out || 0)
            }
        });
    } catch (error) {
        console.error('Error fetching cash summary:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch cash summary' });
    }
});

/**
 * GET /api/cash-register
 * Get all cash register entries (with date range filter)
 * Query params: start_date, end_date, limit, offset
 */
router.get('/', (req, res) => {
    try {
        const { start_date, end_date, limit = 50, offset = 0 } = req.query;

        let query = 'SELECT * FROM cash_register WHERE 1=1';
        const params = [];

        if (start_date) {
            query += ' AND DATE(date) >= DATE(?)';
            params.push(start_date);
        }

        if (end_date) {
            query += ' AND DATE(date) <= DATE(?)';
            params.push(end_date);
        }

        query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const entries = db.prepare(query).all(...params);

        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM cash_register WHERE 1=1';
        const countParams = [];
        if (start_date) {
            countQuery += ' AND DATE(date) >= DATE(?)';
            countParams.push(start_date)
        }
        if (end_date) {
            countQuery += ' AND DATE(date) <= DATE(?)';
            countParams.push(end_date)
        }

        const countResult = db.prepare(countQuery).get(...countParams);

        res.json({
            success: true,
            data: entries,
            pagination: {
                total: countResult.total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        console.error('Error fetching cash register entries:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch cash register entries' });
    }
});

/**
 * POST /api/cash-register/transaction
 * Create a transaction using compact payload used by frontend.
 */
router.post('/transaction', (req, res) => {
    try {
        const { type, amount, description, date } = req.body;
        const normalizedType = String(type || '').trim().toUpperCase();
        const parsedAmount = parseFloat(amount);

        if (!['IN', 'OUT'].includes(normalizedType)) {
            return res.status(400).json({ success: false, error: 'Type must be IN or OUT' });
        }
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ success: false, error: 'Amount must be a positive number' });
        }

        const entryDate = date || new Date().toISOString().split('T')[0];
        const timestamp = now();
        const stmt = db.prepare(`
            INSERT INTO cash_register (date, type, amount, description, created_at)
            VALUES (?, ?, ?, ?, ?)
        `);

        const info = stmt.run(entryDate, normalizedType, parsedAmount, description || '', timestamp);
        const newEntry = db.prepare('SELECT * FROM cash_register WHERE id = ?').get(info.lastInsertRowid);
        res.status(201).json({ success: true, data: newEntry });
    } catch (error) {
        console.error('Error creating cash register transaction:', error);
        res.status(500).json({ success: false, error: 'Failed to create cash register transaction' });
    }
});

/**
 * POST /api/cash-register
 * Create new cash register entry
 */
router.post('/', (req, res) => {
    try {
        const { date, type, amount, description } = req.body;
        const normalizedType = String(type || '').trim().toUpperCase();
        const parsedAmount = parseFloat(amount);

        // Validate required fields
        if (!date || !type || !amount) {
            return res.status(400).json({ success: false, error: 'date, type and amount are required' });
        }

        if (!['IN', 'OUT'].includes(normalizedType)) {
            return res.status(400).json({ success: false, error: 'Type must be IN or OUT' });
        }
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ success: false, error: 'Amount must be a positive number' });
        }

        const timestamp = now();

        // Insert cash register entry
        const stmt = db.prepare(`
      INSERT INTO cash_register (date, type, amount, description, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

        const info = stmt.run(
            date,
            normalizedType,
            parsedAmount,
            description || '',
            timestamp
        );

        // Get the created entry
        const newEntry = db.prepare('SELECT * FROM cash_register WHERE id = ?').get(info.lastInsertRowid);

        res.status(201).json({ success: true, data: newEntry });
    } catch (error) {
        console.error('Error creating cash register entry:', error);
        res.status(500).json({ success: false, error: 'Failed to create cash register entry' });
    }
});

/**
 * DELETE /api/cash_register/:id
 * Delete cash register entry
 */
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;

        const stmt = db.prepare('DELETE FROM cash_register WHERE id = ?');
        const result = stmt.run(id);

        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Entry not found' });
        }

        res.json({ success: true, message: 'Cash register entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting cash register entry:', error);
        res.status(500).json({ success: false, error: 'Failed to delete cash register entry' });
    }
});

module.exports = router;
