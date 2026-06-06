# Print Service Architecture

Canonical reference for print artifact engineering in the Swastik Gold & Silver Testing Lab application.

This document is the source of truth for all print-related work. It establishes the architectural rule, catalogs every print artifact, maps Python originals to SERN equivalents, lists decisions that are not open for revision, and tracks non-blocking follow-up items.

---

## 1. Core Architectural Rule

> **Template logic can be shared. Paper geometry cannot.**

The certificate print pipeline interacts with physical printers and pre-printed paper stock. Misalignment is not a styling regression — it is a document defect that forces reprinting and weakens institutional accountability.

### Safe to share

- Rendering logic
- Field mapping
- Helper utilities
- Print pipeline (snapshot fetch, render dispatch, `window.print` orchestration)
- Formatting helpers (currency, weight, date, purity-in-words, carat conversion)

### Unsafe to blindly share

- CSS coordinates
- Top padding (header skip on pre-printed paper)
- Print width
- Print height
- Signature placement
- Page offsets
- Pre-printed paper alignment zones

### Why this rule exists

**A 1–2 mm drift on printed stock can break physical certificate alignment.** Stamps land outside the printed seal zone. Signature lines fall off the paper edge. The certificate number prints over the customer name field. Operators must reprint, customers reject the document, and audit chains record an issuance retry. The cost of CSS deduplication is paid in physical paper and institutional trust.

CSS files for the four certificate workflows (GT slip, GC, SC, PC) are kept isolated because the paper geometries are physically distinct, not because the code happens to differ. The duplication is intentional.

---

## 2. Print Artifact Catalog

The print service produces five distinct artifact classes, all direct Python ports.

### 2.1 Receipt — thermal handover slip

| | |
|---|---|
| Purpose | Customer acknowledgement at intake or completion |
| Geometry | Thermal strip, `width: 100mm`, `padding: 2mm` |
| Window | `window.open(url, '_blank', 'height=750,width=400,...')` |
| Workflows | GT, GC, SC, PC (4 of 5; ST mirrors GT — see §4) |
| Pages | 1 summary + N per-item slips |

Structure:

- Page 1 — summary: lab header, invoice metadata (number, customer, date, time, workflow title), itemized table (`Sl No | Item | Total Wt | Spl Wt | Amount`), Grand Total, footer.
- Pages 2..N — per-item slip: invoice + customer + per-sample weight row. Amount is intentionally omitted on per-item slips.
- Page-break between summary and slips.
- Returned items render weight with strikethrough.
- Auto-`window.print()` on load; auto-`window.close()` on `afterprint`.

### 2.2 Small Certificate — compact pre-printed slip

| | |
|---|---|
| Purpose | Compact customer slip; alternative to full certificate |
| Geometry | Compact pre-printed slip stock; minimal top padding |
| Workflows | GC, SC, PC |
| Shared CSS | `css/gold_test/certificate.css` is shared across all three workflows |

Structure (per item, page-break between):

- Row 1: combined `{bill_number}/{certificate_number}` at 2.2rem; date right-aligned.
- Row 2: customer name (uppercase).
- Row 3: weight in dual-weight format `{total}gm/{test}gm` when test weight exists; total alone otherwise.
- Row 4: item type (uppercase).
- Row 5: purity percent, OR the literal string `NO GOLD` at 1.7rem when purity is null or ≤ 0.

The "NO GOLD" rendering is data-driven, not a separate template.

### 2.3 Gold Certificate — full

| | |
|---|---|
| Purpose | Legal gold certificate; the artifact that leaves the building |
| Geometry | Pre-printed gold certificate stock; top padding `4.4cm` skips the printed header zone |
| Workflows | GC only |

Structure (per item, page-break between; supports `?index=N` for single-item):

