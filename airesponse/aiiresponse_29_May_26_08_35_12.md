# Customers surface gap analysis — docs/customers-gap-list.md

**Source:** operator direction — *"Now Shall we work on Gap SERN vs py flask prepare new list"* → AskUserQuestion scope answer: **One specific surface deep-dive** + **Operator-rhythm restoration**.
**Recorded:** 2026-05-29 08:35
**Branch:** `receipt-bundle-wip`
**Status:** Gap list landed at [docs/customers-gap-list.md](../docs/customers-gap-list.md). No code changes; analysis-only.

## Surface analyzed

| Layer | Python | SERN |
|---|---|---|
| List page | `dashboard/customer/index.html` — DataTable + server-side AJAX search (name / phone / balance / notes), add/edit modal with Name/Phone/Balance/Notes, toggle action | `Customers.js` — card grid (3-per-row), client-side filter over full `/customers` dump, balance filter + sort + add/edit modal (Name/Phone/Notes — **no balance field**) |
| Profile page | `dashboard/customer/profile.html` — Details card + 5 flat tabs (GT / GC / SC / PC / Balance), per-tab accordion with status badge in header, items table with `total/test - purity%` + mode of payment + GST inline | `CustomerProfile.js` — Header card + 3 tabs (Overview / Records / Timeline), Records is a single accordion of 7 sections, RelatedList exposes only `record# / date / total / action` |
| Add/Edit | Single modal, includes opening balance | Single modal, excludes opening balance — operator must round-trip through Credit History post-create |

## Gaps reclassified (matrix in doc)

11 ranked gaps + 5 governance pluses to keep + 4 SKIPs.

**HIGH** (4 — throughput chokepoints / intake-decision inputs):
1. Client-side filter over full customer dump (mirrors Dashboard #3 dropdown wall)
2. Card grid replaces dense table (~9 customers per fold vs ~20)
3. Initial Balance field missing on Add Customer
4. Sample details (total/test/purity) absent from profile records

**MED** (4): mode of payment + GST columns absent · status badge buried inside accordion · 3-tab vs 5-tab IA · balance history export absent

**LOW** (3): `tel:` link · toggle on list cards · Photo Cert thumbnail in row

## Governance pluses to keep (SERN > Python)

- **Timeline tab** — unified event feed across all workflows
- **Weight Loss History dedicated tab**
- **Print/View per cert row** via `triggerPrint`
- **Active/Inactive badge as first-class read**
- **Frontend phone + name validation gating** on Add Customer

## Wave structure (mirrors dashboard-gap-list.md)

**Wave A — throughput & rhythm**
- A1 Server-side paged/searched `GET /customers`
- A2 Dense-table view as default, card view optional
- A3 Initial Balance on Add Customer
- A4 Restore operational shape in Records accordion (sample summary + mode of payment + GST + status in header)
- A5 `tel:` phone link

**Wave B — forensic & governance**
- B1 Balance history Excel/PDF export (no jQuery DataTable)
- B2 Status surfaced in accordion header
- B3 Optional flat-tab IA (5-tab mode behind setting)

**Wave C — alignment & polish**
- C1 Photo Cert thumbnail in row
- C2 Toggle active/inactive on list

## Cross-surface dependencies flagged

- **Customer A1 + Dashboard #3** share the same backend infra (`/customers?q=&page=`). Build once.
- **Customer A4 + Dashboard #11** both restore "scan → decide → continue" rhythm. Status badge + sample summary should use the same shape across pages so operator's mental model carries.
- **Customer A3 + Customer B1 + Dashboard B1** all depend on the `credit_history.type` taxonomy migration (`OPENING_BALANCE / CUSTOMER_ADVANCE / MANUAL_CORRECTION / SETTLEMENT_DISCOUNT / MIGRATION_BALANCE`). Do NOT let any of them land with a `'CREDIT'` hardcode.

## Open audits before Wave A

- Q-Customer-2: does `POST /customers` silently drop `balance` or accept-but-hide? Audit before claiming A3 is "new."
- Q-Customer-3: confirm cert/test list endpoints return item-level `total_weight / test_weight / purity` (eager-loaded) — A4 requires it.
- Q-Customer-4: coordinate with Dashboard B1 schema migration — same taxonomy, do not parallelize.

## Standing by

No autonomous action. Awaiting direction on next item — execute Wave A1 (server-side paged customers), pick a different surface for the same gap-list treatment (Workflow Board / Phase2Modal / Reports), or return to a queued product item (Today's Rates first-login modal, Receipt Bundle QA execution).
