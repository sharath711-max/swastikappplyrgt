const { db } = require('./db/db');
console.log(db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name IN ('gold_test_item', 'silver_test_item', 'gold_certificate_item', 'silver_certificate_item', 'photo_certificate_item');").all());
