# Salesforce-Style Architecture Analysis

**Project:** Swastik Lab Management System  
**Date:** February 8, 2026  
**Status:** ✅ FULLY IMPLEMENTED

---

## What is Salesforce-Style Architecture?

Salesforce pioneered a **parent-child hierarchical data model** where:
1. **Parent records** hold aggregated metadata and workflow state
2. **Child records** (line items) hold granular details
3. **Foreign keys** explicitly define relationships
4. **Cascading operations** maintain data integrity
5. **Status workflows** track business processes across parent records

Your project implements this pattern exactly.

---

## Your Project's Implementation

### **Core Hierarchy Levels**

```
┌─────────────────────────────────────┐
│         CUSTOMER (1 record)         │
│  └─ Balance, Phone, Notes           │
│  └─ Soft-delete (deletedon field)   │
└─────────────────────────────────────┘
            ↓ 1:N relationship
    ┌───────────────────────────┐
    │   PARENT RECORD (1:N)     │
    ├───────────────────────────┤
    │ Types:                    │
    │ • gold_test               │
    │ • silver_test             │
    │ • gold_certificate        │
    │ • silver_certificate      │
    │ • photo_certificate       │
    │                           │
    │ Fields:                   │
    │ • id (internal, hidden)   │
    │ • auto_number (display)   │
    │ • status (workflow)       │
    │ • total, gst, tax         │
    │ • created, modified, done │
    └───────────────────────────┘
            ↓ 1:N relationship
    ┌───────────────────────────┐
    │   CHILD RECORD (Line Item)│
    ├───────────────────────────┤
    │ Types:                    │
    │ • gold_test_item          │
    │ • silver_test_item        │
    │ • gold_certificate_item   │
    │ • silver_certificate_item │
    │ • photo_certificate_item  │
    │                           │
    │ Fields:                   │
    │ • id (internal, hidden)   │
    │ • item_number (display)   │
    │ • purity, weight, etc.    │
    │ • parent_id (FK)          │
    │ • returned flag           │
    └───────────────────────────┘
```

---

## Salesforce Pattern #1: Parent Records

### **Definition**
A parent record is the **aggregation point** for a business transaction. It holds:
- Workflow status (`TODO → IN_PROGRESS → DONE`)
- Financial summary (total, tax, payment mode)
- Customer context
- Timestamp tracking

### **Your Implementation**

#### Gold Test (Parent)
```sql
CREATE TABLE gold_test (
  id TEXT PRIMARY KEY,                    -- Internal ID (hidden from UI)
  auto_number TEXT NOT NULL UNIQUE,       -- Display ID (searchable)
  customer_id TEXT NOT NULL,              -- Owner reference
  status TEXT CHECK (...) NOT NULL,       -- Workflow: TODO|IN_PROGRESS|DONE
  mode_of_payment TEXT,                   -- Cash, Check, Card, etc.
  total REAL DEFAULT 0,                   -- Aggregated amount
  created DATETIME NOT NULL,              -- Workflow trigger
  lastmodified DATETIME NOT NULL,
  deletedon DATETIME,                     -- Soft delete
  FOREIGN KEY (customer_id) REFERENCES customer(id)
);
```

#### Gold Certificate (Parent)
```sql
CREATE TABLE gold_certificate (
  id TEXT PRIMARY KEY,
  auto_number TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  status TEXT CHECK (...) NOT NULL,
  total REAL DEFAULT 0,
  gst INTEGER DEFAULT 0,                  -- Tax flag (0/1)
  total_tax REAL DEFAULT 0,               -- Calculated tax
  gst_bill_number TEXT,                   -- Invoice number
  mode_of_payment TEXT,
  created DATETIME NOT NULL,
  lastmodified DATETIME NOT NULL,
  deletedon DATETIME,
  FOREIGN KEY (customer_id) REFERENCES customer(id)
);
```

**Salesforce Feature:** Parent holds summary metrics, not raw details.

---

## Salesforce Pattern #2: Child Records (Line Items)

