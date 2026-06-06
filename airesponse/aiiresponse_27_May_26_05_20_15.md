# Python-style dashboard + dark sidebar restyle

**Source:** operator screenshot of the Python dashboard + direction *"like this"* with two scope picks: (a) Visual style only — keep SERN governance content; (b) Dark sidebar, no chips, simple icon + label list.
**Recorded:** 2026-05-27 05:20
**Branch:** `receipt-bundle-wip`
**Status:** Sidebar + Dashboard restyled to match the Python visual. SERN governance content preserved below the hero.

## Files changed

| File | Change |
|---|---|
| [`frontend/src/components/layout/Sidebar.js`](../frontend/src/components/layout/Sidebar.js) | Stripped workflow chips, aging dots, count badges, "+ New" buttons. Workflow rows render as simple icon + label `<button>` matching the other nav items. Removed dead state/effects (`summary`, `useSocket`, `refreshSummary`, `summarySeqRef`, `requestNewWorkflow`, `handleNewWorkflow`). Removed unused imports (`useCallback`, `useEffect`, `useRef`, `api`, `useSocket`, `getAgingBucketFromAgeMs`, `agingTitle`, `FaPlus`). |
| [`frontend/src/components/layout/AppShell.css`](../frontend/src/components/layout/AppShell.css) | Sidebar surface flipped to dark navy (`#1f2937` bg, `#e2e8f0` text). Active state uses SLDS-blue rgba tint (`rgba(1, 118, 211, 0.18)`) with inset blue stripe; hover uses white rgba tint. Nav icon glyph color: slate at rest, white on active/hover. Sidebar footer adapted for dark surface (transparent bg, light-slate version text, muted copyright). Group header + subitems also dark-themed. |
| [`frontend/src/pages/Dashboard.js`](../frontend/src/pages/Dashboard.js) | Full rewrite of the JSX render. New 2-row hero layout matching the Python dashboard exactly. Kept all hooks, state, modals, socket subscriptions. Dropped imports of `WorkflowDispatchCards`, `RevenueCards`, `ActiveCustomersCard` — replaced with inline tiles + stat cards. |
| [`frontend/src/pages/Dashboard.css`](../frontend/src/pages/Dashboard.css) | Appended a new `py-*` class system: hero grid rows, welcome card, white stat cards, big coloured tiles with 7 tone variants (credit, wl, amber, red, blue, green, slate). Existing `.dash-*` classes left in place — now orphaned but harmless. |

## Layout produced

### Row 1 (hero, 4 cards)

| | | | |
|---|---|---|---|
| **Welcome** (light blue card + illustration) | **Active Customers** (white stat, big number) | **Customer Credit** (teal `#2ba6c4` big tile) | **Weight Loss** (dark navy `#232a3d` big tile) |

### Row 2 (hero, 6 cards — Python parity)

| | | | | | |
|---|---|---|---|---|---|
| **Revenue today** (white stat) | **Total Revenue** (white stat) | **Gold Testing** (amber tile) | **Gold Certificate** (red tile) | **Silver Certificate** (blue tile) | **Photo Certificate** (green tile) |

### Secondary row (SERN extras, 4 cards)

| | | | |
|---|---|---|---|
| **Silver Testing** (slate tile — SERN-only) | **Cash In Hand** (white stat) | **Active Tests** (white stat) | **Completed Today** (white stat) |

### Below the hero

- `SystemAnomaliesWidget` — governance telemetry, kept per scope decision (a)
- Recent Tests + Recent Certificates side-by-side (clickable, deep-linked)

## Workflow tile colour palette (Python parity)

| Workflow | Tone class | Hex |
|---|---|---|
| Customer Credit | `py-tile--credit` | `#2ba6c4` teal |
| Weight Loss | `py-tile--wl` | `#232a3d` dark navy |
| Gold Testing (GT) | `py-tile--amber` | `#e69138` |
| Gold Certificate (GC) | `py-tile--red` | `#d24a45` |
| Silver Certificate (SC) | `py-tile--blue` | `#6a8fcb` |
| Photo Certificate (PC) | `py-tile--green` | `#4ab87a` |
| Silver Testing (ST) | `py-tile--slate` | `#64748b` (SERN-only, secondary row) |

Tiles render an open-count badge in the top-right when `/workflow/summary` reports `todo + in_progress > 0` (governance signal preserved on the dashboard since it was removed from the sidebar).

## Manual asset required

`frontend/public/welcome.png` — illustration for the Welcome card. The component uses `<img src="${PUBLIC_URL}/welcome.png" onError={hide}>` so a missing file degrades gracefully (the card still shows the "Welcome Back!" headline, image just doesn't render).

## Components orphaned (not deleted)

These remain on disk for potential reuse on other pages; they are no longer imported by Dashboard.js:

- `frontend/src/components/dashboard/WorkflowDispatchCards.jsx`
- `frontend/src/components/dashboard/RevenueCards.jsx`
- `frontend/src/components/dashboard/ActiveCustomersCard.jsx`

Delete them in a cleanup pass if no other surface uses them.

## Functional guarantees

All behaviour preserved:

- Workflow tile click → `tryWorkflowSwitch` + `setSelectedWorkflow` + `navigate('/workflow')` (same path as the prior `WorkflowDispatchCards`)
- Customer Credit / Weight Loss tile click → opens the existing `CustomerCreditModal` / `WeightLossModal` (uses `useSafeModalClose` — backdrop sweep, focus restore preserved)
- Revenue Today / Total Revenue / Cash In Hand stat cards → open the existing `RevenueTodayModal` / `RevenueAllTimeModal` / `CashInHandModal`
- Active Customers stat card → navigates to `/customers`
- Recent rows → deep-link to `/record/<type>/<id>`
- 30s polling + socket subscription on workflow channels → refreshes all data (summary, breakdown, workflow summary, customers count)
- `useSafeModalClose` modal-backdrop pattern preserved on all modals

## Sidebar — what stayed and what went

| | Before | After |
|---|---|---|
| Background | white | dark navy `#1f2937` |
| Text | dark | light slate `#e2e8f0` |
| Workflow rows | chip + label + count + aging dot + "+ New" button | icon + label only |
| Aging dots | rendered on each workflow chip | **removed** — surfaced via dashboard tile counts instead |
| Open counts | small pill on each workflow row | **removed** — surfaced via dashboard tile counts instead |
| "+ New" buttons | per-workflow plus icon | **removed** — operator opens via Phase2Modal / WorkflowBoard "+" flow |
| `useSocket` subscription | refreshed `/workflow/summary` for the chip data | **removed** — Dashboard owns the summary fetch now |

The queue-pressure / governance signals that lived on the sidebar (aging + open counts) didn't disappear — they moved to the Dashboard's workflow tiles (which is the primary operator surface anyway).

## Verification

`npm start` and navigate to `/`:

- Sidebar: dark navy, white text, simple icon + label rows, active row highlighted with SLDS-blue tint
- Dashboard row 1: welcome card on the left, then 3 prominent cards
- Dashboard row 2: 2 white stat cards + 4 large coloured workflow tiles (GT amber, GC red, SC blue, PC green)
- Secondary row: ST tile + 3 more white stat cards
- Below: governance widget, recents
- Click each: workflow tile → opens kanban, stat card → opens breakdown modal, action tile → opens action modal
- Open-count badges on tiles update when records change on `/workflow/summary`

If the welcome card looks empty because no `welcome.png` is in `public/`, that's expected — drop any small illustration in there to fill it. Everything else works without operator action.
