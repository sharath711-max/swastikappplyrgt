# Historical Truth Policy

This policy governs the **Authority Domain of Truth** for the Swastik migration and live operations. It establishes the canonical rules that define authoritative history, mutability constraints, print snap-shotting, reprint semantics, audits, and operational oversight.

---

## 1. Authoritative Source Hierarchy

The system contains multiple denormalized and cached representations of data for performance and offline capability. In the event of a discrepancy, the canonical hierarchy of truth is resolved as follows:

| Data Domain | Primary Authority | Secondary/Denormalized Cached Copy | Resolution Rules |
| :--- | :--- | :--- | :--- |
| **Financial Ledger** | `credit_history` (Append-only records) | `customer.balance` (Denormalized summary) | If the sum of `credit_history` ledger entries diverges from `customer.balance`, the ledger is the absolute source of truth. The balance must be recalculated and updated to match the ledger. |
| **Cash Journal** | `cash_register` (Append-only cash journal) | Physical cash counts / Outer reports | The `cash_register` is the absolute record of cash movement. Discrepancies represent leakage or human error and must be reconciled via audited `OUT` or `IN` corrections. |
| **Certificate Financials** | Sum of items (`gold_certificate_item.item_total`) | Parent `gold_certificate.total` | If a parent certificate's total diverges from the sum of its items, the items win. Parent totals are calculated dynamically or rolled up via canonical calculation services (`CertificateCalculationService`). |
| **Historical Output** | `print_snapshot` (Signed JSON envelope) | Current live database tables (`gold_certificate`, `customer`, etc.) | For any record in a finalized `DONE` state, the `print_snapshot` is the supreme authority for rendering. Live rows are ignored to prevent historical drift. |

---

## 2. Immutable vs. Mutable States

To prevent tampering and ensure institutional accountability, records are subject to strict state-based mutability limits:

*   **Draft States (`TODO`, `IN_PROGRESS`):**
    *   **Mutability:** Fully mutable. Operators can edit weights, purities, customer references, and items.
    *   **Enforcement:** Calculations are performed live via Calculation Services.
*   **Finalized State (`DONE`):**
    *   **Mutability:** Strictly **IMMUTABLE**.
    *   **Enforcement:**
        *   Database updates to parent tables or child item tables are blocked at the repository level (`updateResults` and `updateItem` throw a `409: Certificate is immutable` error).
        *   Backward status changes (e.g., from `DONE` back to `IN_PROGRESS` or `TODO`) are strictly prohibited in `updateStatus`.

---

## 3. Snapshot Authority & HMAC Sealing

To guarantee that business truth survived restoration and is protected against database-level manipulation, all finalized records must be sealed using cryptographic integrity proofs.

*   **Sealing Trigger:** Moving a record from `IN_PROGRESS` to `DONE` triggers the automatic generation of a print snapshot envelope.
*   **Integrity Proof:** The snapshot envelope contains:
    *   `version`, `schema_version`, and `serialization_version` to prevent version downgrade attacks.
    *   A stable-serialized JSON payload of the entire layout (`data` key with sorted object keys).
    *   A cryptographic HMAC signature (`snapshot_hash`) generated using SHA-256 and the server-configured `SNAPSHOT_SECRET`.
*   **Authority Rule:** Once sealed, the `print_snapshot` is locked in time. Even if a customer's profile is subsequently edited (e.g., name correction) or a child item is soft-deleted, the historic print snapshot remains the unchanged authority. This prevents **reprint drift** where subsequent edits to a customer retroactively alter previously issued certificates.

---

## 4. Reprint Rules & Downgrade Prevention

Reprinting certificates and receipts is a critical governance boundary. It is governed by the following strict rules:

*   **Source Authority:** Reprints of `DONE` records **MUST** use the validated, extracted `print_snapshot` from the database. Generating reprints from live database rows is prohibited.
*   **Integrity Enforcement:**
    *   The system must calculate the HMAC of the `print_snapshot` and verify it matches the stored `snapshot_hash` before rendering.
    *   Any verification failure throws a `SNAPSHOT_INTEGRITY_FAILURE` error, blocking the print and raising a critical alert.
