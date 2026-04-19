'use strict';

const { Router } = require('express');
const { authMiddleware }  = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbac');
const { listAuditLogs, getEntityHistory, listActions } = require('../controllers/auditController');

const router = Router();

router.use(authMiddleware);
router.use(requirePermission('audit:read'));

router.get('/',                         listAuditLogs);
router.get('/actions',                  listActions);
router.get('/:entityType/:entityId',    getEntityHistory);

module.exports = router;
