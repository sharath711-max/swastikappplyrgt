# Unused / Orphaned Inventory

Tracked list of files, exports, dependencies, and assets that appear unused in the current codebase. Generated 2026-05-27 from a fresh `knip` scan on the frontend plus targeted greps on the backend. Re-run knip and this audit periodically (suggested: every release).

## Scan inputs

- **Tool:** `npx knip` (v6.14.2) on `frontend/`
- **Backend:** manual greps (knip doesn't scan Node-server entry points well by default)
- **Branch:** `receipt-bundle-wip` at commit `c1c0fa7`
- **Caveats:**
  - Knip flags any `.test.js` file with no other importer as "unused". These are typically false positives — Jest picks them up via test runner. Verify by running `npm test` and confirming tests still execute.
  - Backend grep can miss dynamic `require()` paths; treat backend findings as candidates, not confirmed orphans.

---

## 1. Confirmed orphan files — non-test (delete or keep with reason)

| Path | Why it appears unused | Action |
|---|---|---|
| `frontend/public/sw.js` | Service worker — `index.js` unregisters all SWs on load before re-registering this one. If PWA caching isn't actively used in production, harmless dead weight; if it is, keep. | Verify with operator |
| `frontend/src/components/dashboard/Dashboard.jsx` | Stub returning `<>` — the real Dashboard is `pages/Dashboard.js`. | Delete |
| `frontend/src/components/dashboard/ActiveCustomersCard.jsx` | Orphaned by the Python-style dashboard rewrite (Active Customers is now inline) | Delete |
| `frontend/src/components/dashboard/RevenueCards.jsx` | Orphaned by the dashboard rewrite (revenue cards now inline) | Delete |
| `frontend/src/components/dashboard/WorkflowDispatchCards.jsx` | Orphaned by the dashboard rewrite (workflow tiles now inline) | Delete |
| `frontend/src/components/kanban/KanbanBoard.jsx` | Superseded by `pages/WorkflowBoard.js` | Delete |
| `frontend/src/components/layout/Header.jsx` | Live header is `components/layout/Header.js` (.js). This `.jsx` is a leftover. | Delete |
| `frontend/src/components/layout/Layout.jsx` | Live layout is `components/layout/AppShell.js`. | Delete |
| `frontend/src/components/layout/Sidebar.jsx` | Stub returning `null`; live sidebar is `Sidebar.js`. Verified earlier in this session. | Delete |
| `frontend/src/components/print/Certificate.jsx` | Print pipeline routes through `PrintManager.js` → `GoldCert.js`/`SilverCert.js`/`PhotoCert.js`/`SmallCert.js`. This generic file is unused. | Delete |
| `frontend/src/components/Toast.js` | Superseded by `contexts/ToastContext.js` + react-toastify | Delete |
| `frontend/src/hooks/useModal.js` | Superseded by `useSafeModalClose` + `useModalLifecycle` | Delete |
| `frontend/src/pages/GoldTest.js` | Workflow board now handles GT inline | Delete |
| `frontend/src/pages/Login.jsx` | Live login is `auth/LoginPage.js` | Delete |
| `frontend/src/test-utils/renderWithRouter.js` | If no test currently imports it; verify before delete | Verify |
| `frontend/src/utils/format.js` | Formatting utilities; check no live consumer | Verify |
| `frontend/src/utils/print.js` | Print utilities superseded by `PrintContext` | Verify before delete |

**Likely false positives (test files flagged by knip but executed by Jest):**

```
tests/kanban.component.test.js
tests/e2e/gc_ui_test.spec.js
tests/e2e/workflow.spec.js
src/tests/unit/auth/LoginPage.test.js
src/tests/unit/auth/ProtectedRoute.test.js
src/tests/unit/components/CertificateForm.behavior.test.js
src/tests/unit/components/CertificateForm.test.js
src/tests/unit/components/core/Modal.test.js
src/tests/unit/components/core/ModalManager.test.js
src/tests/unit/components/core/PriceCalculationTable.test.js
src/tests/unit/components/layout/AppShell.test.js
src/tests/unit/components/layout/Header.test.js
src/tests/unit/components/layout/Sidebar.test.js
src/tests/unit/components/NewGoldCertificateModal.test.js
src/tests/unit/components/NewGoldTestModal.test.js
src/tests/unit/components/NewPhotoCertificateModal.test.js
src/tests/unit/components/NewSilverCertificateModal.test.js
src/tests/unit/components/NewSilverTestModal.test.js
src/tests/unit/components/Phase2Modal.test.js
src/tests/unit/components/print/PrintLayouts.test.js
src/tests/unit/hooks/useItemList.test.js
src/tests/unit/hooks/useSafeModalClose.test.js
src/tests/unit/pages/TestPage.test.js
src/tests/unit/utils/calculations.test.js
src/tests/unit/utils/certificateGuard.test.js
src/tests/unit/utils/handleSubmit.test.js
```

Recommended: configure `knip.json` with a `test` entry pattern so these stop appearing.

---

## 2. Unused exports

From knip — items exported but never imported anywhere:

| Export | File | Note |
|---|---|---|
| `_resetForTests`, `_snapshot`, `SWEEP_DELAY_MS` | `src/services/modalLifecycle.js` | Test/diagnostic exports, harmless |
| `default` | `src/shared/domain/validation/index.js:31` | The default export of the validation engine. May be a real gap — confirm whether the engine is used. |
| `WEIGHT_DECIMAL_PLACES`, `MIN_POSITIVE_WEIGHT`, `EQUALITY_EPSILON`, `safeEquals`, `isPositiveWeight`, `isNonNegativeWeight`, `isWithinMax` | `src/shared/domain/validation/normalization.js` | Validation helpers; verify whether they're meant to be public API |
| `AGING_THRESHOLDS`, `AGING` | `src/utils/aging.js` | Constants exported but only used internally |
| `getAgingBucketFromAgeMs` | `src/utils/aging.js` | Was used by Sidebar.js before the sidebar simplification removed aging dots |
| `cleanupOrphanedBackdrops` | `src/utils/handleSubmit.js` | Superseded by `useSafeModalClose` |

---

## 3. Unused npm dependencies

| Package | Where | Action |
|---|---|---|
| `web-vitals` | `frontend/package.json:15` | Add to dev cleanup or remove if not measuring CWV |

## Unused devDependencies

| Package | Likely status | Note |
|---|---|---|
| `@babel/plugin-proposal-private-property-in-object` | CRA template fossil | Safe to remove |
| `@testing-library/jest-dom`, `@testing-library/react`, `@testing-library/user-event` | Knip false positive — Jest setup imports these | **Keep** |
| `eslint` | Used by CRA build pipeline | **Keep** |
| `html-webpack-plugin` | Used by webpack | **Keep** |
| `identity-obj-proxy` | Used by Jest CSS module mock | **Keep** |
| `jest-transform-stub` | Used by Jest transformer config | **Keep** |

Most "unused devDependencies" reported here are knip false positives — they're consumed by build/test tooling at config-file level, which knip doesn't always trace.

**Unresolved import flagged:** `eslint-config-react-app` listed but knip couldn't find the binary. Used by CRA — keep, ignore.

---

## 4. Backend findings (manual grep)

Backend scripts that look ad-hoc / one-off (verify before deleting; many are intentional ops tools):

```
backend/scripts/add_constraints.js
backend/scripts/add_constraints_v2.js
backend/scripts/add_database_indexes.js
backend/scripts/auto_archive.js
backend/scripts/backfill_legacy_certs.js
backend/scripts/cleanup_tables.js
backend/scripts/clear_data.js
backend/scripts/clear_data_keep_users_customers.js
backend/scripts/clear_transactions.js
backend/scripts/fix_rate_constraint.js
backend/scripts/injectRoles.js
backend/scripts/injectSMS.js
backend/scripts/log_maintenance.js
backend/scripts/reset_schema.js
backend/scripts/test_parity_guarantees.js
backend/scripts/test_workflow_hardened.js
backend/scripts/test_workflows.js
backend/scripts/verifyApi.js
backend/scripts/verify_frontend_ids.js
backend/scripts/verify_login.js
backend/scripts/xrf_listener.js
```

**Status:** these are utility/migration/diagnostic scripts. Many run manually via `node backend/scripts/<file>.js`. Don't delete without confirming with the operator which are still useful (migration scripts should typically be retained as historical record even when complete).

**Definitely-active scripts (referenced or scheduled):**
- `seed_admin.js` (initial setup)
- `factory_reset.js` (referenced in dev workflow)
- `migrate_from_python.js` (referenced from app.js boot)
- `shadow_parity.js` (referenced via `run_shadow_parity.bat`)
- `reconcile_ledger.js` (ops tool)
- `media_verification_report.js`, `migration_acceptance_report.js`, `backup_restore_drill_report.js` (governance reports)

### Backend services flagged as unreferenced (verify before deleting)

Grep pattern: `require\(.*services/<name>['"]` returned zero matches outside the file itself. These are candidates — confirm whether they're consumed dynamically, by tests, or wired via config before deleting.

| Service | Plausible reason for orphan flag |
|---|---|
| `services/billingService.js` | Billing flow might not yet be wired into routes, or routes import via a different alias |
| `services/hmac.js` | Used for snapshot hashing — almost certainly required somewhere via a dynamic path; verify via `grep -r "hmac" backend/` before action |
| `services/paymentService.js` | Payment flow may be unused in current rollout; verify against ledger/finalize flows |
| `services/whatsappService.js` | WhatsApp notifications — likely not wired in current dev mode; keep if planned, remove if deprecated |

---

## 5. Missing assets the codebase expects

| Path | Used by | Status |
|---|---|---|
| `frontend/public/welcome.png` | Dashboard `WelcomeCard` | **Missing** — drop a welcome illustration here. The image tag has an `onError` fallback so the dashboard still renders, but the card looks empty. |

`frontend/public/` currently contains: `index.html`, `logo-sm.png`, `logo.png`, `manifest.json`, `sw.js`. The thermal receipt uses `logo-sm.png`; the receipt summary used `logo.png`. Both exist.

---

## 6. Likely-dead CSS blocks (manual review needed)

These weren't measured by knip — flagged based on JSX class-name changes during recent rebuilds:

| File | Suspect blocks | Reason |
|---|---|---|
| `frontend/src/pages/Dashboard.css` | All `.dash-*` rules | Replaced by `.py-*` rules after the Python-style dashboard rewrite |
| `frontend/src/pages/WorkflowBoard.css` | `.board-header`, `.workflow-search-*`, `.btn-secondary-action`, `.board-title` | Replaced by SLDS classes during the SLDS refresh; still present as orphans |
| `frontend/src/components/layout/AppShell.css` | `.workflow-nav-group`, `.workflow-nav-row`, `.workflow-nav-item`, `.workflow-new-btn`, `.workflow-count*`, `.workflow-code__aging-dot*`, `.workflow-code--*` | Orphaned by sidebar simplification (chips, aging dots, count badges, '+ New' buttons all removed) |
| `frontend/src/components/SalesforceComponents.js` | Whole file | Now that `@salesforce-ux/design-system` is installed, the hand-rolled SLDS components in this file are likely redundant. Audit each export's call sites. |

Tool suggestion: run [PurgeCSS](https://purgecss.com/) against the build output to get a definitive dead-class list.

---

## 7. Recommended next actions (in priority order)

1. **Delete the 13 confirmed orphan non-test files** in §1 (the Action: Delete rows). Single PR. Run tests after.
2. **Add `knip.json`** with a `test` glob entry so the 26 test-file false positives stop appearing in future scans.
3. **Drop `welcome.png`** into `frontend/public/` so the Welcome Card has its illustration.
4. **Decide on `web-vitals`** — remove or implement.
5. **Audit `SalesforceComponents.js`** — does anything still import any of its exports? If not, delete the file.
6. **CSS cleanup pass** — strip the dead `.dash-*`, `.board-header*`, `.workflow-nav-*` rules from the three CSS files listed in §6.
7. **Validation engine unused-export gap (§2 row `default`)** — confirm whether `shared/domain/validation/index.js` is the intended public entry, and either wire it up or remove the orphaned export.
8. **Quarterly re-scan** — re-run `npx knip` after every major feature merge to catch new orphans early.

---

## Appendix — How to reproduce

```sh
cd frontend
npx knip --no-progress
```

For UTF-16 console output (Windows PowerShell default), redirect to a file and decode:

```sh
npx knip --no-progress | iconv -f UTF-16 -t UTF-8 > knip-report.txt
```

Backend orphan check (rough):

```sh
for f in backend/services/*.js; do
  name=$(basename "$f" .js)
  refs=$(grep -rlE "require\(.*services/$name['\"]" backend frontend | grep -v "^$f$")
  [ -z "$refs" ] && echo "orphan: services/$name.js"
done
```
