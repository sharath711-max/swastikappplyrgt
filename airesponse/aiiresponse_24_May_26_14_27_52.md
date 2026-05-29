# Bundle Receipt — expected output cross-check (ST · 2 samples)

**Source:** user-provided QA spec — *"If you're testing Receipt for 2 samples, expected output should be: 3 pages — 1 Summary + 2 Sample"*
**Recorded:** 2026-05-24 14:27
**Branch:** `receipt-bundle-wip`
**Status:** Implementation cross-checked against expected output. Structural match confirmed; two cosmetic deviations flagged for QA.

## Structural match (PASS)

For ST-245 with 2 samples, shipped implementation produces:

- ✅ Total pages = `samples + 1` = 3
- ✅ Page 1 = customer summary with both samples
- ✅ Page 2 = Sample 1 of 2
- ✅ Page 3 = Sample 2 of 2
- ✅ Single print dialog (PrintContext's `window.print()` fires once after the portal mounts)
- ✅ Page breaks via `.rbundle-sheet--break { page-break-before: always }` + `@media print { page-break-after: always }` on every sheet except last

## UI differences from user's minimal mock (richer, not poorer)

### Page 1 summary table

| | User's mock | Shipped |
|---|---|---|
| Columns | 4 (Sl No / Item / Weight / Token) | 7 (Sl No / Token / Item / Metal / Weight / Flow / Remarks) |

Operator sees Metal column ("Silver"), Flow column ("Test"), Remarks column populated from `description`/`remarks`/`item_type`. Acceptable A4-portrait widths configured (12+32+18+22+22mm fixed + auto Item + auto Remarks). If cramped on print, dropping Flow is the easiest trim — single-workflow receipts already imply Flow from the badge.

### Page 1 customer block

Mobile renders with `+91` prefix. Address field renders only if `customer.address` is set on the snapshot — mock doesn't show address; mine matches when no address present.

### Per-sample pages (2+)

Richer than mock:

- 3-column **Sample Details** grid: Gross Weight / Sample Weight / Purity (not just one Weight number)
- Cert block on GC/SC/PC pages (Certificate No + Type)
- Image placeholder box on Photo Certificate pages only
- QR-placeholder verify block in footer (not just a "Verification" line)

These match the user's **original** Receipt Bundle spec ("Test Type / Certificate Type", "Barcode / QR placeholder", "Signature / verification area"), just expanded beyond the minimalist QA-mock representation.

## Format mismatches worth flagging

### Receipt number format

User's mock shows `ST-000245` (zero-padded 3-digit format).

Shipped reads from `buildReceiptSnapshot`: `payload?.header?.auto_number || payload?.bill_number || '-'`. SERN's ST `auto_number` is typically `ST-2026-245`, not `ST-000245`. If the daily-register-book 3-digit format matters operationally, that's a separate display normalization (Python's `ThermalReceipt` does this via `formatInvoiceNumber`).

### Per-sample token format

User's mock: `ST-245-1`, `ST-245-2`.

Shipped fallback: `sample.item_number || sample.certificate_number || sample.label || \`${receipt.number}-${index+1}\``. For ST items that don't carry `item_number`, fallback produces `ST-2026-245-1` — visually different from mock.

Both format adjustments are two-line edits if needed:

- Summary receipt number: add `formatInvoiceNumber()` helper from `ThermalReceipt` to `ReceiptBundleSummary`.
- Per-sample token: change the fallback template literal.

Not done in this turn — flagged as a QA-driven choice.

## QA checklist (reproduced from user)

When operator clicks **Bundle Receipt** on a 2-sample ST record:

- ✅ Print dialog opens once
- ✅ 3 pages generated
- ✅ Page 1 = summary of both samples
- ✅ Page 2 = sample 1
- ✅ Page 3 = sample 2
- ✅ Correct page breaks between pages

Same expectations scale to other workflows: `samples + 1` pages, identical structure.
