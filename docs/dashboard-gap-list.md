# Dashboard Gap List — Python → SERN

**Status:** Tracking · **Owner:** TBD · **Last reframe:** 2026-05-23

## Architectural framing

The SERN Dashboard ([frontend/src/pages/Dashboard.js](../frontend/src/pages/Dashboard.js)) has drifted from an **operational control panel** into an **analytics overview page**. Operators in a physical lab do not log in to look at charts; they log in to process metal, clear lines, and collect money.

> **Verdict.** Don't migrate screens. Migrate operator throughput, cognition, and governance guarantees.

Classification key — **RHY** = operator rhythm (P-D scope) · **COG** = cognition restoration · **GOV** = governance posture · **INF** = informational only · **COS** = cosmetic nostalgia (do not replicate).

---

## Hardened reclassification matrix

| # | Gap | Nature | Initial Sev | Corrected Sev | Justification |
|---|---|---|---|---|---|
| 1 | **Workflow tiles** (GT / GC / SC / PC) missing from top fold — Python had four large color-coded entry tiles; SERN has none on Dashboard | RHY | MED | **HIGH** | Primary operator entry regression. Belongs at top fold as keyboard-friendly one-click launchers. |
| 3 | **Searchable customer dropdown** absent — Python used select2 typeahead; SERN uses native `<Form.Select>` | RHY | MED | **HIGH** | Scalability wall. Native elements degrade past ~150 records → scrolling fatigue → wrong-customer-selected. |
| 7 | **Weight-Loss "balance" payment mode** — SERN allows expense paid against customer credit balance; unmodeled accounting | GOV | MED | **HIGH** | Implies unmodeled accounting mechanics. Requires immediate backend/ledger schema verification. |
| 8 | **Hardcoded `type: 'CREDIT'` + description** on Customer Credit modal — operator intent erased | GOV | MED | **HIGH** | Audit log becomes semantically lossy. Distinct financial events flattened into one type, destroying forensic utility. |
| 4 | **Card→modal scope mismatch** — Cash In Hand card opens `allTime` modal, not cash ledger; Today Revenue + Today Expense both open the same modal | COG | MED | **MED** | Semantic mismatch between card labels and modal scope. Easily fixed, but critical for operator trust. |
| 11 | **Recents not clickable** — `Recent Tests` and `Recent Certificates` are static tables, no deep-link to record's next state | RHY | MED | **MED** | Eliminates dead information. Rows must act as deep links into workflow continuation state. |
| 2 | **Active Customers count card** missing — Python had it; SERN has no count | INF | MED | **LOW** | Purely informational metric. No direct impact on transactional throughput. |
| 13 | **30s polling, no socket** — Sidebar uses sockets + 60s poll fallback; Dashboard polls only | ARCH | HIGH | **LOW/MED** | Inconsistent with sidebar but acceptable if concurrent terminal contention is low. Postponed to avoid premature optimization. |
| — | **Dashboard Action Density (click inflation)** — segmented componentized navigation has inflated click counts between Dashboard and recurring intake operations | RHY | (new) | **HIGH** | Newly named overlooked gap. Operator must drill through menus to perform recurring intake steps; goal of dashboard is to compress these paths. |

Items 5, 6, 9, 10, 12, 14 from the original Python→SERN delta either remain at parity, are SERN governance additions to keep, or are deferred polish — see prior analysis if reviving.

---

## Phased execution roadmap

### Wave A — Immediate throughput & rhythm restoration

**A1. Quick-action control panel (replaces analytics top fold)**

- Demote analytics stat cards below the fold.
- Rebuild top fold as a high-density, keyboard-navigable operational row of quick-action tiles:
  - Start Gold Testing (GT)
  - Issue Gold Certificate (GC)
  - Fix pending / suspended actions
  - Collect pending payment
- Hotkey-driven launchers — see open question Q-A1 below before committing to a hotkey scheme.

**A2. Async searchable combobox**

- Ban native HTML `<select>` for customer choice points.
- Deploy headless searchable combobox (e.g., `cmdk`, or standard virtualized async-filter).
- No legacy jQuery `select2` shim. Pure React DOM.
- Keyboard focus must survive partial-name / phone-number typing.

**A3. Interactive recents (deep-linked queues)**

- Convert `Recent Tests` / `Recent Certificates` from static display tables into active operational queues.
- Each row wraps an explicit route deep-link or action trigger mapping to that record's next logical state (continue test → payment modal → cert issue).

