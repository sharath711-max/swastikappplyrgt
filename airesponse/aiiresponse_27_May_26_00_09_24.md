# Salesforce Lightning Design System — install + first-surface refresh (WorkflowBoard)

**Source:** prompt — *"I need to improve ui as like salesforce ui"* + operator scope decisions (install official SLDS library + start with Workflow Board)
**Recorded:** 2026-05-27 00:09
**Branch:** `receipt-bundle-wip`
**Status:** SLDS library installed and wired; WorkflowBoard structural JSX refreshed to SLDS patterns. CSS trim deferred until operator visual verification.

## Pre-refresh state finding

The project already had partial SLDS adoption:

- `frontend/src/components/SalesforceComponents.js` — Toast, Modal, DataTable with `slds-*` classes
- `frontend/src/styles/theme.css` — full SLDS design-token set (`--primary: #0176d3`, `--font-family: 'Salesforce Sans'`, etc.)
- 6 page files using `slds-*` class names (WorkflowBoard, Verify, LoginPage, CashInHand, Verify.css)
- **But** no `@salesforce-ux/design-system` dependency installed — so the `slds-*` classes in JSX did not resolve to any actual styling

This was the root cause of "feels half-Salesforce" — somebody started the path and stopped before installing the library.

## What shipped this turn

### Dependency

`frontend/package.json` — added `@salesforce-ux/design-system` (resolved to ^2.30.4 by npm). Installed at workspace-root `node_modules/@salesforce-ux/design-system/` (this is an npm workspaces setup; the package is hoisted from `frontend/`).

CSS path: `node_modules/@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css`.

### Entry-point wiring

[`frontend/src/index.js`](../frontend/src/index.js) — added the SLDS CSS import AFTER `bootstrap/dist/css/bootstrap.min.css` so SLDS utility classes win specificity ties where the two libraries overlap (rare in practice since `slds-*` and `btn-*` are namespaced separately):

```js
import 'bootstrap/dist/css/bootstrap.min.css';
import '@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css';
import './styles/ModalContainer.css';
```

### WorkflowBoard JSX refresh

[`frontend/src/pages/WorkflowBoard.js`](../frontend/src/pages/WorkflowBoard.js) — three focused edits to convert structural shell from custom classes to SLDS patterns. All behavior preserved (drag/drop, socket subscriptions, optimistic UI, validation gates, context menu, search filter, modal management).

| Region | Before | After |
|---|---|---|
| Page wrapper | `<div className="workflow-page">` | `<div className="workflow-page slds-scope">` |
| Header | `<div className="board-header">` with `<h1>` + descriptive `<p>` + flex action group | SLDS `slds-page-header` pattern (`slds-page-header__row` → `slds-page-header__col-title` + `slds-page-header__col-actions` → `slds-page-header__controls`); title uses `slds-page-header__title slds-truncate`; subtitle uses `slds-page-header__meta-text` |
| Search input | Custom `.workflow-search-wrap` with custom icon + close × | SLDS `slds-form-element` → `slds-input-has-icon slds-input-has-icon_left-right`; left search icon + right `slds-button slds-button_icon` clear button |
| Refresh button | Custom `.btn-secondary-action` | `slds-button slds-button_neutral` |
| Kanban grid | `.kanban-grid` (CSS grid 3-col) | `kanban-grid slds-grid slds-gutters slds-wrap` |
| Kanban column | `<div className="kanban-column">` | Wrapped in `<article className="slds-card kanban-column__card">`; column gets `slds-col slds-size_1-of-1 slds-medium-size_1-of-3` (responsive) |
| Column header | `<div className="column-header">` with inline `h3` + meta span | `slds-card__header` with `<header className="slds-media slds-media_center slds-has-flexi-truncate">` containing title + meta; column count is `slds-badge`; column background color preserved as inline style |
| Column body | `<div className="column-body">` | `slds-card__body column-body` (additive — kept original class for any nested CSS still depending on it) |

### Preserved as-is (not migrated to SLDS)

The following project-specific governance markers stayed on their existing custom classes because they're not in SLDS:

