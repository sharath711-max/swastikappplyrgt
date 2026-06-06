# Bundle Receipt — full feature removal

**Source:** operator direction — *"Remove bundle reciept just reciept icon in Catd"* (keep only the receipt icon on workflow cards)
**Recorded:** 2026-05-27 05:41
**Branch:** `receipt-bundle-wip` (name retained — historical label; renaming not worth the churn)
**Status:** Bundle Receipt feature removed entirely (button, components, wire-ins, doc entries). Card receipt icon preserved.

## What was removed

### Trigger removal

- [`frontend/src/components/Phase2Modal.js`](../frontend/src/components/Phase2Modal.js):
  - Deleted the `openBundlePrint` async handler
  - Deleted the "Bundle Receipt" button from the modal header action group
  - Reverted the action-group visibility condition from `(isDoneStage || currentStatus === 'IN_PROGRESS') && resolvePrintRoute()` back to `isDoneStage` only (matches pre-Bundle state)
  - Copy and Print All buttons retain their DONE-only visibility

### Wire-in cleanup

- [`frontend/src/components/print/PrintPortal.jsx`](../frontend/src/components/print/PrintPortal.jsx):
  - Removed `ReceiptBundle` import
  - Removed the `if (job.layout === 'receipt-bundle')` dispatch branch
  - Reverted to the original ternary chain (`printType === 'receipt'` → ThermalReceipt; `itemLevel` → per-item PrintManager loop; else → single PrintManager)

- [`frontend/src/pages/PrintView.js`](../frontend/src/pages/PrintView.js):
  - Removed `ReceiptBundle` import
  - Removed the `layout === 'receipt-bundle'` route-based dispatch
  - Reverted to the original layout dispatch (`receipt` → ThermalReceipt; else → PrintManager)

- [`frontend/src/contexts/PrintContext.jsx`](../frontend/src/contexts/PrintContext.jsx):
  - Removed the `routeType` pass-through on the resolved job object (was only consumed by ReceiptBundle)
  - Reverted `needsReceiptSnapshot` logic to its original `resolved.printType === 'receipt'` form
  - The job shape is back to its pre-Bundle state

### Files deleted (4)

- `frontend/src/components/print/ReceiptBundle.jsx`
- `frontend/src/components/print/ReceiptBundleSummary.jsx`
- `frontend/src/components/print/ReceiptBundleSample.jsx`
- `frontend/src/components/print/ReceiptBundle.css`

### Documentation update

[`docs/print-service-architecture.md`](../docs/print-service-architecture.md):

- §2 intro: "six distinct artifact classes" → "five distinct artifact classes"
- §2.6 (Receipt Bundle artifact entry): **removed**
- §3 mapping table: dropped the `ReceiptBundle / layout: 'receipt-bundle' / SERN-only` row
- §4 Locked Decisions:
  - Decision #3 ("Receipt Bundle is a parallel print artifact, not a certificate replacement") — **replaced** with a new #3 stating ThermalReceipt is the customer handover artifact, with a forward-pointer to §6 explaining the Bundle removal
  - Decision #5 ("Receipt Bundle remains the A4 customer + sample packet") — **removed**
  - Remaining decisions renumbered #4 (CSS isolation) and #5 (physical printer verification)
- New §6 "Removed" section added — explains the Bundle Receipt removal in operator-facing terms, lists the deleted files, and instructs future contributors not to reintroduce an A4 multi-page customer acknowledgement without explicit authorization

## What was preserved

### Card receipt icon (operator's requested target)

- [`WorkflowBoard.js`](../frontend/src/pages/WorkflowBoard.js): `handleCardReceipt` handler + receipt icon on every kanban card — **unchanged**. Operator clicks the icon, triggers `triggerPrint(printType, item.id, { layout: 'receipt' })`, gets a thermal receipt via the existing `ThermalReceipt` component.

### ThermalReceipt + cert components

- `ThermalReceipt.jsx` — unchanged. Still the customer-handover artifact for all 5 workflows.
- `GoldCert.js`, `SilverCert.js`, `PhotoCert.js`, `SmallCert.js`, `MemoCert.js`, `PaymentCert.js` — unchanged.

### Context-menu Receipt action

- The right-click "Receipt" option on workflow cards (via `handleReceipt`) still works — same `triggerPrint(printType, id, { layout: 'receipt' })` call.

## Why the removal makes sense

Python already produces a thermal-strip multi-item receipt that prints a customer summary page plus per-item slips (the `gold_test/receipt.html` structure with `<div class="page-break"></div>` between items). SERN's `ThermalReceipt` is the direct port of Python's customer copy — for a multi-item record, it shows all items in one summary. The A4 Bundle Receipt was a parallel artifact that duplicated this purpose with a different paper format. Operator preference is the thermal-strip format triggered from the card icon — no need for the A4 variant.

## Branch state

`receipt-bundle-wip` working tree:

- 5 modified files (Phase2Modal, PrintPortal, PrintView, PrintContext, print-service-architecture.md)
- 4 deleted files (the Bundle Receipt components)
- Other earlier work on the branch (Salesforce SLDS install, dashboard Python rebuild, dark sidebar, sidebar simplification, card receipt icon, PhotoCert carat fix) — unchanged

The branch name still says `receipt-bundle-wip` but the feature is gone. Not renaming — branch labels are throwaway, the meaningful history is in the commits when the branch is staged.

## Verification

`grep -rn "ReceiptBundle\|receipt-bundle" frontend/src docs/` returns zero matches. Remaining hits are in `airesponse/*.md` (historical conversation logs — point-in-time records, not edited as a matter of policy) and the branch name.

After `npm start`:

- Card receipt icon → still prints thermal receipt
- Phase2Modal → only Copy + Print All buttons (DONE state); no Bundle Receipt button
- No console errors from missing components or broken imports

## Memory note (none added)

This is a feature rollback, not a learning. No memory entries created. The print architecture doc's §6 "Removed" subsection is the durable record.
