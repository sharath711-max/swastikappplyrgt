PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;

-- 👤 USERS
CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  username     TEXT NOT NULL UNIQUE,
  password     TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'user',
  version      INTEGER NOT NULL DEFAULT 1,
  created      DATETIME NOT NULL,
  lastmodified DATETIME NOT NULL,
  deletedon    DATETIME
);

-- 🌐 GLOBALS (Auto-number, sequences, config)
CREATE TABLE IF NOT EXISTS globals (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created DATETIME NOT NULL,
  lastmodified DATETIME NOT NULL
);

-- 🔢 SEQUENCES (For simple sequential IDs)
CREATE TABLE IF NOT EXISTS sequences (
  name TEXT PRIMARY KEY,
  value INTEGER DEFAULT 0
);

-- 👥 CUSTOMER
CREATE TABLE IF NOT EXISTS customer (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  phone                 TEXT,
  balance               REAL DEFAULT 0,
  notes                 TEXT,
  version               INTEGER NOT NULL DEFAULT 1,
  created               DATETIME NOT NULL,
  lastmodified          DATETIME NOT NULL,
  deletedon             DATETIME
);

CREATE INDEX IF NOT EXISTS idx_customer_phone ON customer(phone);

-- 🧪 TESTS (PARENT)
CREATE TABLE IF NOT EXISTS gold_test (
  id                    TEXT PRIMARY KEY,
  auto_number           TEXT NOT NULL UNIQUE,
  customer_id           TEXT NOT NULL,
  status                TEXT CHECK (status IN ('TODO','IN_PROGRESS','DONE')) NOT NULL,
  mode_of_payment       TEXT,
  total                 REAL DEFAULT 0,
  version               INTEGER NOT NULL DEFAULT 1,
  created               DATETIME NOT NULL,
  in_progress_at        DATETIME,
  done_at               DATETIME,
  completion_request_id TEXT,
  lastmodified          DATETIME NOT NULL,
  deletedon             DATETIME,
  FOREIGN KEY (customer_id) REFERENCES customer(id)
);

CREATE TABLE IF NOT EXISTS silver_test (
  id                    TEXT PRIMARY KEY,
  auto_number           TEXT NOT NULL UNIQUE,
  customer_id           TEXT NOT NULL,
  status                TEXT CHECK (status IN ('TODO','IN_PROGRESS','DONE')) NOT NULL,
  mode_of_payment       TEXT,
  total                 REAL DEFAULT 0,
  version               INTEGER NOT NULL DEFAULT 1,
  created               DATETIME NOT NULL,
  in_progress_at        DATETIME,
  done_at               DATETIME,
  completion_request_id TEXT,
  lastmodified          DATETIME NOT NULL,
  deletedon             DATETIME,
  FOREIGN KEY (customer_id) REFERENCES customer(id)
);

