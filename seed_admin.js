const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'backend', 'db', 'lab.db');
const db = new Database(dbPath);

console.log('Seeding admin user...');

try {
    const adminExists = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();

    if (!adminExists) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        const now = new Date().toISOString();
        const id = 'u_admin_001';

        db.prepare(
            "INSERT INTO users (id, username, password, role, created, lastmodified) VALUES (?, ?, ?, ?, ?, ?)"
        ).run(id, 'admin', hashedPassword, 'admin', now, now);

        console.log('Admin user created successfully.');
    } else {
        if (adminExists.role !== 'admin') {
            db.prepare("UPDATE users SET role = 'admin', lastmodified = ? WHERE username = 'admin'")
                .run(new Date().toISOString());
            console.log('Admin role corrected to admin.');
        }
        console.log('Admin user already exists.');
    }
} catch (error) {
    console.error('Error seeding database:', error);
}