**A4. Cognitive alignment of metrics**

- Adjust data-scope queries behind stat cards.
- A card labeled "Cash in Hand" must open the cash-register ledger lines — never all-time blended revenue.
- Today vs all-time must be visually unambiguous on the card itself, not only inside the modal.

### Wave B — Forensic & governance enforcement

**B1. Service-layer audit classifications (replacing hardcoded `CREDIT`)**

- Refactor ledger schema to replace flat `CREDIT` string column with explicit relational enumeration / lookup.
- Taxonomy:
  - `CUSTOMER_ADVANCE` — deposits
  - `MANUAL_CORRECTION` — admin adjustment
  - `SETTLEMENT_DISCOUNT` — negotiated waivers
  - `MIGRATION_BALANCE` — legacy data injection
- **Dependency note** — see Q-B1 below. This is a schema migration with consumers beyond the dashboard (ledger projection, audit views, parity adapter, anomaly rules, Python→SERN migration script). Wave A can add the UI affordance to capture intent before this schema lands, persisting to a temporary field if needed.

**B2. Weight-Loss balance accounting verification**

- Audit ledger engine paths for the `balance` payment mode on weight-loss expense.
- Determine and document whether it registers as:
  - operational expense (P&L),
  - reduction in store liability (balance sheet), or
  - direct settlement of customer debt.
- Ensure complete balance-sheet integrity before exposing it in UI further.

### Wave C — Architectural alignment & polish

**C1. Live sockets integration**

- Connect Dashboard event loop to the WebSocket pipeline already driving the Sidebar ([Sidebar.js:57-68](../frontend/src/components/layout/Sidebar.js#L57-L68)).
- Deploy only when terminal traffic metrics indicate multi-operator row contention or stale-state collisions.

---

## Open dependencies / concerns

**Q-A1 — Hotkey collision audit.** `Alt+T`, `Alt+C` collide with browser-chrome accelerators (Edge/Chrome menu shortcuts, screen-reader command keys). Audit against the deployment platform before committing. Alternatives: `Alt+Shift+<letter>`, or a leader-key pattern (`g t`, `g c` à la GitHub) that scales past four workflows.

**Q-B1 — Schema scope.** B1 is not a dashboard ticket — it is a `credit_history` schema migration with downstream consumers (ledger projection, audit views, parity adapter, anomaly rules, Python→SERN migration script). Per the legacy-migration philosophy, this belongs to P-G governance scope, not Wave B "do alongside the dashboard." Recommend treating B1 as a *dependency* of A1's audit-intent capture, not a co-scheduled ticket. Bundling will block dashboard tickets on cross-cutting review.

**Q-Click — Baseline before refactor.** Click inflation must be measured, not asserted. Before Wave A, record the baseline click counts from Dashboard base state for every primary operation (see Baseline Metrics section below). Without a baseline number, "fixed the click inflation" is unfalsifiable and the next refactor reintroduces it.

---

## Baseline metrics to capture before Wave A

Record current state (clicks from Dashboard base state) for each primary operation:

| Operation | Current clicks | Target after Wave A |
|---|---|---|
| Dashboard → Start Gold Test | TBD | TBD |
| Dashboard → Issue Gold Certificate | TBD | TBD |
| Dashboard → Issue Silver Certificate | TBD | TBD |
| Dashboard → Issue Photo Certificate | TBD | TBD |
| Dashboard → Collect pending payment (known customer) | TBD | TBD |
| Dashboard → Fix a pending / suspended workflow item | TBD | TBD |
| Dashboard → Resolve a flagged anomaly | TBD | TBD |

Re-measure after each wave lands. Regression to baseline or worse blocks ticket closure.

---

## References

- Architectural framing — `feedback_sern_architecture_framing.md`, `feedback_dashboard_as_control_panel.md` in user auto-memory
- Migration heuristics — `feedback_legacy_migration_philosophy.md` in user auto-memory
- Severity heuristic — `feedback_severity_reclassification.md` in user auto-memory
- Workflow platform roadmap — `project_workflow_platform.md` in user auto-memory (P-D = operator rhythm; P-G = governance/semantic invariants)
- Python dashboard reference — [../../swastik/app/dashboard/templates/dashboard/index.html](../../swastik/app/dashboard/templates/dashboard/index.html)
