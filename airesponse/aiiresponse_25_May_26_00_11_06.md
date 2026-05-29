# PhotoCert — carat label missing on print (gap #2 fixed)

**Source:** operator report — *"work on photo certificate not working on SERN just check with python code"*; symptom confirmed as gap #2: carat label always blank on print
**Recorded:** 2026-05-25 00:11
**Branch:** `receipt-bundle-wip`
**Status:** Fixed both ends — backend snapshot now exposes `show_kt`; frontend renders the carat value in Python-compatible format without the doubled "KT" suffix.

## Root cause (two-end bug)

1. **Backend gap.** [`backend/services/v2/printService.js`](../backend/services/v2/printService.js) `getPrintLayout` did not include `show_kt` in the photo-cert item shape. The flag is stored as `INTEGER 0/1` in `photo_certificate_item` and edited via the Phase2Modal flow, but the print snapshot dropped it. Result: `item.show_kt` was permanently `undefined` on the frontend, so the JSX conditional `item.show_kt ? ... : ''` always rendered the empty branch — carat row blank on print regardless of the source data.

2. **Frontend format mismatch.** SERN's PhotoCert was computing carat as `((purity/100)*24).toFixed(2)` and rendering with a `" KT"` suffix. Python's `|in_carat` filter is `round(n * 0.24, 2)` — same math (within float precision), but Python's template renders the bare number with no suffix. The PC certificate paper has the "KT" label PRE-PRINTED. The SERN suffix would have caused the physical print to read e.g. `22.00 KT KT` once both ends were fixed.

## Python reference

From `app/__init__.py`:
```python
@app.template_filter('in_carat')
def in_carat(n):
    return round(n * 0.24, 2)
```

From `app/dashboard/templates/dashboard/photo_certificate/certificate.html`:
```html
<h5>
    {{ data.purity|in_carat if data.show_kt else '' }}
</h5>
```

No "KT" suffix. The paper provides it.

## Patches

### Backend — [`backend/services/v2/printService.js`](../backend/services/v2/printService.js)

Photo-cert item spread now exposes `show_kt`:

```diff
   ...(resolvedMetalType === 'photo'
-      ? { media_path: item.media_path || null }
+      ? {
+          media_path: item.media_path || null,
+          show_kt: item.show_kt === 1 || item.show_kt === true,
+        }
       : {}
   ),
```

Normalisation matches the `Phase2Modal` convention (`=== 1 || === true`) used everywhere else in the codebase that consumes this INTEGER-as-boolean column.

### Frontend — [`frontend/src/components/print/PhotoCert.js`](../frontend/src/components/print/PhotoCert.js)

Carat formula re-anchored to Python's filter, suffix removed:

```diff
-  const ktVal = ((purity / 100) * 24).toFixed(2);
+  // Python `|in_carat` filter: round(n * 0.24, 2). Python's float repr keeps
+  // a minimum of one decimal (22 → "22.0", 22.5 → "22.5"). The "KT" suffix is
+  // PRE-PRINTED on PC paper — render the bare number only.
+  const _ktRaw = Math.round(purity * 0.24 * 100) / 100;
+  const ktVal  = Number.isInteger(_ktRaw) ? `${_ktRaw}.0` : _ktRaw.toString();
```

```diff
-  <tr><td><span className="pc-h5">{item.show_kt ? `${ktVal} KT` : ''}</span></td></tr>
+  <tr><td><span className="pc-h5">{item.show_kt ? ktVal : ''}</span></td></tr>
```

Display format examples now match Python's `str(round(x, 2))` output:

| Purity % | Python `in_carat` → str | SERN `ktVal` |
|---|---|---|
| 91.67 | "22.0" | "22.0" |
| 75.00 | "18.0" | "18.0" |
| 93.75 | "22.5" | "22.5" |
| 95.83 | "23.0" | "23.0" |

## Other PhotoCert gaps still open

Identified in the diagnostic pass but NOT patched in this turn (operator confirmed only gap #2 as the active symptom):

| # | Gap | Severity | Fix surface |
|---|---|---|---|
| 1 | Cert number prints as `${auto_number}-${item_no}` (synthesized) instead of `item.certificate_number` (direct from Python) | Wrong text on cert | Frontend `PhotoCert.js` — replace `certNo` line with `item.certificate_number` (with fallback if undefined) |
| 4 | Image URL falls back to `localhost:6001` when `REACT_APP_API_URL` env unset — production deployments on a different port would 404 the image | Env-dependent breakage | Either set `REACT_APP_API_URL` in deployment env, OR change `getMediaUrl` fallback to use relative paths |

Flagging here for the next PC print-pass review.

## Cert-geometry rule reinforced

This fix is a textbook case of the load-bearing rule from [`docs/print-service-architecture.md`](../docs/print-service-architecture.md):

> Template logic can be shared. Paper geometry cannot.

SERN's "KT" suffix was a small piece of "improving on Python" — adding a unit label that seemed informative — that would have **broken the physical certificate** by overlapping the preprinted "KT" label on the paper. Code-review alone would not have caught it because the visual conflict only shows up on actual printed output against the real paper stock. Locked Decision #7 (physical printer verification before any geometry change) directly applies here.

## Verification

After this fix, the printed PC certificate should match Python's behavior exactly:

- `show_kt = 1` + purity 91.67 → carat row renders `22.0` (matches Python `round(91.67 * 0.24, 2) = 22.0`)
- `show_kt = 0` + any purity → carat row blank (matches Python's `if data.show_kt`)
- Bare number with no "KT" suffix (matches Python's filter output rendered raw)

Operator can verify by:
1. Opening a PC record where `show_kt = true`, printing the certificate, confirming carat value appears.
2. Toggling `show_kt = false`, printing again, confirming the carat row is blank.
3. Holding the printed sheet against the pre-printed cert paper, confirming the carat number lands inside (not next to or overlapping) the preprinted "KT" label.

## File state on `receipt-bundle-wip`

Two new edits stacked on top of existing branch state:

- `backend/services/v2/printService.js` (existing WIP file; my edit appends `show_kt` to the photo item spread)
- `frontend/src/components/print/PhotoCert.js` (existing file; my edit fixes carat calculation + suffix)

Per heavy-entanglement exception, both edits coexist with prior session WIP in those files; commit-pass will need staging discipline.
