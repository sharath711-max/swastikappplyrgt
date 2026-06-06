# Phase2Modal Amount auto-populate from configured per-workflow rates

**Source:** operator pain point — *"While enter amount the time taking and I need configure in Dashboard in Day first login decide wirh change in prize or no change then that auto populate as per item cost read it from python project"* + *"fot all 5 flows"*
**Recorded:** 2026-05-27 06:06
**Branch:** `receipt-bundle-wip`
**Status:** Phase A shipped — Amount field auto-populates from per-workflow rates. Phase B (Dashboard first-login config UI) deferred pending operator confirmation.

## Python pricing model (verified from `swastik/app/models.py`)

Python uses **flat per-item PRICE class constants** on each workflow model — total = `PRICE × items.length`, ignoring weight. Defaults:

| Workflow | Python class | `PRICE` constant |
|---|---|---|
| Gold Test | `GoldTest` (line 109) | 30 |
| Gold Certificate | `GoldCertificate` (line 151) | 50 |
| Silver Certificate | `SilverCertificate` (line 159) | 100 |
| Photo Certificate | `PhotoCertificate` (line 167) | 50 |
| Silver Test | — (no Python ancestor) | mirror GT = 30 |

GST handling (Python `set_totals`):
```python
t = (self.PRICE / 1.18) if self.gst else self.PRICE
total = round(len(self.data) * t, 2)
total_tax = round(total * 0.18, 2) if self.gst else 0
```
When GST is on, `total` is the pre-tax base; gross paid by customer = `total + total_tax = PRICE × items` regardless. **This iteration does NOT replicate GST math** — auto-populated amount is the gross figure (`PRICE × items`). Operator can manually adjust if needed. GST formula can be wired in a follow-up if desired.

## What shipped

### Backend — [`backend/services/configService.js`](../backend/services/configService.js)

Extended to manage per-workflow flat prices alongside the legacy per-gram rates:

```js
const PRICE_DEFAULTS = {
    price_gold_test:   30,
    price_silver_test: 30,
    price_gold_cert:   50,
    price_silver_cert: 100,
    price_photo_cert:  50,
};
```

- `getRates()` returns both legacy per-gram rates AND per-workflow prices, with defaults filled in for any missing keys (so frontend can always rely on a numeric value).
- `updateRates(input)` accepts any subset of all keys in a single call. Same validation (non-negative number) and audit-log entry per change.
- Existing `/api/analytics/rates` GET and PUT endpoints inherit the new keys automatically — no route change needed.

### Frontend — [`frontend/src/components/Phase2Modal.js`](../frontend/src/components/Phase2Modal.js)

Three additions:

1. **Rate state + fetch on modal open**:
```js
const [rates, setRates] = useState(null);

useEffect(() => {
    if (!show) return;
    api.get('/analytics/rates').then(r => setRates(r.data?.data || {}));
}, [show]);
```

2. **Workflow→price resolver**:
```js
const getWorkflowPrice = () => {
    if (!rates) return 0;
    if (isGoldTest)                                                 return Number(rates.price_gold_test)   || 0;
    if (isSilverTest)                                               return Number(rates.price_silver_test) || 0;
    if (test?.type === 'gold_cert'   || test?.id?.startsWith('GCR')) return Number(rates.price_gold_cert)   || 0;
    if (test?.type === 'silver_cert' || test?.id?.startsWith('SCR')) return Number(rates.price_silver_cert) || 0;
    if (isPhotoCert)                                                return Number(rates.price_photo_cert)  || 0;
    return 0;
};
```

3. **Auto-populate effect** — fires when rates load + items present + Amount field empty + record not DONE:
```js
useEffect(() => {
    if (!show || isDoneStage || !rates || items.length === 0) return;
    if (amount !== '' && amount !== 0 && amount !== '0') return;
    const price = getWorkflowPrice();
    if (price <= 0) return;
    setAmount(String(price * items.length));
}, [show, rates, items.length, isDoneStage]);
```

**Operator override always wins** — if the Amount field has any value, auto-populate no-ops. DONE records also skip (amount is sealed). Rates are cached for the modal session (one fetch per open).

## Verification

After hard refresh, opening Phase2Modal on an IN_PROGRESS record:

| Record | Items | Expected Amount |
|---|---|---|
| GT (Gold Test) | 1 | ₹30 |
| GT | 3 | ₹90 |
| ST (Silver Test) | 1 | ₹30 |
| GC (Gold Certificate) | 1 | ₹50 |
| GC | 2 | ₹100 |
| SC (Silver Certificate) | 1 | ₹100 |
| PC (Photo Certificate) | 1 | ₹50 |

Operator can override by typing in the field; auto-populate won't overwrite.

## Changing rates today (no UI yet)

Direct API call until the Dashboard "Today's Rates" modal lands:

```http
PUT /api/analytics/rates
Content-Type: application/json

{ "price_gold_cert": 60 }
```

Accepts any subset of:
- `price_gold_test`, `price_silver_test`, `price_gold_cert`, `price_silver_cert`, `price_photo_cert`
- `gold_rate_per_gram`, `silver_rate_per_gram` (legacy, unused by Phase2Modal)

Audit-logged per change.

## Deliberately deferred (Phase B)

The operator's original ask included a **Dashboard "Today's Rates" first-login-of-day prompt** — a modal that fires when the operator logs in for the day, asks "Change prices today?" Y/N, and if Y collects new rates which then drive all auto-populates for the day.

Not shipped this turn because:
1. The auto-populate (Phase A) is the load-bearing fix for the operator's "time taking" pain. Defaults are already applied; operators can work immediately.
2. The Dashboard modal is additional UX work (component, localStorage gate for "shown today?", form, submission to the existing endpoint) that's better validated as a separate iteration once Phase A is confirmed working.

Tell me to wire it when ready. Suggested behaviour: localStorage key `swastik:rates_confirmed:YYYY-MM-DD`; modal fires when key absent on Dashboard mount; modal lists current rates with edit fields; on submit, PUTs to `/api/analytics/rates`, sets the localStorage key, dismisses.

## Out of scope (not yet asked)

- **GST formula replication** — Python's `t = PRICE / 1.18 if gst else PRICE` division for the GST checkbox. Currently the auto-populate uses gross `PRICE × items` regardless of GST. If GST needs to drive a base/tax split visibly on the Amount field, that's a small additional hook.
- **Per-gram pricing** — the legacy `gold_rate_per_gram` / `silver_rate_per_gram` keys are stored but no UI consumes them. Python doesn't use weight-based pricing in `set_totals`. Leaving them unused but available.
