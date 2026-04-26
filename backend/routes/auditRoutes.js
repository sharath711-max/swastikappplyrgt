'use strict';

const { Router } = require('express');
const { authMiddleware }  = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbac');
const { listAuditLogs, getEntityHistory, listActions, performBackup, getRecycleBin, restoreItem } = require('../controllers/auditController');

const router = Router();

router.use(authMiddleware);

router.get('/',                         requirePermission('audit:read'), listAuditLogs);
router.get('/actions',                  requirePermission('audit:read'), listActions);
router.get('/:entityType/:entityId',    requirePermission('audit:read'), getEntityHistory);

// System Management
router.post('/backup',                  requirePermission('system:backup'),  performBackup);
router.get('/recycle-bin',              requirePermission('audit:read'),      getRecycleBin);
router.post('/restore/:type/:id',       requirePermission('system:restore'), restoreItem);

module.exports = router;
