const { db } = require('../db/db');

const tablesToDrop = [
    'gold_test_item',
    'silver_test_item',
    'gold_certificate_item',
    'silver_certificate_item',
    'photo_certificate_item',
    'gold_test',
    'silver_test',
    'gold_certificate',
    'silver_certificate',
    'photo_certificate'
];

console.log('Dropping transaction tables to force schema update...');

try {
    // Disable foreign keys to allow dropping parents even if children exist (though we drop children first in list)
    db.pragma('foreign_keys = OFF');

    db.transaction(() => {
        for (const table of tablesToDrop) {
            db.exec(`DROP TABLE IF EXISTS ${table}`);
            console.log(`Dropped ${table}`);
        }
    })();

    db.pragma('foreign_keys = ON');
    console.log('✅ Tables dropped successfully.');
} catch (error) {
    console.error('❌ Error dropping tables:', error);
}
