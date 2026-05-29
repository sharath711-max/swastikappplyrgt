# Print architecture canonical doc — accepted as project baseline

**Source:** operator review of the rewritten `docs/print-service-architecture.md` — *"I'd treat this version as the canonical print reference for the Swastik project going forward."*
**Recorded:** 2026-05-24 14:59
**Branch:** `receipt-bundle-wip`
**Status:** Accepted. Document is the canonical print reference baseline.

## Operator-confirmed value

Two structural improvements highlighted as material:

1. **Locked decisions count went from 3 → 7.** The four newly-explicit decisions (Thermal Receipt as fast counter-print path, Receipt Bundle scope-locked to single-record bundling, GC/SC CSS isolation, and physical-printer-verification requirement for any geometry unification) are operational rules. Once written explicitly, they prevent future "cleanup" PRs from breaking print behavior.

2. **Tone shifted from conversational to reference prose.** Removal of FAQ framing, "we / you" voice, and airesponse cross-links lets the document survive independently of the conversation that produced it.

## Most operationally valuable rule

Locked Decision #7 was called out as the highest-value addition:

> Print geometry must never be unified without:
> 1. operator sign-off
> 2. physical print test on the target printer with the target paper
> 3. audit trail of the verification before the merged geometry ships

This blocks the common failure mode where a developer sees duplicate CSS, refactors to DRY it, ships through code review, and the resulting 2 mm printer drift breaks certificate alignment in production. Code review alone cannot catch that failure mode — the rule has to be written in the architecture document.

## Doc now functions as

- Architecture baseline
- Migration reference
- Print-system guardrail
- Contributor onboarding document

Sitting alongside `docs/dashboard-gap-list.md` and `docs/migration-verification/`, it is structurally native to the repo's documentation pattern.

## No further action

- Document is locked. Any future changes require operator review.
- No additional memory entries needed — the architectural rule is already captured in [[feedback_python_cert_architecture]] and [[feedback_print_extension_patterns]]; the docs file is the externally-discoverable form.
- Open follow-ups (PhotoCert signatory verification, `num2words` JS equivalent, `|in_carat` JS helper, receipt-on-create auto-trigger) tracked in §5 of the canonical doc as non-blocking items.

## Branch state recap

`receipt-bundle-wip` working tree contains:

- 4 new print components + `ReceiptBundle.css` (Receipt Bundle feature)
- 4 wire-in edits (PrintContext, PrintPortal, PrintView, Phase2Modal)
- 1 new card-quick-print receipt icon edit (WorkflowBoard.js + WorkflowBoard.css)
- 1 canonical docs file (`docs/print-service-architecture.md`)
- ~11 aiiresponse files (session backfill + going-forward records)
- Plus pre-existing operator WIP from prior sessions (untouched by me)

Per heavy-entanglement exception, branch stays uncommitted until operator-driven commit pass.
