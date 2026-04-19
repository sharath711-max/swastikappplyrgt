'use strict';

const certificateServiceV2  = require('../services/v2/certificateService');
const { writeAuditLog }     = require('../services/auditLogService');
const { validateZod }       = require('../middleware/validate');
const { stampHash, verifyHash, verifyByAutoNumber } = require('../services/certificateHashService');
const { assertTransitionAllowed } = require('../services/workflowStateMachine');
const {
    certificateCreateSchema,
    certificateStatusSchema,
    paginationSchema,
} = require('../schemas/index');
const logger = require('../utils/logger');

function _actor(req) {
    return { userId: req.user.id, username: req.user.username, ipAddress: req.ip };
}

async function listCertificates(req, res, next) {
    try {
        const { type }  = req.params;
        const filters   = paginationSchema.parse(req.query);
        const result    = await certificateServiceV2.listCertificates(type, filters);
        return res.json({ success: true, ...result });
    } catch (err) {
        return next(err);
    }
}

async function getCertificate(req, res, next) {
    try {
        const { type, id } = req.params;
        const data = await certificateServiceV2.getCertificate(type, id);
        return res.json({ success: true, data });
    } catch (err) {
        return next(err);
    }
}

async function createCertificate(req, res, next) {
    try {
        const { type } = req.params;
        const payload  = validateZod(certificateCreateSchema, req.body);
        const result   = await certificateServiceV2.createCertificate(type, payload);

        writeAuditLog({
            ..._actor(req),
            action    : 'CREATE_CERTIFICATE',
            event     : 'COMMIT',
            entityType: `${type}_certificate`,
            entityId  : result.id ?? result.data?.id,
            metadata  : { type, customer_id: payload.customer_id },
        });

        return res.status(201).json({ success: true, data: result });
    } catch (err) {
        return next(err);
    }
}

async function updateStatus(req, res, next) {
    try {
        const { type, id } = req.params;
        const { status }   = validateZod(certificateStatusSchema, req.body);

        // Validate transition before hitting the service
        const current = await certificateServiceV2.getCertificate(type, id);
        assertTransitionAllowed(`${type}_cert`, current.status, status);

        // v2 updateStatus writes print_snapshot + snapshot_hash inside its own transaction.
        // Do NOT call stampHash here — it overwrites snapshot_hash with a legacy format
        // that breaks validateAndExtract (SNAPSHOT_INTEGRITY_FAILURE on every verify).
        const result = await certificateServiceV2.updateStatus(type, id, status);

        writeAuditLog({
            ..._actor(req),
            action    : 'UPDATE_CERT_STATUS',
            event     : 'STATUS_CHANGE',
            entityType: `${type}_certificate`,
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

async function saveResults(req, res, next) {
    try {
        const { type, id } = req.params;
        const result = await certificateServiceV2.saveResults(type, id, req.body);

        writeAuditLog({
            ..._actor(req),
            action    : 'SAVE_CERT_RESULTS',
            event     : 'COMMIT',
            entityType: `${type}_certificate`,
            entityId  : id,
        });

        return res.json({ success: true, data: result });
    } catch (err) {
        return next(err);
    }
}

// ─── Hash verification ────────────────────────────────────────────────────────

/**
 * GET /certificates/:type/:id/verify
 * Returns tamper-detection result for an authenticated user.
 */
async function verifyCertificate(req, res, next) {
    try {
        const { type, id } = req.params;
        const result = verifyHash(type, id);

        writeAuditLog({
            ..._actor(req),
            action    : 'VERIFY_CERT',
            event     : 'AUDIT',
            entityType: `${type}_certificate`,
            entityId  : id,
            metadata  : { valid: result.valid, reason: result.reason },
        });

        return res.json({ success: true, data: result });
    } catch (err) {
        return next(err);
    }
}

/**
 * GET /public/verify/:autoNumber
 * Public endpoint — verifies a certificate by its printed auto_number.
 * No auth required; returns minimal safe payload.
 */
async function publicVerify(req, res, next) {
    try {
        const { autoNumber } = req.params;
        const result = verifyByAutoNumber(autoNumber);

        const safe = result.valid
            ? { valid: true,  auto_number: result.auto_number, type: result.type }
            : { valid: false, reason: result.reason, auto_number: autoNumber };

        return res.json({ success: true, data: safe });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    listCertificates,
    getCertificate,
    createCertificate,
    updateStatus,
    saveResults,
    verifyCertificate,
    publicVerify,
};
