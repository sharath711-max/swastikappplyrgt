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
URL state persistence (A1); CustomerCombobox across workflow modals (A2);
WeightLoss native `<select>` removed; Initial Balance persistence (A3); GC/SC/PC
dedicated modal paths; `CertificateForm.js` deleted (dead code); print-service
architecture canonicalized.

- **G1 — Customer profile Records tab** — CLOSED. Cert sections were rendering
  `(0)` for every customer (gold/silver read `.data.data` vs `{ certificates }`;
  photo read `.data.data` vs a raw array) — fixed. All three cert tables now
  enriched via shared `certColumns` (Items / Amount / Pay / GST / Status) and
  collapsed-section headers show count + total + GST count. Backend list queries
  also expose first-item gross/test weight and purity. Shipped in `52a6780`.

- **G2 — BillsPage customer left-rail scalability** — CLOSED. Replaced the
  fetch-all + client-side filter with the A1 paged `/customers` endpoint
  (250ms debounced server search, seqRef race-guard, page-1 browse, Prev/Next
  rail, selected-customer pinned when off-page). Operator-verified live on the
  3,420-customer dataset. Shipped in `0f1fa8e`.

- **G3-P1 — modal keyboard rhythm + safe-close** — CLOSED. (a) WeightLoss +
  CreditHistory close paths migrated to `useSafeModalClose` (orphan-backdrop
  risk gone); (b) `useEnterAdvance` wired into GC/SC/PC; (c) `autoFocus` on the
  amount field in WeightLoss/CreditHistory. Shipped in `816575a`.

- **G3-P2 — autofocus batch** — CLOSED. New shared `useFocusWhen(ref, active)`
  hook lands the cursor on the operator's next field: first item Name field
  after a customer is picked (GT/ST/GC/SC/PC), purity on a TODO card, amount in
  Payment & Delivery (Phase2Modal). All three verified live. Shipped in
  `9e48b20`.

- **P0 — create-entry regression** — CLOSED. See dedicated section below;
  "+ New {workflow}" board-header button restored, shipped in `ac7f674`.

---

## 🔴 P0 — create-entry regression (FIXED — shipped `ac7f674`, verified live)

- **Symptom:** no UI path to start a New Gold/Silver Test or any Gold/Silver/
  Photo Certificate. This blocked `intake → test → bill → print` at step one —
  overrides every throughput gap below.
- **Root cause (two-commit chain):** `c1c0fa7` (Python-style dashboard rebuild)
  moved creation off the sidebar onto the dashboard's `WorkflowDispatchCards`;
  `4fbab0a` ("remove orphaned frontend files") then deleted
  `WorkflowDispatchCards.jsx` as "unused" — but it was the **sole caller of
  `requestNewWorkflow`**. The new dashboard never got a replacement trigger, so
  the three create modals (WorkflowBoard L470/472/474) became unreachable.
- **Fix:** added a primary **"+ New {workflow}"** button to the WorkflowBoard
  header, wired to `requestNewWorkflow(selectedWorkflow)` (the existing,
  unchanged open mechanism). Placed at the active queue — restores creation
  where the operator is already looking, preserving the Python-style intent.
- **Verified (Playwright, live):** all 5 workflows open the correct modal;
  Enter-advance now confirmed reachable in the GC modal; full E2E create lands a
  card in ONGOING ("Gold Certificate created — 1 item(s)", 0 → 1 card).
- **Follow-up (not blocking):** stale Sidebar comments (L12, L67) still reference
  the deleted `WorkflowDispatchCards`; `e2e/gc_modal_test.spec.js` predates the
  removal. Clean up opportunistically.

---

## Remaining gaps (prioritized)

All remaining gaps are **operator throughput only**. No correctness blockers.

### G3 — Test entry: modal keyboard rhythm

- **Lifecycle stage:** Test entry (and all workflow modals)
- **Legacy operator advantage:** keyboard-first muscle memory —
  type → Enter → save → next, almost no mouse.
- **Audit (code-derived, six surfaces):** two paradigms in play; the
  inconsistency *is* the gap.
  - **GT / ST (reference standard):** `autoFocus` on customer combobox;
    `useEnterAdvance` on `<Modal.Body>` → Enter advances + selects next field;
    Esc closes via `useSafeModalClose`; reset on `[show]`. This is the target.
  - **GC / SC / PC:** identical layout but did **not** consume
    `useEnterAdvance` — Enter was dead in item entry (and submitted the inline
    new-customer sub-form). Else same as GT/ST.
  - **WeightLoss / CreditHistory:** **no `autoFocus`** (cursor landed nowhere);
    whole body is `<Form onSubmit>` so Enter submits; and they closed via a
    **direct `onHide`**, bypassing `useSafeModalClose` → orphan-`.modal-backdrop`
    risk that can invisibly block all page clicks (see locked modal rule).
- **P1 fixes — LANDED:**
  - [x] (a) Migrate WeightLoss + CreditHistory close paths to
    `useSafeModalClose` (kills the orphan-backdrop risk). *(highest priority —
    a stability bug, not just rhythm)*
  - [x] (b) Wire `useEnterAdvance` into GC / SC / PC (import + hook +
    `onKeyDown` on `<Modal.Body>`).
  - [x] (c) Add `autoFocus` to the amount field on WeightLoss + CreditHistory.
- **G3-P2 autofocus batch — LANDED (`9e48b20`, verified live):**
  - [x] Intake: focus the first item field after a customer is picked
    (was dropping to `<body>`) — GT/ST/GC/SC/PC via shared `useFocusWhen`.
  - [x] Test: autofocus the purity input on TODO-card open (gated on
    `items.length` so it fires after the rows render).
  - [x] Bill: autofocus the amount field in "Payment & Delivery".
