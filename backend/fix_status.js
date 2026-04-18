const { db } = require('./db/db');

try {
  let changes = db.prepare("UPDATE gold_test SET status = 'TODO' WHERE status = 'ongoing'").run().changes;
  console.log(`Updated ${changes} gold_tests from ongoing to TODO`);
  
  changes = db.prepare("UPDATE silver_test SET status = 'TODO' WHERE status = 'ongoing'").run().changes;
  console.log(`Updated ${changes} silver_tests from ongoing to TODO`);
  
  console.log("Status normalization complete.");
} catch(e) {
  console.log('Error', e);
}
