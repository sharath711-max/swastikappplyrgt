const jwt = require('jsonwebtoken');
const { db } = require('../db/db');

const JWT_SECRET = process.env.JWT_SECRET || 'swastik_secret_key_123';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Always refresh role/identity from DB so role updates apply immediately
        // even when an existing JWT still contains older claims.
        const dbUser = db.prepare('SELECT id, username, role FROM users WHERE id = ?').get(decoded.id);
        if (!dbUser) {
            return res.status(401).json({ error: 'User no longer exists.' });
        }

        req.user = {
            ...decoded,
            id: dbUser.id,
            username: dbUser.username,
            role: dbUser.role
        };
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Admin rights required.' });
    }
};

module.exports = { authMiddleware, adminMiddleware, JWT_SECRET };
