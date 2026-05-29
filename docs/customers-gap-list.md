# Customers Surface Gap List — Python → SERN

**Status:** Tracking · **Owner:** TBD · **Last reframe:** 2026-05-29

Companion to [dashboard-gap-list.md](./dashboard-gap-list.md). Same framing, scoped to the Customer list + profile surfaces.

## Architectural framing

Python's customer surface is a **directory + transaction ledger**: dense DataTable for scan; flat workflow-history tabs (GT / GC / SC / PC / Balance) per customer, each row showing the *operational shape* of that record (sample weights, purity, mode of payment, GST, status). The operator reaches a customer, then reaches a record's working details, in two glances.

SERN's customer surface ([frontend/src/pages/Customers.js](../frontend/src/pages/Customers.js), [frontend/src/pages/CustomerProfile.js](../frontend/src/pages/CustomerProfile.js)) has drifted into a **CRM-style card grid + analytics profile**: avatar cards on the list, then a 3-tab Overview/Records/Timeline profile where workflow records are buried inside an accordion that exposes only `record# / date / total`. Operational shape (purity, sample weight, payment mode, GST, status) is hidden behind a deep-link into each record.

> **Verdict.** Same as Dashboard: don't migrate the screens. Migrate operator scan-throughput, decision cognition, and the governance additions that already justify their cost.

Classification key — **RHY** = operator rhythm (P-D scope) · **COG** = cognition restoration · **GOV** = governance posture (keep / earn / remove) · **INF** = informational only · **SKIP** = Python decoration not worth porting.

---

## Hardened reclassification matrix

