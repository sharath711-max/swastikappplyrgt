const { db } = require('../db/db');
const crypto = require('crypto');

/**
 * Middleware factory: auditLog(action, entityType, getEntityId, fields)
 * Wraps any PUT/PATCH route and writes before+after rows to audit_logs.
 *
 * Example usage in a route:
 *   router.put('/:id/purity', auditMiddleware('UPDATE_PURITY', 'gold_test_item', r => r.params.id, ['purity']), handler);
 */
function auditMiddleware(action, entityType, getEntityId, watchedFields = []) {
    return async (req, res, next) => {
        const user = req.user;           // populated by authMiddleware
        const entityId = getEntityId(req);
        const ipAddress = req.ip;

        // Capture old values before the handler fires
        let oldValues = {};
        try {
            const oldRow = db.prepare(`SELECT * FROM ${entityType} WHERE id = ?`).get(entityId);
            if (oldRow && watchedFields.length) {
                watchedFields.forEach(f => { oldValues[f] = oldRow[f]; });
            }
        } catch (_) { /* table may not have that field */ }

        // Intercept res.json to capture new values after handler
        const origJson = res.json.bind(res);
        res.json = function (body) {
            // Only log on success (2xx)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    const newRow = db.prepare(`SELECT * FROM ${entityType} WHERE id = ?`).get(entityId);
                    watchedFields.forEach(field => {
                        const oldVal = String(oldValues[field] ?? '');
                        const newVal = String(newRow?.[field] ?? '');
                        if (oldVal !== newVal) {
                            db.prepare(`
                                INSERT INTO audit_logs (id, user_id, username, action, entity_type, entity_id, field, old_value, new_value, created, ip_address)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
                            `).run(
                                crypto.randomUUID(),
                                user?.id || 'unknown',
                                user?.username || 'unknown',
                                action,
                                entityType,
                                entityId,
                                field,
                                oldVal,
                                newVal,
                                ipAddress
                            );
                        }
                    });
                } catch (auditErr) {
                    console.error('[Audit] Failed to log:', auditErr.message);
                }
            }
            return origJson(body);
        };

        next();
    };
}

module.exports = { auditMiddleware };
