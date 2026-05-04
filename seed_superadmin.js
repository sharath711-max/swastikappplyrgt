'use strict';

const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const dbPath = process.env.DB_PATH
  ? path.resolve(__dirname, process.env.DB_PATH)
  : path.join(__dirname, 'backend', 'db', 'lab.db');

const username = process.env.SUPERADMIN_USER || 'superadmin';
const password = process.env.SUPERADMIN_PASSWORD || 'admin123';
const now = new Date().toISOString();

const db = new Database(dbPath);

try {
  const existing = db.prepare('SELECT id, username, role FROM users WHERE username = ?').get(username);
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (existing) {
    db.prepare('UPDATE users SET password = ?, role = ?, lastmodified = ? WHERE username = ?')
      .run(hashedPassword, 'superadmin', now, username);
    console.log(`Updated ${username} as role=superadmin.`);
  } else {
    db.prepare(`
      INSERT INTO users (id, username, password, role, created, lastmodified)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(`USR_SUPERADMIN_${Date.now()}`, username, hashedPassword, 'superadmin', now, now);
    console.log(`Created ${username} as role=superadmin.`);
  }

  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
  console.log('Change this password after first login.');
} finally {
  db.close();
}
