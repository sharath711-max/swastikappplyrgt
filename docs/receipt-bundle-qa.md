# ThermalReceipt (multi-page) — QA harness

Cross-workflow print verification for the ThermalReceipt component after the multi-page upgrade (commit covering customer copy + per-item tester slips).

This doc is a checklist for operator-side QA. The implementation is in [`frontend/src/components/print/ThermalReceipt.jsx`](../frontend/src/components/print/ThermalReceipt.jsx). The snapshot adapter that feeds it lives in [`frontend/src/contexts/PrintContext.jsx`](../frontend/src/contexts/PrintContext.jsx) (in-app print) and [`frontend/src/pages/PrintView.js`](../frontend/src/pages/PrintView.js) (route-based print).

## Trigger paths

- **Card receipt icon** on every WorkflowBoard kanban card → `triggerPrint(routeType, id, { layout: 'receipt' })`
- **Right-click context menu** → same `triggerPrint` call
- **Route-based** for new-window print: `/print/<routeType>/<id>?layout=receipt`

All three should produce identical output.

## Expected output for any N-item record

| | |
|---|---|
| **Total pages** | `N + 1` |
| **Page 1** | Customer copy — items table with Amount column + Grand Total + "Thank you for your business!" footer |
| **Pages 2..N+1** | Tester slip per item — simpler 4-column table (Sl No / Item / Total Wt / Spl Wt), no Amount column, no Grand Total |
| **Print dialog** | Opens once, shows `N+1` pages |

Header (centered) on every page:
- Logo (`/logo-sm.png`)
- "Swastik Assayers" 16pt bold
- Address "#11, Appurayappa 'A' Lane / Nagarthpet Cross, Bengaluru - 560002"
- Phone "Phone: 080-41643366/Centrex: 2366"
- Strong horizontal rule below

Meta row pattern (every page):
- Left: `Invoice No: <number>` over `Date: dd-mm-yy`
- Right: `Customer :` over `<name>` over `(+91 <phone>)` over `Time: hh:mm AM/PM`
- Below: workflow label ("Gold Testing" / "Silver Testing" / "Gold Certificate" / "Silver Certificate" / "Photo Certificate")

## Per-workflow QA matrix

| Workflow | Test record to build | Expected pages | Per-row Amount | Notes |
|---|---|---|---|---|
| **GT** (Gold Test) | 1 GT with 2 items (Total=10g, Sample=5g; Total=20g, Sample=8g) | 3 | ₹0.0 per row, Grand Total = configured `price_gold_test` × 2 (default ₹60) | Test fee is record-level, not per-item; per-row Amount stays 0 |
| **ST** (Silver Test) | 1 ST with 2 items (any weights) | 3 | ₹0.0 per row, Grand Total = `price_silver_test` × 2 (default ₹60) | Mirrors GT exactly (no Python ancestor; locked decision) |
| **GC** (Gold Certificate) | 1 GC with 2 items | 3 | ₹50.0 per row, Grand Total ₹100.0 | Per-item amount is the configured `price_gold_cert` |
| **SC** (Silver Certificate) | 1 SC with 2 items | 3 | ₹100.0 per row, Grand Total ₹200.0 | Per-item amount is `price_silver_cert` |
| **PC** (Photo Certificate) | 1 PC with 2 items (incl. uploaded photo) | 3 | ₹50.0 per row, Grand Total ₹100.0 | Thermal receipt is text-only — the photo lives on the formal PC cert (`PhotoCert.js`), not the receipt |

**Sample-count sweep:** for each workflow, also verify:

- 1 item → 2 pages
- 3 items → 4 pages
- 5 items → 6 pages (stress test for vertical overflow on summary table)

## Field-by-field checklist (per page)

### Page 1 (customer copy)

