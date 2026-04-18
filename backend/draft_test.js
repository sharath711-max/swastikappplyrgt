const { createTest, completeTest } = require('./services/v2/testService');
const { db } = require('./db/db');

async function testInvalidDraft() {
    console.log("Creating TODO test...");
    const test = createTest('gold', {
        customer_id: db.prepare('SELECT id FROM customer LIMIT 1').get().id,
        items: [{ item_type: 'Ring', gross_weight: 10, sample_weight: 0.1 }],
        status: 'TODO'
    });
    
    console.log("Created test:", test.id);
    
    console.log("Trying to finalize immediately without sending purity...");
    try {
        const res = completeTest('gold', test.id, {
            mode_of_payment: 'Cash',
            items: [] // sending no items!
        });
        console.log("SUCCESS?! (This is bad if purity is 0 or unvalidated):", res.test.id);
        const item = db.prepare('SELECT * FROM gold_test_item WHERE gold_test_id = ?').get(test.id);
        console.log("Item saved as:", item.purity, item.fine_weight);
    } catch (e) {
        console.log("Correctly rejected:", e.message);
    }
}
testInvalidDraft();
