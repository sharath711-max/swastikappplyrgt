# Python print-service design & spec catalog (Receipt / Small Cert / GC / SC / PC)

**Source:** prompt — *"print service in Python project reciept, small certificate, GC and SC certificate and Photo Certificate get design and specification list the document"*
**Recorded:** 2026-05-24 14:43
**Branch:** N/A — analysis only, no code changes
**Status:** Reference document for SERN parity work.

## Common print-service contract

- Route pattern: `/dashboard/<workflow>/<id>/<artifact>/` and `/dashboard/<workflow>/<id>/certificate/<itemIndex>/` for per-item certs.
- Every template auto-fires `window.print()` on load, `window.close()` on `afterprint` event.
- Linked stylesheets: `bootstrap-4.3.1.min.css` (shared) + `app/dashboard/static/css/<workflow>/<artifact>.css` (per-workflow).
- Per-item printing supported via optional `?index=N` path param; otherwise loops all items with `<div class="page-break"></div>` between.

---

## 1. Receipt (GT / GC / SC / PC — all four)

**Geometry:** Thermal strip — `width: 100mm`, `padding: 2mm`, white background.

**Spawn:** From `<workflow>/index.html`:
```js
window.open(url, '_blank', 'location=yes,height=750,width=400,scrollbars=yes,status=yes')
```
`width=400` is the operator hint for thermal-printer rendering.

**Template:** `<workflow>/receipt.html` — example [`gold_test/receipt.html`](../../swastik/app/dashboard/templates/dashboard/gold_test/receipt.html)
**CSS:** `<workflow>/receipt.css`

### Page 1 — Summary

- Logo block: 120×120px centered, `object-fit: cover`
- Lab header: "Swastik Assayers" 1.4rem + 4-line address (Appurayappa A lane, Nagarthpet Cross, Bengaluru - 560002, Phone: 080-41643366/Centrex: 2366)
- Meta table (no border):
  - Row 1: `Invoice No: {bill_number}` · `Customer: {name} (+91 {phone})`
  - Row 2: `Date: dd-mm-yy` · `Time: HH:MM AM/PM`
  - Row 3: Workflow title ("Gold Testing", "Gold Certificate", etc.)
- Itemized table: columns `Sl No | Item | Total Wt | Spl Wt | Amount`
  - Item names rendered uppercase
  - Returned items: weight gets `text-decoration: line-through`
  - Weight values: `{value}|round0(3)g` (3 decimals)
- Grand Total row with `border-top: 2px solid #000; border-bottom: 2px solid #000`
- Footer: "Thank you for your business!" centered

### Pages 2..N — Per-item slip (additional)

- `<div class="page-break"></div>` separates each
- Mini layout per `data` row: Invoice + Date + Time + Customer + per-sample row (Sl No, Item, weights) — **NO amount** on per-item slips
- Bordered by `border-bottom: 2px solid black` on the inner table

### Variant by workflow

Same structure across GT / GC / SC / PC. Differences:
- Model class: `GoldTest.get(uid)` vs `GoldCertificate.get(uid)` etc.
- Title line: "Gold Testing" vs "Gold Certificate" vs "Silver Certificate" vs "Photo Certificate" — hardcoded per template

---

## 2. Small Certificate (GC / SC / PC)

**Geometry:** Compact pre-printed slip. Top padding minimal (no header skip — slip is physically shorter than the full cert page).

**Template:** `<workflow>/small_certificate.html` — example [`gold_certificate/small_certificate.html`](../../swastik/app/dashboard/templates/dashboard/gold_certificate/small_certificate.html)
**CSS:** `css/gold_test/certificate.css` — **shared across all three workflows** (one slip CSS, three template wrappers)

### Per-item layout

Page-break between items. Per item:

