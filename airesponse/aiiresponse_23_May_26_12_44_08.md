# Gap 1.5 (P1) — Explicit draft-state footer

**Source:** `airequest/myprompt.txt` — Section 1 row 5
**Recorded:** 2026-05-23 12:44
**Status:** PASS. Contextual draft-state footer wired into both New Gold Test and New Silver Test modals. Identical shape applies cleanly to the certificate modals as a follow-up.

## What the gap said

> **P1** — No draft-preservation indicator.
> Operators may think data vanished after cancel / switch.
> **Recommended:** add explicit draft-state footer.

## Architectural constraint (from the directive)

The directive was explicit about *psychological tone*:

> Draft preservation should feel **reassuring**, not **danger-oriented**.
> Muted footer, subtle save/draft wording, contextual appearance only when draft exists.
> UX goal: reduce operator fear during interruption — not introduce another governance warning surface.

This is **operator ergonomics**, not governance enforcement. Different category from the sealed ribbon (Gap 1.4): the sealed ribbon teaches the operator that the system is *protecting institutional truth*; the draft footer reassures them that the system is *preserving their work*. Same calm slate palette, different psychological job.

## What changed

| Path                                              | What                                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `frontend/src/components/core/DraftStateFooter.jsx` | **New.** Presentational. Renders the muted footer when `isDirty=true`, nothing otherwise. Accepts an optional `message` override; defaults to the calm wording. |
| `frontend/src/pages/WorkflowBoard.css`            | `.draft-state-footer` slate-tone styles, document-icon, no animation.                  |
| `frontend/src/components/NewGoldTestModal.js`     | Derives `hasDraftEntries` from existing form state (customer selection, search input, inline new-customer fields, sample rows); renders `<DraftStateFooter />` at the end of `Modal.Body`. |
| `frontend/src/components/NewSilverTestModal.js`   | Same derivation + render.                                                              |

The footer wording (verbatim):

> Draft preserved while this form is open. Closing discards unsaved entries.

One sentence. Two facts:
- "preserved while open" — answers the implicit fear that draft entries vanish on a workflow switch.
- "closing discards unsaved entries" — sets accurate expectation about the existing `tryWorkflowSwitch` confirm flow (which already prompts "Discard new X entry in progress?" before closing).

## Why this shape

- **Component, not hook.** A hook would force every consumer to derive dirty-ness *and* render. A presentational component lets the parent own the dirty derivation (per-form business logic) while the component owns appearance (cross-form consistency). Matches the same lifecycle-vs-business-state separation the modal lifecycle service uses.
- **Per-modal `hasDraftEntries` derivation, not a generic "dirty" library.** Each modal knows what counts as a draft for *its own* form: the inline new-customer fields, the sample rows, the customer search. Centralizing dirty-tracking would either over-detect (every render triggers it) or require a heavy form-state library. The current cost is one explicit boolean per modal — ~10 lines, transparent, easy to audit.
- **Slate, not blue or green.** A green "saved" pill would suggest persistence to a server; a blue "info" badge would imply chrome. Slate matches the sealed ribbon's institutional palette but reads as background reassurance rather than authority — same family, different register.
- **No animation.** A pulse or slide-in would imply *attention required*. Drafts are background reassurance, not events. Pure conditional render.
- **Contextual appearance.** A always-visible footer would teach the operator to ignore it within hours. Hiding it on the pristine form makes it actually mean something on the dirty form.

## Verification (PASS)

Driven via Playwright on `NewGoldTestModal`:

| Step                              | Footer present? | Text matches?                                                                  |
| --------------------------------- | --------------- | ------------------------------------------------------------------------------ |
| 1. Fresh modal open (pristine)    | NO              | n/a                                                                            |
| 2. Type "Test Customer" in name   | YES             | "Draft preserved while this form is open. Closing discards unsaved entries."   |
| 3. Clear the field                | NO              | n/a                                                                            |
| 4. Re-fill                        | YES             | (same)                                                                         |

Visual frame: `C:/WINDOWS/TEMP/verify-gap-1.1/g15-01-modal-with-draft.png` — slate footer at the bottom of the modal body, document-icon on left, single-sentence reassurance. Doesn't compete with the form content above.

## Known limitations / not-done

- **Certificate modals not yet wired.** `NewGoldCertificateModal`, `NewSilverCertificateModal`, `NewPhotoCertificateModal` have identical state shapes (customer + items) and would take one import + one boolean each. Left for a follow-up so this gap stays surgical to the two highest-traffic intake modals.
- **No detection of "balance" changes** from the default `'0'` value. If an operator deliberately types `0` for balance (already the default), the footer won't appear unless other fields are touched. Acceptable — most operators interact with name/phone/items before balance.
- **No "your draft is X seconds old" timer.** The directive explicitly said no animation, no urgency. The footer just signals presence.
- **`Phase2Modal` (the edit-existing-test modal) does not carry a draft footer.** The directive scoped Gap 1.5 to draft preservation in *new* entries; Phase2Modal's editing flow has a different mental model (the record already exists). Could be revisited if operators flag it.

## Artifact

`C:/WINDOWS/TEMP/verify-gap-1.1/g15-01-modal-with-draft.png`.

## Next

Gap 1.6 (P1) — "System anomalies" admin widget. Different layer — governance telemetry on the admin dashboard. Requires touching the audit / reconciliation surface, not just visual operator ergonomics. Per the maturity matrix, this crosses the boundary from operator ergonomics back into governance visibility.
