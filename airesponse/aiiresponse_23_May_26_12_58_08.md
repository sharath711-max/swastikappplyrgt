# Gap 1.6 (P1) — "System anomalies" admin widget

**Source:** `airequest/myprompt.txt` — Section 1 row 6
**Recorded:** 2026-05-23 12:58
**Status:** PASS — three truthful detectors live, one dropped after live-DB audit caught a schema mismatch, count-zero detectors filtered before render.
**Classification:** Shared / cross-cutting. Backend detects; frontend surfaces. Clean separation.

## What the gap said

> **P1** — No operator-facing reconciliation warning surface.
> Reconciliation anomalies only visible in backend reports.
> **Recommended:** add "system anomalies" admin widget.

## Architectural constraint (from the directive)

> Audit anomaly sources before building the widget. The backend anomaly vocabulary must exist first, severity semantics must exist first, operational meaning must exist first. Otherwise you build observability theater instead of governance telemetry.
> Start with high-signal operational anomalies only. The widget answers: "what threatens institutional truth right now?" — not: "what analytics can we display?"

## Audit before code

Inventoried the actual detectable anomalies in this codebase before writing a line. Truthful contract:

| Anomaly                          | Live source                                       | Severity | In v1? | Why                                                              |
| -------------------------------- | ------------------------------------------------- | -------- | ------ | ---------------------------------------------------------------- |
| Missed ledger DEBIT              | `reconcile_ledger.js` SQL                         | HIGH     | **NO** | Live schema lacks `reference_type` / `reference_id`; query throws. |
| Recent DONE w/ no snapshot hash  | SQL on cert tables (scoped 30 days)               | HIGH     | YES    | Honest current-state signal; legacy noise filtered out.           |
| Parity mode active               | `config/systemMode.js`                             | HIGH     | YES    | Mode itself is the governance risk regardless of bypass count.    |
| Stalled IN_PROGRESS (>1 day)     | `reconcile_ledger.js` SQL                         | MEDIUM   | YES    | Operationally actionable.                                         |
| Duplicate ledger DEBIT           | SQL but guarded by index                          | HIGH     | NO     | Always 0; noise.                                                  |
| Unknown reference_type           | SQL                                                | MEDIUM   | NO     | Data hygiene, not operational urgency.                            |
| Missing media                    | filesystem walk (`media_verification_report.js`)  | HIGH     | NO     | Heavy; deferred to on-demand report.                              |
| Failed restore drill             | no in-DB record                                    | —        | NO     | Not detectable yet — observability theater.                       |
| Repeated correction chains       | no correction infrastructure yet                  | —        | NO     | Same.                                                              |
| Print recovery failures          | no print attempt log                              | —        | NO     | Same.                                                              |

Three detectors survived the audit. Live-DB probing during verify caught a fourth (`missed_ledger_debit`) that *looked* implementable but actually wasn't — `reconcile_ledger.js` itself assumes columns the live schema doesn't have. Removed rather than ship a query that throws on every poll.

## What changed

| Path                                                                | What                                                                              |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `backend/services/anomalyService.js`                                | **New.** Three SQL/config detectors, stable shape, count=0 filtered out before return. |
| `backend/routes/analyticsRoutes.js`                                 | New `GET /api/analytics/anomalies`, `requireRole('admin','manager','superadmin')`. |
| `frontend/src/components/dashboard/SystemAnomaliesWidget.jsx`       | **New.** Polls every 60s, severity-ordered rows, expandable explanation + remediation + examples, distinct clean / loading / error / dirty states. |
| `frontend/src/pages/Dashboard.js`                                   | Mounts widget above the existing stat cards.                                       |
| `frontend/src/pages/Dashboard.css`                                  | `.sysanom` + variant styles. Calm institutional palette, no animation.             |

## Detector contract

```js
{
    id:           'parity_mode_active',
    severity:     'HIGH' | 'MEDIUM' | 'LOW',
    title:        'Parity mode is active',
    count:        1,                              // == active items; mode itself counts as 1
    examples:     [...up to 5...],                // bounded payload
    explanation:  '...',                          // single paragraph, operator-readable
    remediation:  'Set SYSTEM_MODE=STRICT in...', // copy-pastable when applicable
    meta:         { system_mode, total_bypasses } // optional, detector-specific
}
```