- Row 1: `{bill_number}/{certificate_number}` at **2.2rem** (large combined ID)
- Row 1 right: date `dd/mm/yy` with `margin-right: 10px; margin-top: 5px`
- Row 2: Customer name (uppercase, `ml-7`)
- Row 3: Total weight; appends `/test_weight` only if `data.test_weight > 0` (dual-weight format `12.500gm/4.250gm`)
- Row 4: Item type (uppercase, `ml-7`)
- Row 5: **Purity %** in `.purity` class
  - OR **"NO GOLD"** at `font-size: 1.7rem` when `data.purity ≤ 0` or `data.purity` is null

### Special rule

"NO GOLD" stamping is data-driven, not a separate template. When purity is null/zero, the slip explicitly says NO GOLD instead of a percentage.

---

## 3. Gold Certificate — Full (GC only)

**Geometry:** Designed to print over **pre-printed certificate paper**. The template uses absolute top padding to skip the printed header zone:

```html
<div class="container mt-4 p-0" style="padding-top: 4.4cm !important;">
```

**Template:** [`gold_certificate/certificate.html`](../../swastik/app/dashboard/templates/dashboard/gold_certificate/certificate.html)
**CSS:** `css/gold_certificate/certificate.css`

### Per-item layout (page-break between items, `?index=N` supports single-item)

| Row | Left column | Right column |
|---|---|---|
| 1 | `certificate_number` (ml-4) | date `dd/mm/yy` |
| 2 | Customer name (or per-sample `data.name` if present) | Total weight `{value} gm` |
| 3 | Item type (uppercase) | Purity in carat via `\|in_carat` filter |
| 4 | (colspan 2) **Purity numeric** 1.75rem **+ purity-in-words spelled** using `num2words()` italic 800-weight, `EIGHTEEN POINT FIVE FIVE` style |

### Special engine

`num2words(data.purity|int)` + decimals → "EIGHTEEN POINT FIVE FIVE" style spelled-out purity. The legal force of the certificate depends on this words-form match.

### Selector

`?index=N` → renders only `test.data[index - 1]` (single-item print path used by the per-item Certificate dropdown action).

---

## 4. Silver Certificate — Full (SC only)

**Geometry:** Identical to GC — same `padding-top: 4.4cm` overlay layout for pre-printed paper.

**Template:** [`silver_certificate/certificate.html`](../../swastik/app/dashboard/templates/dashboard/silver_certificate/certificate.html)
**CSS:** `css/silver_certificate/certificate.css` — **separate from GC**

### Layout

Byte-for-byte the same field grid as GC. Only difference is `SilverCertificate.get(uid)` instead of `GoldCertificate.get(uid)`.

### Critical separation

The CSS file is separate because the silver pre-printed paper has different stamp positions, signature zones, and header heights. Per [[feedback_python_cert_architecture]] this is the canonical "share template logic, never share geometry" rule. **Do not unify these CSS files in SERN.**

---

## 5. Photo Certificate — PC only

**Geometry:** **Two-column landscape-ish layout** — physically wider artifact than GC/SC. Each column 8.13cm wide (16.26cm total content width).

**Template:** [`photo_certificate/certificate.html`](../../swastik/app/dashboard/templates/dashboard/photo_certificate/certificate.html)
**CSS:** `css/photo_certificate/certificate.css`

### Per-item layout

| Left column (8.13cm) — text | Right column (8.13cm) — image |
|---|---|
| Date `dd/mm/yy` | `<img src="static/uploads/{{ test.media[0] }}">` |
| Customer name | (centered photo via px-2 py-4) |
| Certificate number | |
| Item type (uppercase, large bottom margin 2.4rem) | |
| Total weight **2.4rem** + " GM" | |
| Purity in carat (only if `data.show_kt`) | |
| Purity numeric **2.4rem** (`id="purity"`, 9cm width) | |
| "Bhimram" signature (margin-top 0.5cm) | |

### Photo source

`test.media[0]` — the first uploaded media file from the photo cert record. If `test.media` is empty, src is empty string (image renders blank but layout holds).

