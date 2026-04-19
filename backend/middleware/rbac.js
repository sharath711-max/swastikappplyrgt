'use strict';

const { BusinessError, ERR } = require('../services/v2/errors');

// ─── Permission registry ──────────────────────────────────────────────────────
// Maps permission → roles that hold it.  Add new perms here; middleware stays untouched.

const PERMISSIONS = Object.freeze({
    // Customer
    'customers:read'         : ['admin', 'manager', 'front_desk', 'user'],
    'customers:write'        : ['admin', 'manager', 'front_desk'],
    'customers:delete'       : ['admin'],

    // Tests (gold / silver)
    'tests:read'             : ['admin', 'manager', 'technician', 'front_desk', 'user'],
    'tests:write'            : ['admin', 'manager', 'technician', 'front_desk'],
    'tests:complete'         : ['admin', 'manager', 'technician'],
    'tests:delete'           : ['admin'],

    // Certificates
    'certificates:read'      : ['admin', 'manager', 'front_desk', 'user'],
    'certificates:write'     : ['admin', 'manager', 'front_desk'],
    'certificates:finalize'  : ['admin', 'manager'],
    'certificates:delete'    : ['admin'],

    // Workflow
    'workflow:read'          : ['admin', 'manager', 'technician', 'front_desk', 'user'],
    'workflow:move'          : ['admin', 'manager', 'technician', 'front_desk'],
    'workflow:finalize'      : ['admin', 'manager'],

    // Billing / ledger
    'billing:read'           : ['admin', 'manager', 'front_desk'],
    'billing:write'          : ['admin', 'manager', 'front_desk'],
    'billing:export'         : ['admin', 'manager'],

    // Weight loss
    'weight_loss:read'       : ['admin', 'manager'],
    'weight_loss:write'      : ['admin', 'manager'],

    // Cash register
    'cash:read'              : ['admin'],
    'cash:write'             : ['admin'],

    // Analytics / reports
    'analytics:read'         : ['admin', 'manager'],

    // User management (admin only)
    'users:read'             : ['admin'],
    'users:write'            : ['admin'],

    // Audit log access
    'audit:read'             : ['admin'],
});

/**
 * requirePermission(permission)
 * ─────────────────────────────
 * Middleware that enforces a permission check.
 * Requires authMiddleware to have run first (sets req.user).
 *
 * Usage:
 *   router.get('/', requirePermission('customers:read'), handler);
 */
function requirePermission(permission) {
    const allowed = PERMISSIONS[permission];
    if (!allowed) {
        throw new Error(`[RBAC] Unknown permission: "${permission}" — add it to PERMISSIONS registry`);
    }

    return (req, _res, next) => {
        if (!req.user) {
            return next(new BusinessError('Authentication required', ERR.VALIDATION, 401));
        }

        if (!allowed.includes(req.user.role)) {
            return next(new BusinessError(
                `Role "${req.user.role}" does not have permission "${permission}"`,
                'FORBIDDEN',
                403,
            ));
        }

        return next();
    };
}

/**
 * requireRole(...roles)
 * ─────────────────────
 * Low-level role whitelist check.  Prefer requirePermission() for new code.
 *
 * Usage:
 *   router.delete('/:id', requireRole('admin'), handler);
 */
function requireRole(...roles) {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new BusinessError('Authentication required', ERR.VALIDATION, 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(new BusinessError(
                `Access denied. Required roles: ${roles.join(', ')}`,
                'FORBIDDEN',
                403,
            ));
        }

        return next();
    };
}

/**
 * hasPermission(user, permission) → boolean
 * ──────────────────────────────────────────
 * Synchronous check for use inside controllers / services.
 */
function hasPermission(user, permission) {
    const allowed = PERMISSIONS[permission];
    if (!allowed) return false;
    return allowed.includes(user?.role);
}

module.exports = { requirePermission, requireRole, hasPermission, PERMISSIONS };
