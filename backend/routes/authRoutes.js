const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { authMiddleware } = require('../middleware/authMiddleware');

// POST /api/auth/register (Initial setup or admin only)
router.post('/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const user = await authService.register(username, password, role);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await authService.login(username, password);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// GET /api/auth/profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await authService.getProfile(req.user.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/change-password
router.post('/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        await authService.changePassword(req.user.id, currentPassword, newPassword);
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Admin Middleware
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied: Admins only' });
    }
};

// GET /api/auth/users
router.get('/users', authMiddleware, isAdmin, async (req, res) => {
    try {
        const users = await authService.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/users/:id/reset-password
router.post('/users/:id/reset-password', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword) throw new Error('New password is required');
        await authService.resetPassword(req.params.id, newPassword);
        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/auth/users/:id/role
router.put('/users/:id/role', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        if (!role) throw new Error('Role is required');
        await authService.updateUserRole(req.params.id, role);
        res.json({ success: true, message: 'Role updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
