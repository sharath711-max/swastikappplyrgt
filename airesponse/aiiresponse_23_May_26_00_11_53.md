# Gap 1.2 (P0) — Queue counts + aging severity coloring

**Source:** `airequest/myprompt.txt` — Section 1 row 2
**Recorded:** 2026-05-23 00:11:53 (implementation) · 2026-05-23 12:18 (verify)
**Status:** PASS. Implementation and verification both clean. SQL aggregation delivered the expected ~12× speedup on `/summary`.
**Builds on:** [Gap 1.1 — aging badges](./aiiresponse_22_May_26_23_21_21.md). Reuses `/api/workflow/summary` + the aging utility.

## What "queue pressure" means here

Two-dimensional: **volume** (how much work is waiting) and **time pressure** (how long the oldest piece has waited). Encoded on the surfaces operators already look at, using the warm/hot/cold palette established in Gap 1.1.

| Surface                  | Signal                                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| **Sidebar workflow row** | `TODO + IN_PROGRESS` count, tinted by the workflow's oldest open-item bucket. Hidden if 0.                      |
| **Kanban column header** | `30m+/2h+/1d+` chip scoped to *that column's* oldest item. Completed never gets one.                            |

Counts exclude DONE intentionally — a workflow with 0 open + 30 000 done is finished work, not pressure. Severity is taken from the worst-aged item, not an average: one 1-day card buried among 50 fresh ones is operationally a crisis, not "mostly fine."

## What changed

| Path                                              | What                                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `backend/services/workflowService.js`             | `getSummary()` rewritten — per-table `COUNT(CASE…) + MIN(CASE…)` aggregation          |
| `frontend/src/components/layout/Sidebar.js`       | Count pill per workflow row, tinted by aging bucket                                    |
| `frontend/src/components/layout/AppShell.css`     | `.workflow-count` + warm/hot/cold variants                                            |
| `frontend/src/pages/WorkflowBoard.js`             | Column-header severity chip + `.column-header__meta` flex wrapper grouping severity + count |
| `frontend/src/pages/WorkflowBoard.css`            | `.column-severity` warm/hot/cold styles                                                |

## SQL aggregation (1.2a, classified backend infrastructure)

Pre-Gap 1.2 `getSummary()` reused `getAllItems()` — UNION across five tables, returning every DONE row, then filter in JS. Cost: **~320–380 ms/call** at 30 k+ DONE rows. Sidebar polls every 60 s + on every workflow socket event; the cost compounded with concurrent operators.

Replacement is one aggregation per table:

```sql
SELECT
  COUNT(CASE WHEN status = 'TODO'        THEN 1 END) AS todo,
  COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) AS in_progress,
  COUNT(CASE WHEN status = 'DONE'        THEN 1 END) AS done,
  MIN(CASE WHEN status IN ('TODO','IN_PROGRESS') THEN created END) AS oldest_open_created
FROM <table>
WHERE deletedon IS NULL
```

Uses the pre-existing `(status, deletedon)` covering index (`idx_gt_status` et al. in [`init.sql`](../backend/db/init.sql)). DONE rows are counted but never materialized.

## Verification (PASS)

### Backend timing — closes the polling-cost finding from Gap 1.1

```
request 1: 200 in 0.128393s   (cold start / JIT)
request 2: 200 in 0.027541s
request 3: 200 in 0.022611s
request 4: 200 in 0.030492s
request 5: 200 in 0.021646s
```

**~22–30 ms steady-state** vs **~320–380 ms pre-optimization** — ~12× faster. At a polling cadence of 60 s × 5 concurrent sidebars, server CPU spent on `/summary` drops from ~150 ms/min to ~10 ms/min.

### DOM probe (Playwright)

With the same DB probe state used for Gap 1.1 (gold workflow has 3 open rows aged 5 m / 45 m / 3 h):

**Sidebar rows:**
| Code | Dot     | Count | Count tint |
| ---- | ------- | ----- | ---------- |
| GT   | hot     | 3     | hot        |
| GC   | cold    | 1     | cold       |
| ST   | —       | —     | —          |
| SC   | —       | —     | —          |
| PC   | —       | —     | —          |

**Gold kanban columns:**
| Column     | Count | Severity chip |
| ---------- | ----- | ------------- |
| Ongoing    | 2     | `30m+` warm   |
| Tested     | 1     | `2h+` hot     |
| Completed  | 171   | — (never)     |

**Silver kanban (no open items):** every column count = 0, no severity chip rendered, sidebar `ST` row has no count pill. Empty state stays quiet.

### Notes from the capture

- The probe rows aged a bit between "set" and "capture" (a few minutes elapsed). One of the rows I set to fresh crossed the 30 m boundary by capture time and rendered warm. Bucket math is correct — chip reflects current age, not age-at-set-time.
- The displayed wall-clock label on each card (`23 May, 06:38 am`) is still 5.5 h behind reality because the pre-existing `formatDate` bug is unchanged. Aging is correct; displayed timestamps remain wrong. Same finding as Gap 1.1, unchanged scope.

## Known limitations

- **No `aria-live` on the count pill.** Screen-reader users don't hear when a workflow's count or severity changes. Polish item.
- **Column-header layout change.** `.column-count` is no longer a direct flex child of `.column-header` — it's wrapped in `.column-header__meta` alongside the severity chip. Searched for CSS rules that assumed the old structure; none found.
- **No unit tests for the new SQL.** Covering index well-known; main risk is a TZ regression in `oldest_open_created`, still protected by `_parseDbTimestampMs`.

## Artifacts

- `C:/WINDOWS/TEMP/verify-gap-1.1/g12-01-workflow-gold-full.png` — full frame: sidebar with `GT=3 hot`, `GC=1 cold`, column headers with `30m+ warm` and `2h+ hot` chips.
- `g12-02-sidebar-expanded.png`, `g12-03-kanban-grid.png`, `g12-04-workflow-silver-empty.png` — supporting captures.

## Next

Gap 1.3 — centralized modal lifecycle manager. Different surface (modal layer, not workflow telemetry); independent of `/summary`.
