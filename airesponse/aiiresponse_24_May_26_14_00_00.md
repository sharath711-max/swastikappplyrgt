# Recycle Bin removal — UI + backend restore routes

**Source:** prompt — *"Remove Recycle BIn feature from Project"*; user direction: scope = UI + backend restore routes, preserve soft-delete logic
**Recorded:** 2026-05-24 (backfill)
**Branch:** `dashboard-rebuild`
**Status:** Shipped; verification grep returned zero residual references.

## Scope

User chose **UI + backend restore routes**:

- Remove sidebar nav, page, and route on the frontend.
- Remove HTTP restore endpoints (universal `/audit/restore/:type/:id` + per-resource `POST /:id/restore`).
- **Preserve** soft-delete logic — `deletedon` columns, repository `softDelete` and `restore` methods.

Rationale: `restore()` repo methods are still called by `tests/unit/lifecycleMetadata.test.js` — removing them would break tests with no upside. Per [[feedback_sern_architecture_framing]], soft-delete + recovery is institutional governance posture; only the HTTP surface was removed.

## Files changed

**Frontend (deleted + edited):**

- DELETED: [`frontend/src/pages/RecycleBinPage.jsx`](../frontend/src/pages/RecycleBinPage.jsx)
- EDITED: [`frontend/src/App.jsx`](../frontend/src/App.jsx) — removed import + `/admin/recycle-bin` route
- EDITED: [`frontend/src/components/layout/Sidebar.js`](../frontend/src/components/layout/Sidebar.js) — removed nav entry + unused `FaTrash` import
- EDITED: [`frontend/src/tests/unit/components/layout/Sidebar.test.js`](../frontend/src/tests/unit/components/layout/Sidebar.test.js) — removed 2 `Recycle Bin` assertions

**Backend (edited):**

- [`backend/routes/auditRoutes.js`](../backend/routes/auditRoutes.js) — removed 2 routes + 2 imports
- [`backend/controllers/auditController.js`](../backend/controllers/auditController.js) — removed `getRecycleBin` + `restoreItem` functions + their exports
- [`backend/routes/creditHistoryRoutes.js`](../backend/routes/creditHistoryRoutes.js) — removed `POST /:id/restore`
- [`backend/routes/weightLossRoutes.js`](../backend/routes/weightLossRoutes.js) — removed `POST /:id/restore`
- [`backend/middleware/rbac.js`](../backend/middleware/rbac.js) — removed dead `system:restore` permission

## Preserved (per scope)

- Soft-delete logic in repositories (`softDelete`, `restore` methods on credit-history and weight-loss repos)
- `deletedon` columns on all entities
- `lifecycleMetadata.test.js` tests using `repo.restore()` directly

## Verification

Grep across the entire repo for `RecycleBin`, `recycle-bin`, `getRecycleBin`, `restoreItem`, `/audit/restore`, `/:id/restore`, `api.post.*restore`, `system:restore` — all return 0 matches.
