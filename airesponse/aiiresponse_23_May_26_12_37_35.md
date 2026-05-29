# Gap 1.4 (P0) — Sealed-state ribbon + immutable badge on DONE records

**Source:** `airequest/myprompt.txt` — Section 1 row 4
**Recorded:** 2026-05-23 12:37
**Status:** PASS. DONE records now signal sealed authority on both the kanban surface and the read-only Phase2Modal. The "why" sentence is in place.

## What the gap said

> **P0** — No explicit "record locked after DONE" UI state.
> Operators discover immutability only after action failure.
> **Recommended:** add sealed-state ribbon + immutable badge.

## Architectural constraint (from the project directive)

The directive was explicit about *tone*:

> DONE authority should feel **institutional**, not **panic-driven**.
> Calm, sealed, authoritative, obvious, non-negotiable.
> Muted ribbon, lock glyph, "Finalized / Sealed".
> Show *why*, not just *immutable* — single sentence converting "system blocked me" into "system is protecting institutional truth."

No alarm-red. No animation. No giant warning banners. No theater.

## What changed

| Path                                       | What                                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `frontend/src/pages/WorkflowBoard.js`      | DONE kanban cards now carry `kanban-card--sealed` class, a lock-glyph indicator in the top-right corner (replaces the green ready-indicator position, never co-occurs), and a `SEALED` tag in the card footer next to the type tag. |
| `frontend/src/pages/WorkflowBoard.css`     | `.kanban-card--sealed` (muted slate left-border + faint slate-50 wash), `.kanban-card__sealed-indicator` (slate-900 lock badge), `.card-sealed-tag` (slate-900 footer tag), `.sealed-badge` (modal header replacement for "View Only"), `.sealed-ribbon` (calm institutional panel with title + why sentence). |
| `frontend/src/components/Phase2Modal.js`   | When `isDoneStage`: replaces the generic `<Badge bg="secondary">View Only</Badge>` with a slate lock-glyph "Sealed" badge in the header; injects the sealed ribbon at the top of `Modal.Body` with the "why" sentence. Other readOnly modes (e.g. `isSystemReadOnly`) keep the original "View Only" badge — only true finalized records get the sealed treatment. |

## The "why" sentence (verbatim)

> **FINALIZED · SEALED**
> Finalized records are sealed to preserve audit, print, and ledger consistency. Use the Correction Flow for changes.

Three deliberate moves in one sentence:
- "to preserve audit, print, and ledger consistency" — names the *institutional purpose*, not a generic "protected" hand-wave.
- "Finalized records are sealed" — reads as *policy*, not as *error*. The system is not refusing the operator; the record itself is sealed.
- "Use the Correction Flow for changes" — gives the operator an *exit path*. Even though the Correction Flow itself is a future gap (1.7 area), naming it removes the "system blocked me with no recourse" framing.

## Why this shape

- **Lock glyph + muted slate, not alarm-red.** Red signals operator error or system failure. Slate signals policy. The visual register matches the institutional message.
- **No animation.** A pulse would imply *current alert*. The sealed state is not an alert — it's a permanent property of the record.
- **Sealed indicator at top-right of the card, not full-card overlay.** Lets the existing card content (customer, amount, type) stay legible. The lock + footer tag together are unambiguous without obscuring the data.
- **Sealed ribbon at the top of the modal body, not the header.** The header already carries the title and the badge. The ribbon belongs in the body because it's *content about the record's status*, not chrome.
- **Replaces "View Only," doesn't add to it.** A DONE record is not just "view only" (which could mean any read-only state, e.g. a non-Lab parity machine); it's *sealed*. Two badges saying similar things would be noise.

## Verification (PASS)

Driven via Playwright against the live stack.

### Kanban Completed column — 5 sampled cards

| Customer        | `kanban-card--sealed` | Lock indicator | `SEALED` tag | Ready indicator (must be absent) |
| --------------- | --------------------- | -------------- | ------------ | -------------------------------- |
| sukantho        | ✓                     | ✓              | ✓            | ✗                                |
| gorang          | ✓                     | ✓              | ✓            | ✗                                |
| suman           | ✓                     | ✓              | ✓            | ✗                                |
| bharath manna   | ✓                     | ✓              | ✓            | ✗                                |
| abhijeeth       | ✓                     | ✓              | ✓            | ✗                                |

The ready-indicator and the sealed indicator are mutually exclusive by construction (one is for IN_PROGRESS, the other for DONE), and the probe confirms zero overlap.

### Phase2Modal opened on a DONE card

| Assertion                                               | Got                                                                                                                  |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Header badge is the sealed badge, not the generic one   | `hasSealedBadgeInHeader: true`, `hasViewOnlyBadge: false`                                                            |
| Sealed badge label                                      | `"Sealed"`                                                                                                           |
| Sealed ribbon present in body                           | `hasSealedRibbon: true`                                                                                              |
| Ribbon title                                            | `"Finalized · Sealed"`                                                                                                |
| Ribbon "why" sentence                                   | `"Finalized records are sealed to preserve audit, print, and ledger consistency. Use the Correction Flow for changes."` |
| Modal title                                             | `"Completed Sealed"`                                                                                                  |

Visual frame: `C:/WINDOWS/TEMP/verify-gap-1.1/g14-02-modal-sealed.png` — slate-toned ribbon dominates the top of the modal body without overpowering it; sealed cards visible behind the modal show consistent treatment.

## Known limitations / not-done

- **The existing "✓ DONE — RECORD IS IMMUTABLE" green button at the bottom of Phase2Modal** is pre-existing chrome and still renders. It's now redundant with the sealed ribbon and uses an alarmy palette. Worth removing in a polish pass — left untouched to keep this gap surgical.
- **Other surfaces that display DONE records may not yet show the sealed treatment.** `RecordPage.js` for instance opens individual records by URL; if it shows DONE status fields, they would benefit from the same ribbon. Not investigated. The kanban + modal pair is the highest-traffic surface and covers the gap's intent.
- **The "Correction Flow" the ribbon references doesn't exist yet.** The wording deliberately names a future surface (Gap 1.7 area). Operators will see the phrase before the flow ships — currently they'll need to ask a supervisor. Acceptable: the ribbon's job is to set expectations, not to ship the flow.

## Artifact

`C:/WINDOWS/TEMP/verify-gap-1.1/g14-02-modal-sealed.png`.

## Next

Gap 1.5 (P1) — explicit draft-state footer. Operator ergonomics: a footer indicator inside the New * modals that signals "your entries are preserved if you cancel or switch workflows." Independent of sealed state.
