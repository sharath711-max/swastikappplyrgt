const { initDb } = require('./backend/db/db');
console.log('Forcing DB Init...');
try {
    initDb();
    console.log('Success.');
} catch (e) {
    console.error('Error:', e);
}
