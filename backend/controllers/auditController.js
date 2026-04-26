'use strict';

const { db } = require('../db/db');
const { BusinessError, ERR } = require('../services/v2/errors');
const { createBackup } = require('../scripts/backup');

const PAGE_SIZE_DEFAULT = 50;
const PAGE_SIZE_MAX     = 200;

/**
 * GET /api/audit
 * Returns paginated audit log entries.  Admin only (enforced via rbac middleware).
 *
 * Query params:
 *   entity_type, entity_id, action, user_id, start_date, end_date, page, limit
 */
function listAuditLogs(req, res, next) {
    try {
        const {
            entity_type,
            entity_id,
            action,
            user_id,
            start_date,
            end_date,
            page  = 1,
            limit = PAGE_SIZE_DEFAULT,
        } = req.query;

        const pg  = Math.max(1, parseInt(page, 10)  || 1);
        const lim = Math.min(PAGE_SIZE_MAX, Math.max(1, parseInt(limit, 10) || PAGE_SIZE_DEFAULT));
        const offset = (pg - 1) * lim;

        const conditions = [];
        const params     = [];

        if (entity_type) { conditions.push('entity_type = ?'); params.push(entity_type); }
        if (entity_id)   { conditions.push('entity_id   = ?'); params.push(entity_id);   }
        if (action)      { conditions.push('action      = ?'); params.push(action);      }
        if (user_id)     { conditions.push('user_id     = ?'); params.push(user_id);     }
        if (start_date)  { conditions.push("datetime(created) >= datetime(?)"); params.push(start_date); }
        if (end_date)    { conditions.push("datetime(created) <= datetime(?)"); params.push(end_date);   }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const total = db.prepare(`SELECT COUNT(*) AS n FROM audit_logs ${where}`).get(...params)?.n ?? 0;
        const rows  = db.prepare(
            `SELECT id, request_id, user_id, username, action, event, entity_type, entity_id,
                    field, old_value, new_value, ip_address, created
             FROM audit_logs ${where}
             ORDER BY created DESC
             LIMIT ? OFFSET ?`
        ).all(...params, lim, offset);

        return res.json({
            success: true,
            data   : rows,
            pagination: {
                total,
                pages       : Math.ceil(total / lim),
                current_page: pg,
                limit       : lim,
            },
        });
    } catch (err) {
        return next(err);
    }
}

/**
 * GET /api/audit/:entityType/:entityId
 * Full history for one entity.
 */
function getEntityHistory(req, res, next) {
    try {
        const { entityType, entityId } = req.params;

        if (!entityType || !entityId) {
            throw new BusinessError('entityType and entityId are required', ERR.VALIDATION, 400);
        }

        const rows = db.prepare(
            `SELECT id, request_id, user_id, username, action, event,
                    field, old_value, new_value, ip_address, metadata_json, created
             FROM audit_logs
             WHERE entity_type = ? AND entity_id = ?
             ORDER BY created ASC`
        ).all(entityType, entityId);

        return res.json({ success: true, data: rows });
    } catch (err) {
        return next(err);
    }
}

/**
 * GET /api/audit/actions
 * Returns distinct action names — useful for frontend filter dropdowns.
 */
function listActions(req, res, next) {
    try {
        const rows = db.prepare(
            `SELECT DISTINCT action FROM audit_logs WHERE action IS NOT NULL ORDER BY action`
        ).all();
        return res.json({ success: true, data: rows.map(r => r.action) });
    } catch (err) {
        return next(err);
    }
}

/**
 * POST /api/audit/backup
 * Triggers a manual snapshot.
 */
async function performBackup(req, res, next) {
    try {
        // createBackup is async and handles its own errors
        await createBackup();
        return res.json({ success: true, message: 'Backup initiated successfully' });
    } catch (err) {
        return next(err);
    }
}

/**
 * GET /api/audit/recycle-bin
 * Returns list of deleted items from all main tables.
 */
function getRecycleBin(req, res, next) {
    try {
        const rows = db.prepare(`
            SELECT 'gold_test' as type, id, auto_number, customer_id, deletedon 
            FROM gold_test WHERE deletedon IS NOT NULL
            UNION ALL
            SELECT 'silver_test' as type, id, auto_number, customer_id, deletedon 
            FROM silver_test WHERE deletedon IS NOT NULL
            UNION ALL
            SELECT 'gold_certificate' as type, id, auto_number, customer_id, deletedon 
            FROM gold_certificate WHERE deletedon IS NOT NULL
            UNION ALL
            SELECT 'silver_certificate' as type, id, auto_number, customer_id, deletedon 
            FROM silver_certificate WHERE deletedon IS NOT NULL
            UNION ALL
            SELECT 'photo_certificate' as type, id, auto_number, customer_id, deletedon 
            FROM photo_certificate WHERE deletedon IS NOT NULL
            ORDER BY deletedon DESC
            LIMIT 100
        `).all();

        const enriched = rows.map(row => {
            const customer = db.prepare('SELECT name FROM customer WHERE id = ?').get(row.customer_id);
            return { ...row, customer_name: customer?.name || 'Unknown' };
        });

        return res.json({ success: true, data: enriched });
    } catch (err) {
        return next(err);
    }
}

/**
 * POST /api/audit/restore/:type/:id
 * Restores a deleted item.
 */
function restoreItem(req, res, next) {
    try {
        const { type, id } = req.params;
        const validTypes = ['gold_test', 'silver_test', 'gold_certificate', 'silver_certificate', 'photo_certificate'];
        
        if (!validTypes.includes(type)) {
            throw new BusinessError('Invalid item type', ERR.VALIDATION, 400);
        }

        const result = db.prepare(`UPDATE ${type} SET deletedon = NULL WHERE id = ?`).run(id);
        
        if (result.changes === 0) {
            throw new BusinessError('Item not found or already restored', ERR.NOT_FOUND, 404);
        }

        return res.json({ success: true, message: 'Item restored successfully' });
    } catch (err) {
        return next(err);
    }
}

module.exports = { 
    listAuditLogs, 
    getEntityHistory, 
    listActions,
    performBackup,
    getRecycleBin,
    restoreItem
};
