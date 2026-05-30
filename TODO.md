# UI Gap Analysis — Legacy Flask UI → SERN Web App (Post Print-Parity Re-scope)

**Goal:** operator **throughput** parity, not visual screen parity.

> Primary question: where does the legacy Flask UI still allow a faster or
> lower-friction operator workflow than the SERN web app?

**Severity:** P0 cutover blocker · P1 high throughput drag · P2 medium friction
· P3 cosmetic/parity-only.

---

## Closed / matched (do not reopen)

Treated as identical in operator-visible output between Python and SERN:

- Gold / Silver / Photo / Small Certificate print output
- Thermal Receipt / receipt bundle print output
- Tester slips and customer-copy bundle
- **Print template HTML/CSS, print styling, paper geometry** — closed. No gap
  items for layout parity. Print appears below _only_ where a workflow issue
  exists around *triggering or using* print, never for output.

Also at parity (prior waves): paged `/customers` with server-side search and
URL state persistence; CustomerCombobox across workflow modals; WeightLoss
native `<select>` removed; Initial Balance persistence; GC/SC/PC dedicated modal
paths; print-service architecture canonicalized.

---

## Remaining gaps (prioritized)

### G1 — Customer profile: Records tab operational shape

- **Lifecycle stage:** Customer profile / history lookup
- **Legacy operator advantage:** denser info, status visible without drill-in;
  operator scanned history vertically.
- **Component:** `frontend/src/pages/CustomerProfile.js`, RECORDS tab
  (`RelatedList` + the by-type `Accordion`, L313–449).
- **Structural reality (corrected):** the Records tab is an accordion segmented
  **by record type**, each holding a flat table — NOT a per-record collapsible
  list. Friction is two-part: (A) sections collapsed by default (only Gold Certs
  open), and (B) thin columns even when open. A separate TIMELINE tab already
  carries a dense vertical feed; decision below keeps scan on the Records tab.
- **BLOCKER bug (fix first):** Gold & Silver cert sections read `gc.data.data`
  but `/certificates` returns `{ certificates }` (no `.data` key) — so cert
  sections render empty `(0)` on every customer. Tests/credit work because their
  routes return `{ data }`. Verify photo-cert shape too.
- **Data availability:** `item_count`, `first_*` weights, `mode_of_payment`,
  `gst`/`gst_bill_number`, `total`, and `status` are ALL already returned by
  `listCertificates` — enrichment is pure frontend, zero backend.
- **Decisions:** (1) enrich the **Records tab** (not Timeline); (2) status badge
  = **workflow status** (TODO/IN_PROGRESS/DONE), zero backend. "Printed/
  Delivered" delivery status deferred — would need a backend payload add.
- **Subtasks:**
  - [x] (a) fix the cert payload read — all three cert types were misread
    (gold/silver read `.data.data` vs `{certificates}`; photo read `.data.data`
    vs a raw array). Tests/credit/weight-loss were already correct.
  - [x] (b) add Items / Amount / Pay / GST / Status columns to all three cert
    tables via shared `certColumns` (Silver previously had no amount column).
  - [x] (c) collapsed section headers now show count + total + GST count
    (`CertSectionHeader`).
  - [ ] (e) operator scan pass — verify in running app against a customer with
    real cert history.
- **Severity:** P1 (the empty-cert bug alone is arguably higher)
- **P-D Rhythm Phase:** YES

### G2 — Billing: BillsPage customer left-rail scalability

- **Lifecycle stage:** Billing
- **Legacy operator advantage:** fast customer switching while keeping a
  persistent browse rail.
- **Current SERN behavior:** fetch-all customer list with client-side
  filtering; degrades as record count grows; not a paged rail.
- **Gap statement:** left rail needs paginated/searchable browsing that
  preserves active-customer context and the browse UX. Not a combobox
  replacement — a mini A1-style pagination port for the sidebar.
- **Severity:** P1
- **P-D Rhythm Phase:** YES

### G3 — Test entry: modal keyboard rhythm