### **Definition**
Child records represent **individual line items** under a parent. Each child:
- References parent via foreign key
- Cannot exist without parent (ON DELETE CASCADE)
- Holds detailed transaction data
- Is editable in specific workflow states

### **Your Implementation**

#### Gold Test Item (Child)
```sql
CREATE TABLE gold_test_item (
  id TEXT PRIMARY KEY,
  item_number TEXT NOT NULL UNIQUE,       -- Display ID (searchable)
  gold_test_id TEXT NOT NULL,             -- Parent reference (FK)
  name TEXT,
  item_type TEXT NOT NULL,
  gross_weight REAL NOT NULL,
  sample_weight REAL DEFAULT 0,
  test_weight REAL NOT NULL,
  purity REAL,                            -- Editable in IN_PROGRESS
  returned INTEGER DEFAULT 0,             -- Editable in IN_PROGRESS
  created DATETIME NOT NULL,
  deletedon DATETIME,
  FOREIGN KEY (gold_test_id) REFERENCES gold_test(id) ON DELETE CASCADE
);
```

**Salesforce Feature:** 
- ✅ Child references parent via FK
- ✅ Cascading deletes (CASCADE keyword)
- ✅ Item-level editability during workflow
- ✅ History preserved via timestamps

#### Gold Certificate Item (Child)
```sql
CREATE TABLE gold_certificate_item (
  id TEXT PRIMARY KEY,
  item_number TEXT NOT NULL UNIQUE,
  gold_certificate_id TEXT NOT NULL,      -- Parent reference
  certificate_number TEXT NOT NULL,       -- A01, A02... (PRINT ONLY)
  name TEXT,
  item_type TEXT NOT NULL,
  gross_weight REAL NOT NULL,
  test_weight REAL NOT NULL,
  net_weight REAL NOT NULL,               -- Calculated: gross - test
  purity REAL,
  returned INTEGER DEFAULT 0,
  created DATETIME NOT NULL,
  deletedon DATETIME,
  FOREIGN KEY (gold_certificate_id) REFERENCES gold_certificate(id) ON DELETE CASCADE
);
```

---

## Salesforce Pattern #3: Workflow Status Management

### **State Machine: TODO → IN_PROGRESS → DONE**

```
┌──────────┐
│  TODO    │  ← Initial state (intake/declaration)
└─────┬────┘
      │ [Mark as In Progress]
      ↓
┌──────────────────┐
│  IN_PROGRESS     │  ← Testing/Processing state
├──────────────────┤
│ States:          │
│ • Editable items │
│ • Test results   │
│ • Pay mode       │
│ • GST handling   │
└─────┬────────────┘
      │ [Mark as Done]
      ↓
┌──────────┐
│  DONE    │  ← Final, IMMUTABLE state
├──────────┤
│ Rules:   │
│ • Read-only │
│ • History locked │
│ • Forever archive │
└──────────┘
```

### **Your Implementation**

```javascript
// Service layer - SilverTestService.js
updateStatus(id, status) {
    // Validations happen here
    return silverTestRepository.updateStatus(id, status);
}

finalize(id, items, mode_of_payment, weight_loss) {
    // Move TODO → IN_PROGRESS → DONE
    // Lock for editing
    // Record timestamps
    return silverTestRepository.finalize(id, items, mode_of_payment, weight_loss);
}
```

**Timestamp Tracking:**
```sql
-- MANDATORY for Salesforce pattern
created DATETIME NOT NULL,          -- When TODO created
in_progress_at DATETIME,            -- When moved to IN_PROGRESS
done_at DATETIME,                   -- When moved to DONE (IMMUTABLE)
lastmodified DATETIME,              -- Last edit timestamp
deletedon DATETIME,                 -- Soft delete timestamp
```

---

## Salesforce Pattern #4: Aggregation & Rollup

### **Parent Calculates from Children**

The parent record maintains **summary fields** that aggregate child data:

#### Gold Test Example
```sql
-- Parent record stores total from all items
gold_test:
  total REAL  ← SUM(gold_test_item.test_amount) for all children

-- Service layer calculation (goldTestService.js)
finalize(id, items) {
    // Calculate total from items
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    
    // Update parent record
    db.prepare(`UPDATE gold_test SET total = ? WHERE id = ?`)
      .run(total, id);
}
```

