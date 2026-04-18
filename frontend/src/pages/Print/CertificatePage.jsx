import React from 'react';
import { useLocation } from 'react-router-dom';
import '../../styles/print.css';

const CertificatePage = () => {
  const { state } = useLocation();
  const data = state || {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="certificate-container">
      <div className="no-print text-end mb-2">
        <button className="btn btn-sm btn-primary" onClick={handlePrint}>
          Print
        </button>
      </div>

      <div className="certificate">
        <h2 className="title">Gold Testing Certificate</h2>

        <div className="section">
          <p><strong>Customer:</strong> {data.customer_name}</p>
          <p><strong>Date:</strong> {data.date}</p>
          <p><strong>Certificate No:</strong> {data.certificate_no}</p>
        </div>

        <table className="cert-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Gross</th>
              <th>Purity</th>
              <th>Net</th>
              <th>Fine</th>
            </tr>
          </thead>
          <tbody>
            {(data.items || []).map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
                <td>{item.gross_weight}</td>
                <td>{item.purity}%</td>
                <td>{item.net_weight}</td>
                <td>{item.fine_weight}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="footer">
          <span>Authorized Signature</span>
          <span>Seal</span>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