### Hardcoded signatory

Literal "Bhimram" baked into the template — this is the issuing assayer's name in PC paper geometry.

---

## Cross-cutting design rules

1. **Auto-print + auto-close.** Every template ends with `window.print()` + `window.onafterprint = () => window.close()`. No print preview, no manual button.

2. **Pre-printed paper assumption.** GC and SC full certs use `padding-top: 4.4cm` to leave the pre-printed header (lab logo, cert frame, title) untouched. Operator loads the right blank cert into the printer; the template fills only the per-item fields. Small certs and PC certs have different paper assumptions.

3. **Per-item vs all-items.** Routes accept optional `<int:index>` path param:
   - `/<id>/certificate/` → loops all `test.data` items with page-break between
   - `/<id>/certificate/<index>/` → renders only `test.data[index - 1]`

4. **Custom Jinja filters in use:**
   - `|round0(n)` — n-decimal float (`12.500`)
   - `|in_carat` — purity % to carat label (e.g. `22K`)
   - `|upper` — standard Jinja2
   - `num2words(...)` — Python library, spells numbers — load-bearing for cert legal copy

5. **Workflow labels hardcoded per template.** "Gold Testing" / "Gold Certificate" / "Silver Certificate" / "Photo Certificate" are string literals in each template, NOT a shared dictionary.

6. **CSS-file isolation = paper geometry isolation.** The four cert workflows each have their own `<workflow>/certificate.css`. This is the architectural enforcement of physical-form-driven cert engineering. Sharing CSS would break the pre-printed paper alignment of one or more flows.

---

## Matrix summary

| Artifact | Workflows | Paper | Top skip | Geometry driver | Special features |
|---|---|---|---|---|---|
| Receipt | GT / GC / SC / PC | 100mm thermal strip | None | `<workflow>/receipt.css` | Summary + per-item slip, returned-weight strikethrough, Grand Total |
| Small Certificate | GC / SC / PC | Compact pre-printed slip | None | `css/gold_test/certificate.css` (shared) | Combined `{bill}/{cert}` ID 2.2rem, "NO GOLD" stamping, dual-weight `Xgm/Ygm` |
| GC Full Cert | GC only | Pre-printed A-ish cert paper | 4.4cm | `css/gold_certificate/certificate.css` | num2words spelled purity |
| SC Full Cert | SC only | Pre-printed silver cert paper | 4.4cm | `css/silver_certificate/certificate.css` | Same template logic as GC, separate CSS for paper geometry |
| PC Certificate | PC only | Two-column wide layout, 16.26cm content | None | `css/photo_certificate/certificate.css` | Image column, hardcoded "Bhimram" signatory, 2.4rem weight/purity |

---

## Implications for SERN parity work

- **Receipt:** SERN's `ThermalReceipt` (`layout: 'receipt'`) is the direct port. Confirmed matches Python's 100mm thermal strip.
- **Small Certificate:** SERN's `SmallCert.js` is the equivalent. Three workflows (GC/SC/PC) share its logic; verify the CSS contract matches Python's shared `gold_test/certificate.css`.
- **GC Full / SC Full:** SERN has `GoldCert.js` and `SilverCert.js` with separate CSS — correct cert geometry isolation.
- **PC Certificate:** SERN's `PhotoCert.js` must preserve the two-column 8.13cm layout + image column + hardcoded "Bhimram" (unless lab signatory rotation is a P-D feature).
- **`num2words` equivalent:** SERN needs a JS equivalent for purity-in-words spelling. If `num2words` doesn't yet have a JS analogue in the codebase, this is a small library addition (`number-to-words` npm package or hand-rolled English-only impl).
- **`|in_carat` filter:** Python custom filter. SERN needs a JS function with the same purity→carat conversion table.
- **`|round0` filter:** SERN should use `Number(x).toFixed(n)` per-callsite or a shared `formatWeight` helper. Several SERN print components already do this.
