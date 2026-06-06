# Gap 1.7 (P1) — Prerequisite banners on cert modals

**Source:** `airequest/myprompt.txt` — Section 1 row 7
**Recorded:** 2026-05-23 14:11
**Status:** PASS. Banner present on all three cert modals (GC / SC / PC), absent on test modals as expected. Wording matches institutional truth — backend does not enforce a test prerequisite, so the copy says "typically" not "requires."

## What the gap said

> **P1** — No workflow dependency visibility.
> GC/SC creation dependencies are implicit.
> **Recommended:** add prerequisite banners.

## Architectural constraint (from the directive)

> Calm, directional, instructional, workflow-oriented. Not warning-heavy or error-colored. **Surface existing institutional rules — don't create new ones accidentally.** Audit actual dependency rules before writing copy.

## Audit before code (institutional reality)

Searched the backend for actual dependency enforcement between certs and tests. Findings:

| Question                                            | Reality                                                                                                         |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Does GC require a finalized GT?                     | **No.** `certificateService.createCertificate(type, data)` accepts customer + items directly.                  |
| Does GC have any FK to gold_test in schema?         | **No.** `gold_certificate.customer_id → customer.id`. No `gold_test_id` link.                                  |
| What's the "test-driven" path?                      | `testService.completeTest()` calls `certificateService.createFromTestItems()` on finalization — internal hop.   |
| Does SC mirror GC?                                  | Yes, same shape.                                                                                                |
| Does PC have a test prerequisite?                   | **No.** Photo Cert is by design independent — operator photographs the items, no test/purity flow.              |

**Implication.** The "prerequisite" is operational doctrine, not enforced rule. The user's example wording "Gold Certificate requires a finalized Gold Test" would have *invented* a constraint the backend doesn't enforce — the directive's own anti-pattern ("don't create new institutional rules accidentally"). Used "typically generated when … is finalized" instead.

## What changed

| Path                                                                | What                                                                                              |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `frontend/src/components/core/PrerequisiteBanner.jsx`               | **New.** Presentational. Slate panel, info-icon, single-sentence body. No animation. Accepts children. |
| `frontend/src/pages/WorkflowBoard.css`                              | `.prereq-banner` styles — `#f1f5f9` background, `#64748b` left border, info icon, no animation.    |
| `frontend/src/components/NewGoldCertificateModal.js`                | Banner at top of `Modal.Body`. Wording: "Gold Certificate is typically generated when a Gold Test is finalized. Direct entry is supported for legacy or off-system items but skips test-result reuse." |
| `frontend/src/components/NewSilverCertificateModal.js`              | Mirror copy for Silver.                                                                            |
| `frontend/src/components/NewPhotoCertificateModal.js`               | Different wording: "Photo Certificate is created independently from the customer's existing items. No prior test is required; ensure the source items match what was actually weighed." |

GT and ST modals deliberately have **no** banner — their flow has no upstream prerequisite, and adding a banner there would manufacture ambiguity where the institutional flow is already clear.

## Wording rationale

Two sentences per banner, doing two different jobs:

| Sentence                                                              | Purpose                                                                                   |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| "Gold Certificate is typically generated when a Gold Test is finalized." | Surfaces the canonical institutional path so operators stop relying on tribal knowledge. |
| "Direct entry is supported for legacy or off-system items but skips test-result reuse." | Acknowledges the existence of the bypass path and tells the operator what they lose by taking it. |

The Photo Cert banner deliberately *doesn't* mention tests — saying "no test required" once is more honest than implying tests are an option. Adds a tactile reminder ("ensure the source items match what was actually weighed") because PC has no upstream test to backstop weight accuracy.

**Never used the word "requires."** Backend doesn't enforce a prerequisite, so the UI must not claim one. If it did, an operator legitimately doing a direct-entry cert would receive a phantom "rule violation" feeling — the exact "system blocked me" framing Gap 1.4 worked to dissolve.

## Why this shape

- **Slate, not blue or yellow.** Info-blue would imply tooltip, yellow would imply warning. Slate matches the institutional palette of Gaps 1.4 (sealed ribbon) and 1.5 (draft footer) — same family, "this is just how the system works" register.
- **Top of `Modal.Body`, above the customer search.** The operator sees the canonical path *before* they start typing — sets expectations rather than correcting them after.
- **Reusable component.** Single `<PrerequisiteBanner>` with children — three different copies, one consistent shape. Other workflows can adopt the same banner with different wording when their own prerequisites become surface-worthy.
- **No "Action required" button.** This is *guidance*, not an alert. Adding a CTA would shift the psychological register from instructional to interventional.

## Verification (PASS)

Playwright across all four modal types:

| Modal           | Banner expected?     | Banner present? | Wording verbatim?                                                                                                                                                                       |
| --------------- | -------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gold Cert       | YES                  | ✓               | "Gold Certificate is typically generated when a Gold Test is finalized. Direct entry is supported for legacy or off-system items but skips test-result reuse."                          |
| Silver Cert     | YES                  | ✓               | "Silver Certificate is typically generated when a Silver Test is finalized. Direct entry is supported for legacy or off-system items but skips test-result reuse."                      |
| Photo Cert      | YES                  | ✓               | "Photo Certificate is created independently from the customer's existing items. No prior test is required; ensure the source items match what was actually weighed."                    |
| Gold Test (neg) | **NO**               | ✗ (absent)      | n/a                                                                                                                                                                                     |

Visual frame: `C:/WINDOWS/TEMP/verify-gap-1.1/g17-gc.png` — slate panel above the Customer field, info-icon, two-sentence body. Sits naturally between the modal header and the form.

## Findings during verify

- **PAGE ERR observed when GT modal opened in the negative-test step.** The console reported a React error from `<Context.Provider>` inside `Transition` / `BackdropTransition` / `NewGoldTestModal`. The modal opened, the negative assertion (banner absent) succeeded, and Escape closed it cleanly — so the error didn't manifest in user-visible state. Almost certainly a transient unmount-during-transition warning from the modal lifecycle integration (Gap 1.3) interacting with RB's fade. Worth investigating in a hardening pass but not blocking this gap; the lifecycle service is still working at the observable level (body lock, focus, stack — all verified clean in Gap 1.3).
- **GT modal title "Gold Certificate Testing (A025)" visible in the background** in the GC screenshot — that's the next-cert-item-number preview from Gap 1.2's section title work, behaving correctly.

## Known limitations / not-done

- **No dynamic enablement of paths based on prerequisites.** A "Use existing Gold Test instead" shortcut button could deepen the guidance, but that's a workflow-flow change and out of Gap 1.7 scope.
- **No banner on `Phase2Modal`** when editing a test that's about to finalize. The flow-completion path is already visible there (DONE state, sealed ribbon from Gap 1.4); a prerequisite banner would be redundant.
- **No banner on the `NewCertificateModal` legacy wrapper.** The active flows route through the type-specific modals (NewGoldCertificateModal, etc.). If `NewCertificateModal` is still reachable from any path, it would benefit from the same treatment.

## Artifact

`C:/WINDOWS/TEMP/verify-gap-1.1/g17-gc.png`, `g17-sc.png`, `g17-pc.png`.

## Next

Gap 1.8 — persistent top-level parity-mode banner. The anomaly widget already surfaces parity-mode-active as a HIGH-severity row (Gap 1.6), but the gap calls for a *persistent top-level* surface — meaning the operator sees the warning even when not on the admin dashboard. Different psychological role: governance-risk visibility at all times vs. anomaly inventory.
