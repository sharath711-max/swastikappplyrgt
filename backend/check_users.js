const { db } = require('./db/db');
const rows = db.prepare("SELECT id, username, role FROM users").all();
console.log('Users:', JSON.stringify(rows, null, 2));
