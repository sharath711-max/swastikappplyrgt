# Receipt & Certificate Actions — Full Analysis

## 1. Overview

Every business module inside the dashboard (Gold Test, Gold Certificate, Silver Certificate, Photo Certificate) follows an **identical routing pattern** for generating printable documents. Each module registers these print-page routes using the `RouteView.register` utility:

| Module | Blueprint Prefix | Routing Module |
|---|---|---|
| Gold Testing | `/dashboard/gold-test/` | `gold_test.py` |
| Gold Certificate | `/dashboard/gold-certificate/` | `gold_certificate.py` |
| Silver Certificate | `/dashboard/silver-certificate/` | `silver_certificate.py` |
| Photo Certificate | `/dashboard/photo-certificate/` | `photo_certificate.py` |

---

## 2. Routing Architecture

### Uniform Route Pattern (all 4 modules)

```
GET /<module>/<uid>/receipt/                         → receipt.html
GET /<module>/<uid>/certificate/                     → certificate.html  (all items)
GET /<module>/<uid>/certificate/<index>/             → certificate.html  (single item)
GET /<module>/<uid>/small-certificate/               → small_certificate.html (all items)
GET /<module>/<uid>/small-certificate/<index>/       → small_certificate.html (single item)
GET /<module>/bills/                                 → bills.html
```

> **Exception:** `gold_test` module does NOT have a `small_certificate` route. It only has `receipt`, `certificate`, and `bills`.

#### Gold Test Route Registration (gold_test.py)
```python
RouteView.register(gold_test, 'receipt',      {'/\u003cint:uid>/receipt/': {}},                        receipt.html)
RouteView.register(gold_test, 'certificate',  {'/\u003cint:uid>/certificate/': {},
                                               '/\u003cint:uid>/certificate/\u003cint:index>/': {}},  certificate.html)
RouteView.register(gold_test, 'bills',        '/bills/',                                     bills.html)
```

#### Gold/Silver/Photo Certificate Route Registration
```python
RouteView.register(..., 'receipt',           {'/\u003cint:uid>/receipt/': {}},                         receipt.html)
RouteView.register(..., 'certificate',       {'/\u003cint:uid>/certificate/': {},
                                              '/\u003cint:uid>/certificate/\u003cint:index>/': {}},   certificate.html)
RouteView.register(..., 'small_certificate', {'/\u003cint:uid>/small-certificate/': {},
                                              '/\u003cint:uid>/small-certificate/\u003cint:index>/': {}}, small_certificate.html)
RouteView.register(..., 'bills',             '/bills/',                                      bills.html)
```

---

## 3. Receipt Action (`receipt.html`)

### What it renders
A **thermal-printer-friendly, 100mm wide** HTML receipt page that:
- Prints the shop header (Logo + "Swastik Assayers" + Address + Phone)
- Shows Invoice/Bill Number, Customer Name, Date, Time
- Lists all line items (Sl No, Item, Total Weight, Spl Weight, Amount)
- Shows Grand Total
- On a second pass, prints one **individual slip per item** (page-break separated)

### Template Structure

```
Section 1 — Master Summary Receipt (once per transaction)
├── Logo block (120×120px img)
├── Shop info block (address, phone)
├── Invoice No + Customer Name
├── Date + Time
├── Line item table (loop: test.data)
│     → Sl No | Item | Total Wt | Spl Wt | Amount
└── Grand Total row

Section 2 — Per-Item Slips (loop: test.data → page-break between each)
├── Shop name (abbreviated)
├── Invoice No + Date + Time + Customer Name
└── Mini table (single item row only)
```

### Key Design Decisions

| Feature | How it works |
|---|---|
| **Print trigger** | `window.print()` fires on page load automatically |
| **Auto-close** | `window.onafterprint` + `matchMedia` listener calls `window.close()` after print dialog closes |
| **Returned items** | Items with `data.returned == True` get CSS `text-decoration: line-through` on the weight column |
| **GST display** | Gold Certificate receipts conditionally render GSTIN and CGST @9% + SGST @9% rows only when `test.gst` is `True` |
| **Per-item name override** | If `data.name` is set on an item, it overrides the master `test.customer.name` — supports joint-customer scenarios |

### Differences Between Modules (receipt.html)

| Feature | Gold Test | Gold / Silver / Photo Certificate |
|---|---|---|
| GSTIN line | ❌ Not present | ✅ Shown conditionally (`if test.gst`) |
| GST rows (CGST/SGST) | ❌ | ✅ |
| Certificate number in header | ❌ | ✅ (`Certificate: XXXX` in header) |
| Label | "Gold Testing" | "Gold Certificate Testing" / "Silver Certificate Testing" |
| CSS file for receipt | `css/gold_test/receipt.css` | `css/gold_test/receipt.css` (shared!) |

