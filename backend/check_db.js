const { db } = require('./db/db');
console.log('DB OK');
const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log(rows.map(r => r.name).join(', '));
