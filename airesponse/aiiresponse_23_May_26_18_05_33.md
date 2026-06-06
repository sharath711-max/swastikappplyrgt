# Gap 1.10 (P2) — Sequence policy helper text

**Source:** `airequest/myprompt.txt` — Section 1 row 10
**Recorded:** 2026-05-23 18:05
**Status:** PASS. Helper line appears under cert-workflow section titles only; wording matches the actual sequenceService policy (not the user's example "calendar year" wording, which would have been wrong).

## What the gap said

> **P2** — No explicit sequence-year visibility.
> Operators may misunderstand yearly reset behavior.
> **Recommended:** show sequence policy helper text.

## Audit before code (institutional reality)

Read [`backend/services/v2/sequenceService.js`](../backend/services/v2/sequenceService.js) and [`backend/db/init.sql`](../backend/db/init.sql) before writing copy. Live policy:

| Sequence                           | Reset cadence            | Operator-visible as            |
| ---------------------------------- | ------------------------ | ------------------------------ |
| Test/cert daily auto_numbers       | **Daily** at IST midnight | `GT26-001` / `GC26-040`        |
| Bill sequences                     | **Never**                 | bill numbers                   |
| **Cert item labels (A001–Z999)**   | **Never** — global counter | `(A025)` preview in section title |

The user's example wording "Sequence numbers reset each calendar year" would have been **factually wrong** for both directions: the daily counters reset *daily* (not yearly), and the cert-item counter (the one the operator actually sees as `(A025)` in the section title) **never resets**. Repeating the Gap 1.7 pattern of inventing institutional truth would have damaged the very governance trust this gap exists to build.

## What changed

| Path                                  | What                                                                                                       |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `frontend/src/pages/WorkflowBoard.js` | Single conditional `<div className="sequence-policy-helper">` under the section title. Renders only when `selectedWorkflow ∈ {gold_cert, silver_cert, photo_cert}` — the three workflows that show the `(Axxx)` preview. |
| `frontend/src/pages/WorkflowBoard.css` | `.sequence-policy-helper` — 11px slate, no animation, sits just below the section title with a small negative top margin so it reads as a subtitle, not an alert. |

Wording (verbatim):

> Cert item labels (A001–Z999) increment globally and do not reset by day or year.
> Skipped labels can appear after cancellations or audit holds.

Two sentences doing two different jobs:
- Sentence 1 — names the label, explains the lifetime contract. Matches the live `getNextCertificateItemNumber` behavior in sequenceService.
- Sentence 2 — answers the question the operator *would* ask after seeing a gap. The "cancellations or audit holds" framing names institutional rather than technical causes, per the directive's "stable operational expectations" goal.

## Why this shape

- **Always-on, no toggle, no hover.** Operators passively absorb the policy by reading it where the `(Axxx)` preview lives. A tooltip would only reach operators already curious enough to hover; the directive's purpose is *suspicion reduction*, which means visible-by-default.
- **Scoped to cert workflows only.** Test workflows (gold / silver) use the daily auto_number format; their reset story is different and *also* a separate operator question. Mixing them into one helper would over-explain. If a separate test-workflow helper is needed later, it gets its own scope.
- **Slate, no warning palette.** Sequence policy is not a warning — it's a fact about how the system numbers things. Slate matches the institutional-truth palette of Gaps 1.4, 1.5, 1.7.
- **Truth before tone.** The wording was rewritten away from the directive's suggested "calendar year" example after the audit because the audit found that wording would have lied. Documented honestly in the writeup so future readers see the path.

## Verification (PASS)

Playwright walk across all five workflows:

| Workflow            | Helper expected? | Helper present? | "calendar year" check | Wording verbatim?                                                                                                  |
| ------------------- | ---------------- | --------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Gold Test           | NO               | ✗               | false                 | n/a                                                                                                                |
| Silver Test         | NO               | ✗               | false                 | n/a                                                                                                                |
| Gold Certificate    | YES              | ✓               | false                 | "Cert item labels (A001–Z999) increment globally and do not reset by day or year. Skipped labels can appear after cancellations or audit holds." |
| Silver Certificate  | YES              | ✓               | false                 | (same)                                                                                                             |
| Photo Certificate   | YES              | ✓               | false                 | (same)                                                                                                             |

`mentionsCalendarYear` is `false` on every probe — a deliberate negative assertion that the false "calendar year" framing did not slip into the shipped copy.

Visual: `C:/WINDOWS/TEMP/verify-gap-1.1/g110-01-gold-cert.png` — helper line sits cleanly under `Gold Certificate Testing (A025)`, calm slate, no distraction. Parity banner (Gap 1.8), sealed cards (Gap 1.4), and section title `(A025)` preview (Gap 1.2) all coexist in the same frame.

## Known limitations / not-done

- **No helper for the daily-reset test auto_numbers** (`GT26-001` etc.). The label format itself encodes the reset (year prefix), so operators have at least visual evidence of the structure. A separate test-workflow helper could explain "26 is the year suffix; the 001 part resets each day" — left out so this gap stays surgical. Worth a Section 2 follow-up if operators continue to ask.
- **Helper does not link to a longer explainer.** If institutional documentation grows (e.g. an SOP doc), the helper could become a "learn more →" link. Not done because no such doc exists in the repo.
- **No aria-live.** Helper is read once on workflow switch; not announced to screen readers. Acceptable — it's stable content, not an alert.

## Artifact

`C:/WINDOWS/TEMP/verify-gap-1.1/g110-01-gold-cert.png`.

## Section 1 complete

| Gap   | Status      | Verification |
| ----- | ----------- | ------------ |
| 1.1   | ✅ PASS      | ✅            |
| 1.2   | ✅ PASS      | ✅            |
| 1.3   | ✅ PASS      | ✅            |
| 1.4   | ✅ PASS      | ✅            |
| 1.5   | ✅ PASS      | ✅            |
| 1.6   | ✅ PASS      | ✅            |
| 1.7   | ✅ PASS      | ✅            |
| 1.8   | ✅ PASS      | ✅            |
| 1.9   | ✅ PASS      | ✅            |
| 1.10  | ✅ PASS      | ✅            |

Carry-overs to a hardening pass (not blockers):
- `<Context.Provider>` unmount-during-transition warning in NewGoldTestModal — likely a seam between Gap 1.3's lifecycle service and react-bootstrap fade exit. Non-fatal in observed behavior, but worth instrumenting.
- Per-modal verification of the singleton modal lifecycle service under simultaneous open of two modals (the typical workflow doesn't currently exercise that path, but the service supports it).
- Migration of cert modals (GC / SC / PC) to use `useEnterAdvance` — same pattern as the test modals, one-line wiring each.
