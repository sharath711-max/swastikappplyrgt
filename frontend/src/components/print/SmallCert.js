import React from 'react';
import './CertificatePrint.css';

/**
 * Small Certificate — 1:1 port of Python's small_certificate.html (gold & silver).
 *
 * Geometry contract lives in CertificatePrint.css (.gt-cert-container) —
 * 10cm slip, 5.5cm table top margin, 2.35cm row pitch. Shared by both variants.
 *
 * Variant deltas (Python parity):
 *   gold   → row1: bill/cert, purity fallback "NO GOLD" when ≤ 0
 *   silver → row1: bill only, item suffix " (SILVER)", fallback "0%"
 *
 * recordType is resolved from the explicit prop, else from data shape /
 * id prefix — keeps callers that don't pass it (e.g. PrintView popup with
 * ?layout=small) working without an extra round-trip.
 */
const SmallCert = ({ test, item, recordType }) => {
    if (!test || !item) return null;

    const metal = (recordType || test.type || '').toString().toLowerCase().includes('silver')
        || (test.id || '').startsWith('STS')
        ? 'silver'
        : 'gold';

    const purity   = Number(item.purity) || 0;
    const grossWt  = (Number(item.gross_weight) || Number(item.total_weight) || 0).toFixed(3);
    const testWt   = (Number(item.test_weight) || 0).toFixed(3);
    const customer = (item.name || test.customer_name || test.customer?.name || '').toUpperCase();
    const baseItem = (item.item_type || item.item || '').toUpperCase();
    const itemName = metal === 'silver' ? `${baseItem} (SILVER)` : baseItem;
    const date     = new Date(test.created_at || test.createdon || test.created || Date.now())
                        .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const billNo   = test.bill_number || test.gst_bill_number || test.auto_number || '-';
    const certNo   = item.certificate_number || item.item_number || '-';
    const refNo    = metal === 'gold' ? `${billNo}/${certNo}` : `${billNo}`;

    const renderPurity = () => {
        if (purity > 0) {
            return <span className="cert-purity">{purity.toFixed(2)}%</span>;
        }
        if (metal === 'gold') {
            return <span className="cert-purity cert-no-gold">NO GOLD</span>;
        }
        return <span className="cert-purity">0%</span>;
    };

    return (
        <div className="gt-cert-container">
            <table className="cert-slip-table">
                <tbody>
                    {/* Row 1: bill[/cert] + date */}
                    <tr>
                        <td><span className="cert-h5 cert-ml" style={{ fontSize: '2.2rem' }}>{refNo}</span></td>
                        <td className="cert-right"><span className="cert-h5">{date}</span></td>
                    </tr>

                    {/* Row 2: customer name (UPPERCASE) */}
                    <tr>
                        <td colSpan={2}>
                            <span className="cert-h5 cert-ml">{customer}</span>
                        </td>
                    </tr>

                    {/* Row 3: gross[/test] weight */}
                    <tr>
                        <td colSpan={2}>
                            <span className="cert-h5 cert-ml">
                                {grossWt}gm{Number(item.test_weight) > 0 ? `/ ${testWt}gm` : ''}
                            </span>
                        </td>
                    </tr>

                    {/* Row 4: item name (UPPERCASE), silver gets "(SILVER)" suffix */}
                    <tr>
                        <td colSpan={2}>
                            <span className="cert-h5 cert-ml">{itemName}</span>
                        </td>
                    </tr>

                    {/* Row 5: purity callout — gold falls back to "NO GOLD", silver to "0%" */}
                    <tr>
                        <td colSpan={2}>{renderPurity()}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default SmallCert;
