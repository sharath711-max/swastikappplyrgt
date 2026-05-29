# Phase2Modal — Bundle Receipt button wired

**Source:** prompt — *"Put it in Phase2Modal"* (user's recommendation for the receipt-bundle trigger location)
**Recorded:** 2026-05-24 (backfill)
**Branch:** `receipt-bundle-wip`
**Status:** Shipped.

## What was implemented

One handler + one header-action restructure in [`frontend/src/components/Phase2Modal.js`](../frontend/src/components/Phase2Modal.js):

### `openBundlePrint` handler

```js
const openBundlePrint = async () => {
    const route = resolvePrintRoute();
    if (!route || !test?.id) return;
    try {
        await triggerPrint(route, test.id, { layout: 'receipt-bundle' });
    } catch (err) {
        addToast('Print failed. Please try again.', 'error');
    }
};
```

Defined next to the existing `openFullPrint`. Uses the file's existing `resolvePrintRoute()` helper for workflow→route mapping.

### Header action restructure

Original condition was `{isDoneStage && (...)}`, gating the entire Copy + Print All action area to DONE only. Relaxed to:

```jsx
{(isDoneStage || currentStatus === 'IN_PROGRESS') && resolvePrintRoute() && (
    <div className="d-flex gap-2 ms-auto me-3">
        {isDoneStage && (<Button>Copy</Button>)}
        {isDoneStage && (isCertificate || isGoldTest || isSilverTest) && (<Button>Print All</Button>)}
        <Button variant="outline-dark" size="sm" onClick={openBundlePrint} title="Customer receipt: summary page + one page per sample">
            <FaFileInvoice className="me-1" /> Bundle Receipt
        </Button>
    </div>
)}
```

Result: Copy and Print All remain DONE-only (their existing semantics). Bundle Receipt is visible in **both IN_PROGRESS and DONE** — operator can hand the customer a receipt at intake time (post-test verification), not only after sealing.

## UI placement

```
[ Modal title · Sealed badge ]    [ Copy ] [ Print All ] [ 🧾 Bundle Receipt ]
                                  ^ DONE   ^ DONE         ^ IN_PROGRESS + DONE
```

`outline-dark` variant + `FaFileInvoice` icon differentiate from Copy (`outline-primary`) and Print All (`outline-success`).

## Why Phase2Modal vs. other surfaces

User recommendation (which I agreed with):

- **Workflow right-click menu** — less discoverable, power-user only
- **Dashboard recents** — Dashboard is overview, not record-level action surface
- **WorkflowBoard card** — would add card clutter (later addressed by a separate prompt with the icon-on-card pattern)
- **Phase2Modal** — operator already there during the verify-items step, before customer handover

Matches the operational flow: *Create → Phase2Modal → verify items → click Bundle Receipt → hand customer summary + sample slips.*

## Out-of-scope (deferred per user)

- Auto-print toggle in NewGoldTestModal etc. — manual button first.
- Header button spacing on narrow screens — only patch with `flex-wrap` if visual crowding observed; not preemptive.
