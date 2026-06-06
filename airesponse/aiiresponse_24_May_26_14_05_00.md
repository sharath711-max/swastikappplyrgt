# GT drag-gate optimistic-move rollback fix

**Source:** operator report — *"Create GT → click Add Test Result → no action → browser refresh → same card clickable"*; user diagnosis: post-create frontend state hydration bug
**Recorded:** 2026-05-24 (backfill)
**Branch:** `dashboard-rebuild`
**Status:** Two-line fix in place. User's diagnosis was incorrect; the actual cause traced to a different file/line.

## Real cause (NOT post-create hydration)

I pushed back on the user's hypothesis after reading the code:

- `NewGoldTestModal.handleSubmit` calls `runModalSubmit({ reload: onSuccess })` where `onSuccess === fetchData` — a **full** kanban refetch from `/workflow/kanban`. No optimistic partial-record insert.
- Socket path `'item:added'` in [`WorkflowBoard.js:186-193`](../frontend/src/pages/WorkflowBoard.js#L186-L193) calls `fetchBoardItem(id, type)` which GETs the complete record via `/gold-tests/:id`.
- `handleCardClick` further does its own `GET /gold-tests/:id` before opening Phase2Modal. Even if cards were partial, the click handler refetches.

After the user clarified the dead click was a **drag-to-Tested**, root cause located at [`WorkflowBoard.js:341-345`](../frontend/src/pages/WorkflowBoard.js#L341-L345):

1. Drag fires `handleDrop`.
2. Optimistic `applyBoardState(moveCardInBoard(...))` moves card visually to IN_PROGRESS.
3. Purity-required gate fires `addToast('⚠️ Add test results (purity) before moving to Tested.')`.
4. Early `return` **skips the rollback** — card stays visually in IN_PROGRESS even though backend never accepted the move.
5. `pendingIds.current.add(itemId)` blocks socket reconciliation for ~500ms.
6. Refresh → `/workflow/kanban` returns truth → card snaps back → now interactable.

DONE gate at [`WorkflowBoard.js:358-362`](../frontend/src/pages/WorkflowBoard.js#L358-L362) had the identical bug for the payment-missing case.

## What was changed

Two-line fix in [`frontend/src/pages/WorkflowBoard.js`](../frontend/src/pages/WorkflowBoard.js):

```jsx
if (!hasPurity) {
    applyBoardState(previousBoard);   // ← added
    addToast('⚠️ Add test results (purity) before moving to Tested.', 'warning');
    setDraggedItem(null);
    return;
}
```

And the same `applyBoardState(previousBoard)` rollback inserted in the DONE-gate's payment-missing early-return.

## Verification

Test sequence the operator should run:

1. Create a fresh GT (no purity), drag from Ongoing → Tested → toast appears AND card snaps back to Ongoing.
2. Add purity in Phase2Modal, drag again → moves cleanly.
3. Drag an IN_PROGRESS card without payment details → Completed → snap-back + toast.
4. Normal happy-path drag (purity + payment present) still works — no regression because existing catch-block rollback path is unchanged.
