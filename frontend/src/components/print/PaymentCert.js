import React from 'react';
import './CertificatePrint.css';

/**
 * High-fidelity Payment Receipt template for Financial transactions.
 * Replaces the legacy SSR receipt implementations in the old financial system.
 */
const PaymentCert = ({ trx }) => {
    if (!trx) return null;

    const numToWords = (num) => {
        const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
        const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

        const convert = (n) => {
            if (n < 20) return a[n];
            if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
            if (n < 1000) return a[Math.floor(n / 100)] + ' hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
            return convert(Math.floor(n / 1000)) + ' thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
        };

        return convert(Math.floor(num)).trim() + ' only';
    };

    return (
        <div className="payment-container" id="payment-print-document">
            <div className="payment-header">
                <h1>SWASTIK LAB</h1>
                <p>Authorized Financial Acknowledgement</p>
                <div className="header-decoration"></div>
            </div>

            <div className="receipt-banner">
                <h2>PAYMENT RECEIPT</h2>
                <div className="receipt-no">No: <strong>{trx.id || 'PR-000'}</strong></div>
            </div>

            <div className="payment-body">
                <div className="payment-meta">
                    <div className="meta-item">
                        <span className="label">Date:</span>
                        <span className="value">{new Date(trx.createdon || Date.now()).toLocaleString('en-IN')}</span>
                    </div>
                </div>

                <div className="payer-info">
                    <p className="description">Received with thanks from:</p>
                    <h3 className="payer-name">{trx.customer_name || 'Customer Profile'}</h3>
                    <p className="payer-phone">+91 {trx.customer_phone || trx.phone}</p>
                </div>

                <div className="amount-section">
                    <p className="amount-description">Total Amount Paid</p>
                    <div className="amount-box">
                        <span className="currency">₹</span>
                        <span className="value">{Number(trx.amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="amount-words">{numToWords(trx.amount || 0).toUpperCase()}</p>
                </div>

                <div className="transaction-detail">
                    <span className="label">Description:</span>
                    <span className="value">{trx.description || 'Payment towards laboratory services.'}</span>
                </div>
            </div>

            <div className="payment-footer">
                <div className="footer-note">
                    * This receipt is valid only for the amount specified. Subject to realization in case of cheque.
                </div>
                <div className="payment-signature">
                    Authorized Signatory
                </div>
            </div>
        </div>
    );
};

export default PaymentCert;
