const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, genId, now } = require('../db/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

class AuthService {
    async register(username, password, role = 'staff') {
        const hashedPassword = await bcrypt.hash(password, 10);
        const id = genId('USR');
        const timestamp = now();

        try {
            const info = db.prepare(`
                INSERT INTO users (id, username, password, role, created, lastmodified)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(id, username, hashedPassword, role, timestamp, timestamp);
            return { id, username, role, created: timestamp };
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error('Username already exists');
            }
            throw error;
        }
    }

    async login(username, password) {
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (!user) {
            throw new Error('Invalid username or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid username or password');
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        };
    }

    async getProfile(userId) {
        const user = db.prepare('SELECT id, username, role, created as created_at FROM users WHERE id = ?').get(userId);
        return user;
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
        if (!user) throw new Error('User not found');

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) throw new Error('Incorrect current password');

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const timestamp = now();
        db.prepare('UPDATE users SET password = ?, lastmodified = ? WHERE id = ?').run(hashedPassword, timestamp, userId);
        return { success: true };
    }

    async getAllUsers() {
        return db.prepare('SELECT id, username, role, created as created_at FROM users ORDER BY created DESC').all();
    }

    async resetPassword(userId, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const timestamp = now();
        const result = db.prepare('UPDATE users SET password = ?, lastmodified = ? WHERE id = ?').run(hashedPassword, timestamp, userId);
        if (result.changes === 0) throw new Error('User not found');
        return { success: true };
    }

    async updateUserRole(userId, newRole) {
        const timestamp = now();
        const result = db.prepare('UPDATE users SET role = ?, lastmodified = ? WHERE id = ?').run(newRole, timestamp, userId);
        if (result.changes === 0) throw new Error('User not found');
        return { success: true };
    }
}

module.exports = new AuthService();
