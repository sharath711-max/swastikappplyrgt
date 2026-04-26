'use strict';

const { db } = require('../db/db');

/**
 * Checks if a global maintenance lock (e.g. backup) is in progress.
 * If active, blocks all mutation requests (POST, PUT, PATCH, DELETE).
 * GET requests are still allowed.
 */
function maintenanceMiddleware(req, res, next) {
    // Only block mutations. Read operations (GET) are safe during backup.
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        try {
            // Check the globals table for the lock
            const row = db.prepare("SELECT value FROM globals WHERE key = 'BACKUP_IN_PROGRESS'").get();
            
            if (row && row.value === '1') {
                return res.status(503).json({
                    error: 'System Maintenance in Progress',
                    message: 'A database backup is currently running. Please try again in 1-2 minutes.',
                    code: 'SYSTEM_LOCKED'
                });
            }
        } catch (err) {
            // If the DB check fails (e.g. DB is exclusively locked), we should also block
            console.error('⚠️ Maintenance check failed:', err);
            if (err.code === 'SQLITE_BUSY') {
                return res.status(503).json({ error: 'Database is Busy', code: 'DB_BUSY' });
            }
        }
    }
    
    next();
}

module.exports = { maintenanceMiddleware };
