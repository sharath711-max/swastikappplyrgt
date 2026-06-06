# Sidebar workflow chips — unified to one neutral category

**Source:** operator screenshot of the sidebar + direction *"treat all are same categories"* — chosen action: make all 5 workflow chip colours the same (one neutral colour)
**Recorded:** 2026-05-27 05:03
**Branch:** `receipt-bundle-wip`
**Status:** Per-workflow chip tints neutralised. All 5 workflows now read as one nav category visually.

## What changed

[`frontend/src/components/layout/AppShell.css`](../frontend/src/components/layout/AppShell.css) — the per-workflow tint rules at lines 546-550 were collapsed into one no-op shell so all 5 chips inherit the base `.workflow-code` palette (neutral slate: `#f1f5f9` background, `#334155` text, `#e5e7eb` border).

### Before

```css
.workflow-code--gold        { background: #fef3c7; color: #92400e; border-color: #fcd34d; }  /* amber */
.workflow-code--gold_cert   { background: #fef9c3; color: #854d0e; border-color: #facc15; }  /* yellow */
.workflow-code--silver      { background: #e2e8f0; color: #334155; border-color: #cbd5e1; }  /* slate */
.workflow-code--silver_cert { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }  /* light slate */
.workflow-code--photo_cert  { background: #ede9fe; color: #5b21b6; border-color: #c4b5fd; }  /* violet */
```

### After

```css
/* All 5 workflows render as one nav category. Per-key colour overrides
   removed by operator direction — the 2-letter code is the differentiator.
   Selectors retained as no-ops so WorkflowBoard.js + Sidebar.js can keep
   passing className={`workflow-code workflow-code--${key}`} without churn. */
.workflow-code--gold,
.workflow-code--gold_cert,
.workflow-code--silver,
.workflow-code--silver_cert,
.workflow-code--photo_cert {
    /* intentional: inherit the base .workflow-code neutral palette */
}
```

## What stayed

- **Base `.workflow-code` rule** at [AppShell.css:502-515](../frontend/src/components/layout/AppShell.css#L502-L515) — neutral slate palette, monospace 2-letter code, applies to every chip.
- **Active-state rule** at [AppShell.css:469-473](../frontend/src/components/layout/AppShell.css#L469-L473) — when `.workflow-nav-item` is active, the chip gets the SLDS blue (`#0176d3`) background + white text. **Same blue for all 5 workflows** when selected — already consistent, no change needed.
- **Aging dot overlay** at [AppShell.css:521-543](../frontend/src/components/layout/AppShell.css#L521-L543) — warm/hot/cold severity dots positioned over the chip's top-right corner. Per-workflow governance signal; not affected by the colour unification.
- **Open-count badge** + **"+ New" button** on each row — unchanged.
- **WorkflowBoard section-title chip** (`workflow-code--lg`) — automatically inherits the neutral palette because the comment at [WorkflowBoard.css:109](../frontend/src/pages/WorkflowBoard.css#L109) says it reuses the AppShell tints. Nothing to change there.

## Selectors kept as shells, not deleted

`.workflow-code--gold`, `.workflow-code--gold_cert`, etc. are still emitted by the JSX (`className={`workflow-code workflow-code--${w.key}`}` in [Sidebar.js:142](../frontend/src/components/layout/Sidebar.js#L142) and [WorkflowBoard.js](../frontend/src/pages/WorkflowBoard.js)). Keeping the selectors as empty rules with the documenting comment:

1. Avoids touching every JSX call-site to remove the modifier class.
2. Leaves a clearly-marked hook for re-introducing per-workflow tinting if the operator changes their mind.
3. Documents the intent (`removed by operator direction`) so a future contributor doesn't "fix" the missing colours.

## Visual outcome (after refresh)

| Workflow | Chip background | Chip text | Chip border |
|---|---|---|---|
| Gold Test (GT) | `#f1f5f9` slate | `#334155` slate | `#e5e7eb` light slate |
| Gold Certificate (GC) | `#f1f5f9` slate | `#334155` slate | `#e5e7eb` light slate |
| Silver Test (ST) | `#f1f5f9` slate | `#334155` slate | `#e5e7eb` light slate |
| Silver Certificate (SC) | `#f1f5f9` slate | `#334155` slate | `#e5e7eb` light slate |
| Photo Certificate (PC) | `#f1f5f9` slate | `#334155` slate | `#e5e7eb` light slate |
| **Any of the above when active** | `#0176d3` SLDS blue | `#ffffff` white | `#0176d3` SLDS blue |

All chips identical until selection. Selection promotes whichever workflow is active to SLDS blue.

## Reversibility

Single edit, single file. To restore per-workflow colours: refill the rules at [AppShell.css:546-557](../frontend/src/components/layout/AppShell.css#L546-L557) with any palette. Selectors are already in place; no JSX changes required.