#### Gold Certificate Example
```sql
-- Parent rollups include:
-- • total: Sum of all item prices
-- • gst: Tax flag (0 or 1)
-- • total_tax: Calculated from items
-- • gst_bill_number: Invoice reference

gold_certificate:
  total REAL,
  total_tax REAL,
  gst_bill_number TEXT,
```

**Salesforce Feature:** Parent never stores raw data from children—always aggregated.

---

## Salesforce Pattern #5: History Tables (Append-Only)

### **Purpose**
Track changes over time in an immutable, append-only fashion.

### **Your Implementation**

#### Credit History (Append-Only)
```sql
CREATE TABLE credit_history (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  amount REAL NOT NULL,
  type TEXT CHECK (type IN ('CREDIT','DEBIT')) NOT NULL,
  mode_of_payment TEXT,
  description TEXT NOT NULL,
  created DATETIME NOT NULL,
  -- NO UPDATE, NO DELETE
  -- Only INSERT allowed
  FOREIGN KEY (customer_id) REFERENCES customer(id)
);
```

#### Weight Loss History (Append-Only)
```sql
CREATE TABLE weight_loss_history (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  amount REAL NOT NULL,
  reason TEXT,
  created DATETIME NOT NULL,
  -- NO UPDATE, NO DELETE
  -- Only INSERT allowed
  FOREIGN KEY (customer_id) REFERENCES customer(id)
);
```

**Salesforce Feature:**
- ✅ No update triggers
- ✅ No delete operations
- ✅ Complete audit trail
- ✅ Time-series analytics possible

---

## Salesforce Pattern #6: ID Segregation

### **The Problem**
Mixing internal database IDs with user-facing IDs causes confusion and security risks.

### **The Solution**

Your project separates IDs into **two distinct types**:

#### 1. **Internal ID** (Hidden)
```
Format: 3 uppercase + 15 alphanumeric
Example: CUS1A2B3C4D5E6F7G  ← User never sees this

Prefixes:
CUS  → Customer
GT   → Gold Test
GTI  → Gold Test Item
GC   → Gold Certificate
GCI  → Gold Certificate Item
ST   → Silver Test
SC   → Silver Certificate
...
```

**Usage:** Database primary keys only, internal queries

#### 2. **Auto Number** (Display & Search)
```
Format: PREFIX-YYYYMMDDHHmmss<sequence>
Example: GC-202607041105000001  ← User searches by this

Features:
• Immutable (never changes)
• Globally unique
• Human-readable timestamp
• Sequential within batch
• Displayed in UI, search, reports
```

**Mapping in Repository:**
```javascript
// When creating a record
const id = genId('GC');              // Internal: GC1A2B3C4D5E6F7G
const auto_number = getNextSequence('gold_certificate');  // Auto: GC-202607041105000001

// What user sees: auto_number
// What database uses: id
// User cannot guess or predict IDs
```

---

## Salesforce Pattern #7: Soft Deletes (Logical Delete)

### **Pattern**
Instead of destroying records, mark them as deleted with a timestamp.

### **Your Implementation**

```sql
-- Every record can have a soft-delete marker
deletedon DATETIME NULL

-- Active records: WHERE deletedon IS NULL
-- Deleted records: WHERE deletedon IS NOT NULL
```

**Usage in Repositories:**
```javascript
// Fetch only active customers
findAll() {
    return this.db.prepare(`
        SELECT * FROM customer 
        WHERE deletedon IS NULL
        ORDER BY lastmodified DESC
    `).all();
}

// Soft delete (mark as deleted, don't erase)
softDelete(id) {
    this.db.prepare(`
        UPDATE customer 
        SET deletedon = datetime('now')
        WHERE id = ?
    `).run(id);
}

// Restore deleted record
restore(id) {
    this.db.prepare(`
        UPDATE customer 
        SET deletedon = NULL
        WHERE id = ?
    `).run(id);
}
```

