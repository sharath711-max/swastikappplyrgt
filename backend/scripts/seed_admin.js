const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

// Fix path: script is in backend/scripts, db is in backend/db
const dbPath = path.join(__dirname, '../db/lab.db');
const db = new Database(dbPath);

async function seedAdmin() {
    try {
        const adminUser = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();

        if (adminUser) {
            console.log('✅ Admin user already exists.');
            // Optional: Update role if it's missing or wrong (fixing the previous issue)
            if (adminUser.role !== 'admin') {
                console.log('Updating admin role to "admin"...');
                db.prepare("UPDATE users SET role = 'admin' WHERE username = 'admin'").run();
            }
            return;
        }

        console.log('Creating admin user...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const now = new Date().toISOString();

        db.prepare(`
            INSERT INTO users (id, username, password, role, created, lastmodified)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run('USR000000000ADMIN1', 'admin', hashedPassword, 'admin', now, now);

        console.log('✅ Admin user created successfully.');
        console.log('Username: admin');
        console.log('Password: admin123');

    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
    }
}

seedAdmin();
