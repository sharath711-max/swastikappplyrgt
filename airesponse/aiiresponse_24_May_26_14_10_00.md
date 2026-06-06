# Receipt Bundle — multi-page A4 customer acknowledgement

**Source:** prompt — *"Build a unified multi-page Receipt Print system for the Swastik Gold & Silver Testing Lab application that works across ALL 5 operational workflows."*
**Recorded:** 2026-05-24 (backfill)
**Branch:** `receipt-bundle-wip` (created from `dashboard-rebuild` HEAD per heavy-entanglement exception)
**Status:** Shipped; pending operator QA. Triggers wired in Phase2Modal (separate response file).

## Scope decisions (made before coding)

- **Receipt / acknowledgement** — NOT formal cert. Plain A4, browser-printable. Does not conflict with [[feedback_python_cert_architecture]] which protects GC/SC/PC paper geometries from unification.
- **Within ONE record's items** — not cross-module batches. Builds on the existing `?itemLevel=true` path in `PrintView.js` rather than introducing a schema-level "visit" concept.
- **Extend existing pipeline** per [[feedback_print_extension_patterns]] — variant-prop via existing PrintContext/PrintPortal/PrintView, not a parallel system.
- **Branch off current HEAD** instead of waiting for the dashboard-rebuild commits — the working tree had 80+ pre-existing WIP files; untangling first would have blocked the feature for hours.

## What was implemented

Trigger contract: `triggerPrint(routeType, id, { layout: 'receipt-bundle' })` works for all 5 workflows. Route-based equivalent: `/print/:type/:id?layout=receipt-bundle`. Total pages = `samples.length + 1`.

## New files (`frontend/src/components/print/`)

- [`ReceiptBundle.jsx`](../frontend/src/components/print/ReceiptBundle.jsx) — orchestrator; renders Summary + per-sample loop with page breaks
- [`ReceiptBundleSummary.jsx`](../frontend/src/components/print/ReceiptBundleSummary.jsx) — Page 1: lab header, receipt meta, customer block, sample table, totals, signature lines
- [`ReceiptBundleSample.jsx`](../frontend/src/components/print/ReceiptBundleSample.jsx) — Page 2+: per-sample page with position banner ("Sample N of M"), item details, cert block for GC/SC/PC, image placeholder for PC, QR placeholder + signature footer
- [`ReceiptBundle.css`](../frontend/src/components/print/ReceiptBundle.css) — A4 portrait (210×297mm), screen preview with shadow, `@media print` page-break-after between sheets

## Modified files (overlap with pre-existing WIP per heavy-entanglement exception)

- [`frontend/src/contexts/PrintContext.jsx`](../frontend/src/contexts/PrintContext.jsx) — builds `receiptData` snapshot for `layout: 'receipt-bundle'`; passes `routeType` through to the job
- [`frontend/src/components/print/PrintPortal.jsx`](../frontend/src/components/print/PrintPortal.jsx) — dispatches to `<ReceiptBundle>` when `job.layout === 'receipt-bundle'`
- [`frontend/src/pages/PrintView.js`](../frontend/src/pages/PrintView.js) — same dispatch in the route-based `/print/:type/:id` flow

## Architectural guarantees

- **Did not touch** GoldCert / SilverCert / PhotoCert formal cert renderers — cert geometry isolation preserved.
- **Did not extend** `buildReceiptSnapshot` to add new fields — the per-sample page reads raw items directly from `data.items` (which has `sample_weight`, `test_weight`, `item_number`, etc.). Snapshot stays the contract surface for header rendering only.
- One component handles all 5 workflows uniformly because it's an acknowledgement artifact, not a cert.

## Out-of-scope follow-ups

- Trigger button placement (handled in next response file — Phase2Modal Bundle Receipt button).
- Auto-open receipt after create (Python's `socket.id === sender` pattern) — deferred per user "manual button first, auto-print toggle later" guidance.
