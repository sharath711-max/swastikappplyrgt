import React from 'react';
import { useLocation } from 'react-router-dom';
import '../../styles/print.css';

const ReceiptPage = () => {
  const { state } = useLocation();
  const data = state || {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="receipt-container">
      <div className="no-print text-end mb-2">
        <button className="btn btn-sm btn-primary" onClick={handlePrint}>
          Print
        </button>
      </div>

      <div className="receipt">
        <h4 className="center">Swastik Lab</h4>
        <p className="center small">Gold &amp; Silver Testing</p>

        <div className="divider" />

        <div className="receipt-row">
          <span>Date</span>
          <span>{data.date}</span>
        </div>

        <div className="receipt-row">
          <span>Customer</span>
          <span>{data.customer_name}</span>
        </div>

        <div className="divider" />

        {(data.items || []).map((item, idx) => (
          <div key={idx} className="item-block">
            <div className="receipt-row">
              <span>{item.name}</span>
              <span>{item.gross_weight} g</span>
            </div>
            <div className="receipt-row small">
              <span>Purity</span>
              <span>{item.purity}%</span>
            </div>
            <div className="receipt-row small">
              <span>Net</span>
              <span>{item.net_weight} g</span>
            </div>
            <div className="divider light" />
          </div>
        ))}

        <div className="receipt-row bold">
          <span>Total</span>
          <span>Rs. {data.total}</span>
        </div>

        <div className="divider" />

        <p className="center small">Thank You</p>
      </div>
    </div>
  );
};

export default ReceiptPage;
