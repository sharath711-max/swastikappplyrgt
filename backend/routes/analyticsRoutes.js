const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { db } = require('../db/db');
const { authMiddleware } = require('../middleware/authMiddleware');

const HEARTBEAT_FILE = path.join(__dirname, '../db/xrf_heartbeat.json');

router.use(authMiddleware);

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

module.exports = router;
