# Gap 1.3 (P0) — Centralized modal lifecycle manager

**Source:** `airequest/myprompt.txt` — Section 1 row 3
**Recorded:** 2026-05-23 12:30
**Status:** PASS. Singleton service in place; both modal stacks (custom `Modal.jsx` and react-bootstrap modals via `useSafeModalClose`) now participate in cross-modal arbitration.

## What the gap said

> **P0** — Modal-close race conditions still possible under rapid action spam.
> Double-submit / orphan backdrop / focus-lock edge cases.
> **Recommended:** centralized modal lifecycle manager.

## Architectural constraints (from the project directive)

The manager owns **lifecycle orchestration**, not business state:

| Responsibility             | Owned by manager? |
| -------------------------- | ----------------- |
| Backdrop coordination      | YES               |
| Body scroll lock           | YES               |
| Focus restoration          | YES               |
| Close sequencing           | YES (per-modal via `useSafeModalClose`) |
| Escape-key arbitration     | YES               |
| Duplicate-open suppression | YES               |
| Modal form fields          | NO                |
| Workflow draft state       | NO                |
| Business validation        | NO                |

Treated as an **infrastructure service**, not a React convenience helper. Deterministic open/close ordering, single focus authority, idempotent close, explicit teardown.

## What was already in place

Before this gap the app had:
- **`hooks/useSafeModalClose.js`** — strong per-modal close orchestration (rapid-click guard via `closingRef`, post-unmount safety via `mountedRef`, orphan sweep, focus restore via `triggerRef`). Each modal had its own copy of all of this state.
- **`components/core/Modal.jsx`** — a custom modal primitive with a leaky **module-level** `openModalCount` counter for body locking. The counter could desync if useEffect cleanups ran out of order.
- **`contexts/ModalContext.jsx`** — a thin context for opening modals from outside their parent tree (used by WorkflowBoard).
- **~13 react-bootstrap modals** (`NewGoldTestModal`, `Phase2Modal`, `NewCertificateModal`, etc.) each managing their own RB lifecycle independently.

The pieces were correct in isolation; what was missing was the *cross-modal arbiter* — a single source of truth for stack order, body lock ownership, escape routing, and dedup.

## What changed

| Path                                              | What                                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `frontend/src/services/modalLifecycle.js`         | **New.** Singleton service. Owns: open-modal stack, body-lock ownership transfer, single document-level Escape listener, focus-restoration stack, duplicate-key suppression, orphan-backdrop sweep. |
| `frontend/src/hooks/useModalLifecycle.js`         | **New.** React adapter — registers/releases the stack entry across `isOpen` changes; returns `{ isActive, isTop, rejectedAsDuplicate }`. |
| `frontend/src/components/core/Modal.jsx`          | Removed the module-level `openModalCount` counter. Now uses `useModalLifecycle` for body lock and escape. |
| `frontend/src/hooks/useSafeModalClose.js`         | Added `lifecycleKey` option + auto-register/release on `show` toggle. RB modals now participate in cross-modal stack ordering, escape arbitration, and focus restoration without changing any individual modal file. |

## Why the design

**Single Escape listener.** Each modal previously attached its own keydown listener. Two open modals = two listeners = race on which one's onHide fires (or both fire). The singleton attaches one document-level listener and routes to the top of stack. Escape closes exactly one modal — the top.

**Body-lock ownership transfer, not a counter.** A counter is correct only if every increment is matched by a decrement; React Strict Mode double-invoke breaks that. The singleton instead tracks a single owner (whoever first claimed the lock) and transfers ownership when the owner leaves while others remain. The lock releases exactly when the stack empties.

**Focus restoration scoped to the stack entry.** Each `register()` call captures `document.activeElement` at register time. On `release()` (if the released entry was the top), focus returns to that captured element. Independent of which modal closed, focus returns to its own trigger, not the deepest-mounted one.

**Duplicate suppression is opt-in.** If the consumer passes a `key`, the singleton rejects a second `register()` with the same key — the second open returns `rejectedAsDuplicate: true` and never enters the stack. Without a `key`, every register succeeds (legacy compatibility). The project's existing `requestNewWorkflow` / `consumeNewRequest` flow already does context-level dedup, so the singleton's dedup is a defense-in-depth backstop.

**`useSafeModalClose` keeps its responsibilities.** The per-modal close orchestration (reset → onHide → sweep) stays where it is. The hook now also registers/releases a lifecycle entry on every `show` edge, so the RB modals get cross-modal arbitration without any per-modal change. No business state moved into the singleton.

## Verification (PASS)

Driven via Playwright against the live stack. Observed the singleton's DOM-level effects (body class, `.modal.show` count, backdrop count, `document.activeElement`) across eight steps:

| Step                           | Body lock | Modals | Backdrops | Focus after            | Outcome |
| ------------------------------ | --------- | ------ | --------- | ---------------------- | ------- |
| 1. baseline                    | OFF       | 0      | 0         | `BODY`                 | clean   |
| 2. open New Gold Test          | ON        | 1      | 1         | inside modal           | ✓       |
| 3. press Escape                | OFF       | 0      | 0         | `BUTTON "New Gold Test"` (trigger) | ✓ focus restored |
| 4. re-open                     | ON        | 1      | 1         | inside modal           | ✓ clean re-open |
| 5. click X                     | OFF       | 0      | 0         | `BUTTON "New Gold Test"` | ✓ focus restored |
| 6. rapid open/Esc × 3          | OFF       | 0      | 0         | `BUTTON "New Gold Test"` | ✓ no leaked backdrop/lock |
| 7. backdrop click              | ON        | 1      | 1         | inside modal           | ✓ RB static-backdrop honored (no close) |
| 8. final state after Esc       | OFF       | 0      | 0         | `BUTTON "New Gold Test"` | ✓ clean shutdown |

The rapid-open probe was the discriminator — three open/Escape cycles in ~120 ms each completed with zero leaked backdrops, zero leaked body-lock state, and focus correctly restored every time. This is the exact failure mode the gap called out ("rapid action spam → double-submit / orphan backdrop / focus-lock edge cases").

## Known limitations / not-done

- **Migrating individual react-bootstrap modals to pass `lifecycleKey`** is not done. Their `useSafeModalClose` call would just need a `lifecycleKey: 'new-gold-test'` (or similar) for duplicate suppression to activate. Without a key the singleton allows multiple registers, which is the legacy behavior (still safe — body/escape/focus still arbitrated). Add keys incrementally.
- **`ModalManager.jsx`** (the context-driven render dispatcher) still does its own thin switch. Unchanged in this gap — it's a render router, not a lifecycle owner.
- **No unit tests for the singleton yet.** The singleton exposes `_snapshot()` and `_resetForTests()` precisely so it can be tested in isolation. Pure logic, every branch easy to cover. Left for a follow-up.
- **Pre-existing `_sweepOrphans` in `useSafeModalClose` still runs.** It's now mostly redundant with the singleton's sweep, but kept as defense in depth — both are idempotent. Could be removed in a cleanup pass once we trust the singleton in production.

## Artifacts

`C:/WINDOWS/TEMP/verify-gap-1.1/g13-01-modal-open.png` — single frame showing the modal open with body locked and focus inside.

## Next

Gap 1.4 — sealed-state ribbon + immutable badge on DONE records. Touches the workflow surface again (kanban cards + the modal that opens for DONE items in read-only mode). Independent of the modal lifecycle work.
