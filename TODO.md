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

---

## Remaining gaps (prioritized)

All remaining gaps are **operator throughput only**. No correctness blockers.

### G2 — Billing: BillsPage customer left-rail scalability

- **Lifecycle stage:** Billing
- **Legacy operator advantage:** fast customer switching while keeping a
  persistent, visible browse rail.
- **Current SERN behavior:** fetch-all customer list with client-side
  filtering; degrades as record count grows; not a paged rail.
- **Gap statement:** server-backed search + paginated customer rail that
  preserves active-customer context and keeps the left-rail browse UX. **Not** a
  `CustomerCombobox` replacement — a mini A1-style pagination port for the
  sidebar.
- **Severity:** P1
- **P-D Rhythm Phase:** YES

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
- **P2 — deferred to the stopwatch session (need real operator timing):**
  - [ ] "Save & Add Another" — every modal closes on success; repeat intake
    requires reopen. Could speed high-volume entry, could clutter the UI.
  - [ ] Esc unsaved-entry guard — `DraftStateFooter`/`hasDraftEntries` is
    display-only; Esc/X discards a half-entered test/cert with no confirm.
  - [ ] Live tab-order pass — confirm no traps / early button focus / first-Enter
    swallowed by the combobox (cannot be verified statically).
- **Severity:** P1 (a–c landed) · P2 (judgment calls pending stopwatch)
- **P-D Rhythm Phase:** YES

### G4 — Cross-screen: context persistence / return-to-context

- **Lifecycle stage:** Cross-screen navigation
- **Legacy operator advantage:** returning to the same place after an action
  with no re-filtering or re-scrolling.
- **Current SERN behavior:** improved in Customers; unverified elsewhere.
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

All current remaining gaps are throughput-related, in execution order:

1. **G2** — BillsPage left-rail pagination/search _(P1, highest cutover impact)_
2. **G3** — Test-entry / modal keyboard rhythm audit _(P1)_
3. **G4** — Cross-screen context persistence audit _(P1)_
4. **G5** — Visual scan density _(P2)_
5. **G6** — Reconciliation speed pass _(P2)_
6. **G7** — Print dispatch trigger/recovery workflow _(P2)_

> Recommendation: ship **G2**, then run one real operator stopwatch session
> end-to-end (intake → test → bill → print) before opening another large UI
> wave. The stopwatch session is what reclassifies the P1/P2 audit items into
> concrete fixes — or surfaces a P0 that isn't visible from code review.

---

## Short version

Remaining open:

```text
G2 BillsPage scalability        P1
G3 Modal keyboard rhythm        P1
G4 Context persistence          P1
G5 Visual density               P2
G6 Reconciliation speed         P2
G7 Print dispatch workflow      P2
```

Closed: A1 · A2 · A3 · CertificateForm deletion · G1 · print parity · receipt
parity · tester-slip parity.

---

## Cutover blockers

**P0 — none currently identified.**

No remaining item is known to *prevent* an operator completing
intake → test → bill → print at production speed. The risk is cumulative
operator-friction drag from the P1 items (G2–G4), not a hard correctness block.
The end-to-end stopwatch session is the gate that confirms this — if it does,
Flask can retire when:

> one operator can complete **intake → test → bill → print** on SERN only, at
> legacy-equivalent production speed, for a real workload, with no fallback to
> legacy UI patterns or memory workarounds.
