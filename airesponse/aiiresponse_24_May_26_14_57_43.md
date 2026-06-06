# Print architecture documentation — rewritten to canonical spec

**Source:** prompt — *"Build project-level canonical documentation for Swastik print architecture. Create a permanent architecture reference document: docs/print-service-architecture.md"*
**Recorded:** 2026-05-24 14:57
**Branch:** `receipt-bundle-wip`
**Status:** Document rewritten to match the canonical-doc spec exactly. Replaces the earlier draft from `aiiresponse_24_May_26_14_51_44`.

## What changed from the prior draft

The previous version was close but missed several locked decisions and leaned conversational in places. Rewrite addresses both:

### Structural changes

- **Lead with the architectural rule.** Section 1 now opens with the bare rule, then explains "safe to share" / "unsafe to share" / why the rule exists. The 1–2 mm drift consequence is called out explicitly as the cost of CSS deduplication.

- **Print Artifact Catalog now uses metadata tables** (Purpose / Geometry / Workflows / Pages) before the structural prose for each artifact. Improves scannability and matches the long-lived engineering reference tone the spec required.

- **Locked Decisions expanded from 3 → 7 items** to match the spec:
  1. ST has no Python ancestor
  2. ST receipt mirrors GT receipt behavior
  3. Bundle Receipt is parallel artifact, not cert replacement
  4. Thermal Receipt remains fast counter-print path (newly explicit)
  5. Receipt Bundle remains A4 customer + sample packet (newly explicit, with cross-record bundling explicitly out of scope)
  6. GC and SC certificate CSS must remain isolated (newly explicit as a locked decision, not just inferred from the rule)
  7. Print geometry must never be unified without physical printer verification (newly explicit with the three-step verification requirement: operator sign-off + physical print test + audit trail)

- **Open Follow-ups now marked `Status: follow-up / non-blocking`** per spec, with the four items the spec listed.

### Tone changes

- Removed chat-style addresses ("If you find yourself DRY-ing two cert components, stop.") in favor of declarative reference prose.
- Removed the FAQ-style opening ("Use this document when answering: ...").
- Removed the "Related references" section that linked back to airesponse logs — future contributors should be able to answer from this file alone without grepping conversation history.
- Replaced "Notable design rules" prose section with a `File locations` section that just lists paths.
- Switched from "we / you" voice to "the system / operators / this codebase" voice throughout.

## What was preserved

- The five Python-ported artifact classes + the SERN-only sixth (Receipt Bundle).
- The complete Python→SERN mapping table.
- The PhotoCert hardcoded `Bhimram` signatory note (verification still queued in follow-ups).
- Custom Jinja filter list (`|round0`, `|in_carat`, `num2words`) with the load-bearing-for-legal-copy callout.

## Verification questions the document now answers directly

- *Why separate CSS?* → §1 (1–2 mm drift breaks alignment) + §4.6 (locked decision)
- *Why separate cert components?* → §2.4 (Silver Certificate entry explicit on byte-for-byte template identity but separate CSS); §4.6
- *Why not build one unified print layout?* → §1 rule + §4.7 (requires physical printer verification before any unification)
- *What print artifacts exist?* → §2 catalog (six classes)
- *What maps from Python?* → §3 mapping table
- *What is new in SERN?* → §3 (Receipt Bundle marked SERN-only) + §2.6

## File location

`docs/print-service-architecture.md`

Reachable alongside `docs/dashboard-gap-list.md` and `docs/migration-verification/`. Pattern-consistent with the rest of the project's docs directory.

## Out of scope for this rewrite

- No code changes.
- No memory updates — the architectural rule is already captured in [[feedback_python_cert_architecture]] and [[feedback_print_extension_patterns]]; the docs file is the externally-discoverable form.
- No airesponse cross-linking from the docs file (per spec — "without reading old conversations or searching airesponse logs").
