# Day-End Reconciliation Report (Operational Closure Truth)

This policy governs the **Operational Closure Domain of Truth** for Swastik Gold & Silver Lab. It defines the formal governance framework, daily reconciliation invariants, audit checklists, and management sign-off criteria required to answer the ultimate business trust question:

> **“Can management safely declare the business day reconciled and close operational books?”**

Operational closure is the final checkpoint of institutional truth. It relies entirely on **Authority Truth**—if records in a terminal `DONE` state mutated silently, if ledgers were not immutable, or if print snapshots drifted, day-end reconciliation would be mathematically and operationally meaningless. Restoring runtime immutability is the prerequisite for this closure layer.

---

## 1. The Day-End Reconciliation Hierarchy

Reconciliation is not a simple "totals export" or a printout of the day's dashboard. It is a comprehensive mathematical proof of the system's ledger, cash flow, and metal audit integrity. The hierarchy of reconciliation verification is structured as follows:

| Verification Layer | Primary Proof Method | Target Objective | Acceptable Variance |
| :--- | :--- | :--- | :--- |
| **Financial Ledger** | Append-only ledger correlation (`credit_history` sum vs. customer aggregate balance) | Verify mathematical ledger parity. | **0.00 (Zero)** |
| **Cash Journal** | `cash_register` journal balance vs. Physical Cash in Drawer count | Detect cash leakage, theft, or operator errors. | **0.00 (Zero)** |
| **UPI/Bank Journal** | Appended UPI transactions vs. Bank Settlement/Gateway statement | Ensure all UPI/Digital charges cleared successfully. | **0.00 (Zero)** |
| **Metal Inventory** | Weight-loss logs in `weight_loss_history` vs. Physical Gold/Silver waste | Track testing loss and refine operations. | **±0.05g** (Refinery threshold) |
| **Document Integrity** | Static `print_snapshot` HMAC check on all certificates completed today | Prevent reprint drift and verify cryptographic seal. | **0.00 (Zero)** |

---

## 2. Nine Domains of Reconciliation Proof

To safely seal a business day, management must audit the **Nine Domains of Reconciliation Proof**. The system's automated toolset (such as `reconcile_ledger.js` and audit logs) must generate reports satisfying each domain.

### 2.1. Operational Closure Completeness
*   **The Invariant:** Every job started today must reside in a correct terminal state (`DONE` or soft-deleted) or be explicitly carried over as an authorized draft.
*   **The Check:** Run a query for any drafts (`TODO`, `IN_PROGRESS`) created today. All pending records must have a recorded operational justification (e.g., "Waiting on customer metal pickup tomorrow").
*   **The Guard:** Stalled drafts in `IN_PROGRESS` for more than 24 hours are automatically flagged by `reconcile_ledger.js` for administrator review.

### 2.2. Reconciliation Explainability
*   **The Invariant:** Total income reported in the system must match the sum of item fees.
*   **The Check:** For all certificates and tests finalized today:
    $$\text{Sum of Certificate Parent Totals} = \sum (\text{Gold Item Fees} \times 50) + \sum (\text{Silver Item Fees} \times 100)$$
*   **The Guard:** If a parent certificate's total diverges from the dynamic calculation of its child items, the dynamic item rollup wins, and the discrepancy must be flagged.

### 2.3. Discrepancy Visibility
*   **The Invariant:** Aggregate changes in customer balances must perfectly align with ledger entries posted today.
*   **The Check:**
    $$\sum_{c} \Delta \text{customer.balance}_c = \sum \text{credit\_history.amount (DEBITs)} - \sum \text{credit\_history.amount (CREDITs)}$$
*   **The Guard:** Any divergence flags a database corruption or manual update breach. The affected customer accounts are immediately locked from further transactions until reconciled.

### 2.4. Unresolved Due Visibility
*   **The Invariant:** No customer may carry outstanding balances from today's transactions without an active, audited credit limit ledger entry.
*   **The Check:** Review all finalize actions today that used `mode_of_payment = 'Balance'`. Ensure the customer has a matching, valid record in `credit_history` incrementing their balance.
*   **The Guard:** Unpaid balances are aggregated and listed on the Day-End Report as "Active Administrative Receivables," categorized by aging.

### 2.5. GST Traceability
*   **The Invariant:** GST charges compiled on invoices must perfectly match the tax percentage of taxable transactions.
*   **The Check:** Reconcile taxable transactions vs. tax-exempt transactions.
    $$\text{GST Collected Today} = \sum (\text{Taxable Invoices} \times \text{GST Rate})$$
*   **The Guard:** GST reports are correlated with state-level invoice sequence numbers to ensure no missing invoices.

