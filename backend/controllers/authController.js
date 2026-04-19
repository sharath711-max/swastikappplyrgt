'use strict';

const authService = require('../services/authService');
const { writeAuditLog } = require('../services/auditLogService');
const { validateZod } = require('../middleware/validate');
const {
    loginSchema,
    registerSchema,
    changePasswordSchema,
    resetPasswordSchema,
    updateRoleSchema,
} = require('../schemas/index');

async function login(req, res, next) {
    try {
        const { username, password } = validateZod(loginSchema, req.body);
        const result = await authService.login(username, password);

        writeAuditLog({
            userId    : result.user?.id ?? 'unknown',
            username  : result.user?.username ?? username,
            action    : 'LOGIN',
            event     : 'AUTH',
            entityType: 'user',
            entityId  : result.user?.id ?? username,
            ipAddress : req.ip,
        });

        return res.json({ success: true, ...result });
    } catch (err) {
        return next(err);
    }
}

async function register(req, res, next) {
    try {
        const data   = validateZod(registerSchema, req.body);
        const result = await authService.register(data.username, data.password, data.role);

        writeAuditLog({
            userId    : req.user?.id ?? 'system',
            username  : req.user?.username ?? 'system',
            action    : 'REGISTER_USER',
            event     : 'AUTH',
            entityType: 'user',
            entityId  : result.user?.id ?? data.username,
            ipAddress : req.ip,
            metadata  : { role: data.role },
        });

        return res.status(201).json({ success: true, ...result });
    } catch (err) {
        return next(err);
    }
}

async function getProfile(req, res, next) {
    try {
        const profile = await authService.getProfile(req.user.id);
        return res.json({ success: true, data: profile });
    } catch (err) {
        return next(err);
    }
}

async function changePassword(req, res, next) {
    try {
        const { currentPassword, newPassword } = validateZod(changePasswordSchema, req.body);
        await authService.changePassword(req.user.id, currentPassword, newPassword);

        writeAuditLog({
            userId    : req.user.id,
            username  : req.user.username,
            action    : 'CHANGE_PASSWORD',
            event     : 'AUTH',
            entityType: 'user',
            entityId  : req.user.id,
            ipAddress : req.ip,
        });

        return res.json({ success: true, message: 'Password updated' });
    } catch (err) {
        return next(err);
    }
}

async function getAllUsers(req, res, next) {
    try {
        const users = await authService.getAllUsers();
        return res.json({ success: true, data: users });
    } catch (err) {
        return next(err);
    }
}

async function resetPassword(req, res, next) {
    try {
        const { userId, newPassword } = validateZod(resetPasswordSchema, req.body);
        await authService.resetPassword(userId, newPassword);

        writeAuditLog({
            userId    : req.user.id,
            username  : req.user.username,
            action    : 'RESET_PASSWORD',
            event     : 'AUTH',
            entityType: 'user',
            entityId  : userId,
            ipAddress : req.ip,
        });

        return res.json({ success: true, message: 'Password reset' });
    } catch (err) {
        return next(err);
    }
}

async function updateUserRole(req, res, next) {
    try {
        const { role } = validateZod(updateRoleSchema, req.body);
        const { id }   = req.params;
        await authService.updateUserRole(id, role);

        writeAuditLog({
            userId    : req.user.id,
            username  : req.user.username,
            action    : 'UPDATE_ROLE',
            event     : 'AUTH',
            entityType: 'user',
            entityId  : id,
            ipAddress : req.ip,
            metadata  : { newRole: role },
        });

        return res.json({ success: true, message: 'Role updated' });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    login,
    register,
    getProfile,
    changePassword,
    getAllUsers,
    resetPassword,
    updateUserRole,
};
