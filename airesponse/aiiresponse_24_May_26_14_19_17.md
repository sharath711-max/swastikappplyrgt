# Card-quick-print Receipt icon on WorkflowBoard cards

**Source:** prompt — *"Build a 'Receipt' quick-action icon on WorkflowBoard cards for all 5 workflows"*
**Recorded:** 2026-05-24 14:19
**Branch:** `receipt-bundle-wip`
**Status:** Implemented. Pending operator QA (single-click receipt from card, no Phase2Modal open, drag-start not falsely triggered).

## What was implemented

One-click receipt icon directly on every kanban card in WorkflowBoard. Reuses the existing `PRINT_ROUTE_BY_TYPE` map and the `usePrint().triggerPrint(route, id, { layout: 'receipt' })` flow already used by the right-click context menu and Phase2Modal. Zero print-logic duplication.

Visible on every card across all 5 workflows (GT / ST / GC / SC / PC) in every state (Ongoing / Tested / Completed).

## Files touched (all on `receipt-bundle-wip` branch)

| File | Change |
|---|---|
| [`frontend/src/pages/WorkflowBoard.js`](../frontend/src/pages/WorkflowBoard.js) | Added `handleCardReceipt(e, item)` helper next to existing `handleReceipt`; added the icon button JSX inside `card-top` next to the `#shortId` badge |
| [`frontend/src/pages/WorkflowBoard.css`](../frontend/src/pages/WorkflowBoard.css) | Appended `.kanban-card__receipt-btn` rule — transparent button, slate icon, light hover, indigo focus outline |

## Implementation notes

### Handler
- `e.preventDefault()` + `e.stopPropagation()` so the card body's `onClick` does NOT also fire (would have opened Phase2Modal in parallel).
- Resolves print route via the existing `PRINT_ROUTE_BY_TYPE` map (no per-workflow branching in the handler).
- Toast-on-error pattern matches the context-menu `handleReceipt` so failure UX is consistent across both surfaces.

### JSX
- Wrapped the existing `#shortId` `<Badge>` in a flex group with the new `<button>` to its left.
- Used `FaFileInvoice` (already imported in `WorkflowBoard.js`) — matches the icon used in the context-menu Receipt option for visual consistency.
- `onMouseDown` also stops propagation — protects against the card's `draggable` attribute starting a drag when the operator targets the button.
- `title="Print Receipt"` for the hover tooltip, `aria-label` for screen readers.

### CSS
- Transparent background, no border, slate-500 icon — "subtle, no large chrome" per spec.
- Hover: light slate background + darker icon.
- `:focus-visible`: indigo outline for keyboard navigation.

## Deliberately NOT implemented

- **Second "Bundle Receipt" icon on the card.** Spec said *"If card feels crowded: show only Thermal Receipt icon on card, keep Bundle Receipt inside Phase2Modal."* The card already shows aging chip, sealed lock, customer name, ID badge, type tag, ready indicator, and amount. A second print button would push past comfortable density. Bundle Receipt stays in Phase2Modal where it already lives.

## Test sequence (operator-side)

1. Open Workflow Board, pick any workflow tab.
2. Click the receipt icon on a card in any column → thermal receipt print dialog should open.
3. Confirm the card does NOT open Phase2Modal in parallel.
4. Try to drag from the icon itself → should NOT start a drag (mousedown stopped).
5. Right-click → "Receipt" should still work (existing context-menu path untouched).
6. Verify icon appears on GT / ST / GC / SC / PC cards identically.

## Out-of-scope follow-ups

- If operators report wanting an auto-print-on-create rhythm (the old Python `socket.id === sender` trigger), wire it via `NewGoldTestModal.onSuccess` → `triggerPrint(...)`. Tracked separately.
- Bundle Receipt button in Phase2Modal is already wired (previous task) — receipt-bundle layout uses `{ layout: 'receipt-bundle' }` rather than the thermal `{ layout: 'receipt' }`.
