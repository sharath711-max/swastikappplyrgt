PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;

-- 👤 USERS (Single login)
-- 👤 USERS (Single login)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'admin' or 'user'
  created DATETIME NOT NULL,
  lastmodified DATETIME NOT NULL,
  deletedon DATETIME
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
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  balance REAL DEFAULT 0,
  gold_weight_balance REAL DEFAULT 0,
  silver_weight_balance REAL DEFAULT 0,
  notes TEXT,
  created DATETIME NOT NULL,
  lastmodified DATETIME NOT NULL,
  deletedon DATETIME
);

CREATE INDEX IF NOT EXISTS idx_customer_phone ON customer(phone);

-- 🧪 TESTS (PARENT)
CREATE TABLE IF NOT EXISTS gold_test (
  id TEXT PRIMARY KEY,
  auto_number TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('TODO','IN_PROGRESS','DONE')) NOT NULL,
  mode_of_payment TEXT,
  total REAL DEFAULT 0,
  created DATETIME NOT NULL,
  in_progress_at DATETIME,
  done_at DATETIME,
  lastmodified DATETIME NOT NULL,
  deletedon DATETIME,
  FOREIGN KEY (customer_id) REFERENCES customer(id)
);

CREATE TABLE IF NOT EXISTS silver_test (
  id TEXT PRIMARY KEY,
  auto_number TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('TODO','IN_PROGRESS','DONE')) NOT NULL,
  mode_of_payment TEXT,
  total REAL DEFAULT 0,
  created DATETIME NOT NULL,
  in_progress_at DATETIME,
  done_at DATETIME,
  lastmodified DATETIME NOT NULL,
  deletedon DATETIME,
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
  id TEXT PRIMARY KEY,
  auto_number TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,

  status TEXT CHECK (status IN ('TODO','IN_PROGRESS','DONE')) NOT NULL,

  total REAL DEFAULT 0,
  gst INTEGER DEFAULT 0,              -- 0 / 1
  total_tax REAL DEFAULT 0,
  gst_bill_number TEXT,
  mode_of_payment TEXT,

  created DATETIME NOT NULL,
  lastmodified DATETIME NOT NULL,
  deletedon DATETIME,

  FOREIGN KEY (customer_id) REFERENCES customer(id)
);

CREATE TABLE IF NOT EXISTS silver_certificate (
  id TEXT PRIMARY KEY,
  auto_number TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,

  status TEXT CHECK (status IN ('TODO','IN_PROGRESS','DONE')) NOT NULL,

  total REAL DEFAULT 0,
  gst INTEGER DEFAULT 0,
  total_tax REAL DEFAULT 0,
  gst_bill_number TEXT,
  mode_of_payment TEXT,

  created DATETIME NOT NULL,
  lastmodified DATETIME NOT NULL,
  deletedon DATETIME,

  FOREIGN KEY (customer_id) REFERENCES customer(id)
);

CREATE TABLE IF NOT EXISTS photo_certificate (
  id TEXT PRIMARY KEY,
  auto_number TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('TODO','IN_PROGRESS','DONE')) NOT NULL,
  total REAL DEFAULT 0,
  gst INTEGER DEFAULT 0,
  total_tax REAL DEFAULT 0,
  gst_bill_number TEXT,
  mode_of_payment TEXT,
  created DATETIME NOT NULL,
  in_progress_at DATETIME,
  done_at DATETIME,
  lastmodified DATETIME NOT NULL,
  deletedon DATETIME,
  FOREIGN KEY (customer_id) REFERENCES customer(id)
);

-- 📄 CERTIFICATE ITEMS (CHILD)
CREATE TABLE IF NOT EXISTS gold_certificate_item (
  id TEXT PRIMARY KEY,
  item_number TEXT NOT NULL UNIQUE,
  gold_certificate_id TEXT NOT NULL,

  certificate_number TEXT NOT NULL,   -- A01, A02 (PRINT ONLY)

  name TEXT,
  item_type TEXT NOT NULL,
  gross_weight REAL NOT NULL,
  test_weight REAL NOT NULL,
  net_weight REAL NOT NULL,
  purity REAL,
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
  gross_weight REAL NOT NULL,
  test_weight REAL NOT NULL,
  net_weight REAL NOT NULL,
  purity REAL,
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
  gross_weight REAL,
  test_weight REAL,
  net_weight REAL,
  purity REAL,
  returned INTEGER DEFAULT 0,
  media_path TEXT,
  created DATETIME NOT NULL,
  lastmodified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deletedon DATETIME,
  FOREIGN KEY (photo_certificate_id)
    REFERENCES photo_certificate(id) ON DELETE CASCADE
);

-- 💰 CREDIT HISTORY (APPEND ONLY)
CREATE TABLE IF NOT EXISTS credit_history (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  amount REAL DEFAULT 0,
  weight REAL DEFAULT 0,
  weight_type TEXT CHECK (weight_type IN ('GOLD','SILVER','NONE')) DEFAULT 'NONE',
  type TEXT CHECK (type IN ('CREDIT','DEBIT')) NOT NULL,
  mode_of_payment TEXT,
  description TEXT NOT NULL,
  created DATETIME NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customer(id)
);

-- ⚖️ WEIGHT LOSS HISTORY (APPEND ONLY)
CREATE TABLE IF NOT EXISTS weight_loss_history (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  amount REAL NOT NULL,
  reason TEXT,
  created DATETIME NOT NULL,
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
CREATE TRIGGER IF NOT EXISTS update_gc_lastmodified AFTER UPDATE ON gold_certificate BEGIN UPDATE gold_certificate SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_sc_lastmodified AFTER UPDATE ON silver_certificate BEGIN UPDATE silver_certificate SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_pc_lastmodified AFTER UPDATE ON photo_certificate BEGIN UPDATE photo_certificate SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS update_gti_lastmodified AFTER UPDATE ON gold_test_item BEGIN UPDATE gold_test_item SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_sti_lastmodified AFTER UPDATE ON silver_test_item BEGIN UPDATE silver_test_item SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_gci_lastmodified AFTER UPDATE ON gold_certificate_item BEGIN UPDATE gold_certificate_item SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_sci_lastmodified AFTER UPDATE ON silver_certificate_item BEGIN UPDATE silver_certificate_item SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_pci_lastmodified AFTER UPDATE ON photo_certificate_item BEGIN UPDATE photo_certificate_item SET lastmodified = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

-- 📋 AUDIT LOGS (Gap 3: Compliance — who changed what)
CREATE TABLE IF NOT EXISTS audit_logs (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  username    TEXT NOT NULL,
  action      TEXT NOT NULL,          -- e.g. 'UPDATE_PURITY', 'UPDATE_WEIGHT', 'STATUS_CHANGE'
  entity_type TEXT NOT NULL,          -- e.g. 'gold_test_item', 'gold_test'
  entity_id   TEXT NOT NULL,
  field       TEXT,                   -- which field changed
  old_value   TEXT,
  new_value   TEXT,
  created     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address  TEXT
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user   ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_ts     ON audit_logs (created DESC);
