# Python receipt-action verification across all 5 workflows

**Source:** prompt — *"Verify python project list flows having Reciept Actions"*
**Recorded:** 2026-05-24 (backfill)
**Branch:** N/A — read-only verification
**Status:** Verified. Findings documented below.

## Matrix

| Workflow | Exists in Python? | Receipt Template | Receipt URL | Receipt Button Location |
|---|:-:|---|---|---|
| **Gold Test (GT)** | ✓ | `gold_test/receipt.html` | `/dashboard/gold-test/{id}/receipt/` | Ongoing + Completed columns (Tested shows Certificate instead) |
| **Silver Test (ST)** | ✗ | — | — | **Does not exist** — `silver_test` directory absent from Python templates |
| **Gold Certificate (GC)** | ✓ | `gold_certificate/receipt.html` | `/dashboard/gold-certificate/{id}/receipt/` | All 3 columns |
| **Silver Certificate (SC)** | ✓ | `silver_certificate/receipt.html` | `/dashboard/silver-certificate/{id}/receipt/` | All 3 columns |
| **Photo Certificate (PC)** | ✓ | `photo_certificate/receipt.html` | `/dashboard/photo-certificate/{id}/receipt/` | All 3 columns |

## Key findings

- **4 of 5 SERN workflows have Python receipt parity.** ST is a SERN-only addition; Python had no silver_test directory at all.
- **GT differs from the cert flows** — Receipt in Ongoing + Completed only, NOT in Tested where the dropdown shows Certificate instead. The three cert flows show Receipt in all three columns.
- **Receipt-on-create auto-trigger** — all four Python flows have `$(`#test_${id}`).find('.receiptBtn').trigger('click')` in their `socket.on('added', ...)` handler. When the operator creates the record, their own session auto-opens the receipt window (via `socket.id === data.sender` sender check). SERN dropped this rhythm; flagged earlier in the GT analysis.
- **Receipt geometry: thermal-strip, not A4.** All Python receipts open via `window.open(url, '_blank', 'location=yes,height=750,width=400,scrollbars=yes,status=yes')`. `width=400` confirms single-page thermal-printer receipts. SERN's existing `ThermalReceipt` component is the direct port; the new `ReceiptBundle` (A4 multi-page) is a NEW artifact class with no Python equivalent.

## Implication for the Bundle Receipt feature

The Receipt Bundle shipped earlier is institutional capability Python never had:

- **Python receipt** = thermal-strip handover slip, single page, ~400px wide
- **SERN ThermalReceipt** (`layout: 'receipt'`) = same thing, same artifact
- **SERN ReceiptBundle** (`layout: 'receipt-bundle'`) = NEW multi-page A4 customer acknowledgement

If Python-receipt parity is wanted in Phase2Modal alongside Bundle Receipt, that's a small sibling button: `triggerPrint(route, id, { layout: 'receipt' })` → existing `ThermalReceipt`. Not implemented in this response — flagged as a follow-up only.
