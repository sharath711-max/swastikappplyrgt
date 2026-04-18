const { db } = require('./db/db');

const check = (table, msg, query) => {
    try {
        const res = db.prepare(query).all();
        console.log(`${msg}:`, res);
    } catch (e) {
        console.log(`Error running ${msg}:`, e.message);
    }
};

console.log("--- GOLD ---");
check('gold_test', 'Invalid states', "SELECT id, status FROM gold_test WHERE status NOT IN ('TODO','IN_PROGRESS','DONE') AND deletedon IS NULL");
check('gold_test_item', 'Null fields', "SELECT id FROM gold_test_item WHERE purity IS NULL OR gross_weight IS NULL AND deletedon IS NULL");
check('gold_test_item', 'Bad types', "SELECT id, purity, typeof(purity) as type FROM gold_test_item WHERE typeof(purity) != 'real' AND typeof(purity) != 'integer' AND deletedon IS NULL");

console.log("--- SILVER ---");
check('silver_test', 'Invalid states', "SELECT id, status FROM silver_test WHERE status NOT IN ('TODO','IN_PROGRESS','DONE') AND deletedon IS NULL");
check('silver_test_item', 'Null fields', "SELECT id FROM silver_test_item WHERE purity IS NULL OR gross_weight IS NULL AND deletedon IS NULL");
check('silver_test_item', 'Bad types', "SELECT id, purity, typeof(purity) as type FROM silver_test_item WHERE typeof(purity) != 'real' AND typeof(purity) != 'integer' AND deletedon IS NULL");
