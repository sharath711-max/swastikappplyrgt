# MASTER SYSTEM RULES

> **AUTHORITATIVE SOURCE**
> Any implementation that contradicts this document is WRONG.

## 0. CORE PRINCIPLES (NON-NEGOTIABLE)
1. **Salesforce-style Parent → Child normalization**
2. **Phase-based workflow**: TODO → IN_PROGRESS → DONE
3. **No JSON blobs** for business data
4. **Internal IDs are NEVER shown** to users
5. **Auto Numbers are the ONLY global/searchable identifiers**
6. **Certificate Numbers are PRINT-only identifiers**
7. **Single login, two physical systems** (Front Desk & Lab)
8. **Backend is the single source of truth**
9. **History tables are append-only**
10. **DONE state is immutable forever**

## 1. ID & NUMBERING STANDARDS

### Internal ID (DB only)
- **Format**: 18 chars: 3 uppercase letters + 15 alphanumeric
- **Regex**: `^[A-Z]{3}[A-Za-z0-9]{15}$`
- **Source**: Generated server-side
- **Visibility**: Never exposed to UI

### Auto Number (Displayed & searchable)
- **Format**: `<PREFIX>-<yyyyMMddHHmmss><sequence>`
- **Examples**: GT-…, GTI-…, GC-…, GCI-…
- **Source**: Generated via globals
- **Properties**: Immutable
- **Usage**: Search, Kanban, list views, navigation

## 2. CERTIFICATE NUMBER (PRINT ONLY)
- **Format**: A01, A02…
- **Location**: Exists ONLY in Certificate ITEM tables
- **Usage**: Used ONLY in certificate print layout
- **Editability**: Editable ONLY during TODO (creation), Read-only afterwards
- **Restriction**: NEVER used for search or navigation
- **Rule**: Auto Number ≠ Certificate Number (never interchangeable)

## 3. SYSTEM MODES
- **Concept**: Single login, two physical systems
- **Modes**: `FRONT_DESK`, `LAB`
- **Control**: Mode is set via environment/config and enforced by backend. **No UI switching.**

## 4. DATA MODEL (FINAL)

### Customer
- `id`, `name` (≥2 chars), `phone` (10 digits optional), `balance` (info), `notes`

### Tests (Parent)
- **Tables**: `gold_test`, `silver_test`
- **Fields**: `id`, `auto_number`, `customer_id`, `status`, `mode_of_payment`, `total`, `created`, `in_progress_at`, `done_at`
- **Status Enum**: TODO / IN_PROGRESS / DONE

### Test Items (Child)
- **Tables**: `gold_test_item`, `silver_test_item`
- **Fields**: `id`, `item_number`, `parent_test_id`, `name`, `item_type`, `gross_weight`, `sample_weight`, `test_weight`, `purity`, `returned`

### Certificates (Parent — FINANCIAL OWNER)
- **Tables**: `gold_certificate`, `silver_certificate`, `photo_certificate`
- **Fields**: `id`, `auto_number`, `customer_id`, `status`, `total`, `gst` (0/1), `total_tax`, `gst_bill_number`, `mode_of_payment`, `created`, `in_progress_at`, `done_at`

### Certificate Items (Child)
- **Tables**: `gold_certificate_item`, `silver_certificate_item`, `photo_certificate_item`
- **Fields**: `id`, `item_number`, `parent_certificate_id`, `certificate_number` (PRINT ONLY), `name`, `item_type`, `gross_weight`, `test_weight`, `net_weight`, `purity`, `returned`, `media_path` (Photo Cert Item only)

### Credit History (CH) — Append-only
- `id`, `customer_id`, `amount`, `type` (CREDIT/DEBIT), `mode_of_payment`, `description`, `created`

### Weight Loss History (WLH) — Append-only
- `id`, `customer_id`, `amount`, `reason`, `created`

### Globals
- `key`, `value` (auto-number sequences, counters, config)

## 5. STATE TIMESTAMPS (MANDATORY)
Each parent record MUST track:
- `created` → when TODO is created
- `in_progress_at` → when moved to IN_PROGRESS
- `done_at` → when moved to DONE

**Rules**:
- Set only once
- Never editable
- Displayed read-only in UI
- DONE records must always have `done_at`

## 6. TODO STATE (INTAKE ONLY)
- **Who**: Front Desk system
- **Purpose**: Capture what customer gives (declaration only)
- **Allowed**: Customer search, Item rows (Name, Item Type, Gross Wt, Sample Wt, Returned, Certificate Number)
- **Forbidden**: Purity, Photo upload, Payment/GST, Mode of payment
- **UI**: Delete icon only if >1 item, Auto numbers hidden
- **DB**: Insert parent (TODO) + child items, Set `created` timestamp

## 7. IN_PROGRESS STATE (TEST / PHOTO / PAYMENT)
- **Who**: Lab system
- **Purpose**: Record truth and evidence
- **Item-level editable**: Purity (0 < purity ≤ 100), Returned flag, Photo upload (Photo Cert only)
- **Parent-level editable**: Mode of payment, Total, GST flag, GST bill number, Total tax
- **Validations**: Every item must have purity, Photo Cert must have photo per item, Payment must be completed
- **DB**: Update child purity/media, Update parent financials, Set `in_progress_at` if first entry

## 8. DONE STATE (IMMUTABLE)
- **Meaning**: Certified, issued, final
- **Rules**: NO edits, NO deletes, NO uploads, NO payment changes
- **UI**: Fully read-only, View / Print / Export only
- **API**: Any update attempt → `409 CONFLICT`
- **DB**: No UPDATE or DELETE allowed
- **Set**: `done_at` timestamp

## 9. PHOTO CERTIFICATE SPECIAL RULES
- Photo upload exists **ONLY** for Photo Certificate
- Allowed **ONLY** in `IN_PROGRESS`
- GC / SC / Tests never upload photos
- Backend rejects photo fields for GC / SC

## 10. UI GLOBAL RULES
- Never show internal IDs
- Always show Auto Numbers
- Certificate Numbers shown only in print preview
- Search by Auto Number / Customer name / Phone
- Record pages use Tabs: Details, Related Lists
- Kanban cards show latest state date

## 11. BACKEND ENFORCEMENT
- Enforce modes and phase transitions
- Enforce immutability after DONE
- Reject illegal field updates
- Ignore frontend-generated IDs/numbers
- Validate all calculations

## 12. MIGRATION (ONE-TIME)
- **Old system**: Bundled parent + item rows, Manual certificate numbers, Flat / JSON storage
- **Migration Rules**:
    1. Group old rows → ONE parent
    2. Each old row → ONE child
    3. Generate NEW auto numbers
    4. Copy old certificate numbers → `item.certificate_number`
    5. Set migrated status = DONE
    6. Populate `created` / `in_progress_at` / `done_at`
    7. Migration must be idempotent and verifiable

## 13. FINAL SYSTEM LAW
- TODO = intent
- IN_PROGRESS = verification
- DONE = history
- History never changes.
- IDs are for machines.
- Auto numbers are for humans.
- Certificate numbers are for print only.
- Every state leaves a timestamp footprint.
