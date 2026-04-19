'use strict';

const testServiceV2    = require('../services/v2/testService');
const { writeAuditLog } = require('../services/auditLogService');
const { validateZod }  = require('../middleware/validate');
const { stampHash }    = require('../services/certificateHashService');
const {
    testCreateSchema,
    testCompleteSchema,
    testItemsBatchSchema,
    calculateItemSchema,
    paginationSchema,
} = require('../schemas/index');
const logger = require('../utils/logger');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _actor(req) {
    return {
        userId   : req.user.id,
        username : req.user.username,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
    };
}

// ─── Controllers ──────────────────────────────────────────────────────────────

async function listTests(req, res, next) {
    try {
        const { type } = req.params;
        const filters  = paginationSchema.parse(req.query);
        const result   = await testServiceV2.listTests(type, filters);
        return res.json({ success: true, ...result });
    } catch (err) {
        return next(err);
    }
}

async function getTest(req, res, next) {
    try {
        const { type, id } = req.params;
        const data = await testServiceV2.getTest(type, id);
        return res.json({ success: true, data });
    } catch (err) {
        return next(err);
    }
}

async function createTest(req, res, next) {
    try {
        const { type }  = req.params;
        const payload   = validateZod(testCreateSchema, req.body);
        const result    = await testServiceV2.createTest(type, payload);

        writeAuditLog({
            ...{ userId: req.user.id, username: req.user.username, ipAddress: req.ip },
            action    : 'CREATE_TEST',
            event     : 'COMMIT',
            entityType: `${type}_test`,
            entityId  : result.id ?? result.data?.id,
            metadata  : { type, customer_id: payload.customer_id },
        });

        return res.status(201).json({ success: true, data: result });
    } catch (err) {
        return next(err);
    }
}

async function saveDraft(req, res, next) {
    try {
        const { type, id } = req.params;
        const { items }    = validateZod(testItemsBatchSchema, req.body);
        const result       = await testServiceV2.saveResults(type, id, { items });

        writeAuditLog({
            userId    : req.user.id,
            username  : req.user.username,
            ipAddress : req.ip,
            action    : 'SAVE_DRAFT',
            event     : 'COMMIT',
            entityType: `${type}_test`,
            entityId  : id,
            metadata  : { itemCount: items.length },
        });

        return res.json({ success: true, data: result });
    } catch (err) {
        return next(err);
    }
}

async function completeTest(req, res, next) {
    try {
        const { type, id } = req.params;
        const payload      = validateZod(testCompleteSchema, req.body);
        const result       = await testServiceV2.completeTest(type, id, { ...payload, post_ledger: true });

        // Stamp SHA-256 hash on the minted certificate
        if (result.certificate?.id) {
            try { stampHash(type, result.certificate.id); } catch (hashErr) {
                logger.warn(`[testController] Hash stamp failed for cert ${result.certificate.id}: ${hashErr.message}`);
            }
        }

        writeAuditLog({
            userId    : req.user.id,
            username  : req.user.username,
            ipAddress : req.ip,
            action    : 'COMPLETE_TEST',
            event     : 'COMMIT',
            entityType: `${type}_test`,
            entityId  : id,
            metadata  : {
                certificate_id: result.certificate?.id ?? null,
                type,
            },
        });

        return res.json({ success: true, data: result });
    } catch (err) {
        return next(err);
    }
}

async function calculateItem(req, res, next) {
    try {
        const { type } = req.params;
        const payload  = validateZod(calculateItemSchema, req.body);

        const calcService = type === 'gold'
            ? require('../services/goldTestCalculationService')
            : require('../services/silverTestCalculationService');

        const data = calcService.calculateItem(payload);
        return res.json({ success: true, data });
    } catch (err) {
        return next(err);
    }
}

module.exports = { listTests, getTest, createTest, saveDraft, completeTest, calculateItem };
