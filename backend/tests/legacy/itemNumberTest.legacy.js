const { getNextItemNumber } = require('../utils/itemNumberGenerator');
const { db } = require('../db/db');

// Ensure globals table exists for test
db.exec(`
CREATE TABLE IF NOT EXISTS globals (
  id TEXT PRIMARY KEY CHECK (length(id)=18 AND substr(id,1,3)='GLB'),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created DATETIME NOT NULL,
  lastmodified DATETIME NOT NULL,
  deletedon DATETIME
);
`);

console.log('--- Testing Item Number Generation ---');

function testSameSecondInserts() {
    console.log('Testing same-second inserts...');

    // We can't easily mock time without library, but we can generate quickly
    // which should fall in same second if fast enough.

    const count = 5;
    const results = [];

    try {
        const start = Date.now();
        for (let i = 0; i < count; i++) {
            results.push(getNextItemNumber('TEST'));
        }
        const end = Date.now();

        console.log(`Generated ${count} items in ${end - start}ms`);
        results.forEach(id => console.log(id));

        // Assertions
        // 1. Check format
        const regex = /^TEST-\d{14}\d{5}$/;
        const validFormat = results.every(r => regex.test(r));
        console.log(`Format valid: ${validFormat}`);

        // 2. Check collisions
        const unique = new Set(results).size === results.length;
        console.log(`Unique IDs: ${unique}`);

        // 3. Check sequence increment (if same second)
        // Group by timestamp
        const grouped = {};
        results.forEach(r => {
            const parts = r.split('-');
            const ts = parts[1].substring(0, 14);
            const seq = parseInt(parts[1].substring(14));
            if (!grouped[ts]) grouped[ts] = [];
            grouped[ts].push(seq);
        });

        for (const ts in grouped) {
            const seqs = grouped[ts];
            console.log(`Timestamp ${ts}: Sequences [${seqs.join(', ')}]`);
            // Check strictly increasing?
            // Since synchronous loop, yes.
            let correct = true;
            for (let j = 0; j < seqs.length - 1; j++) {
                if (seqs[j + 1] !== seqs[j] + 1) correct = false;
            }
            console.log(`Sequences verified for ${ts}: ${correct}`);
        }

    } catch (e) {
        console.error('Test failed', e);
    }
}

testSameSecondInserts();
