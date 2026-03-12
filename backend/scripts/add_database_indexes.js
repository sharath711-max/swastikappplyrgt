const { db } = require('../db/db');

console.log('⚡ Adding database indexes for performance optimization...');

const indexes = [
    // Foreign Keys
    'CREATE INDEX IF NOT EXISTS idx_gold_test_customer ON gold_test(customer_id);',
    'CREATE INDEX IF NOT EXISTS idx_silver_test_customer ON silver_test(customer_id);',
    'CREATE INDEX IF NOT EXISTS idx_gold_cert_customer ON gold_certificate(customer_id);',
    'CREATE INDEX IF NOT EXISTS idx_silver_cert_customer ON silver_certificate(customer_id);',
    'CREATE INDEX IF NOT EXISTS idx_photo_cert_customer ON photo_certificate(customer_id);',
    'CREATE INDEX IF NOT EXISTS idx_credit_history_customer ON credit_history(customer_id);',
    'CREATE INDEX IF NOT EXISTS idx_wlh_customer ON weight_loss_history(customer_id);',

    // Frequent Queries
    'CREATE INDEX IF NOT EXISTS idx_gold_test_status ON gold_test(status);',
    'CREATE INDEX IF NOT EXISTS idx_silver_test_status ON silver_test(status);',
    'CREATE INDEX IF NOT EXISTS idx_gold_cert_status ON gold_certificate(status);',
    'CREATE INDEX IF NOT EXISTS idx_silver_cert_status ON silver_certificate(status);',
    'CREATE INDEX IF NOT EXISTS idx_photo_cert_status ON photo_certificate(status);',

    // Sorting/Filtering
    'CREATE INDEX IF NOT EXISTS idx_gold_test_created ON gold_test(created);',
    'CREATE INDEX IF NOT EXISTS idx_silver_test_created ON silver_test(created);',
    'CREATE INDEX IF NOT EXISTS idx_gold_cert_created ON gold_certificate(created);',
    'CREATE INDEX IF NOT EXISTS idx_silver_cert_created ON silver_certificate(created);',

    // Identifiers
    'CREATE INDEX IF NOT EXISTS idx_gold_test_auto_number ON gold_test(auto_number);',
    'CREATE INDEX IF NOT EXISTS idx_silver_test_auto_number ON silver_test(auto_number);'
];

try {
    db.transaction(() => {
        for (const idxQuery of indexes) {
            db.exec(idxQuery);
        }
    })();
    console.log('✅ All database indexes created successfully.');
} catch (err) {
    console.error('❌ Error creating indexes:', err);
}
