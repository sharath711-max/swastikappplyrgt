# Gap 1.8 (P1) — Persistent top-level parity-mode banner

**Source:** `airequest/myprompt.txt` — Section 1 row 8
**Recorded:** 2026-05-23 17:43
**Status:** PASS. Banner is inescapable when parity mode is active, absent otherwise. Layout shift (header / sidebar / main all drop by 32px) verified clean across pages.
**Classification:** Shared / cross-cutting — backend owns mode authority, web-app owns operator-visible warning.

## What the gap said

> **P1** — No "parity mode active" global warning.
> Dangerous operational mode may be invisible.
> **Recommended:** persistent top-level parity banner.

## Architectural constraint (from the directive)

> Persistent top-frame banner, muted amber/slate, explicit governance explanation, link to anomaly details. Inescapable but not panic-red, not flashing, not modal-blocking. Hidden integrity downgrades destroy institutional trust — operators must always know when protections are relaxed.

## How this differs from Gap 1.6

| Surface           | Gap 1.6 anomaly widget                       | Gap 1.8 parity banner                          |
| ----------------- | -------------------------------------------- | ---------------------------------------------- |
| Audience          | Admin / manager / superadmin                 | Every authenticated operator                   |
| Scope             | All current institutional risks              | One specific governance-state risk             |
| Where visible     | Dashboard only                               | Every page (top of frame)                      |
| Triggered by      | Any anomaly with count > 0                   | `SYSTEM_MODE=PARITY` regardless of activity    |
| Psychological job | "What threatens truth right now?"            | "You are operating under relaxed guarantees."  |

The anomaly widget answers a question. The banner asserts a state. Two different jobs — both needed.

## What changed

| Path                                                                | What                                                                                                                  |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `backend/routes/systemRoutes.js`                                    | **New.** Mounts `GET /api/system/mode`. Returns `{ system_mode, is_parity, is_strict }`. Auth required, no role gate — every operator can read.    |
| `backend/app.js`                                                    | Mounts the new router at `/api/system`.                                                                              |
| `frontend/src/components/layout/ParityModeBanner.jsx`               | **New.** Fetches mode on mount + 5min poll; toggles `body.parity-mode-active`; renders banner only when parity. |
| `frontend/src/components/layout/AppShell.js`                        | Mounts banner above `Header`.                                                                                         |
| `frontend/src/components/layout/AppShell.css`                       | `.parity-banner` (position fixed at top, z-index 1100, height 32px); `body.parity-mode-active` shifts header / sidebar / main down by 32px. |

## Why this shape

- **`position: fixed; z-index: 1100`.** Header is `z-index: 1001`, user-menu dropdown is `1002`. The banner sits above both — operators cannot hide it by interacting with the rest of the UI.
- **Body-class layout shift, not flex-layout.** AppShell uses fixed-positioned Header (top: 0) and Sidebar (top: 64px) with absolute coordinates. Inserting a 32px banner above them required matching offset adjustments to all three (Header → 32px, Sidebar → 96px, Main → 96px margin-top). When parity is off, no class, no shift, zero cost.
- **No role gate on `/api/system/mode`.** The mode is institutional truth, not admin telemetry. Every authenticated role should see the banner. Bypass *counts* stay admin-only (separate endpoint `/api/analytics/parity-bypasses` already exists for that).
- **Muted amber, not panic-red.** Matches the directive's "institutionally dangerous, not visually hysterical" register. Amber communicates seriousness without inducing operator stress.
- **"Details" link to `/`** (Dashboard) where the anomaly widget lives — the operator can drill deeper into governance state from any page.
- **5-minute poll.** Mode flips require a backend restart; high-frequency polling would burn cycles for no signal. 5 min is a fresh-sessions backstop.

## Verification (PASS)

| Page                | Banner expected? | `bodyHasParityClass` | Banner rect (y, h) | `.app-header` top | `.app-sidebar` top | `.app-main` margin-top |
| ------------------- | ---------------- | -------------------- | ------------------- | ------------------ | ------------------- | ----------------------- |
| `/login` (no AppShell) | NO            | false                | n/a                 | n/a                | n/a                 | n/a                     |
| `/` (Dashboard)     | YES              | true                 | 0, 32px             | 32px               | 96px                | 96px                    |
| `/workflow`         | YES              | true                 | 0, 32px             | 32px               | 96px                | 96px                    |

Banner text verbatim across pages:
- Title: `"PARITY MODE ACTIVE"`
- Detail: `"Strict integrity protections are relaxed for migration or legacy compatibility operations."`

Visual: `C:/WINDOWS/TEMP/verify-gap-1.1/g18-02-workflow.png` — amber banner at top with shield icon and "Details" link; header, sidebar, and kanban all visible below without overlap; sealed-card indicators (Gap 1.4) and aging chips (Gap 1.1/1.2) all render correctly under the new top offset.

## During-verify catch

Initial commit had `.parity-banner` styled as a flex row WITHOUT `position: fixed`, and the body-class layout-shift rules were missing entirely. With AppShell's fixed Header sitting at `top: 0`, the inline banner would have been hidden behind it — operators would have toggled the body class with no visible effect. Caught during the recheck cycle before the verify run; replaced the block with positioned styles + layout-shift rules in a single edit.

## Known limitations / not-done

- **`/api/system/mode` is auth-only.** Login page therefore can't show the banner — which is acceptable, since the user hasn't yet signed into the affected system. If pre-auth visibility ever matters (e.g. on a public verify page), the route would need a public variant.
- **No socket invalidation.** A live mode flip from PARITY → STRICT (rare; requires backend restart) takes up to 5 minutes to clear from connected clients. Acceptable for this rarity.
- **5-minute poll runs on every page.** A single shared SWR-style cache would deduplicate across components if any other consumer of `/api/system/mode` shows up. None today.
- **No reactive `aria-live` on disappearance.** When parity → strict, the banner unmounts silently. Acceptable since strict mode is the calm state.

## Artifact

`C:/WINDOWS/TEMP/verify-gap-1.1/g18-02-workflow.png`.

## Next

Gap 1.9 — controlled keyboard progression (Enter rhythm). Restores the operator's Tab/Enter flow inside the intake modals to match the Python parity expectation. Pure operator ergonomics, no governance surface.
