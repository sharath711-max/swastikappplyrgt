# Gap 1.1 (P0) — Aging badges in sidebar + kanban

**Source:** `airequest/myprompt.txt` — Section 1 row 1
**Recorded:** 2026-05-22 23:21:21 (implementation) · 2026-05-23 00:08 (verify) · 2026-05-23 12:18 (re-verified alongside Gap 1.2)
**Status:** PASS end-to-end. TZ bug caught and fixed during the bucket-boundary probe.

## What changed

| Path                                              | What                                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `frontend/src/utils/aging.js`                     | New. `getAgingBucket`, `getAgingBucketFromAgeMs`, `agingTitle` + `parseDbTimestampMs` |
| `backend/services/workflowService.js`             | New `getSummary()` + module-level `_parseDbTimestampMs`                                |
| `backend/routes/workflowRoutes.js`                | New `GET /api/workflow/summary`                                                       |
| `frontend/src/pages/WorkflowBoard.js` + `.css`    | Per-card aging chip (30m+/2h+/1d+) + tinted left border + 60s tick                    |
| `frontend/src/components/layout/Sidebar.js` + `AppShell.css` | Aging dot on each workflow code-badge corner; cold-bucket pulse animation     |

## Buckets

| Age range  | Bucket | Chip   | Tint                          |
| ---------- | ------ | ------ | ----------------------------- |
| < 30 m     | fresh  | —      | none                          |
| 30 m – 2 h | warm   | `30m+` | amber                         |
| 2 h – 24 h | hot    | `2h+`  | orange                        |
| ≥ 24 h     | cold   | `1d+`  | red + slow pulse on dot       |

DONE cards always bucket as fresh (no chip). Sidebar dot uses the workflow-wide oldest open item; card chips use each card individually.

## The TZ bug — found during verify, fixed inside the same gap

SQLite stores `created` as `'YYYY-MM-DD HH:MM:SS[.sss]'` in **UTC with no offset marker**. `new Date(thatString)` in V8 parses as **local time**, inflating every age by the system TZ offset (5.5 h in IST). Confirmed numerically: same row read as `5.62 h` vs `0.12 h` depending on parser path.

**Effect (pre-fix):** in IST, the warm bucket was unreachable — a 30 m row read as 6 h and rendered hot. A 23 h row read as 28 h and rendered cold ~5.5 h early. **Fix:** `parseDbTimestampMs` detects missing TZ marker and appends `Z`. Lives in both [`frontend/src/utils/aging.js`](../frontend/src/utils/aging.js) and [`backend/services/workflowService.js`](../backend/services/workflowService.js); both call-sites must agree.

## Verification (PASS)

Playwright + DOM probe + DB mutation. Three open `gold_test` rows set to 5 m / 45 m / 3 h, captured, restored.

| Probe row                       | Set     | Chip rendered    | Card class                  |
| ------------------------------- | ------- | ---------------- | --------------------------- |
| GTS-B02A4B44003B (IN_PROGRESS)  | 5 min   | none (fresh)     | `kanban-card--aging-fresh`  |
| GTS-801F17B6E4E9 (TODO)         | 45 min  | `30m+` warm      | `kanban-card--aging-warm`   |
| GTS-B7896569D1AB (TODO)         | 3 h     | `2h+` hot        | `kanban-card--aging-hot`    |

Sidebar `GT` dot flipped to hot post-fix (3 h is in 2–24 h band). `GC` stayed cold (pre-existing 766-day open cert). 171 DONE cards: zero chips.

API: `GET /api/workflow/summary` returns 200, shape matches the contract above, 401 on no-auth and bad-token, **~320–380 ms/call** pre-optimization (closed by Gap 1.2a — now ~22–30 ms).

## Known limitations

- **Pre-existing TZ display bug remains.** `formatDate` in [`WorkflowBoard.js`](../frontend/src/pages/WorkflowBoard.js) and ~15 other `new Date(row.created)` sites across the app still parse UTC strings as local time. Aging math is correct; displayed timestamps still shift by the TZ offset. Separate cleanup — out of Gap 1.1 scope.
- **No unit tests** for `aging.js` yet. Pure function, every branch covered by the visual probe.
- **Bucket thresholds hard-coded** — gap text named them explicitly, no config flag added.

## Artifacts

`C:/WINDOWS/TEMP/verify-gap-1.1/01-workflow-gold-full.png` — single frame showing all three buckets, clean DONE column, sidebar dots tinted.
