import React from 'react';
import './CertificatePrint.css';
import './SilverCertificatePrint.css';

// Utility for converting purity percentages to "Words POINT Words"
const numToWords = (num) => {
    const a = ['', 'ONE ', 'TWO ', 'THREE ', 'FOUR ', 'FIVE ', 'SIX ', 'SEVEN ', 'EIGHT ', 'NINE ', 'TEN ', 'ELEVEN ', 'TWELVE ', 'THIRTEEN ', 'FOURTEEN ', 'FIFTEEN ', 'SIXTEEN ', 'SEVENTEEN ', 'EIGHTEEN ', 'NINETEEN '];
    const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    let str = '';
    str += (n[1] !== '00') ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'CRORE ' : '';
    str += (n[2] !== '00') ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'LAKH ' : '';
    str += (n[3] !== '00') ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'THOUSAND ' : '';
    str += (n[4] !== '0') ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'HUNDRED ' : '';
    str += (n[5] !== '00') ? ((str !== '') ? 'AND ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim() || 'ZERO';
};

const getPurityWords = (purity) => {
    if (typeof purity !== 'number') return 'ZERO POINT ZERO';
    const numStr = purity.toFixed(2);
    const [intPart, decPart] = numStr.split('.');

    const intWords = numToWords(parseInt(intPart, 10));
    const decWords = numToWords(parseInt(decPart, 10));

    return `${intWords} POINT ${decWords}`;
};

/**
 * High-fidelity print template for Silver Certificates.
 * Replaces the legacy SSR silver_certificate.html implementation.
 */
const SilverCertificateTemplate = ({ test, item }) => {
    if (!test || !item) return null;

    // NNN Display Logic
    const itemReferenceNum = item.item_no || item.item_number || '001';

    // Security QR URL hitting 18-character immutable DB record
    const verifyUrl = `${window.location.origin}/verify/sl/${item.id}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(verifyUrl)}`;

    return (
        <div className="silver-certificate-container" id="certificate-print-document">
            {/* Background Watermark */}
            <div className="silver-watermark">
                SILVER<br />CERTIFICATE
            </div>

            {/* Header */}
            <div className="silver-header">
                <h2>SWASTIK SILVER LABORATORY</h2>
                <div className="silver-meta">
                    <span className="cert-number">
                        <strong>No:</strong> {test.bill_number}/{itemReferenceNum}
                    </span>
                    <span className="cert-date">
                        <strong>Date:</strong> {new Date(item.created_at || item.created || test.createdon || Date.now()).toLocaleDateString('en-GB')}
                    </span>
                </div>
            </div>

            {/* Customer Details */}
            <div className="silver-customer">
                <p>
                    <strong>Customer:</strong> {item.name || test.customer_name || (test.customer && test.customer.name) || '-'}
                </p>
            </div>

            {/* Data Table */}
            <table className="silver-table">
                <tbody>
                    <tr>
                        <td style={{ width: '50%' }}>
                            <strong>Item:</strong> {item.item_type || item.item || '-'}
                        </td>
                        <td style={{ width: '50%', textAlign: 'right' }}>
                            <strong>Gross Wt:</strong> {(Number(item.gross_weight) || 0).toFixed(3)}g
                        </td>
                    </tr>
                    <tr>
                        <td style={{ width: '50%' }}>
                            <strong>Sample Wt:</strong> {(Number(item.test_weight) || 0).toFixed(3)}g
                        </td>
                        <td style={{ width: '50%', textAlign: 'right' }}>
                            <strong>Net Wt:</strong> {(Number(item.net_weight) || 0).toFixed(3)}g
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Prominent Purity Value Section with cool-toned Highlights */}
            <div className="silver-purity-section">
                <div className="silver-purity-highlight">
                    <span className="silver-purity-number">{(Number(item.purity) || 0).toFixed(2)}%</span>
                </div>
                <div className="silver-purity-words">
                    {getPurityWords(Number(item.purity) || 0)}
                </div>
            </div>

            {/* Footer containing Security QR & Signature */}
            <div className="silver-footer">
                <div className="silver-qr">
                    <img src={qrUrl} alt="Verify Security QR" />
                </div>
                <div className="silver-signature">
                    Authorized Signatory
                </div>
            </div>
        </div>
    );
};

export default SilverCertificateTemplate;