- [ ] Logo renders centered (or fallback hides cleanly if `/logo-sm.png` is missing)
- [ ] Lab name "Swastik Assayers" bold, centered
- [ ] Address renders on 2 lines as expected
- [ ] Phone line renders
- [ ] Strong rule directly under phone
- [ ] `Invoice No:` shows the record's `auto_number` (or 3-digit padded if `formatInvoiceNumber` applies)
- [ ] Customer name bold 12pt right-aligned
- [ ] Customer phone shows `(+91 NNNNNNNNNN)` only if phone is present
- [ ] Date format `dd-mm-yy` (e.g., `27-05-26`)
- [ ] Time format `hh:mm AM/PM` (e.g., `06:30 AM`)
- [ ] Workflow label matches workflow type ("Gold Certificate" not "GC")
- [ ] Table headers: `Sl No | Item | Total Wt | Spl Wt | Amount`
- [ ] Item names render UPPERCASE
- [ ] Weights show `N.NNNg` (3 decimals); zero → `-`
- [ ] **Returned items** (any item with `returned: true`) → Total Wt has line-through strikethrough
- [ ] Amount column shows `₹ N.N` (1 decimal); test workflows show ₹ 0.0 per row (expected — test fee is record-level)
- [ ] Grand Total row has double-rule top + bottom
- [ ] "Thank you for your business!" centered footer

### Pages 2..N+1 (tester slips)

- [ ] Same centered header as page 1 (logo, name, address, phone)
- [ ] Same meta row pattern, **same customer name** as page 1 (record-level)
- [ ] Same workflow label
- [ ] Table headers: `Sl No | Item | Total Wt | Spl Wt` (**no Amount column**)
- [ ] Only ONE row per slip (the single item for that page)
- [ ] Sl No matches the item's index from page 1 (1-based)
- [ ] **No Grand Total** on tester slips
- [ ] Bottom border on the tester table (2px solid)
- [ ] Page-break before next sheet

### Print dialog

- [ ] Print preview shows exactly `N + 1` pages
- [ ] Single print dialog opens (not one per page)
- [ ] Each sheet is centered on the A4 paper (thermal-strip width 78mm with white margins)
- [ ] No page is empty or duplicated

## Known limitations / edge cases

- **Per-item Amount on tests (GT/ST) is ₹0.0** — this is upstream data shape, not a print bug. Tests bill at the record level (single fee), so backend's `item.item_total` is 0 for each row. Grand Total still reflects the configured per-workflow price × item count. If you want per-row Amount to equal Grand Total / N for tests, that's a separate backend change.
- **Logo fallback** — if `/logo-sm.png` is missing or fails to load, the `onError` handler hides the img tag silently. The receipt still prints clean text (no broken-image icon).
- **Customer phone is optional** — the `(+91 ...)` line only renders when `customer.phone` is non-empty.
- **Returned-item strikethrough** is on `Total Wt` only — Spl Wt and Amount columns stay normal even when returned. Matches Python's `gold_test/receipt.html` pattern.

## Highest-stress test (mentioned in closure note)

**PC with 2+ items** — stress-tests:
- Cross-workflow print dispatch (PC routes through the same PrintContext as the others)
- Per-sample rendering across N pages
- Vertical overflow risk if the items table grows long
- Page-break-after CSS on each `.thermal-receipt-wrapper` (including the last one excluded via `:last-child`)

If PC with 2 items prints clean, GT / ST / GC / SC at 2 items will almost certainly pass.

## How to capture findings

Suggest filling in this row per workflow as you test:

| Workflow | Items | Pages observed | Layout OK | Notes |
|---|---|---|---|---|
| GT | 2 | _ | ☐ | |
| GT | 5 | _ | ☐ | |
| ST | 2 | _ | ☐ | |
| GC | 2 | _ | ☐ | |
| GC | 1 | _ | ☐ | Single-item sanity |
| SC | 2 | _ | ☐ | |
| PC | 2 | _ | ☐ | Most important |
| PC | 5 | _ | ☐ | Page-break stress |

Any failure mode (wrong page count, weight rendering as `0.000g`, customer phone missing on page 1 but appearing on tester slips, strikethrough not rendering, etc.) → bring back here with the workflow + record details and I'll trace the data path.

## Already-verified items (no need to re-test)

- ✅ **`Bhimram` signatory preservation** in `PhotoCert.js` — verified at line 53. Note this is on the FORMAL PC cert (not the thermal receipt); receipts are text-only.
- ✅ **show_kt exposure** in print snapshot — confirmed in `printService.js` line 366 (carat label fix already shipped).
- ✅ **gross_weight + test_weight** preserved separately in snapshot — `buildReceiptSnapshot` in both `PrintContext.jsx` and `PrintView.js` now coerce to Number before the truthy chain, so zero net_weight no longer beats a real gross_weight.