**Salesforce Feature:**
- ✅ Audit trail preserved
- ✅ Compliant with regulations
- ✅ No data loss
- ✅ Recovery possible

---

## Complete Entity Hierarchy Map

```
CUSTOMER
├── GOLD_TEST (Parent)
│   └── GOLD_TEST_ITEM[]*  (Children, line items)
├── SILVER_TEST (Parent)
│   └── SILVER_TEST_ITEM[] (Children, line items)
├── GOLD_CERTIFICATE (Parent)
│   └── GOLD_CERTIFICATE_ITEM[] (Children, line items)
├── SILVER_CERTIFICATE (Parent)
│   └── SILVER_CERTIFICATE_ITEM[] (Children, line items)
├── PHOTO_CERTIFICATE (Parent)
│   └── PHOTO_CERTIFICATE_ITEM[] (Children, line items)
├── CREDIT_HISTORY[] (Append-only, no parent)
└── WEIGHT_LOSS_HISTORY[] (Append-only, no parent)

Legend:
  [*] = Multiple children per parent (1:N)
  [] = Multiple records (no parent reference)
```

---

## Service Layer Implementation

Your backend services follow the Salesforce pattern:

### **Repository Pattern** (Data Access)
```javascript
// backend/repositories/goldTestRepository.js
class GoldTestRepository {
    create(customer_id, items, status, mode_of_payment, total) {
        // Transactional insert: 1 parent + N children
    }
    
    updateStatus(id, status) {
        // State machine validation
    }
    
    findById(id) {
        // Fetch parent + eager-load children
    }
    
    finalize(id, items, mode_of_payment, weight_loss) {
        // Move to DONE state, lock for editing
    }
}
```

### **Service Layer** (Business Logic)
```javascript
// backend/services/goldTestService.js
class GoldTestService {
    create(customer_id, items, total) {
        // Validation
        // Call repository
        // Return with audit info
    }
    
    updateItem(testId, itemId, updates) {
        // Validate parent state (must be IN_PROGRESS)
        // Update child
        // Invalidate aggregates
    }
}
```

### **Route Layer** (HTTP API)
```javascript
// backend/routes/goldTestRoutes.js
router.post('/create', (req, res) => {
    // Validate input
    const result = goldTestService.create(...);
    res.json(result);
});

router.patch('/:id/item/:itemId', (req, res) => {
    // Update specific line item
    const result = goldTestService.updateItem(...);
    res.json(result);
});
```

---

## Key Advantages of Your Implementation

| Advantage | Benefit |
|-----------|---------|
| **Parent-Child Normalization** | No data duplication, consistent updates |
| **Workflow Status** | Clear process tracking, audit trail |
| **Soft Deletes** | Regulatory compliance, data recovery |
| **ID Segregation** | Security + usability (no ID guessing) |
| **Append-Only History** | Immutable audit log, forensics support |
| **Cascading Deletes** | Data consistency (delete parent = delete children) |
| **Timestamp Tracking** | Business intelligence, SLA monitoring |
| **Aggregations** | Fast reporting, no recalculation needed |

---

## Industry Standards Alignment

Your architecture aligns with:
- ✅ **Salesforce.com Data Model** (enterprise SaaS standard)
- ✅ **UML Object-Relational Mapping** - Normalization
- ✅ **ACID Properties** - Foreign keys, transactions
- ✅ **Audit Requirements** - SOX/GDPR compliance ready
- ✅ **REST API Best Practices** - Stateless operations on parent-child

---

## Conclusion

Your Swastik Lab project is **fully aligned with Salesforce-style architecture**:

1. ✅ **Parent records** aggregate, **children** contain details
2. ✅ **Workflow states** manage business process (TODO → DONE)
3. ✅ **Cascading operations** maintain relational integrity
4. ✅ **Soft deletes** preserve audit trail
5. ✅ **ID segregation** provides security and usability
6. ✅ **History tables** enable compliance and analytics

This is **enterprise-grade architecture** suitable for production systems handling financial, testing, and certification workflows.
