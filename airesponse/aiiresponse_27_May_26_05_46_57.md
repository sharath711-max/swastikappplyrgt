# ThermalReceipt — upgraded to multi-page (customer + tester slips)

**Source:** operator report — print preview showed only 1 page for a 1-sample receipt; asked *"where page 2 tester copies"*
**Recorded:** 2026-05-27 05:46
**Branch:** `receipt-bundle-wip`
**Status:** Fixed. ThermalReceipt now produces `samples + 1` pages in a single print job. Card receipt icon wiring unchanged.

## What went wrong in the prior turn

In the previous turn I removed the Bundle Receipt feature literally — deleted the components, dropped the Phase2Modal button, reverted the wire-ins. The card receipt icon kept calling `triggerPrint(... , { layout: 'receipt' })`, which routes to `ThermalReceipt`, which was single-page only. Result: 1-sample print = 1 page; no tester slips.

The operator's actual intent was "remove the *separate* Bundle Receipt path, keep the card icon as the single trigger — and the card icon should still produce the multi-page output." I dropped the multi-page functionality along with the feature.

## What was fixed this turn

Enhanced `ThermalReceipt` itself to be multi-page, mirroring Python's `gold_test/receipt.html` structure. No separate Bundle component reintroduced.

### [`frontend/src/components/print/ThermalReceipt.jsx`](../frontend/src/components/print/ThermalReceipt.jsx)

Restructured the render output:

```
<thermal-receipt-root print-only-surface>
  <thermal-receipt-wrapper>             ← Page 1: CUSTOMER COPY
    [SlipHeader: logo + lab + meta]
    [5-column table: Sl No | Item | Total Wt | Spl Wt | Amount]
    [Grand Total]
    [Thank you for your business!]
  </thermal-receipt-wrapper>

  {items.map(item, idx => (
    <thermal-receipt-wrapper --tester>  ← Pages 2..N+1: TESTER COPY (one per item)
      [SlipHeader: same lab + meta block]
      [4-column table: Sl No | Item | Total Wt | Spl Wt]    ← no Amount column
    </thermal-receipt-wrapper>
  ))}
</thermal-receipt-root>
```

Extracted a `SlipHeader` inline component to share the centered logo + lab name + address + phone + meta row across the customer page and every tester slip. Same render logic, single source of truth.

### [`frontend/src/components/print/CertificatePrint.css`](../frontend/src/components/print/CertificatePrint.css)

Added page-break behaviour:

```css
@media print {
  .thermal-receipt-wrapper {
    page-break-after: always;
    break-after: page;
  }
  .thermal-receipt-wrapper:last-child {
    page-break-after: auto;
    break-after: auto;
  }
}

.thermal-receipt-wrapper--tester .tr-table--tester {
  border-bottom: 2px solid #000;
}
```

Page-break-after on every wrapper except the last produces clean per-page separation in the print preview. Tester table bottom border mirrors Python's `border-bottom: 2px solid black` on the per-item slip table.

## Per-sample person name override (deferred)

Python's `gold_test/receipt.html` shows the per-sample person name on the tester slip if `data.name` is set, else the record-level customer name. The SERN snapshot rename (`buildReceiptSnapshot` in `PrintContext.jsx`) collapses `item.name` to mean *item type* rather than *person*, so the per-sample person name isn't recoverable from the snapshot today.

Tester slips currently always show the record-level `customer.name` — safe fallback. If the per-sample person name becomes a requirement, extend `buildReceiptSnapshot` to preserve a separate `personName` field. Inline TODO comment left at the call site.

## Behaviour preserved

- Single print dialog opens once per receipt action — N+1 pages render in that one dialog.
- Card receipt icon on workflow cards (`handleCardReceipt` in `WorkflowBoard.js`) still triggers `triggerPrint(printType, item.id, { layout: 'receipt' })` — no wiring change.
- Right-click context-menu Receipt action still routes the same way.
- Phase2Modal's Copy + Print All buttons unchanged (DONE-only visibility, unrelated to receipts).
- ThermalReceipt's existing visual layout (78mm thermal-strip width, centered logo, address/phone, invoice/customer/date/time/workflow meta, 5-col items table on page 1) — all preserved.
- Bundle Receipt artifact remains deleted; no Bundle wire-in restored.

## Verification

After refresh:

- 1-sample record → print preview shows **2 pages**.
- 2-sample record → **3 pages**.
- N-sample record → **N + 1 pages**.
- Page 1: items table with Amount + Grand Total.
- Pages 2..N+1: simpler items table (no Amount), bottom border on table.
- Same lab header + meta on every page.
- Single browser print dialog.

## Doc note

`docs/print-service-architecture.md` §6 "Removed" already covers the Bundle Receipt removal. The thermal-receipt multi-page behaviour is consistent with what `ThermalReceipt` is documented as in §2.1 (the catalog entry already calls it a customer-handover artifact for all 5 workflows). No doc edit needed — the artifact category didn't change, only the rendered page count.
