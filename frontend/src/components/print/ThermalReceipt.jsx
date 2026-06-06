import React from 'react';

const formatDate = (value) => {
  if (!value) return '--';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear().toString().slice(-2);
  return `${day}-${month}-${year}`;
};

const formatTime = (value) => {
  if (!value) return '--';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatWeight = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? `${numericValue.toFixed(3)}g` : '-';
};

const formatAmount = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? `₹ ${numericValue.toFixed(1)}` : '-';
};

const TEST_TYPE_LABELS = {
  GT: 'Gold Testing',
  ST: 'Silver Testing',
  GC: 'Gold Certificate',
  SC: 'Silver Certificate',
  PC: 'Photo Certificate',
  'gold-test': 'Gold Testing',
  'silver-test': 'Silver Testing',
  'gold-certificate': 'Gold Certificate',
  'silver-certificate': 'Silver Certificate',
  'photo-certificate': 'Photo Certificate',
  gold_test: 'Gold Testing',
  silver_test: 'Silver Testing',
  gold_certificate: 'Gold Certificate',
  silver_certificate: 'Silver Certificate',
  photo_certificate: 'Photo Certificate',
};
const labelizeTestType = (raw) => {
  if (!raw) return 'Gold Testing';
  if (TEST_TYPE_LABELS[raw]) return TEST_TYPE_LABELS[raw];
  const upper = String(raw).trim().toUpperCase();
  if (TEST_TYPE_LABELS[upper]) return TEST_TYPE_LABELS[upper];
  return raw;
};

// Operational daily invoice display: extract trailing digits, zero-pad to 3.
// Matches the handwritten daily register book serial. Frontend formatting only —
// the backend numbering engine is not modified.
const formatInvoiceNumber = (raw) => {
  if (!raw || raw === '-') return '--';
  const m = String(raw).match(/(\d+)\s*$/);
  if (!m) return String(raw);
  return m[1].padStart(3, '0');
};

/** Shared header + meta block — used by both the customer summary page and
 *  each per-item tester slip page. Centered logo, lab name, address, phone,
 *  then the invoice/customer/date/time/workflow meta rows.
 *
 *  `customerNameOverride` lets tester slips display the per-item personal
 *  name (`item.name`) when present, falling back to the record-level
 *  customer name. Python parity with `data.name if data.name else
 *  test.customer.name` from gold_test/receipt.html. */
function SlipHeader({ lab, receipt, customer, testType, customerNameOverride }) {
  const displayName = customerNameOverride || customer.name || '--';
  return (
    <>
      <div className="tr-header">
        <img
          src={`${process.env.PUBLIC_URL || ''}/logo-sm.png`}
          alt=""
          className="tr-logo"
          width="60"
          height="60"
        />
        <div className="tr-brand">{lab.name || 'Swastik Assayers'}</div>
        <div className="tr-address">
          {lab.address || "#11, Appurayappa 'A' Lane\nNagarthpet Cross, Bengaluru - 560002"}
        </div>
        <div className="tr-phone">
          {lab.phone ? `Phone: ${lab.phone}` : 'Phone: 080-41643366/Centrex: 2366'}
        </div>
      </div>

      <div className="tr-divider" />

      <div className="tr-meta">
        <div className="tr-meta-row">
          <div className="tr-meta-left">
            <span className="tr-label">Invoice No: </span>
            <span className="tr-value">{formatInvoiceNumber(receipt.number)}</span>
          </div>
          <div className="tr-meta-right">
            <span className="tr-label">Customer :</span>
          </div>
        </div>
        <div className="tr-meta-row">
          <div className="tr-meta-left"></div>
          <div className="tr-meta-right tr-customer-name">{displayName}</div>
        </div>
        {customer.phone && !customerNameOverride && (
          <div className="tr-meta-row">
            <div className="tr-meta-left"></div>
            <div className="tr-meta-right tr-customer-phone">
              (+91{customer.phone.replace('+91', '').replace(' ', '')})
            </div>
          </div>
        )}
        <div className="tr-meta-row tr-mt-small">
          <div className="tr-meta-left">
            <span className="tr-label">Date: </span>
            <span className="tr-value">{formatDate(receipt.createdAt)}</span>
          </div>
          <div className="tr-meta-right">
            <span className="tr-label">Time: </span>
            <span className="tr-value">{formatTime(receipt.createdAt)}</span>
          </div>
        </div>
        <div className="tr-meta-row tr-test-type">
          <div className="tr-meta-left">
            <span className="tr-bold">{testType}</span>
          </div>
        </div>
      </div>
    </>
  );
}

