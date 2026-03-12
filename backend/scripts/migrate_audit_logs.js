const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '../db/lab.db'));

db.exec(`
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  field TEXT,
  old_value TEXT,
  new_value TEXT,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user   ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_ts     ON audit_logs (created DESC);
`);

console.log('audit_logs: CREATED/VERIFIED OK');
const count = db.prepare('SELECT COUNT(*) as c FROM audit_logs').get();
console.log('Current rows:', count.c);
db.close();
