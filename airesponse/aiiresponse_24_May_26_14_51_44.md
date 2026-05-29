# Print catalog promoted to canonical project documentation

**Source:** operator direction — *"Save this document exactly as your print reference baseline. If someone later asks: why separate CSS? why separate cert components? why can't we unify print layouts? this file answers it clearly."*
**Recorded:** 2026-05-24 14:51
**Branch:** `receipt-bundle-wip` (working tree — uncommitted)
**Status:** Promoted to `docs/print-service-architecture.md`. Closure note saved.

## What shipped

Two file writes:

1. [`docs/print-service-architecture.md`](../docs/print-service-architecture.md) — canonical project documentation. Lead with the load-bearing rule ("Template logic can be shared. Paper geometry cannot."), then the five artifact classes + Bundle Receipt addition, then mapping table, then design rules, then locked decisions, then open follow-ups.
2. This aiiresponse file — closure record.

## Why `docs/` and not `airesponse/`

`airesponse/` is conversation log. `docs/` is project authority. Per the operator's framing — *"good closure" + reference baseline for future questions* — this content needs to live where future contributors can find it without grepping through aiiresponse logs.

Docs are also reachable from `docs/dashboard-gap-list.md` and `docs/migration-verification/`. The print architecture file fits that pattern.

## Confirmed locked decisions (preserved in docs)

- ST receipt mirrors GT receipt (no Python ancestor; operator-consistency priority)
- Bundle Receipt is parallel institutional artifact, not a cert replacement
- PhotoCert signatory "Bhimram" preservation required; verification queued
- The five Python artifact classes + the SERN-only Bundle Receipt

## Open follow-ups (also preserved in docs)

- `num2words` JS equivalent for GC/SC purity-in-words legal copy
- `|in_carat` JS helper for cert carat label
- PhotoCert signatory grep verification
- Receipt-on-create auto-trigger (deferred per "manual button first")

## What I did NOT save to memory

The "Template logic can be shared. Paper geometry cannot." rule is already captured architecturally in [[feedback_python_cert_architecture]] — *"share print infrastructure but NEVER share cert geometry"*. The new docs file makes it externally discoverable; the memory continues to make it accessible to me in future sessions. No new memory entry needed — the existing one is the canonical statement.

## Branch state

`receipt-bundle-wip` now contains, uncommitted:

- 4 new print component files + `ReceiptBundle.css`
- 4 wire-in edits (PrintContext, PrintPortal, PrintView, Phase2Modal)
- 1 new component edit (WorkflowBoard.js + WorkflowBoard.css for card-quick-print)
- 1 new docs file (`docs/print-service-architecture.md`)
- 9 aiiresponse files (this session's backfill + going-forward saves)

Plus pre-existing WIP from prior sessions in the working tree (unchanged by me). Per the heavy-entanglement exception, branch stays at this state until operator-driven commit pass.