- **P2 — settled by the stopwatch run (full GC lifecycle, live):**
  - **"Save & Add Another" → SKIP.** Reopen cost measured at **~290ms**; the
    mechanical saving is negligible and certs are usually per-customer. Not
    worth the clutter unless same-customer batch entry emerges.
  - [ ] **Esc unsaved-entry guard → DO (dirty-only) — ONLY OPEN G3 ITEM.**
    Confirmed live: Esc closed a modal with typed data, no confirm, silent
    loss. Add a confirm-on-dirty guard (reuse `hasDraftEntries`, currently
    display-only). Non-mechanical / interaction-policy — design carefully:
    warn only when dirty, never on a clean close, no extra clicks normally.
- **Stopwatch positives / notes:** modal-open latency is excellent (200–320ms,
  reopen ~290ms — no slow-transition gap); Bill is genuinely one-click
  ("Payment & Delivery" pre-computes amount/GST/total → "Delivered"); the test
  button was renamed "Submit to Tested" → "Submit" (so `gc_modal_test.spec.js`
  is stale). Print stage (card receipt button) produced no observable popup in
  automation — needs a manual/G7 check (likely a print-window/OS dialog).
- **Severity:** G3-P1 + G3-P2 CLOSED · only the Esc-guard (P2) remains open.
- **P-D Rhythm Phase:** YES

### G4 — Cross-screen: context persistence / return-to-context

- **Lifecycle stage:** Cross-screen navigation
- **Legacy operator advantage:** returning to the same place after an action
  with no re-filtering or re-scrolling.
- **Current SERN behavior:** improved in Customers; unverified elsewhere.
- **Stopwatch finding (workflow queue):** `selectedWorkflow` is in-memory
  context — it *survives* in-app sidebar nav but resets to the default queue
  (Gold Test) on a hard reload / deep-link. Narrow fix: persist the selected
  queue to URL (`?tab=`) or localStorage so reload/deep-link restores it.
- **Gap statement:** audit and preserve filter state, search state, modal reopen
  state, browser back behavior, and scroll restoration across remaining surfaces
  so operators don't rebuild context after each save.
- **Severity:** P1
- **P-D Rhythm Phase:** YES

### G5 — High-volume operator scan speed (visual density)

- **Lifecycle stage:** Cross-screen (tables/cards)
- **Legacy operator advantage:** identify the next action without opening
  nested detail.
- **Current SERN behavior:** some lists/cards require opening records to learn
  state; lower info-per-screen than legacy.
- **Gap statement:** raise information density on high-traffic lists — status
  visibility, payment summary, totals, quick next-action cues — so the next
  action is visible at a glance without over-opening detail.
- **Severity:** P2
- **P-D Rhythm Phase:** YES

### G6 — Billing: reconciliation speed pass

- **Lifecycle stage:** Reconciliation
- **Legacy operator advantage:** quick scan of unsettled balances and recent
  bill history while switching customers.
- **Current SERN behavior:** unvalidated for switching speed, locating
  unsettled balances, and scanning recent bills.
- **Gap statement:** operator validation pass on the loop — find unsettled
  customer → review recent bills → switch customer → continue reconciliation.
- **Severity:** P2
- **P-D Rhythm Phase:** YES

### G7 — Print dispatch: triggering & recovery workflow (NOT output)

- **Lifecycle stage:** Print dispatch
- **Output closed:** certificate / receipt / small-certificate output and paper
  geometry are at parity — see Closed list.
- **Current SERN behavior:** unvalidated batch print speed, retry handling,
  printer-failure recovery, and duplicate-print avoidance.
- **Gap statement:** validate the *act of dispatching* — batch speed, retry,
  failure recovery, duplicate-print guard. Print **output** is closed; this is
  workflow-only.
- **Severity:** P2
- **P-D Rhythm Phase:** YES

---

## P-D Rhythm backlog (throughput-only)

Execution order for what's left (the stopwatch session already ran, so the
P1/P2 audit items are now concrete):

```text
NEXT
  G7  — manual print verification (dispatch/recovery; output already closed)

THEN
  Esc dirty-state guard (G3 P2 — only non-mechanical item; design carefully)

THEN
  G4  — queue persistence (?tab / localStorage) + remaining context audit  P1
  G5  — visual scan density                                                P2
  G6  — reconciliation speed pass                                          P2

CLEANUP (low-risk tail)
  - Sidebar.js stale WorkflowDispatchCards comments (L12, L67)
  - gc_modal_test.spec.js label update ("Submit to Tested" → "Submit")
```

---

## Short version

```text
Closed:
  A1 · A2 · A3 · CertificateForm deletion · G1 · G2 · G3-P1 · G3-P2
  · P0 create-entry regression · print/receipt/tester-slip parity

Open:
  G7   manual print verification        (next)
  Esc  dirty-state guard                (G3 P2, non-mechanical)
  G4   context persistence              P1
  G5   visual scan density              P2
  G6   reconciliation speed             P2
  cleanup: Sidebar comments · gc_modal_test label
```

---

## Cutover blockers

**P0 — none currently identified.**

No remaining item is known to *prevent* an operator completing
intake → test → bill → print at production speed (the P0 that *did* block it —
the missing create entry point — is fixed). The remaining risk is cumulative
operator-friction drag from G4, not a hard correctness block. The end-to-end
stopwatch session has run once (full GC lifecycle); Flask can retire when:

> one operator can complete **intake → test → bill → print** on SERN only, at
> legacy-equivalent production speed, for a real workload, with no fallback to
> legacy UI patterns or memory workarounds.
