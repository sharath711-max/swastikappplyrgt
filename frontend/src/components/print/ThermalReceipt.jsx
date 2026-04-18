import React from 'react';

const formatDateTime = (value) => {
  if (!value) {
    return '--';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const formatWeight = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? `${numericValue.toFixed(3)} g` : '--';
};

const formatAmount = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue)
    ? numericValue.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '--';
};

export default function ThermalReceipt({ snapshot }) {
  if (!snapshot) {
    return null;
  }

  const {
    lab = {},
    receipt = {},
    customer = {},
    items = [],
    totals = {},
    footer = {},
  } = snapshot;

  return (
    <div className="receipt print-only-surface">
      <div className="receipt__header center">
        <div className="receipt__brand">{lab.name || 'SWASTIK GOLD LAB'}</div>
        {lab.tagline ? <div className="receipt__subtle">{lab.tagline}</div> : null}
        {lab.address ? <div className="receipt__subtle">{lab.address}</div> : null}
        {lab.phone ? <div className="receipt__subtle">Ph: {lab.phone}</div> : null}
      </div>

      <div className="divider" />

      <div className="receipt__section">
        <div className="receipt__row">
          <span>Receipt No</span>
          <span>{receipt.number || '--'}</span>
        </div>
        <div className="receipt__row">
          <span>Date</span>
          <span>{formatDateTime(receipt.createdAt)}</span>
        </div>
        <div className="receipt__row">
          <span>Type</span>
          <span>{receipt.type || 'THERMAL'}</span>
        </div>
        {receipt.status ? (
          <div className="receipt__row">
            <span>Status</span>
            <span>{receipt.status}</span>
          </div>
        ) : null}
      </div>

      <div className="divider" />

      <div className="receipt__section">
        <div>Customer</div>
        <div className="receipt__strong">{customer.name || '--'}</div>
        {customer.phone ? <div>{customer.phone}</div> : null}
        {customer.id ? <div>ID: {customer.id}</div> : null}
      </div>

      <div className="divider" />

      <div className="receipt__section">
        <div className="receipt__row receipt__strong">
          <span>Item</span>
          <span>Wt / Amt</span>
        </div>
        {items.length > 0 ? (
          items.map((item, index) => (
            <div className="receipt__item" key={item.id || `${item.name || 'item'}-${index}`}>
              <div className="receipt__item-name">{item.name || `Item ${index + 1}`}</div>
              <div className="receipt__row">
                <span>{item.label || item.description || '-'}</span>
                <span>{formatWeight(item.weight)}</span>
              </div>
              <div className="receipt__row">
                <span>Amount</span>
                <span>{formatAmount(item.amount)}</span>
              </div>
              {item.purity ? (
                <div className="receipt__row">
                  <span>Purity</span>
                  <span>{item.purity}</span>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="receipt__subtle">No line items available</div>
        )}
      </div>

      <div className="divider" />

      <div className="receipt__section">
        <div className="receipt__row">
          <span>Subtotal</span>
          <span>{formatAmount(totals.subtotal)}</span>
        </div>
        <div className="receipt__row">
          <span>Tax</span>
          <span>{formatAmount(totals.tax)}</span>
        </div>
        <div className="receipt__row receipt__total">
          <span>Total</span>
          <span>{formatAmount(totals.total)}</span>
        </div>
        {totals.paid !== undefined ? (
          <div className="receipt__row">
            <span>Paid</span>
            <span>{formatAmount(totals.paid)}</span>
          </div>
        ) : null}
        {totals.balance !== undefined ? (
          <div className="receipt__row">
            <span>Balance</span>
            <span>{formatAmount(totals.balance)}</span>
          </div>
        ) : null}
      </div>

      <div className="divider" />

      <div className="receipt__footer center">
        <div>{footer.message || 'Snapshot print copy'}</div>
        {footer.operator ? <div>Operator: {footer.operator}</div> : null}
        {footer.note ? <div>{footer.note}</div> : null}
      </div>
    </div>
  );
}