- `kanban-card__aging-badge` (warm/hot/cold variants)
- `kanban-card__sealed-indicator` (lock icon overlay)
- `kanban-card__receipt-btn` (the recently-added receipt quick-action)
- `column-severity` (oldest-item severity chip on column header)
- `card-customer`, `card-meta`, `card-footer`, `type-tag`, `card-amount`, `card-sealed-tag` (kanban card internals)
- `sequence-policy-helper` (cert-workflow sequence policy note)
- `workflow-code workflow-code--lg workflow-code--<key>` (workflow identity chip on section title)

Per [[feedback_governance_as_infrastructure]] — governance primitives are project-specific infrastructure, not decoration. They should not be replaced by generic SLDS components even when SLDS has a visually-similar pattern.

## Why CSS trim was NOT done in this pass

Preemptively deleting `.board-header`, `.workflow-search-*`, `.btn-secondary-action`, etc. from `WorkflowBoard.css` risks visual breakage on first paint before operator can verify the SLDS frame is rendering correctly. Order of operations:

1. Operator runs `npm start` and sees the refreshed WorkflowBoard
2. Identifies any visual conflicts (e.g., react-bootstrap Button's `btn-primary` blue bleeding through the `slds-button_neutral`)
3. CSS trim pass targets the specific conflicts

If the visual is clean on first paint, the now-orphaned custom CSS rules can be removed wholesale in a follow-up.

## Known potential visual conflicts to watch for

These are not bugs — just react-bootstrap + SLDS overlap points worth checking on first paint:

1. **Refresh button:** still wrapped in react-bootstrap `<Button>`. RB adds `btn btn-primary` by default. SLDS classes are also applied. Whichever has higher CSS specificity wins. Bootstrap utility-level classes (`btn-primary`) may shine through with their blue background. If it looks wrong, switch to plain `<button>` element with only SLDS classes.

2. **Column count badge:** has `bg="dark"` from react-bootstrap PLUS `slds-badge`. The Bootstrap `bg-dark` utility uses `!important` so the dark background will win the conflict. Visually that's fine — looks like a dark SLDS badge.

3. **Card #shortId badge:** same situation (`<Badge bg="dark">` with no SLDS class added — pure Bootstrap). No conflict, no change needed.

4. **`workflow-code workflow-code--<key>` chips on section title:** Custom; no SLDS. Should look the same as before.

5. **Aging chip + sealed ribbon:** Custom; no SLDS. Should look the same as before.

## Verification (operator-side)

1. `cd frontend && npm start` — confirm CSS imports load without console errors.
2. Navigate to `/workflow` — confirm the Workflow Board renders with:
   - SLDS-style page header (clean breadcrumb-less header with title + meta + action region)
   - Search input in SLDS form-element style
   - Refresh button styled per SLDS (neutral button)
   - Kanban columns inside SLDS cards (white background, light border, subtle shadow)
   - Aging chips + sealed ribbons + receipt button still rendering as before
3. Confirm functional behavior unchanged:
   - Drag a card from Ongoing to Tested (gate validation still fires)
   - Search filter still narrows results
   - Right-click context menu still appears
   - Card click still opens Phase2Modal
   - Receipt icon click still triggers thermal print
4. Open browser DevTools → Network → verify `salesforce-lightning-design-system.min.css` loads with 200 status.

If anything looks visually wrong, identify which custom CSS rule is overriding the SLDS class, and we patch from there.

## Branch state recap

`receipt-bundle-wip` working tree now contains, in addition to all prior work:

- `frontend/package.json` — +1 dependency (`@salesforce-ux/design-system`)
- `frontend/package-lock.json` — auto-updated
- `node_modules/@salesforce-ux/design-system/` — installed at repo root (workspaces hoist)
- `frontend/src/index.js` — +1 CSS import line
- `frontend/src/pages/WorkflowBoard.js` — three JSX edits

No CSS file changes in this pass.

## Next steps (when ready)

- Operator visual verification on `npm start`
- CSS trim pass: remove now-unused rules from `WorkflowBoard.css` (`.board-header`, `.workflow-search-*`, `.btn-secondary-action`, `.board-title`, etc.)
- Propagate the SLDS pattern to the next surfaces (Dashboard, CustomerProfile, Customers list) in order of operator visibility
- Audit `SalesforceComponents.js` — now that SLDS CSS resolves, the Toast/Modal/DataTable in that file should start rendering correctly; verify and consume from existing call sites if not already.
