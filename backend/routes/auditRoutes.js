'use strict';

const { Router } = require('express');
const { authMiddleware }  = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbac');
const { listAuditLogs, getEntityHistory, listActions } = require('../controllers/auditController');

const router = Router();

router.use(authMiddleware);

router.get('/',                         requirePermission('audit:read'), listAuditLogs);
router.get('/actions',                  requirePermission('audit:read'), listActions);
router.get('/:entityType/:entityId',    requirePermission('audit:read'), getEntityHistory);

module.exports = router;
