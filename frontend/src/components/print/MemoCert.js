import React from 'react';
import './CertificatePrint.css';

/**
 * High-fidelity Memo/Invoice template for Gold/Silver Tests.
 * Replaces the legacy SSR receipt.html.
 */
const MemoCert = ({ test, items = [] }) => {
    if (!test) return null;

    const data = items.length > 0 ? items : (test.items || []);

    return (
        <div className="memo-container" id="memo-print-document">
            <div className="memo-header text-center">
                <h1 className="lab-name">SWASTIK LAB</h1>
                <p className="lab-tagline">Authenticity & Precision in Testing</p>
                <div className="memo-meta-strip">
                    <span><strong>Invoice:</strong> {test.bill_number}</span>
                    <span><strong>Date:</strong> {new Date(test.createdon || Date.now()).toLocaleDateString('en-GB')}</span>
                </div>
            </div>

            <div className="memo-customer-row">
                <div className="customer-info">
                    <span className="label">Customer:</span>
                    <span className="value">{test.customer_name}</span>
                </div>
                <div className="customer-phone">
                    <span className="label">Phone:</span>
                    <span className="value">+91 {test.customer_phone}</span>
                </div>
            </div>

            <table className="memo-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Item Description</th>
                        <th className="text-end">Gross Wt</th>
                        <th className="text-end">Test Wt</th>
                        <th className="text-end">Charge</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, idx) => (
                        <tr key={idx} className={item.returned ? 'item-returned' : ''}>
                            <td>{idx + 1}</td>
                            <td>{item.item_type || item.item_name || 'Gold Sample'}</td>
                            <td className="text-end">{(Number(item.gross_weight) || 0).toFixed(3)}g</td>
                            <td className="text-end">{(Number(item.test_weight) || 0).toFixed(3)}g</td>
                            <td className="text-end">₹{item.total || 0}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="total-row">
                        <td colSpan="4">Grand Total</td>
                        <td className="text-end">₹{test.grand_total || test.total}</td>
                    </tr>
                </tfoot>
            </table>

            <div className="memo-footer">
                <div className="memo-note">
                    <strong>Note:</strong> This is a computer-generated test memo. Purity results are based on XRF analysis.
                </div>
                <div className="memo-signature">
                    Authorized Signatory
                </div>
            </div>
        </div>
    );
};

export default MemoCert;
