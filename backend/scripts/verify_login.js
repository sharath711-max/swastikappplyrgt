const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../db/lab.db');
const db = new Database(dbPath);

async function verifyAdmin() {
    try {
        console.log('Database Path:', dbPath);
        const users = db.prepare("SELECT * FROM users").all();
        console.log(`Found ${users.length} users in DB.`);
        users.forEach(u => console.log(`- ${u.username} (${u.role})`));

        const user = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();

        if (!user) {
            console.log('❌ Admin user not found in DB!');
            // Re-seed if missing
            console.log('Re-seeding admin user...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const now = new Date().toISOString();
            db.prepare(`
                INSERT INTO users (id, username, password, role, created, lastmodified)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run('USR000000000ADMIN1', 'admin', hashedPassword, 'admin', now, now);
            console.log('✅ Admin user re-seeded.');
            return;
        }

        console.log('✅ Admin user found:', {
            id: user.id,
            username: user.username,
            role: user.role,
            password_hash_prefix: user.password.substring(0, 10) + '...'
        });

        const testPassword = 'admin123';
        console.log(`Verifying password '${testPassword}'...`);

        const isMatch = await bcrypt.compare(testPassword, user.password);

        if (isMatch) {
            console.log('✅ Password verification SUCCESSFUL!');
        } else {
            console.log('❌ Password verification FAILED!');

            // Try re-hashing and updating if failed
            console.log('Re-hashing password and updating...');
            const newHash = await bcrypt.hash(testPassword, 10);
            db.prepare("UPDATE users SET password = ? WHERE username = 'admin'").run(newHash);
            console.log('✅ User password updated manually.');

            // Verify again
            const isMatchRetry = await bcrypt.compare(testPassword, newHash);
            console.log('Retrying verification:', isMatchRetry ? 'SUCCESS' : 'STILL FAILED');
        }

    } catch (error) {
        console.error('❌ Error verifying admin:', error);
    }
}

verifyAdmin();