/** Thermal receipt — Python-parity multi-page output. Mirrors
 *  gold_test/receipt.html structure exactly:
 *   - Page 1: customer copy with all items in a 5-col table + Grand Total
 *   - Pages 2..N+1: one tester slip per item with a 4-col table (no Amount,
 *     no Grand Total). Page-break between every page.
 *
 *  Total pages = items.length + 1. Single print job. */
export default function ThermalReceipt({ snapshot }) {
  if (!snapshot) return null;

  const {
    lab = {},
    receipt = {},
    customer = {},
    items = [],
    totals = {},
  } = snapshot;

  const testType = labelizeTestType(receipt.type);

  return (
    <div className="thermal-receipt-root print-only-surface">
      {/* ── Page 1 — CUSTOMER COPY: all items + Grand Total ── */}
      <div className="thermal-receipt-wrapper">
        <SlipHeader lab={lab} receipt={receipt} customer={customer} testType={testType} />

        <table className="tr-table">
          <thead>
            <tr>
              <th className="tr-col-sl">Sl No</th>
              <th className="tr-col-item">Item</th>
              <th className="tr-col-wt">Total Wt</th>
              <th className="tr-col-wt">Spl Wt</th>
              <th className="tr-col-amt">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id || index}>
                <td className="tr-col-sl">{index + 1}</td>
                <td className="tr-col-item">{item.name || item.item_name || 'SAMPLE'}</td>
                <td className="tr-col-wt">{formatWeight(item.grossWeight || item.weight)}</td>
                <td className="tr-col-wt">{item.sampleWeight ? formatWeight(item.sampleWeight) : '-'}</td>
                <td className="tr-col-amt">{formatAmount(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="tr-grand-total">
          <div className="tr-total-label">Grand Total</div>
          <div className="tr-total-value">{formatAmount(totals.total)}</div>
        </div>

        <div className="tr-footer">
          <div className="tr-thank-you">Thank you for your business!</div>
        </div>
      </div>

      {/* ── Pages 2..N+1 — TESTER COPY: one slip per item ── */}
      {items.map((item, index) => (
        <div
          key={`tester-${item.id || index}`}
          className="thermal-receipt-wrapper thermal-receipt-wrapper--tester"
        >
          <SlipHeader
            lab={lab}
            receipt={receipt}
            customer={customer}
            testType={testType}
            /* Python's gold_test/receipt.html uses `data.name` (per-sample
               person) if present, else falls back to the record customer.
               The SERN receipt snapshot's `item.name` is the item type
               (not the person), so we always fall back to record customer
               here. Restore per-sample personName via a snapshot field
               extension if/when that requirement comes up. */
          />

          <table className="tr-table tr-table--tester">
            <thead>
              <tr>
                <th className="tr-col-sl">Sl No</th>
                <th className="tr-col-item">Item</th>
                <th className="tr-col-wt">Total Wt</th>
                <th className="tr-col-wt">Spl Wt</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="tr-col-sl">{index + 1}</td>
                <td className="tr-col-item">{item.name || item.item_name || 'SAMPLE'}</td>
                <td className="tr-col-wt">{formatWeight(item.grossWeight || item.weight)}</td>
                <td className="tr-col-wt">{item.sampleWeight ? formatWeight(item.sampleWeight) : '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
