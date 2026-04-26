import React from 'react';
import './CertificatePrint.css';

const numToWords = (num) => {
    const a = ['','ONE ','TWO ','THREE ','FOUR ','FIVE ','SIX ','SEVEN ','EIGHT ','NINE ','TEN ',
               'ELEVEN ','TWELVE ','THIRTEEN ','FOURTEEN ','FIFTEEN ','SIXTEEN ','SEVENTEEN ','EIGHTEEN ','NINETEEN '];
    const b = ['','','TWENTY','THIRTY','FORTY','FIFTY','SIXTY','SEVENTY','EIGHTY','NINETY'];
    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return 'ZERO';
    let str = '';
    str += n[1] !== '00' ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'CRORE ' : '';
    str += n[2] !== '00' ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'LAKH ' : '';
    str += n[3] !== '00' ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'THOUSAND ' : '';
    str += n[4] !== '0'  ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'HUNDRED ' : '';
    str += n[5] !== '00' ? ((str !== '') ? 'AND ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim() || 'ZERO';
};

const getPurityWords = (purity) => {
    const s = (Number(purity) || 0).toFixed(2);
    const [i, d] = s.split('.');
    return `${numToWords(parseInt(i, 10))} POINT ${numToWords(parseInt(d, 10))}`;
};

/**
 * Silver certificate print template.
 * Mirrors Python silver_certificate/certificate.css — identical layout to gold cert:
 * html width=16cm height=11cm, body margin-left=7.5cm.
 */
const SilverCertificateTemplate = ({ test, item, recordType = 'silver' }) => {
    if (!test || !item) return null;

    const isTest   = recordType === 'silver' || recordType === 'silver-test';
    const purity   = Number(item.purity) || 0;
    const grossWt  = (Number(item.gross_weight)  || 0).toFixed(3);
    const testWt   = (Number(item.test_weight)   || 0).toFixed(3);
    const customer = (item.name || test.customer_name || '').toUpperCase();
    const itemName = (item.item_type || item.item || '').toUpperCase();
    const date     = new Date(test.created_at || test.createdon || Date.now())
                        .toLocaleDateString('en-GB', { day:'2-digit', month:'2-digit', year:'2-digit' });
    const refNo    = isTest
        ? (test.bill_number || item.item_number || '-')
        : (item.certificate_number || item.item_number || test.bill_number || '-');

    return (
        <div className={isTest ? 'gt-cert-container' : 'gc-cert-container'}>
            <table className="cert-slip-table">
                <tbody>
                    <tr>
                        <td><span className="cert-h5 cert-ml">{refNo}</span></td>
                        <td className="cert-right"><span className="cert-h5">{date}</span></td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <span className="cert-h5 cert-ml">{customer}</span>
                        </td>
                    </tr>
                    {isTest ? (
                        <tr>
                            <td colSpan={2}>
                                <span className="cert-h5 cert-ml">
                                    {grossWt}gm{Number(item.test_weight) > 0 ? `/ ${testWt}gm` : ''}
                                </span>
                            </td>
                        </tr>
                    ) : (
                        <tr>
                            <td><span className="cert-h5 cert-ml">{grossWt} gm</span></td>
                            <td className="cert-right"><span className="cert-h5">{purity.toFixed(2)}%</span></td>
                        </tr>
                    )}
                    <tr>
                        <td colSpan={2}>
                            <span className="cert-h5 cert-ml">{itemName}</span>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            {purity > 0
                                ? <span className="cert-purity">{purity.toFixed(2)}%</span>
                                : <span className="cert-purity cert-no-gold">NO SILVER</span>
                            }
                        </td>
                    </tr>
                    {!isTest && (
                        <tr>
                            <td colSpan={2}>
                                <span className="cert-h5" style={{ marginLeft: '1.6cm' }}>
                                    {purity.toFixed(2)}
                                </span>
                                <span className="cert-h5 cert-purity-words">
                                    &nbsp;&nbsp;{getPurityWords(purity)}
                                </span>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default SilverCertificateTemplate;
