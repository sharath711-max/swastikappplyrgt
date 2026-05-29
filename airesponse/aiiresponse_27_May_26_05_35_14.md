# Receipt Bundle — rewritten to Python PDF parity

**Source:** operator-supplied PDF of the actual Python receipt for an Invoice 6449 / yasin shek / Gold Certificate / 2 items + direction *"check"* + earlier note *"both print are generated in single print"*
**Recorded:** 2026-05-27 05:35
**Branch:** `receipt-bundle-wip`
**Status:** Three files rewritten so the SERN Bundle Receipt matches the Python PDF exactly. Single print job remains (correct behaviour); the FORMAT now matches.

## Root cause of the divergence

The earlier Bundle Receipt I built was an A4-portrait acknowledgement layout (210mm wide, dense 7-column samples table, customer/received-by signature lines, dedicated cert blocks per sample, QR placeholder footer). The PDF shows Python's actual receipt is a **thermal-strip layout** (100mm wide, centered on A4 paper, simple 5-column items table on page 1, 4-column items table on per-item pages, no signatures, no QR).

Single print job behaviour was always correct — the FORMAT was the gap. "Both print are generated in single print" was an accurate description of the working print job, but the contents didn't visually match the operator's expectation set by the Python reference.

## Files rewritten

### [`frontend/src/components/print/ReceiptBundleSummary.jsx`](../frontend/src/components/print/ReceiptBundleSummary.jsx)

Rewritten to mirror Python's `gold_test/receipt.html` page-1 structure exactly:

- Centered logo (uses `${PUBLIC_URL}/logo.png` with `onError` fallback)
- Centered "Swastik Assayers" 16pt bold
- Centered address (defaults to actual Python lab address: `#11, Appurayappa 'A' Lane / Nagarthpet Cross, Bengaluru - 560002`)
- Centered phone line (`Phone: 080-41643366/Centrex: 2366` default)
- Strong horizontal rule
- Meta: Invoice No (left) / Customer label (right); Customer name (right, bold 12pt); Customer phone right; Date (left) / Time (right); workflow label (e.g., "Gold Certificate") on its own line
- Items table: `Sl No | Item | Total Wt | Spl Wt | Amount` — item names uppercased, weights formatted as `12.345g`, amounts as `₹ 42.4`, returned items get line-through on Total Wt
- Grand Total row with double-rule top/bottom
- Centered "Thank you for your business!" footer

Date format = `dd-mm-yy` (Python `strftime('%d-%m-%y')`).
Time format = `hh:mm AM/PM` (Python `strftime('%I:%M %p')`).

### [`frontend/src/components/print/ReceiptBundleSample.jsx`](../frontend/src/components/print/ReceiptBundleSample.jsx)

Rewritten to mirror Python's per-item slip (the page-break loop inside `gold_test/receipt.html`):

- Same centered header (logo + name + address + phone)
- Same strong rule
- Same meta layout BUT customer line falls back to `sample.name || customer.name` — matches Python's `data.name if data.name else test.customer.name` pattern for the per-sample personal name
- Same workflow label
- **Simpler 4-column table**: `Sl No | Item | Total Wt | Spl Wt` — no Amount column, no Grand Total
- No QR placeholder, no certificate block, no signature lines
- Bottom border (Python's per-item slip `border-bottom: 2px solid black`)

This is the "tester copy" the operator described — internal lab-facing slip with no pricing info.

### [`frontend/src/components/print/ReceiptBundle.css`](../frontend/src/components/print/ReceiptBundle.css)

Complete rewrite:

- `.rbundle-sheet` width: `210mm` → **`100mm`** (thermal-strip)
- Page sheet still centred on A4 paper via `margin: 0 auto`
- Padding tightened to `4mm 4mm 6mm` for thermal density
- Font sizes reduced (`11pt` body, `16pt` lab name, `12pt` customer/workflow, `10pt` table)
- Removed: SLDS-block-style borders, `.rbundle-block`, grid layouts, signature blocks, image placeholder, QR styling, badge styling, position banner styling
- Added: `.rbundle-rule--strong` (header separator), `.rbundle-meta__*` (left/right two-column meta rows), `.rbundle-table__*` (5/4-col table variants), `.rbundle-table__grand-row` (double-rule Grand Total), `.rbundle-thanks` (centered footer)
- `@media print`: each `.rbundle-sheet` gets `page-break-after: always` (last sheet excluded); behaviour same as before, just narrower content
- `@media screen`: light backdrop + sheet shadow for screen preview

## Behaviour preserved

- Single print job for the whole bundle — operator clicks Bundle Receipt once, browser print dialog opens once, all `N+1` pages render in one dialog.
- Page count formula unchanged: `samples + 1`. For 2 samples = 3 pages (page 1 customer copy + 2 tester slip pages).
- Page-break CSS still applies one break per sheet.
- Workflow type drives the section label and table contents identically across all 5 workflows.

## Assets still required

- `frontend/public/logo.png` — the swastika logo image from the PDF (centered, ~22mm tall). Falls back gracefully (`onError` hides the img tag) if missing.

## Verification matrix (operator-side)

After `npm start` and triggering Bundle Receipt on a 2-item GC record:

| Check | Expected |
|---|---|
| Print dialog count | 1 |
| Page count | 3 (1 customer + 2 tester) |
| Page 1 width | Narrow strip centered on A4 (matches PDF) |
| Page 1 header | Logo + "Swastik Assayers" + address + phone, all centered |
| Page 1 table columns | `Sl No \| Item \| Total Wt \| Spl Wt \| Amount` |
| Page 1 Grand Total | Present, double-rule, right-aligned |
| Page 1 footer | "Thank you for your business!" centered |
| Pages 2-3 width | Same narrow strip |
| Pages 2-3 table columns | `Sl No \| Item \| Total Wt \| Spl Wt` (no Amount) |
| Pages 2-3 Grand Total | Absent |
| Pages 2-3 customer name | Per-sample `sample.name` if present, else record customer name |
| Date format | `dd-mm-yy` (e.g., `16-04-24`) |
| Time format | `hh:mm AM/PM` (e.g., `01:19 PM`) |
| Item names | Uppercased |
| Returned items | Total Wt strikethrough |

## Outstanding from earlier (still non-blocking)

- PhotoCert "Bhimram" signatory preservation (already verified via grep; in place)
- `num2words` JS equivalent for GC/SC full-cert purity-in-words copy (separate component, not Bundle Receipt)
- `|in_carat` JS helper (separate component)
- Receipt-on-create auto-trigger
