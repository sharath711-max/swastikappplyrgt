const { db } = require('./db/db');
const bcrypt = require('bcryptjs');
// Get table info for users
const cols = db.prepare("PRAGMA table_info(users)").all();
console.log('Columns:', cols.map(c => c.name).join(', '));

const row = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
console.log('Admin row:', JSON.stringify(row, null, 2));

// find the password column
const pwCol = cols.find(c => c.name.toLowerCase().includes('pass'));
if (pwCol && row[pwCol.name]) {
    const match = bcrypt.compareSync('admin123', row[pwCol.name]);
    console.log(`Password 'admin123' matches ${pwCol.name}:`, match);
}
