# Dashboard rebuild — Python-style operator control panel

**Source:** prompt — *"Rebuild the SERN Dashboard to be functionally and visually IDENTICAL to the legacy Python Dashboard behavior while preserving the modern React architecture, governance additions, and existing backend APIs."*
**Recorded:** 2026-05-24 (backfill — work shipped earlier in this session)
**Branch:** `dashboard-rebuild` (later carried forward to `receipt-bundle-wip` via the heavy-entanglement exception)
**Status:** Shipped; uncommitted on branch pending operator QA.

## What was implemented

Composed the new Dashboard out of fresh components in Python-style operational order:

1. `SystemAnomaliesWidget` (preserved governance top)
2. `WorkflowDispatchCards` — 5 large color-coded tiles (GT / GC / ST / SC / PC) driven by `WORKFLOWS` from [`WorkflowContext.jsx`](../frontend/src/contexts/WorkflowContext.jsx); body click → workflow queue, "+ New" button → New X modal (Sidebar's two-affordance pattern)
3. Quick-action row — Customer Credit / Weight Loss
4. `RevenueCards` — three scoped cards (Revenue Today / Total Revenue / Cash In Hand), each opens its own modal
5. Operational stats — Active Customers (clickable) / Active Tests / Completed Today
6. `RecentTestsTable` + `RecentCertificatesTable` — clickable rows deep-linking to `/record/:type/:id`, aging chips, status badges

Polling → sockets: subscribed to the same workflow channels Sidebar uses; 30s poll retained as fallback. Action-modal saves call `refreshAll`.

## New files (`frontend/src/components/dashboard/`)

- `CustomerCombobox.jsx` + `.css` — server-side typeahead via `/analytics/search`, keyboard nav, chip-style selected state. No jQuery, no select2, no new deps.
- `WorkflowDispatchCards.jsx` — reuses Sidebar's workflow-summary fetch + socket pattern; aging dot + open count + tagline per tile
- `ActiveCustomersCard.jsx` — clickable card → `/customers`
- `RevenueCards.jsx` — fixes the Cash-In-Hand-opens-all-time-breakdown scope mismatch
- `FinancialBreakdownModals.jsx` — three exports, Python-style big-number column layout
- `CustomerActionModals.jsx` — Credit + Weight Loss split, full Audit Type dropdown per spec
- `RecentActivityTables.jsx` — clickable rows + aging markers + status badges

## Modified files

- [`frontend/src/pages/Dashboard.js`](../frontend/src/pages/Dashboard.js) — composition only, no inline business logic
- [`frontend/src/pages/Dashboard.css`](../frontend/src/pages/Dashboard.css) — appended operational CSS classes; preserved existing `.sysanom__*`

## Decisions made

- Audit type dropdown shows full taxonomy (`CREDIT`/`ADJUSTMENT`/`SETTLEMENT`/`REFUND`/`MANUAL_CORRECTION`) per user direction; backend will 400 on new values until the schema ticket lands.
- Weight Loss modal shows only `cash`/`upi` (no `balance`) — matches Python and dodges the audit-semantics question.
- Did NOT extract the governance primitive library (per [[feedback_governance_as_infrastructure]] — separate architectural ticket).
- Did NOT touch the formal cert components — per [[feedback_python_cert_architecture]] those paper geometries stay isolated.

## Tracked artifact

- [`docs/dashboard-gap-list.md`](../docs/dashboard-gap-list.md) — hardened reclassification matrix + Wave A/B/C roadmap; written earlier in the session.