- **Lifecycle stage:** Test entry (and all workflow modals)
- **Legacy operator advantage:** keyboard-first muscle memory — type, Enter,
  next, no mouse.
- **Current SERN behavior:** unverified tab order / Enter-save / Escape-close /
  post-save focus reset; likely mouse-dependent steps.
- **Gap statement:** stopwatch + keyboard audit on modal open speed, tab order,
  Enter-to-save, Escape-to-close, and focus placement after save/reset.
- **Severity:** P1
- **P-D Rhythm Phase:** YES

### G4 — Cross-screen: context persistence / return-to-context

- **Lifecycle stage:** Cross-screen navigation
- **Legacy operator advantage:** returning to the same place after an action
  with no re-filtering or re-scrolling.
- **Current SERN behavior:** improved in Customers; unverified elsewhere
  (filters, search state, modal reopen state, back navigation, scroll restore).
- **Gap statement:** audit and preserve filters/search/scroll and modal reopen
  state across remaining surfaces so operators don't rebuild context after each
  save.
- **Severity:** P1
- **P-D Rhythm Phase:** YES

### G5 — High-volume operator scan speed (visual density)

- **Lifecycle stage:** Cross-screen (tables/cards)
- **Legacy operator advantage:** identify the next action without opening
  nested detail.
- **Current SERN behavior:** some lists/cards require opening records to learn
  state; lower info-per-screen than legacy.
- **Gap statement:** raise information density on high-traffic lists so the next
  action is visible at a glance, without over-opening detail.
- **Severity:** P2
- **P-D Rhythm Phase:** YES

### G6 — Billing: reconciliation speed pass

- **Lifecycle stage:** Reconciliation
- **Legacy operator advantage:** quick scan of unsettled balances and recent
  bill history while switching customers.
- **Current SERN behavior:** unvalidated for switching speed, locating
  unsettled balances, and scanning recent bills.
- **Gap statement:** operator validation pass on customer switching, unsettled
  balance discovery, and recent-bill scanning speed.
- **Severity:** P2
- **P-D Rhythm Phase:** YES

### G7 — Print dispatch: triggering & recovery workflow (NOT output)

- **Lifecycle stage:** Print dispatch
- **Legacy operator advantage:** predictable batch dispatch, no accidental
  re-prints.
- **Current SERN behavior:** unvalidated batch print speed, retry handling,
  printer-failure recovery, and duplicate-print avoidance.
- **Gap statement:** validate the *act of dispatching* — batch speed, retry,
  failure recovery, duplicate-print guard. Print **output** is closed; this is
  workflow-only.
- **Severity:** P2
- **P-D Rhythm Phase:** YES

---

## P-D Rhythm backlog (throughput-only)

All current remaining gaps are throughput-related, in execution order:

1. **G1** — Records accordion operational shape _(P1, highest cutover impact)_
2. **G2** — BillsPage left-rail pagination/search _(P1)_
3. **G3** — Test-entry / modal keyboard rhythm audit _(P1)_
4. **G4** — Cross-screen context persistence audit _(P1)_
5. **G5** — Visual scan density _(P2)_
6. **G6** — Reconciliation speed pass _(P2)_
7. **G7** — Print dispatch trigger/recovery workflow _(P2)_

> Recommendation: ship **G1**, then run one real operator stopwatch session
> end-to-end (intake → test → bill → print) before opening another large UI
> wave. The stopwatch session is what reclassifies the P1/P2 audit items into
> concrete fixes — or surfaces a P0 that isn't visible from code review.

---

## Cutover blockers

**P0 — none currently identified.**

No remaining item is known to *prevent* an operator completing
intake → test → bill → print at production speed. The risk is cumulative drag
from the P1 items (G1–G4), not a hard block. The end-to-end stopwatch session is
the gate that confirms this — if it does, Flask can retire when:

> one operator can complete **intake → test → bill → print** on SERN only, at
> legacy-equivalent production speed, for a real workload, with no fallback to
> legacy UI patterns or memory workarounds.