- Row 1: certificate number; date right-aligned.
- Row 2: customer name (or per-sample `data.name` if present); total weight in grams.
- Row 3: item type (uppercase); purity-in-carat via `|in_carat` filter.
- Row 4 (full width): purity numeric at 1.75rem, followed by purity-in-words via `num2words()` rendered italic 800-weight (e.g. `EIGHTEEN POINT FIVE FIVE`).

The purity-in-words rendering is load-bearing for legal copy. The certificate's force depends on the words-form matching the numeric.

### 2.4 Silver Certificate — full

| | |
|---|---|
| Purpose | Legal silver certificate |
| Geometry | Pre-printed silver certificate stock; top padding `4.4cm` |
| Workflows | SC only |

Template structure is byte-for-byte identical to the Gold Certificate full template. The only logical difference is the model class (`SilverCertificate.get(uid)` vs `GoldCertificate.get(uid)`).

The CSS file is separate from the gold certificate CSS. The silver pre-printed paper has different stamp positions, signature zones, and header heights. Sharing CSS would break the silver paper alignment.

This is the canonical case for §1 — share template logic, never share paper geometry.

### 2.5 Photo Certificate

| | |
|---|---|
| Purpose | Item certificate with embedded photograph of the article |
| Geometry | Two-column layout, each column `8.13cm` wide (16.26cm content) |
| Workflows | PC only |
| Signatory | Hardcoded literal `"Bhimram"` in the Python template |

Structure (per item, page-break between):

| Left column (8.13cm) | Right column (8.13cm) |
|---|---|
| Date `dd/mm/yy` | `<img src="static/uploads/{{ media[0] }}">` |
| Customer name | (centered photo via padding) |
| Certificate number | |
| Item type (uppercase, 2.4rem bottom margin) | |
| Total weight at 2.4rem + ` GM` | |
| Purity in carat (only if `data.show_kt`) | |
| Purity numeric at 2.4rem | |
| Signatory: `Bhimram` | |

Photo source is `test.media[0]` (the first uploaded media file). If the array is empty, the image renders blank but the layout holds.

---

## 3. Python → SERN Mapping

| Python Artifact | SERN Component | PrintContext layout key | Status |
|---|---|---|---|
| Receipt | `ThermalReceipt` | `layout: 'receipt'` | Parity |
| Small Certificate | `SmallCert` | `layout: 'small'` | Parity |
| Gold Certificate | `GoldCert` | (default cert layout) | Parity |
| Silver Certificate | `SilverCert` | (default cert layout) | Parity |
| Photo Certificate | `PhotoCert` | (default cert layout) | Parity |

SERN components live under `frontend/src/components/print/`. Dispatch goes through `PrintContext` → `PrintPortal` (in-app print) or `PrintView` (route-based new-window print).

Custom Jinja filters used in Python templates require JS equivalents in SERN:

- `|round0(n)` — n-decimal float formatting
- `|in_carat` — purity percent → carat label (e.g. `22K`)
- `num2words(...)` — number-to-English-words; load-bearing for certificate legal copy

---

## 4. Locked Decisions

The following decisions are not open for revision without explicit operator authorization and physical printer verification:

1. **Silver Test has no Python ancestor.** Python's dashboard implemented Gold Test (GT), Gold Certificate (GC), Silver Certificate (SC), and Photo Certificate (PC). Silver Test (ST) is a SERN-only workflow added during the rewrite.

2. **ST receipt mirrors GT receipt behavior.** Because ST has no Python ancestor, its receipt artifact replicates the Gold Test thermal-strip structure (100mm width, summary + per-item slips, identical field grid). Operators get the same training, same print experience, and same workflow expectation across both metal types.

3. **Thermal Receipt is the customer handover artifact.** The 100mm thermal-strip `ThermalReceipt` is the operator's immediate handover at intake and completion. It is the only customer-facing acknowledgement artifact in the system. (A previous A4 multi-page "Receipt Bundle" variant was removed by operator direction — see Removed below.)

