'use strict';

const workflowService     = require('../services/workflowService');
const { writeAuditLog }   = require('../services/auditLogService');
const { validateZod }     = require('../middleware/validate');
const { assertTransitionAllowed, nextStatuses } = require('../services/workflowStateMachine');
const { workflowMoveSchema } = require('../schemas/index');
const { BusinessError, ERR } = require('../services/v2/errors');

function _actor(req) {
    return {
        userId   : req.user.id,
        username : req.user.username,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
    };
}

async function getKanban(req, res, next) {
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
        const board = await workflowService.getKanbanBoard(limit);
        return res.json({ success: true, data: board });
    } catch (err) {
        return next(err);
    }
}

async function moveItem(req, res, next) {
    try {
        const { id }           = req.params;
        const { type, status } = validateZod(workflowMoveSchema, req.body);

        // State machine guard — get current status first
        const current = workflowService._getCurrentRow(type, id);
        if (!current) {
            throw new BusinessError(`Workflow item not found: ${id}`, ERR.NOT_FOUND, 404);
        }

        // Explicit finalize guard: DONE requires the /finalize endpoint
        if (status === 'DONE') {
            throw new BusinessError(
                'Use POST /workflow/finalize/:type/:id to mark DONE',
                ERR.STATUS_INVALID, 403,
            );
        }

        assertTransitionAllowed(type, current.status, status);

        const result = await workflowService.moveItem(type, id, status, _actor(req));

        writeAuditLog({
            userId    : req.user.id,
            username  : req.user.username,
            ipAddress : req.ip,
            action    : 'WORKFLOW_MOVE',
            event     : 'STATUS_CHANGE',
            entityType: type,
            entityId  : id,
            field     : 'status',
            oldValue  : current.status,
            newValue  : status,
        });

        return res.json({ success: true, data: result });
    } catch (err) {
        return next(err);
    }
}

async function finalizeItem(req, res, next) {
    try {
        const { type, id } = req.params;

        if (!type || !id) {
            throw new BusinessError('type and id are required', ERR.VALIDATION, 400);
        }

        const result = await workflowService.finalizeItem(type, id, _actor(req));

        writeAuditLog({
            userId    : req.user.id,
            username  : req.user.username,
            ipAddress : req.ip,
            action    : 'WORKFLOW_FINALIZE',
            event     : 'COMMIT',
            entityType: type,
            entityId  : id,
            field     : 'status',
            oldValue  : 'IN_PROGRESS',
            newValue  : 'DONE',
            metadata  : {
                certificate_id: result.immutableIds?.certificateId ?? null,
            },
        });

        return res.json({ success: true, data: result });
    } catch (err) {
        return next(err);
    }
}

/**
 * GET /workflow/next-statuses/:type/:id
 * Returns which statuses are reachable from the item's current status.
 * Used by the frontend to show/hide action buttons.
 */
async function getNextStatuses(req, res, next) {
    try {
        const { type, id } = req.params;
        const current = workflowService._getCurrentRow(type, id);
        if (!current) {
            throw new BusinessError(`Not found: ${id}`, ERR.NOT_FOUND, 404);
        }
        return res.json({
            success : true,
            current : current.status,
            next    : nextStatuses(type, current.status),
        });
    } catch (err) {
        return next(err);
    }
}

module.exports = { getKanban, moveItem, finalizeItem, getNextStatuses };