### 2.6. Cash/UPI Consistency
*   **The Invariant:** Digital and physical cash receipts must be isolated and reconciled independently.
*   **The Check:**
    *   Compare `cash_register` ledger balance against physical cash count.
    *   Compare the UPI ledger records against external bank transaction hashes.
*   **The Guard:** UPI transactions must include the bank's Transaction Reference ID. No UPI transaction may be finalized in the ledger without this reference.

### 2.7. Weight-Loss Traceability
*   **The Invariant:** Every scrap of metal consumed or lost during testing must be logged to prevent inventory leakage.
*   **The Check:**
    *   Sum of weight loss recorded in finalized tests (`weight_loss_history`).
    *   Audit reasons to verify they match the canonical lowercase format (e.g., `gold test finalization: GTS...`).
*   **The Guard:** High-variance weight loss (e.g., > 1.0g on a single test) is flagged for immediate management inspection.

### 2.8. Module Completeness
*   **The Invariant:** Independent accounting across modules (Gold testing vs. Silver testing vs. Certificate printing) must tie back to the master cash register.
*   **The Check:** Ensure each module's transaction counters incremented consecutively without gaps.
*   **The Guard:** Any gaps in sequence numbers (e.g., `GCR-101` then `GCR-103` without `GCR-102`) indicate unauthorized deletion or database state tampering and trigger a critical integrity alert.

### 2.9. Exception Visibility
*   **The Invariant:** Every high-risk operational action must be surfaced, audited, and reviewed.
*   **The Check:** Compile all exceptions logged today in `audit_logs`:
    *   All soft-deletes of finalized records (`DELETE_TEST`, `DELETE_CERTIFICATE`).
    *   All failed transaction attempts (e.g., double finalization blocks throwing 409).
    *   Any manual ledger adjustments (`CREDIT`/`DEBIT` posted without certificate link).
    *   Any transitions into `PARITY` mode.
*   **The Guard:** Parity mode runs must be highlighted in red with active warnings since they represent relaxed guard states.

---

## 3. Reconciliation Protocol & Remediation

When automated tools detect a divergence, operators are **strictly prohibited** from directly editing database rows or running raw SQL patches to "make the numbers work." The remediation path must preserve historical truth:

1.  **Divergence Isolation:** The administrator must isolate the diverging record (e.g., a customer whose balance diverges from their ledger).
2.  **Audit Trail Inspection:** Inspect the `audit_logs` and request correlation IDs to find the origin of the discrepancy.
3.  **Audited Adjustment Entry:** Write an audited adjusting ledger entry.
    *   For cash discrepancies, post an `IN` or `OUT` adjustment to `cash_register` with a detailed, signed reason.
    *   For customer balance discrepancies, post a credit/debit to `credit_history` to align the denormalized balance with the ledger.
4.  **No Immutability Violations:** Finalized certificates in `DONE` status are locked. Corrections to actual certificate details are strictly executed by soft-deleting the old certificate and creating a new one.

---

## 4. Management Day-End Closure Checklist

Before closing the cash drawer and declaring the operational day sealed, a manager must physically review the day's reports and answer the following operational closure questions:

| Domain | Day-End Closure Verification Question | Required Output / Evidence | Manager Sign-Off (Yes/No) |
| :--- | :--- | :--- | :--- |
| **Completeness** | Are there any active `TODO` or `IN_PROGRESS` records created today that are not authorized to carry over to tomorrow? | Query returns zero unauthorized drafts. | |
| **Financial Ledger** | Has the sum of `credit_history` been cross-checked against customer balances, and did it pass with zero variance? | `reconcile_ledger.js` output: **PASS** | |
| **Cash Control** | Does the physical cash in the drawer match the `cash_register` journal balance exactly? | Zero variance between physical count and system cash balance. | |
| **UPI Reconciliation** | Have all UPI transaction reference IDs from today been verified against the bank gateway statements? | Gateway statement matches system UPI report. | |
| **Tax Traceability** | Do today's GST aggregates match the taxable invoice rollup without sequence gaps? | Continuous sequence, matching tax ledger. | |
| **Weight Control** | Have all gold and silver testing weight-loss records been reviewed for high-variance exceptions? | Weight loss report signed off by lead tester. | |
| **Exception Audit** | Have all soft-deletes and manual overrides from today been reviewed and justified? | Audit log exception summary attached to day report. | |
| **Snapshot Seal** | Do all certificates completed today have valid cryptographic HMAC seals (`snapshot_hash` verified)? | Integrity service returns **100% SECURE**. | |
| **Mode Parity** | Was the system run in `STRICT` mode today? If `PARITY` mode was toggled, is the signed authorization form attached? | System mode log check. | |

> **Operational Declaration:** By signing below, management certifies that the operational day is reconciled, all discrepancies have been audited or corrected via official ledger adjustments, and the system state is declared **Closed & Trusted**.
>
> **Manager Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  **Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