| # | Gap | Nature | Initial Sev | Corrected Sev | Justification |
|---|---|---|---|---|---|
| 1 | **Client-side filter over full customer dump** — `GET /customers` returns every row, JS filters in-memory. Python used server-side AJAX DataTable with paged search across name / phone / balance / notes. | RHY | MED | **HIGH** | Same scalability wall as the Dashboard searchable dropdown (Dashboard gap #3). Degrades past ~150-200 customers — initial fetch latency + memory + slow filter keystroke response. Throughput chokepoint at production scale ⇒ HIGH floor. |
| 2 | **Card grid replaces dense table** — 3 customers per row × ~3 rows visible ≈ 9 customers per fold. Python's DataTable shows ~20 rows per fold at the same viewport, with phone / balance scannable in one horizontal sweep. | RHY | MED | **HIGH** | Halves visual scan throughput per page. Operator looking for "the customer who came in yesterday with the 18g chain" reads card → card → card instead of one column-sweep. Recurring intake operation — HIGH floor. |
| 3 | **Initial Balance field missing on Add Customer** — Python's add-customer modal captured `balance` directly; SERN's [NewCustomerModal.js](../frontend/src/components/NewCustomerModal.js) accepts only Name / Phone / Notes. Opening balance for legacy / migration customers must now route through: Save → open profile → Records tab → Credit History accordion → Add. | RHY | MED | **HIGH** | Intake-decision input regression per [[feedback_legacy_migration_philosophy]]. Multi-step workflow for what was a single-form action. HIGH floor. |
| 4 | **Sample details (total / test / purity) absent from profile records** — Python's accordion row shows `total/test - purity%` inline per item, plus mode of payment, plus total, plus per-record status badge in the header. SERN's RelatedList columns are only `Record No / Date / Total / Action`. | COG | MED | **HIGH** | Forces drill-down navigation that Python avoided. Customer profile is operator's reconciliation surface — "did we test this chain at 91.6% or 75%?" used to be one expand-accordion glance, now requires loading the full record page. HIGH floor. |
| 5 | **Mode of payment + GST columns absent from cert / test rows** — Python showed both per row; SERN's RelatedList omits both. | COG | MED | **MED** | Reduces per-row forensic visibility. Less load-bearing than #4 but still operator-cognition loss. |
| 6 | **Status badge buried inside accordion body, not in header** — Python embedded the status badge directly in the accordion header (`#bill_number (date) [badge]`), so operator could see record state without expanding. SERN places status only inside the expanded row. | COG | MED | **MED** | "Which of this customer's 6 gold tests is still ongoing?" is one header-scan in Python, six expansions in SERN. |
| 7 | **Information architecture: 3 deep tabs vs 5 flat tabs** — Python: Gold Testing / Gold Certificate / Silver Certificate / Photo Certificate / Balance as 5 sibling tabs. SERN: Overview / Records / Timeline as 3 tabs, with all 5 workflows + Credit History + Weight Loss collapsed into a single Records accordion. | COG | MED | **MED** | Extra accordion-expand click per workflow. Operator who lives in "show me this customer's gold tests" pays one cognitive hop per visit. |
| 8 | **Balance history export (Excel / PDF) absent** — Python exposed Copy / Excel / PDF export buttons on the balance history DataTable. SERN's Credit History accordion has no export. | RHY | LOW | **MED** | Customer-statement workflow (especially month-end / customer dispute resolution). Not daily, but it is the surface that *replaces* paper ledgers. MED. |
| 9 | **`tel:` phone link absent** — Python wrapped phone in `<a href="tel:...">`. SERN renders phone as static text on both list cards and profile header. | RHY | LOW | **LOW** | Cheap to restore; not a throughput chokepoint. |
| 10 | **Toggle active/inactive not exposed on list cards** — Python's DataTable had a toggle action in the row. SERN shows the active/inactive badge but requires opening Edit modal to flip it. | RHY | LOW | **LOW** | Toggle is a rare admin action; one-extra-click is acceptable. |
| 11 | **Photo Cert thumbnail not inline in cert row** — Python's photo-cert history table showed the uploaded photo as a 50×50 thumbnail in the first column. SERN's row is text-only. | COG | LOW | **LOW** | Recognition aid; useful but secondary to #4. |

### Governance pluses — SERN improvements to keep

| # | Addition | Why it stays |
|---|---|---|
| K1 | **Timeline tab** — unified event feed across GT / GC / SC / PC / payment / weight-loss for the customer, ordered by event_date. | Pure governance add. Python required tab-by-tab manual reconciliation; SERN's institutional posture is "single chronological truth surface." Aligns with [[feedback_sern_architecture_framing]] — UX-state → institutional truth. |
| K2 | **Weight Loss History as dedicated tab/accordion** | Python had no first-class surface for weight-loss expenses; SERN does. Required by the operator-rhythm work captured in Dashboard gap #7 (balance-mode weight-loss accounting verification). |
| K3 | **Print / View action per cert row in Records accordion** | Python had no equivalent. SERN can re-issue a cert from the customer profile via the unified `triggerPrint` pipeline. Net throughput gain. |
| K4 | **Active / Inactive badge** | SERN exposes deleted-state as a first-class read; Python showed it only via filter context. Governance-positive. |
| K5 | **Real-time validation on phone (10 digits) + name (non-numeric, min 2 chars)** on Add Customer | Python validated server-side only. Frontend gating prevents bad-shape submissions reaching the wire. |

### SKIP — Python decoration not worth porting

| Item | Reason |
|---|---|
| jQuery DataTable `lengthMenu` + `pagination-rounded` styling | Aesthetic; achievable with any virtualized list lib. Don't reintroduce jQuery for it. |
| `uil-*` icon set (Unicons) | SERN already standardised on `react-icons/fa`. Don't fork the icon family. |
| Plain "Copy" export (alongside Excel / PDF) | Operator never used Copy in practice; Excel + PDF cover the workflow. |
| Per-row `data.name if data.name else test.customer.name` pattern | This was a Python data-shape workaround for record-level name override on per-item records. SERN's snapshot already resolves at the record level — don't replicate the conditional. |

---

## Phased execution roadmap

### Wave A — Immediate throughput & rhythm restoration

**A1. Server-side paged customer search**

- Move `GET /customers` to a paged endpoint with `?q=&page=&pageSize=&balance=&sort=` query params.
- Search across name + phone + (optionally) notes server-side. Filter for due / advance / settled stays the same predicate, evaluated server-side.
- Frontend switches to controlled-query + paginated fetch. Keep the existing `useState(searchTerm)` shape — just debounce + dispatch to the server.
- Removes the unconditional full-table fetch on every mount.

**A2. Dense-table view as default, card view optional**

- Default the Customers list to a dense table: `Avatar | Name | Phone | Balance (DR/CR/Settled) | Active | Edit`.
- Keep the current card grid behind a view-toggle (`Table | Cards`), persisted to localStorage.
- Reasoning: scan throughput. Cards retained only for occasional "browse" sessions.

**A3. Initial Balance field on Add Customer**

- Add an `Initial Balance` numeric input to [NewCustomerModal.js](../frontend/src/components/NewCustomerModal.js), with sign convention matching the rest of the app (positive = DR / customer owes, negative = CR / advance held).
- Backend accepts `balance` on `POST /customers` and writes an opening `credit_history` row with `type: 'OPENING_BALANCE'` so audit trail is preserved.
- Dependency: cross-references Dashboard gap B1 (audit classification taxonomy). `OPENING_BALANCE` joins `CUSTOMER_ADVANCE / MANUAL_CORRECTION / SETTLEMENT_DISCOUNT / MIGRATION_BALANCE`.

**A4. Records accordion — restore operational shape per row**

- Extend `RelatedList` columns for GT / GC / SC / PC accordions to match Python:
  - `Sl | Record No | Date | Status badge | Items (count) | Sample summary | Mode of Payment | GST | Total | Action`
- Sample summary = first item rendered as `total_wt/test_wt - purity%`, with "+N more" if multi-item.
- Status badge promoted into the accordion header so it's visible without expanding (see #6 above).
- `View` action stays as `triggerPrint(...)` for certs and `navigate(/record/...)` for tests.

**A5. `tel:` phone link**

- Wrap phone in `<a href={`tel:+91${customer.phone}`}>` on both the list card and the profile header.

### Wave B — Forensic & governance enforcement

**B1. Balance history export (Excel / PDF)**

- Add Excel + PDF export buttons to the Credit History accordion. Use [SheetJS](https://sheetjs.com/) (already a candidate via the SERN Utility roadmap) for Excel, browser print + dedicated print template for PDF.
- No jQuery DataTable. Pure React + lib calls.
- Schema: Date · Mode of Payment · Type · Amount · Running Balance · Description.

**B2. Status surfaced in accordion header**

- Refactor the existing `<Accordion.Header>` content to show: `Workflow Title (N) · oldest-pending-badge · most-recent-status`. So the operator reads workflow state without expanding.

**B3. Optional flat-tab IA (5-tab mode behind a setting)**

- Add a Profile setting `Workflow tab mode: Combined records | Flat workflows`. Combined = current 3-tab. Flat = Python's 5 tabs (GT / GC / SC / PC / Balance) + retained 6th Timeline tab.
- Default to Combined (preserves SERN's institutional posture); flat mode for operators who explicitly prefer Python's IA.

### Wave C — Architectural alignment & polish

**C1. Photo Cert thumbnail in row**

- Photo Cert accordion row shows uploaded photo as 40×40 thumbnail in the first column. Lazy-load. Falls back to a placeholder if the photo path is missing.

**C2. Toggle active / inactive on list**

- Small toggle icon next to the Active / Inactive badge on each list card / table row. Confirms via inline confirm prompt (no modal); calls existing toggle endpoint. Audit log captures who flipped what.

---

## Open dependencies / concerns

**Q-Customer-1 — Card view retention.** Before A2 ships, measure card vs table use. If <5% of sessions hit the existing card grid for browse intent, demote it to a hidden setting rather than a top-level toggle. Avoid carrying weight for a pattern operators don't use.

**Q-Customer-2 — `balance` field on `POST /customers`.** Verify backend currently silently drops `balance` from the customer-create payload, or whether the field is accepted but never surfaced (potential silent governance hole). If it's accepted: A3 already works at the API level — only the form is missing. Audit before claiming A3 as a "new" feature.

**Q-Customer-3 — Sample-summary field availability.** A4's `Sample summary` requires `items[0].total_weight / test_weight / purity` to be present on the cert / test list endpoints. Audit `GET /certificates?type=gold&customer_id=...` and `GET /gold-tests?customer_id=...` responses — confirm items are eager-loaded or add an `?include=items` flag.

**Q-Customer-4 — Audit taxonomy for `OPENING_BALANCE`.** A3 depends on the same `credit_history.type` taxonomy that Dashboard B1 is migrating. Per [[feedback_legacy_migration_philosophy]], opening balance is a *first-class operator intent* and must not be flattened into `CREDIT`. Coordinate with Dashboard B1 — do not let A3 ship with a `type: 'CREDIT'` hardcode that becomes its own future cleanup.

**Q-Customer-5 — Timeline vs flat-tabs coexistence.** B3 keeps the Timeline tab when flat mode is on (giving 6 tabs). Verify Timeline's event-date sort matches operator intuition — Python operators are used to "newest first within tab," and Timeline cuts across tabs. Don't replace Timeline's chronological-across-workflow guarantee with a per-workflow sort just to mimic Python's IA.

---

## Baseline metrics to capture before Wave A

Record current state (clicks / seconds from Customers base state) for each primary operation:

| Operation | Current clicks | Current latency | Target after Wave A |
|---|---|---|---|
| Customers → find customer by partial name (10-customer DB) | TBD | TBD | TBD |
| Customers → find customer by partial name (200-customer DB) | TBD | TBD | TBD |
| Customers → find customer by phone-suffix | TBD | TBD | TBD |
| Customers → see all gold-test purity values for customer X | TBD | TBD | TBD |
| Customers → see mode-of-payment for customer X's last cert | TBD | TBD | TBD |
| Customers → add new customer with opening balance ₹500 | TBD | TBD | TBD |
| Customers → export balance history as Excel | TBD | TBD | TBD |
| Customers → reprint a specific gold certificate | TBD | TBD | TBD (governance plus, should already be 2 clicks) |

Re-measure after each wave lands. Regression to baseline or worse blocks ticket closure.

---

## Cross-surface links

- **Dashboard gap #3** (searchable customer dropdown) is the *intake-side* counterpart of Customer gap #1 (paged search). Same underlying technical infra — `/customers?q=&page=` — should serve both. Build once.
- **Dashboard gap #11** (interactive recents deep-linking into next workflow state) is the *workflow-board side* counterpart of Customer gap #4 (operational shape in profile records). Both restore "scan → decide → continue" rhythm; both should expose status badge + sample summary in the same shape so the operator's mental model carries across pages.
- **Dashboard B1** (`credit_history.type` taxonomy) is a hard dependency for Customer A3 (Initial Balance) and Customer B1 (Balance export). Do not let either land with a `CREDIT` hardcode.

---

## References

- Companion gap list — [dashboard-gap-list.md](./dashboard-gap-list.md)
- Architectural framing — `feedback_sern_architecture_framing.md`, `feedback_dashboard_as_control_panel.md` in user auto-memory
- Migration heuristics — `feedback_legacy_migration_philosophy.md` in user auto-memory
- Severity heuristic — `feedback_severity_reclassification.md` in user auto-memory
- Workflow platform roadmap — `project_workflow_platform.md` in user auto-memory (P-D = operator rhythm; P-G = governance/semantic invariants)
- Python customer list reference — [../../swastik/app/dashboard/templates/dashboard/customer/index.html](../../swastik/app/dashboard/templates/dashboard/customer/index.html)
- Python customer profile reference — [../../swastik/app/dashboard/templates/dashboard/customer/profile.html](../../swastik/app/dashboard/templates/dashboard/customer/profile.html)
- SERN list — [frontend/src/pages/Customers.js](../frontend/src/pages/Customers.js)
- SERN profile — [frontend/src/pages/CustomerProfile.js](../frontend/src/pages/CustomerProfile.js)
- SERN add/edit modal — [frontend/src/components/NewCustomerModal.js](../frontend/src/components/NewCustomerModal.js)
