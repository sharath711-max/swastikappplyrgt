'use strict';

const { db } = require('../db/db');
const { BusinessError, ERR } = require('../services/v2/errors');

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

module.exports = { listAuditLogs, getEntityHistory, listActions };
