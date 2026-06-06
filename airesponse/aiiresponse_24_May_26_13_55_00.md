# Modal-backdrop click-blocker fix — useSafeModalClose retrofit

**Source:** operator report — *"after submit saved close action on modal closing and Existing card not clickable"*; user diagnosis: orphan `.modal-backdrop` left after close
**Recorded:** 2026-05-24 (backfill)
**Branch:** `dashboard-rebuild`
**Status:** Fix in place; one-line memory written to prevent recurrence.

## Root cause

The 5 new dashboard modals shipped earlier (CustomerCredit, WeightLoss, RevenueToday, RevenueAllTime, CashInHand) called the parent's `onHide()` directly. React-Bootstrap's modal can leave `.modal-backdrop` + `body.modal-open` behind after close, especially when the close happens in the same tick as parent state cascades (success → `refreshAll()` → `onHide()`). The orphan backdrop is invisible but `pointer-events: auto`, so it intercepts every click on the page until a reload.

This project already has a purpose-built [`useSafeModalClose`](../frontend/src/hooks/useSafeModalClose.js) hook used by all 7 pre-existing modals (NewGoldTestModal, NewSilverTestModal, Phase2Modal, etc.). I missed it when writing the new dashboard modals.

## What was changed

[`frontend/src/components/dashboard/CustomerActionModals.jsx`](../frontend/src/components/dashboard/CustomerActionModals.jsx) (Credit + Weight Loss):

- Imported `useSafeModalClose`
- Defined `resetTransientState` to wipe form + submitting flag
- Replaced raw `onHide()` calls with `closeSafely()` in success path AND as the Modal component's `onHide` prop (covers X, Escape, click-outside, backdrop click — the four close paths drift-prone in modal code)
- Added `mountedRef.current` guard around post-await setState
- Dropped `finally { setSubmitting(false) }` — the reset hook covers success; only the error path keeps the explicit setSubmitting since the modal stays open there

[`frontend/src/components/dashboard/FinancialBreakdownModals.jsx`](../frontend/src/components/dashboard/FinancialBreakdownModals.jsx) (3 read-only breakdown modals):

- Each now wires `safeClose` as the Modal's `onHide` prop (no form state to reset)

## Memory written

[`feedback_react_bootstrap_modal_safe_close.md`](../../.claude/projects/c--Users-pc-Desktop-swastik-gold-silver-lab/memory/feedback_react_bootstrap_modal_safe_close.md) — captures the rule, the symptoms (clicks dead, no error, no visible problem until reload), and the discovery process (grep `useSafeModalClose` in `components/` before writing any new RB modal).

## Verification

`grep -rn "onHide()" frontend/src/components/dashboard/` returns 0 matches. All 5 dashboard modals now route through `closeSafely`.