---

## 4. Certificate Action (`certificate.html`)

### What it renders
A **physical stamp-card / certificate** designed to be printed on pre-printed assay card stock. Minimal layout — just fills prescribed fields at fixed positions.

### Template Logic

```jinja2
{% set test_data = [test.data[index - 1]] if index else test.data %}
{% for data in test_data %}
  <!-- certificate card for this item -->
{% endfor %}
```

- If `index` URL parameter is provided → prints **only that one item's certificate**.
- If no `index` → prints **all items' certificates**, with `page-break` between each.

### Field Layout Per Module

#### Gold Test Certificate (`gold_test/certificate.html`)
| Field | Value |
|---|---|
| Bill Number | `test.bill_number` |
| Date | `test.created` (formatted `%d/%m/%y`) |
| Customer Name | `data.name` or `test.customer.name` (UPPERCASE) |
| Weight | `data.total_weight` / `data.test_weight` (gm) |
| Item Type | `data.item` (UPPERCASE) |
| Purity Display | `data.purity` as `%` OR `"NO GOLD"` if purity ≤ 0 |

#### Gold Certificate (`gold_certificate/certificate.html`)
| Field | Value |
|---|---|
| Certificate Number | `data.certificate_number` |
| Date | `test.created` |
| Customer Name | `data.name` or `test.customer.name` |
| Item | `data.item` (UPPERCASE) |
| Weight | `data.total_weight` (gm) |
| Purity (carat) | `data.purity \| in_carat` (template filter → converts % to carats) |
| Purity (numeric+words) | `data.purity` rounded + spelled out in words using `num2words` |

> **Notable:** Gold Certificate is the **most elaborate** — it converts purity to both carats AND an English words description (e.g., `SEVENTY TWO POINT ZERO`), suitable for formal assay document requirements.

---

## 5. Small Certificate Action (`small_certificate.html`)

### What it renders
A **compact thermal-format version** of the certificate, similar to the Gold Test certificate layout but for Certificates (Gold, Silver, Photo). Designed for a smaller physical card.

### How it differs from the full `certificate.html`

| Aspect | `certificate.html` | `small_certificate.html` |
|---|---|---|
| Layout | Larger A4/card size, uses `padding-top: 4.4cm` | Compact — no large padding |
| Certificate ref | `data.certificate_number` alone | `test.bill_number / data.certificate_number` (combined) |
| Purity format | Full numeric + carat + num2words | `%` or `"NO GOLD"` — simpler |
| Use case | Official assay certificate for customer | Quick internal/counter reference slip |

---

## 6. Print Lifecycle — Universal Mechanism

All 4 types of printable documents use the **same auto-print + auto-close** JavaScript:

```javascript
(function () {
    let afterPrint = function () {
        window.close();  // Auto-close the tab
    };
    if (window.matchMedia) {
        var mediaQueryList = window.matchMedia('print');
        mediaQueryList.addListener(function (mql) {
            if (!mql.matches) { afterPrint(); }
        });
    }
    window.onafterprint = afterPrint;
}());
window.print();  // Auto-trigger print dialog on page load
```

This means every receipt/certificate page:
1. **Opens in a new tab** (triggered from the index table via JS `window.open`)
2. **Auto-fires the print dialog** on load
3. **Closes itself** after the print dialog is dismissed, returning user to the list

---

## 7. Comparison Table — All Document Types

| Feature | Receipt | Certificate (Full) | Small Certificate |
|---|---|---|---|
| Width | 100mm (thermal) | Pre-printed card | Small card |
| All items in one doc | ✅ Summary + per-item slips | ✅ (loop + page-break) | ✅ (loop + page-break) |
| Single item by index | ❌ | ✅ `/certificate/<index>/` | ✅ `/small-certificate/<index>/` |
| GST breakdown | ✅ (cert modules only) | ❌ | ❌ |
| Purity in words | ❌ | ✅ (Gold Cert) | ❌ |
| Returned item strikethrough | ✅ | ❌ | ❌ |
| Auto-print + auto-close | ✅ | ✅ | ✅ |

---

## 8. Suggested Improvements

1. **CSS consolidation**: The Gold Certificate receipt still loads `css/gold_test/receipt.css` — it should have its own `css/gold_certificate/receipt.css` to avoid tight coupling.
2. **`matchMedia.addListener` deprecation**: `addListener` is deprecated in favor of `addEventListener('change', ...)` across all print templates.
3. **Index bounds check**: If `index` exceeds `len(test.data)`, an unhandled `IndexError` will propagate. A guard in the template or route is advisable.
4. **Gold Test small certificate gap**: If small cards are ever required for gold testing sessions, the `gold_test` blueprint would need a `small_certificate` route added.