*   **Downgrade Protection:** The verification service validates envelope versions (`version`, `schema_version`, `serialization_version`). If the snapshot's versions exceed the server's current maximums, the request is rejected with a database corruption error.
*   **Audit Logging:** Every reprint action triggers an audit record (`PRINT_TRIGGERED`) containing the IP address, user agent, actor ID, and snapshot hash for forensic accountability.

---

## 5. Correction Semantics & Audit Logs

Errors discovered after finalization (`status = 'DONE'`) cannot be corrected by editing the record. They must follow governance-grade correction semantics:

1.  **Immutability Bypass Blocked:** Direct SQL updates to `DONE` certificate tables are prohibited.
2.  **Soft-Delete and Re-Create (Standard Correction Path):**
    *   The incorrect certificate must be soft-deleted. The system updates the `deletedon` timestamp on the parent and child rows.
    *   A new draft certificate is created with the correct data, going through the standard `TODO` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `DONE` workflow.
3.  **Financial Adjustment Path:**
    *   If a payment error occurred, the customer's balance must be adjusted by posting an audited `DEBIT` or `CREDIT` row to `credit_history`.
    *   Each adjustment must include a unique `request_id` for idempotency and duplicate prevention.
4.  **Audit Logs:** All changes are recorded in `audit_logs` containing:
    *   `request_id` (correlation trace ID).
    *   `user_id` & `username` (actor identity).
    *   `action` type (`STATUS_CHANGE`, `PRINT_TRIGGERED`, etc.).
    *   `entity_type` & `entity_id` (targets).
    *   Old vs. new values.

---

## 6. Reconciliation & Divergence Handling

Unreconciled balances represent an operational failure. Regular integrity audits are enforced to surface and resolve divergences:

*   **Automated Verification:** The administrative toolset includes the `reconcile_ledger.js` suite, which detects:
    *   Finalized `DONE` certificates missing a corresponding `DEBIT` entry in `credit_history` (missed charges).
    *   Certs with multiple `DEBIT` entries (duplicate charges).
    *   `DONE` certificates missing a cryptographic snapshot seal (`snapshot_hash` is null or empty).
    *   Stalled drafts in `IN_PROGRESS` status for more than 24 hours.
    *   `credit_history` records with unrecognized reference types.
*   **Resolution Protocol:** Any flagged issue must be escalated to the administrator. Divergences must be resolved by posting audited adjusting entries, never by direct table edits.

---

## 7. Operator Visibility & Management Review

Authority truth must be transparent to operators and verifiable by management:

*   **Operator Dashboard:** The frontend surfaces the status of records clearly (`TODO`, `IN_PROGRESS`, `DONE`). `DONE` records are explicitly marked as locked and final.
*   **Audit Trail Access:** Management has exclusive access to the audit trail to trace modifications, reprints, and soft-deletes.
*   **Mode Transitions:** Changing the system mode (e.g., from `STRICT` enforcement to Python-compatible `PARITY` mode) bypasses key idempotency and verification rules. This is a high-risk operational action that **requires formal, written management sign-off** and a corresponding configuration audit record.

---

## 8. Business Sign-Off Questions

Before go-live governance can proceed, the management team must review this policy and sign off on the following operational realities:

| Operational Reality | Verification / Review Question | Business Sign-off (Yes/No) |
| :--- | :--- | :--- |
| **Immutability of DONE records** | Do you accept that once a certificate or test is marked `DONE`, it cannot be edited under any circumstances? | |
| **Correction Workflow** | Do you accept that errors on `DONE` records can only be corrected by soft-deleting them and re-creating them? | |
| **Reprint Authority** | Do you accept that reprints will render the exact historical snapshot captured on completion, regardless of subsequent customer profile changes? | |
| **Mode Audit Requirements** | Do you accept that switching the system to `PARITY` mode requires formal authorization, since it disables strict duplicate checks? | |
