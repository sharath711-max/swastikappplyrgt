const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { db } = require('../db/db');
const { authMiddleware } = require('../middleware/authMiddleware');

const HEARTBEAT_FILE = path.join(__dirname, '../db/xrf_heartbeat.json');

router.use(authMiddleware);

// ── GET /api/analytics/pnl (Gap: HARDENING_03 Real-world P&L) ──────────────
router.get('/pnl', (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        let dateFilter = '';
        let params = [];
        if (start_date && end_date) {
            dateFilter = ' AND date(created) >= date(?) AND date(created) <= date(?) ';
            params = [start_date, end_date];
        }

        const grossRevenueRaw = db.prepare(`SELECT SUM(amount) as value FROM credit_history WHERE type = 'CREDIT' ${dateFilter}`).get(...params);
        const weightLossRaw = db.prepare(`SELECT SUM(amount) as value FROM weight_loss_history WHERE 1=1 ${dateFilter}`).get(...params);
        
        let cashParams = params;
        let cashDateFilter = '';
        if (start_date && end_date) {
            cashDateFilter = ' AND date(date) >= date(?) AND date(date) <= date(?) ';
        }
        const expensesRaw = db.prepare(`SELECT SUM(amount) as value FROM cash_register WHERE type = 'OUT' ${cashDateFilter}`).get(...cashParams);

        const grossRevenue = grossRevenueRaw?.value || 0;
        const totalWeightLoss = weightLossRaw?.value || 0;
        const totalExpenses = expensesRaw?.value || 0;

        const netProfit = grossRevenue - totalWeightLoss - totalExpenses;

        res.json({
            success: true,
            data: {
                formula: 'Profit = (SUM(CREDIT_Ledger)) - (SUM(Weight_Loss)) - (SUM(Expenses))',
                grossRevenue,
                totalWeightLoss,
                totalExpenses,
                netProfit
            }
        });
    } catch(e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ── GET /api/analytics/dashboard ─────────────────────────────────────────────
router.get('/dashboard', (req, res) => {
    try {
        const revenueTrends = db.prepare(`
            SELECT
                date(created) as date,
                SUM(total) as revenue,
                SUM(CASE WHEN gst = 1 THEN total ELSE 0 END) as gst_revenue
            FROM (
                SELECT created, total, gst FROM gold_certificate   WHERE status = 'DONE'
                UNION ALL
                SELECT created, total, gst FROM silver_certificate WHERE status = 'DONE'
            )
            WHERE date(created) >= date('now', '-30 days')
            GROUP BY date(created)
            ORDER BY date(created) ASC
        `).all();

        const testVolumes = db.prepare(`
            SELECT 'Gold'   as name, COUNT(*) as value FROM gold_test   WHERE date(created) >= date('now', '-7 days')
            UNION ALL
            SELECT 'Silver' as name, COUNT(*) as value FROM silver_test WHERE date(created) >= date('now', '-7 days')
        `).all();

        const weightLossCauses = db.prepare(`
            SELECT reason as name, SUM(amount) as value
            FROM weight_loss_history
            WHERE date(created) >= date('now', '-30 days')
            GROUP BY reason
            ORDER BY value DESC
        `).all();

        res.json({ success: true, data: { revenueTrends, testVolumes, weightLossCauses } });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch analytics data' });
    }
});

// ── GET /api/analytics/summary  (Dashboard home stats card) ──────────────────
// Called by Dashboard.js on load and every 30s.
router.get('/summary', (req, res) => {
    try {
        // Revenue collected today (debit entries = charges to customers)
        const todayRevenue = db.prepare(`
            SELECT COALESCE(SUM(amount), 0) AS val
            FROM credit_history
            WHERE type = 'DEBIT' AND date(created) = date('now','localtime')
        `).get().val;

        // Cash out today
        const todayExpense = db.prepare(`
            SELECT COALESCE(SUM(amount), 0) AS val
            FROM cash_register
            WHERE type = 'OUT' AND date(date) = date('now','localtime')
        `).get().val;

        // Total outstanding customer balance
        const customerBalance = db.prepare(`
            SELECT COALESCE(SUM(balance), 0) AS val FROM customer WHERE deletedon IS NULL
        `).get().val;

        // Cash in hand global value
        const cashRow = db.prepare(`SELECT value FROM globals WHERE key = 'cash_in_hand'`).get();
        const cashInHand = cashRow ? parseFloat(cashRow.value) || 0 : 0;

        // Active tests (TODO + IN_PROGRESS)
        const activeTests = db.prepare(`
            SELECT
              (SELECT COUNT(*) FROM gold_test   WHERE status != 'DONE' AND deletedon IS NULL) +
              (SELECT COUNT(*) FROM silver_test WHERE status != 'DONE' AND deletedon IS NULL) AS val
        `).get().val;

        // Completed today
        const completedToday = db.prepare(`
            SELECT
              (SELECT COUNT(*) FROM gold_test   WHERE status = 'DONE' AND date(done_at) = date('now','localtime') AND deletedon IS NULL) +
              (SELECT COUNT(*) FROM silver_test WHERE status = 'DONE' AND date(done_at) = date('now','localtime') AND deletedon IS NULL) AS val
        `).get().val;

        // Recent tests (last 10)
        const recentTests = db.prepare(`
            SELECT gt.id, gt.auto_number, gt.status, gt.total, gt.created AS created_at,
                   c.name AS customer_name, 'gold' AS metal_type
            FROM gold_test gt JOIN customer c ON gt.customer_id = c.id
            WHERE gt.deletedon IS NULL
            UNION ALL
            SELECT st.id, st.auto_number, st.status, st.total, st.created AS created_at,
                   c.name AS customer_name, 'silver' AS metal_type
            FROM silver_test st JOIN customer c ON st.customer_id = c.id
            WHERE st.deletedon IS NULL
            ORDER BY created_at DESC LIMIT 10
        `).all();

        // Recent certificates (last 10)
        const recentCertificates = db.prepare(`
            SELECT gc.id, gc.auto_number AS certificate_no, gc.total AS total_amount,
                   gc.created AS issue_date, c.name AS customer_name, 'gold' AS metal_type
            FROM gold_certificate gc JOIN customer c ON gc.customer_id = c.id
            WHERE gc.deletedon IS NULL
            UNION ALL
            SELECT sc.id, sc.auto_number AS certificate_no, sc.total AS total_amount,
                   sc.created AS issue_date, c.name AS customer_name, 'silver' AS metal_type
            FROM silver_certificate sc JOIN customer c ON sc.customer_id = c.id
            WHERE sc.deletedon IS NULL
            ORDER BY issue_date DESC LIMIT 10
        `).all();

        res.json({
            success: true,
            data: {
                todayRevenue, todayExpense, cashInHand, customerBalance,
                activeTests, completedToday,
                recentTests, recentCertificates,
            }
        });
    } catch (e) {
        console.error('Dashboard summary error:', e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// ── GET /api/analytics/xrf-status  (Gap 2 – Hardware Heartbeat) ──────────────
router.get('/xrf-status', (req, res) => {
    try {
        if (!fs.existsSync(HEARTBEAT_FILE)) {
            return res.json({ status: 'OFFLINE', message: 'XRF listener not started', ts: null, stale: true });
        }
        const beat = JSON.parse(fs.readFileSync(HEARTBEAT_FILE, 'utf-8'));
        const ageMs = Date.now() - new Date(beat.ts).getTime();
        const stale = ageMs > 24 * 60 * 60 * 1000;
        res.json({
            status: stale ? 'STALE' : beat.status,
            ts: beat.ts,
            lastFile: beat.lastFile,
            ageHours: +(ageMs / 3600000).toFixed(1),
            stale
        });
    } catch (e) {
        res.status(500).json({ status: 'ERROR', error: e.message });
    }
});

// ── GET /api/analytics/audit-log  (Gap 3 – Compliance Viewer) ────────────────
router.get('/audit-log', (req, res) => {
    if (req.user?.role !== 'admin' && req.user?.role !== 'manager') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    try {
        const logs = db.prepare(`
            SELECT * FROM audit_logs ORDER BY created DESC LIMIT 200
        `).all();
        res.json({ success: true, data: logs });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ── GET /api/analytics/search?q=  (Global quick search) ─────────────────────
// Searches customers, gold tests, silver tests, gold certs, silver certs by name
// or auto_number. Returns top 5 customers and top 10 each for tests/certs.
// Max query length 100 chars, minimum 2 chars.
router.get('/search', (req, res) => {
    const q = (req.query.q || '').trim().slice(0, 100);
    if (q.length < 2) return res.json({ success: true, data: { customers: [], tests: [], certs: [] } });

    const like = `%${q}%`;
    try {
        const customers = db.prepare(`
            SELECT id, name, phone, balance
            FROM customer WHERE deletedon IS NULL
              AND (name LIKE ? OR phone LIKE ?)
            ORDER BY name LIMIT 5
        `).all(like, like);

        const tests = db.prepare(`
            SELECT gt.id, gt.auto_number, gt.status, gt.total, c.name AS customer_name, 'gold' AS metal_type
            FROM gold_test gt JOIN customer c ON gt.customer_id = c.id
            WHERE gt.deletedon IS NULL AND (gt.auto_number LIKE ? OR c.name LIKE ?)
            UNION ALL
            SELECT st.id, st.auto_number, st.status, st.total, c.name AS customer_name, 'silver' AS metal_type
            FROM silver_test st JOIN customer c ON st.customer_id = c.id
            WHERE st.deletedon IS NULL AND (st.auto_number LIKE ? OR c.name LIKE ?)
            ORDER BY auto_number DESC LIMIT 10
        `).all(like, like, like, like);

        const certs = db.prepare(`
            SELECT gc.id, gc.auto_number, gc.status, gc.total, c.name AS customer_name, 'gold' AS metal_type
            FROM gold_certificate gc JOIN customer c ON gc.customer_id = c.id
            WHERE gc.deletedon IS NULL AND (gc.auto_number LIKE ? OR c.name LIKE ?)
            UNION ALL
            SELECT sc.id, sc.auto_number, sc.status, sc.total, c.name AS customer_name, 'silver' AS metal_type
            FROM silver_certificate sc JOIN customer c ON sc.customer_id = c.id
            WHERE sc.deletedon IS NULL AND (sc.auto_number LIKE ? OR c.name LIKE ?)
            ORDER BY auto_number DESC LIMIT 10
        `).all(like, like, like, like);

        res.json({ success: true, data: { customers, tests, certs } });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ── GET /api/analytics/rates ─────────────────────────────────────────────────
// Returns current gold and silver rate-per-gram from globals table.
router.get('/rates', (req, res) => {
    try {
        const gold   = db.prepare(`SELECT value FROM globals WHERE key = 'gold_rate_per_gram'`).get();
        const silver = db.prepare(`SELECT value FROM globals WHERE key = 'silver_rate_per_gram'`).get();
        res.json({
            success: true,
            data: {
                gold_rate_per_gram  : gold   ? parseFloat(gold.value)   : 0,
                silver_rate_per_gram: silver ? parseFloat(silver.value) : 0,
                updated_at          : new Date().toISOString(),
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ── PUT /api/analytics/rates ──────────────────────────────────────────────────
// Admin sets gold and/or silver rate-per-gram. Stored in globals table.
// Body: { gold_rate_per_gram?: number, silver_rate_per_gram?: number }
router.put('/rates', (req, res) => {
    const { gold_rate_per_gram, silver_rate_per_gram } = req.body;
    if (gold_rate_per_gram === undefined && silver_rate_per_gram === undefined) {
        return res.status(400).json({ success: false, error: 'At least one rate is required' });
    }

    const upsert = db.prepare(`
        INSERT INTO globals (key, value, created, lastmodified)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, lastmodified = CURRENT_TIMESTAMP
    `);

    try {
        const update = db.transaction(() => {
            const updated = {};
            if (gold_rate_per_gram !== undefined) {
                if (typeof gold_rate_per_gram !== 'number' || gold_rate_per_gram < 0)
                    throw new Error('gold_rate_per_gram must be a non-negative number');
                upsert.run('gold_rate_per_gram', String(gold_rate_per_gram));
                updated.gold_rate_per_gram = gold_rate_per_gram;
            }
            if (silver_rate_per_gram !== undefined) {
                if (typeof silver_rate_per_gram !== 'number' || silver_rate_per_gram < 0)
                    throw new Error('silver_rate_per_gram must be a non-negative number');
                upsert.run('silver_rate_per_gram', String(silver_rate_per_gram));
                updated.silver_rate_per_gram = silver_rate_per_gram;
            }
            return updated;
        });
        res.json({ success: true, data: update() });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

module.exports = router;