Detector failures are themselves surfaced as anomalies — never silently swallowed. If the SQL throws, the operator sees the failure in the widget rather than seeing a falsely-clean state.

## Why this shape

- **count=0 detectors don't render.** The widget answers "what threatens truth right now?" — a clean detector adds nothing. Filter happens server-side before payload assembly, not client-side.
- **count=1 for parity mode.** Bypass *count* would mislead — "0 bypasses" reads as "fine" even though the mode itself is the governance risk. The mode being on counts as 1 active risk; the bypass tally goes in `meta`.
- **Scoped to 30 days for unsealed_done.** Live DB returned 7680 unsealed DONE certs on the first probe — all legacy migrated rows. Scoping to recent finalizations turned the signal from "historical noise" into "is the current finalization path writing snapshot_hash?". The 30-day window is in `meta.window_days` for traceability.
- **Same palette family as Gaps 1.1 / 1.2 / 1.4.** HIGH = red-tinted chip on white card, MEDIUM = amber, LOW = slate. Institutional, no alarm theater, no animation. Severity icon left, label chip, title, count. Expandable for explanation + remediation + examples.
- **Three distinct calm-state branches.** Clean (no anomalies, one-line "No anomalies detected"), Loading (one-line "Checking…"), Error (anomaly check itself is unavailable — surface, don't pretend clean). Each is a single non-noisy row.
- **No charts, no trends.** Per directive. Just the present-state list. Trend visualization can come later if the data justifies it.

## Verification (PASS)

### Backend

| Probe                                              | Result                                                                                |
| -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `GET /api/analytics/anomalies` unauthenticated     | 401                                                                                   |
| `GET /api/analytics/anomalies` as `admin`          | 200 in 16–26 ms                                                                       |
| Payload shape matches contract                     | `{ success, data: { anomalies: [...], checked_at, total } }`                          |
| `missed_ledger_debit` no longer fails              | Detector removed; payload now clean                                                   |
| `unsealed_done_recent` scope correctness           | 7680 → 0 after 30-day scoping                                                         |
| `parity_mode_active` count semantics               | `count=1` (mode is risk), `meta.total_bypasses=0` (no bypasses triggered)             |
| count=0 detectors filtered                         | `stalled_in_progress: 0` and `unsealed_done_recent: 0` absent from payload entirely   |

### Frontend (Playwright DOM probe + screenshot)

```
PROBE: {
  "totalBadge": "1 active",
  "rows": [
    { "id": "high", "severityLabel": "HIGH", "title": "Parity mode is active", "count": "1" }
  ]
}
```

Expanded row shows the explanation paragraph and the remediation (`Set SYSTEM_MODE=STRICT in backend/.env once migration parity is verified.`). Frame: `C:/WINDOWS/TEMP/verify-gap-1.1/g16-02-expanded.png` — widget sits above the existing stat cards, doesn't compete with them.

## Known limitations / not-done

- **`missed_ledger_debit` deferred.** Requires either a schema migration adding `credit_history.reference_type` + `reference_id` (and a backfill from description-string parsing) OR a separate cert↔ledger linkage table. Until then, the missed-DEBIT class of anomaly is unmonitored.
- **No socket-driven refresh.** 60s poll. Anomaly state changes too slowly to justify socket overhead, and the widget is admin-only.
- **Filesystem-dependent detectors (missing media) absent.** Adding them needs an on-demand "Run full scan" button; not in the polling loop.
- **No history.** This is present-state only. A "trend" or "since when?" view would need a separate `anomaly_log` table.
- **Severity is detector-static.** A detector always emits the same severity regardless of count. Severity escalation (e.g. unsealed_done HIGH normally → CRITICAL if count > 100) not modeled.

## Artifact

`C:/WINDOWS/TEMP/verify-gap-1.1/g16-02-expanded.png`.

## Next

Gap 1.7 — prerequisite banners. Operator-facing workflow dependency visibility (e.g. "Gold Certificate requires a finalized Gold Test"). Cross-references the cert-creation modals; no new backend infra.
