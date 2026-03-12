import React from 'react';
import './CertificatePrint.css';

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
 * High-fidelity print template mimicking the old SSR Python template.
 * Uses a "Document-in-CSS" approach for pristine A4 exports.
 */
const GoldCertificateTemplate = ({ test, item, recordType = 'gold' }) => {
    // Graceful fallback for missing data
    if (!test || !item) return null;

    const isGold = recordType === 'gold';
    const headerTitle = isGold ? 'SWASTIK LAB' : 'SWASTIK TESTING CENTER';

    // Generates a verifiable QR code tying back to this certificate item
    const verifyUrl = `${window.location.origin}/verify/${item.id}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(verifyUrl)}`;

    return (
        <div className="certificate-container" id="certificate-print-document">
            {/* Background Watermark */}
            <div className="watermark">SWASTIK</div>

            {/* Header: Lab Name + NNN Ticket Number / Date */}
            <div className="cert-header">
                <h2>{headerTitle}</h2>
                <div className="cert-meta">
                    <span className="cert-number">
                        <strong>No:</strong> {test.bill_number}/{item.item_no || item.item_number || '001'}
                    </span>
                    <span className="cert-date">
                        <strong>Date:</strong> {new Date(test.created_at || test.createdon).toLocaleDateString('en-GB')}
                    </span>
                </div>
            </div>

            {/* Customer Details */}
            <div className="cert-customer">
                <p>
                    <strong>Customer:</strong> {item.name || test.customer_name || (test.customer && test.customer.name) || '-'}
                </p>
            </div>

            {/* Table Details */}
            <table className="cert-table">
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

            {/* Prominent Purity Value Section */}
            {test.status !== 'TODO' && (
                <div className="cert-purity-section">
                    <div className="purity-value-box">
                        <span className="purity-number">{(Number(item.purity) || 0).toFixed(2)}%</span>
                    </div>
                    <div className="purity-words">
                        {getPurityWords(Number(item.purity) || 0)}
                    </div>
                </div>
            )}

            {/* Footer containing Security QR & Signature */}
            <div className="cert-footer">
                <div className="cert-qr">
                    <img src={qrUrl} alt="Verify QR" />
                </div>
                <div className="cert-signature">
                    Authorized Signatory
                </div>
            </div>
        </div>
    );
};

export default GoldCertificateTemplate;