4. **Gold Certificate and Silver Certificate CSS must remain isolated.** The two paper stocks have different stamp positions, signature zones, and header heights. Their CSS files (`css/gold_certificate/certificate.css` and `css/silver_certificate/certificate.css` in Python; the equivalent SERN component-scoped styles) must not be merged or DRY-refactored.

5. **Print geometry must never be unified without physical printer verification.** Any refactor that proposes consolidating two or more cert layouts requires:
   - Operator sign-off on the proposed paper stock change;
   - Physical print test on the target printer with the target paper;
   - Audit trail of the verification before the merged geometry ships.

   No purely-code-review justification is sufficient to merge cert geometries.

---

## 5. Open Follow-ups

The following items are non-blocking and should be verified during the next print-architecture review pass:

- **PhotoCert signatory parity** — verify the literal `"Bhimram"` signatory is preserved in `frontend/src/components/print/PhotoCert.js`. If absent and no `signatory` config replaces it, the SERN port silently dropped the issuing assayer's legal accountability. *Status: follow-up / non-blocking.*

- **JS equivalent for `num2words` purity text** — Python's `num2words` library renders the load-bearing purity-in-words legal copy on Gold and Silver full certificates. Verify the SERN `GoldCert` and `SilverCert` components render the equivalent words-form. *Status: follow-up / non-blocking.*

- **JS helper for `|in_carat` formatting** — Python's custom Jinja filter converts purity percent to a carat label (e.g. `22K`). Verify a SERN equivalent helper exists and is wired into the cert components. *Status: follow-up / non-blocking.*

- **Receipt-on-create auto-trigger review** — Python's intake flow auto-opened the receipt window for the operator who created the record (via `socket.id === data.sender` matching in the per-flow `socket.on('added')` handlers). The SERN dashboard rebuild deferred this rhythm in favor of an explicit manual button. Review whether the auto-trigger should be re-introduced as an opt-in setting once the manual workflow is stable in production. *Status: follow-up / non-blocking.*

---

## 6. Removed

### Receipt Bundle (A4 multi-page customer acknowledgement)

Previously shipped as a sixth print artifact: an A4-portrait multi-page receipt (page 1 summary + one page per sample, total = `samples + 1`). Triggered via `layout: 'receipt-bundle'` from a "Bundle Receipt" button in `Phase2Modal`.

**Removed by operator direction.** Customer handover is served by the existing `ThermalReceipt` (`layout: 'receipt'`), which Python already produces in the equivalent thermal-strip multi-page form for multi-item records. The Bundle Receipt's A4 acknowledgement layout was redundant; the operator's spec preference is "just receipt icon in card" — the card-level thermal receipt trigger on `WorkflowBoard.js` covers the customer-handover use case.

Files removed from `frontend/src/components/print/`:

- `ReceiptBundle.jsx`
- `ReceiptBundleSummary.jsx`
- `ReceiptBundleSample.jsx`
- `ReceiptBundle.css`

Wire-ins reverted in `PrintContext.jsx`, `PrintPortal.jsx`, `PrintView.js`. The `routeType` pass-through in `PrintContext`'s job object (which only the Bundle Receipt consumed) was also removed.

**Do not reintroduce** an A4 multi-page customer acknowledgement without explicit operator authorization. If the use case re-emerges, evaluate first whether `ThermalReceipt` already covers it.

---

## File locations

- Python templates: `app/dashboard/templates/dashboard/<workflow>/<artifact>.html` (in the legacy Python repository)
- Python stylesheets: `app/dashboard/static/css/<workflow>/<artifact>.css`
- SERN print components: `frontend/src/components/print/`
- SERN print orchestration: `frontend/src/contexts/PrintContext.jsx`, `frontend/src/components/print/PrintPortal.jsx`, `frontend/src/pages/PrintView.js`
- SERN per-sample dispatch: `frontend/src/components/print/PrintManager.js`