-- 🧪 TEST ITEMS (CHILD)
CREATE TABLE IF NOT EXISTS gold_test_item (
  id TEXT PRIMARY KEY,
  item_number TEXT NOT NULL UNIQUE,
  gold_test_id TEXT NOT NULL,
  name TEXT,
  item_type TEXT NOT NULL,
  gross_weight REAL NOT NULL,
  sample_weight REAL DEFAULT 0,
  test_weight REAL NOT NULL,
  net_weight REAL,
  purity REAL,
  fine_weight REAL,
  item_total REAL DEFAULT 0,
  returned INTEGER DEFAULT 0,
  created DATETIME NOT NULL,
  lastmodified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deletedon DATETIME,
  FOREIGN KEY (gold_test_id) REFERENCES gold_test(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS silver_test_item (
  id TEXT PRIMARY KEY,
  item_number TEXT NOT NULL UNIQUE,
  silver_test_id TEXT NOT NULL,
  name TEXT,
  item_type TEXT NOT NULL,
  gross_weight REAL NOT NULL,
  sample_weight REAL DEFAULT 0,
  test_weight REAL NOT NULL,
  net_weight REAL,
  purity REAL,
  fine_weight REAL,
  item_total REAL DEFAULT 0,
  returned INTEGER DEFAULT 0,
  created DATETIME NOT NULL,
  lastmodified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deletedon DATETIME,
  FOREIGN KEY (silver_test_id) REFERENCES silver_test(id) ON DELETE CASCADE
);

-- 📜 CERTIFICATES (PARENT — FINANCIAL OWNER)
CREATE TABLE IF NOT EXISTS gold_certificate (
  id                 TEXT PRIMARY KEY,
  auto_number        TEXT NOT NULL UNIQUE,
  customer_id        TEXT NOT NULL,
  status             TEXT CHECK (status IN ('TODO','IN_PROGRESS','DONE')) NOT NULL,
  total              REAL DEFAULT 0,
  total_net_weight   REAL DEFAULT 0,
  total_fine_weight  REAL DEFAULT 0,
  gst                INTEGER DEFAULT 0,
  total_tax          REAL DEFAULT 0,
  gst_bill_number    TEXT,
  mode_of_payment    TEXT,
  -- Atomic idempotency gate for ledger charge.
  ledger_charged_at  DATETIME,
  version            INTEGER NOT NULL DEFAULT 1,
  created            DATETIME NOT NULL,
  in_progress_at     DATETIME,
  done_at            DATETIME,
  lastmodified       DATETIME NOT NULL,
  deletedon          DATETIME,
  FOREIGN KEY (customer_id) REFERENCES customer(id)
);

CREATE TABLE IF NOT EXISTS silver_certificate (
  id                 TEXT PRIMARY KEY,
  auto_number        TEXT NOT NULL UNIQUE,
  customer_id        TEXT NOT NULL,
  status             TEXT CHECK (status IN ('TODO','IN_PROGRESS','DONE')) NOT NULL,
  total              REAL DEFAULT 0,
  total_net_weight   REAL DEFAULT 0,
  gst                INTEGER DEFAULT 0,
  total_tax          REAL DEFAULT 0,
  gst_bill_number    TEXT,
  mode_of_payment    TEXT,
  -- Atomic idempotency gate for ledger charge.
  ledger_charged_at  DATETIME,
  version            INTEGER NOT NULL DEFAULT 1,
  created            DATETIME NOT NULL,
  in_progress_at     DATETIME,
  done_at            DATETIME,
  lastmodified       DATETIME NOT NULL,
  deletedon          DATETIME,
  FOREIGN KEY (customer_id) REFERENCES customer(id)
);

CREATE TABLE IF NOT EXISTS photo_certificate (
  id                 TEXT PRIMARY KEY,
  auto_number        TEXT NOT NULL UNIQUE,
  customer_id        TEXT NOT NULL,
  status             TEXT CHECK (status IN ('TODO','IN_PROGRESS','DONE')) NOT NULL,
  total              REAL DEFAULT 0,
  gst                INTEGER DEFAULT 0,
  total_tax          REAL DEFAULT 0,
  gst_bill_number    TEXT,
  mode_of_payment    TEXT,
  -- Atomic idempotency gate for ledger charge. NULL = not yet charged;
  -- DATETIME = first charge timestamp. Subsequent charges no-op via
  -- UPDATE ... WHERE ledger_charged_at IS NULL (changes()=0 → already charged).
  ledger_charged_at  DATETIME,
  version            INTEGER NOT NULL DEFAULT 1,
  created            DATETIME NOT NULL,
  in_progress_at     DATETIME,
  done_at            DATETIME,
  lastmodified       DATETIME NOT NULL,
  deletedon          DATETIME,
  FOREIGN KEY (customer_id) REFERENCES customer(id)
);

-- 📄 CERTIFICATE ITEMS (CHILD)
CREATE TABLE IF NOT EXISTS gold_certificate_item (
  id TEXT PRIMARY KEY,
  item_number TEXT NOT NULL UNIQUE,
  gold_certificate_id TEXT NOT NULL,

  certificate_number TEXT NOT NULL,   -- A001-A999, B001-..., Z999, then wraps to A001 (PRINT ONLY)

  name TEXT,
  item_type TEXT NOT NULL,
  gross_weight REAL NOT NULL CHECK (gross_weight > 0),
  test_weight REAL NOT NULL CHECK (test_weight >= 0),
  net_weight REAL NOT NULL CHECK (net_weight >= 0),
  purity REAL CHECK (purity >= 0 AND purity <= 100),
  fine_weight REAL DEFAULT 0 CHECK (fine_weight >= 0),
  item_total REAL DEFAULT 0,
  returned INTEGER DEFAULT 0,

  created DATETIME NOT NULL,
  lastmodified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deletedon DATETIME,

  FOREIGN KEY (gold_certificate_id)
    REFERENCES gold_certificate(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS silver_certificate_item (
  id TEXT PRIMARY KEY,
  item_number TEXT NOT NULL UNIQUE,
  silver_certificate_id TEXT NOT NULL,
  certificate_number TEXT NOT NULL,
  name TEXT,
  item_type TEXT NOT NULL,
  gross_weight REAL NOT NULL CHECK (gross_weight > 0),
  test_weight REAL NOT NULL CHECK (test_weight >= 0),
  net_weight REAL NOT NULL CHECK (net_weight >= 0),
  purity REAL CHECK (purity >= 0 AND purity <= 100),
  fine_weight REAL DEFAULT 0 CHECK (fine_weight >= 0),
  item_total REAL DEFAULT 0,
  returned INTEGER DEFAULT 0,
  created DATETIME NOT NULL,
  lastmodified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deletedon DATETIME,
  FOREIGN KEY (silver_certificate_id)
    REFERENCES silver_certificate(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS photo_certificate_item (
  id TEXT PRIMARY KEY,
  item_number TEXT NOT NULL UNIQUE,
  photo_certificate_id TEXT NOT NULL,
  certificate_number TEXT NOT NULL,
  name TEXT,
  item_type TEXT NOT NULL,
  gross_weight REAL CHECK (gross_weight >= 0),
  test_weight REAL CHECK (test_weight >= 0),
  net_weight REAL CHECK (net_weight >= 0),
  purity REAL CHECK (purity >= 0 AND purity <= 100),
  fine_weight REAL DEFAULT 0 CHECK (fine_weight >= 0),
  item_total REAL DEFAULT 0,
  returned INTEGER DEFAULT 0,
  media_path TEXT,
  created DATETIME NOT NULL,
  lastmodified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deletedon DATETIME,
  FOREIGN KEY (photo_certificate_id)
    REFERENCES photo_certificate(id) ON DELETE CASCADE
);

-- 💰 CREDIT HISTORY — customer-centric business history.
--    Standard lifecycle metadata: created / lastmodified / deletedon.
--    Soft-delete is honored by all read paths (balance roll-up, list,
--    analytics) via WHERE deletedon IS NULL.
CREATE TABLE IF NOT EXISTS credit_history (
  id               TEXT PRIMARY KEY,
  customer_id      TEXT NOT NULL,
  amount           REAL DEFAULT 0,
  type             TEXT CHECK (type IN ('CREDIT','DEBIT')) NOT NULL,
  mode_of_payment  TEXT,
  description      TEXT,
  previous_balance REAL,
  request_id       TEXT,
  created          DATETIME NOT NULL,
  lastmodified     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deletedon        DATETIME,
  FOREIGN KEY (customer_id) REFERENCES customer(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_history_request_id ON credit_history(request_id) WHERE request_id IS NOT NULL;

-- ⚖️ WEIGHT LOSS HISTORY — customer-centric business history.
--    Same lifecycle contract as credit_history.
CREATE TABLE IF NOT EXISTS weight_loss_history (
  id              TEXT PRIMARY KEY,
  customer_id     TEXT NOT NULL,
  amount          REAL NOT NULL,
  reason          TEXT,
  mode_of_payment TEXT,
  created         DATETIME NOT NULL,
  lastmodified    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deletedon       DATETIME,
  FOREIGN KEY (customer_id) REFERENCES customer(id)
);

-- 🧾 RECEIPTS (IMMUTABLE SNAPSHOTS) — full lifecycle contract.
--    Renamed created_at → created for naming consistency. lastmodified
--    + deletedon added so receipts follow the same rule as other
--    business entities.
CREATE TABLE IF NOT EXISTS receipts (
  id            TEXT PRIMARY KEY,
  customer_id   TEXT NOT NULL,
  snapshot      TEXT NOT NULL,        -- JSON
  snapshot_hash TEXT NOT NULL,        -- HMAC
  created       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lastmodified  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deletedon     DATETIME,
  FOREIGN KEY (customer_id) REFERENCES customer(id)
);

-- 💵 CASH REGISTER (APPEND ONLY LEDGER)
CREATE TABLE IF NOT EXISTS cash_register (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATETIME NOT NULL,
  type TEXT CHECK (type IN ('IN','OUT')) NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  created_at DATETIME NOT NULL
);

-- 📊 INDEXES
CREATE INDEX IF NOT EXISTS idx_gt_status ON gold_test(status, deletedon);
CREATE INDEX IF NOT EXISTS idx_st_status ON silver_test(status, deletedon);

CREATE INDEX IF NOT EXISTS idx_gc_status ON gold_certificate(status, deletedon);
CREATE INDEX IF NOT EXISTS idx_sc_status ON silver_certificate(status, deletedon);
CREATE INDEX IF NOT EXISTS idx_pc_status ON photo_certificate(status, deletedon);

CREATE INDEX IF NOT EXISTS idx_ch_customer ON credit_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_wlh_customer ON weight_loss_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_cash_register_date ON cash_register(date);

-- ⏱️ LASTMODIFIED TRIGGERS
CREATE TRIGGER IF NOT EXISTS update_customer_lastmodified AFTER UPDATE ON customer BEGIN UPDATE customer SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_globals_lastmodified AFTER UPDATE ON globals BEGIN UPDATE globals SET lastmodified = CURRENT_TIMESTAMP WHERE key = NEW.key; END;
CREATE TRIGGER IF NOT EXISTS update_users_lastmodified AFTER UPDATE ON users BEGIN UPDATE users SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS update_gt_lastmodified AFTER UPDATE ON gold_test BEGIN UPDATE gold_test SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_st_lastmodified AFTER UPDATE ON silver_test BEGIN UPDATE silver_test SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS update_gti_lastmodified AFTER UPDATE ON gold_test_item BEGIN UPDATE gold_test_item SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_sti_lastmodified AFTER UPDATE ON silver_test_item BEGIN UPDATE silver_test_item SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_gci_lastmodified AFTER UPDATE ON gold_certificate_item BEGIN UPDATE gold_certificate_item SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_sci_lastmodified AFTER UPDATE ON silver_certificate_item BEGIN UPDATE silver_certificate_item SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_pci_lastmodified AFTER UPDATE ON photo_certificate_item BEGIN UPDATE photo_certificate_item SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

-- Lifecycle triggers for the customer-centric history + receipts tables.
CREATE TRIGGER IF NOT EXISTS update_ch_lastmodified  AFTER UPDATE ON credit_history      BEGIN UPDATE credit_history      SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_wlh_lastmodified AFTER UPDATE ON weight_loss_history BEGIN UPDATE weight_loss_history SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_receipts_lastmodified AFTER UPDATE ON receipts       BEGIN UPDATE receipts            SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

-- 📋 AUDIT LOGS (Gap 3: Compliance — who changed what)
CREATE TABLE IF NOT EXISTS audit_logs (
  id            TEXT PRIMARY KEY,
  request_id    TEXT,                 -- correlation / trace id from AsyncLocalStorage
  user_id       TEXT NOT NULL,
  username      TEXT NOT NULL,
  action        TEXT NOT NULL,        -- e.g. 'UPDATE_PURITY', 'UPDATE_WEIGHT', 'STATUS_CHANGE'
  event         TEXT,                 -- e.g. 'FIELD_CHANGE', 'START', 'COMMIT'
  operation     TEXT,                 -- service or middleware operation name
  entity_type   TEXT NOT NULL,        -- e.g. 'gold_test_item', 'gold_test'
  entity_id     TEXT NOT NULL,
  field         TEXT,                 -- which field changed
  old_value     TEXT,
  new_value     TEXT,
  method        TEXT,                 -- HTTP method when available
  url           TEXT,                 -- request URL when available
  metadata_json TEXT,                 -- JSON payload for structured extras
  created       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address    TEXT
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user   ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_ts     ON audit_logs (created DESC);

-- 🔑 IDEMPOTENCY KEYS (richer per-user duplicate suppression)
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key         TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  method      TEXT NOT NULL,
  path        TEXT NOT NULL,
  entity_type TEXT,
  entity_id   TEXT,
  status_code INTEGER NOT NULL DEFAULT 0,
  response    TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at  DATETIME NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_idem_expires   ON idempotency_keys(expires_at);
CREATE INDEX IF NOT EXISTS idx_idem_user_path ON idempotency_keys(user_id, path, created_at);

-- 📊 ADDITIONAL INDEXES (hot query paths)
-- Tests: customer profile, date-range analytics
CREATE INDEX IF NOT EXISTS idx_gt_customer   ON gold_test(customer_id, status, deletedon);
CREATE INDEX IF NOT EXISTS idx_st_customer   ON silver_test(customer_id, status, deletedon);
CREATE INDEX IF NOT EXISTS idx_gt_created    ON gold_test(created DESC) WHERE deletedon IS NULL;
CREATE INDEX IF NOT EXISTS idx_st_created    ON silver_test(created DESC) WHERE deletedon IS NULL;

-- Certs: public verify, search, date-range
CREATE INDEX IF NOT EXISTS idx_gc_auto_number ON gold_certificate(auto_number)   WHERE deletedon IS NULL;
CREATE INDEX IF NOT EXISTS idx_sc_auto_number ON silver_certificate(auto_number) WHERE deletedon IS NULL;
CREATE INDEX IF NOT EXISTS idx_pc_auto_number ON photo_certificate(auto_number)  WHERE deletedon IS NULL;
CREATE INDEX IF NOT EXISTS idx_gc_created     ON gold_certificate(created DESC)   WHERE deletedon IS NULL;
CREATE INDEX IF NOT EXISTS idx_sc_created     ON silver_certificate(created DESC) WHERE deletedon IS NULL;
CREATE INDEX IF NOT EXISTS idx_pc_created     ON photo_certificate(created DESC)  WHERE deletedon IS NULL;
CREATE INDEX IF NOT EXISTS idx_gc_customer    ON gold_certificate(customer_id, status, deletedon);
CREATE INDEX IF NOT EXISTS idx_sc_customer    ON silver_certificate(customer_id, status, deletedon);

-- Cert snapshot hash: verification endpoint
CREATE INDEX IF NOT EXISTS idx_gc_hash ON gold_certificate(snapshot_hash)   WHERE snapshot_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sc_hash ON silver_certificate(snapshot_hash) WHERE snapshot_hash IS NOT NULL;

-- Items: FK traversal (list items for a test/cert)
CREATE INDEX IF NOT EXISTS idx_gti_test ON gold_test_item(gold_test_id, deletedon);
CREATE INDEX IF NOT EXISTS idx_sti_test ON silver_test_item(silver_test_id, deletedon);
CREATE INDEX IF NOT EXISTS idx_gci_cert ON gold_certificate_item(gold_certificate_id, deletedon);
CREATE INDEX IF NOT EXISTS idx_sci_cert ON silver_certificate_item(silver_certificate_id, deletedon);
CREATE INDEX IF NOT EXISTS idx_pci_cert ON photo_certificate_item(photo_certificate_id, deletedon);

-- Credit history: ledger page (customer + date range + type)
CREATE INDEX IF NOT EXISTS idx_ch_customer_type ON credit_history(customer_id, type, created);
CREATE INDEX IF NOT EXISTS idx_ch_created       ON credit_history(created DESC);
CREATE INDEX IF NOT EXISTS idx_wlh_created      ON weight_loss_history(created DESC);

-- Audit: action filter, entity+action compound
CREATE INDEX IF NOT EXISTS idx_audit_action        ON audit_logs(action, created DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity_action ON audit_logs(entity_type, action, created DESC);

-- Users: auth lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE deletedon IS NULL;

-- 🔒 VERSION TRIGGERS (OCC — increment when caller forgets to bump explicitly)
-- Fires only when version is NOT already bumped by the UPDATE statement,
-- preventing double-increment when withOptimisticLock() sets version = version + 1.
CREATE TRIGGER IF NOT EXISTS trg_gold_test_version
  AFTER UPDATE ON gold_test WHEN NEW.version = OLD.version
  BEGIN UPDATE gold_test SET version = OLD.version + 1 WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS trg_silver_test_version
  AFTER UPDATE ON silver_test WHEN NEW.version = OLD.version
  BEGIN UPDATE silver_test SET version = OLD.version + 1 WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS trg_gold_cert_version
  AFTER UPDATE ON gold_certificate WHEN NEW.version = OLD.version
  BEGIN UPDATE gold_certificate SET version = OLD.version + 1 WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS trg_silver_cert_version
  AFTER UPDATE ON silver_certificate WHEN NEW.version = OLD.version
  BEGIN UPDATE silver_certificate SET version = OLD.version + 1 WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS trg_photo_cert_version
  AFTER UPDATE ON photo_certificate WHEN NEW.version = OLD.version
  BEGIN UPDATE photo_certificate SET version = OLD.version + 1 WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS trg_customer_version
  AFTER UPDATE ON customer WHEN NEW.version = OLD.version
  BEGIN UPDATE customer SET version = OLD.version + 1 WHERE id = NEW.id; END;
