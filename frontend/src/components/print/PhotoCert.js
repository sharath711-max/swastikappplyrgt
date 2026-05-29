import React from 'react';
import './PhotoCertificatePrint.css';

/**
 * Photo certificate print template.
 * Mirrors Python photo_certificate/certificate.css exactly:
 *   - html transform=scale(0.7), width=16.26cm, height=10.9cm
 *   - Two-column layout: left=data table (8.13cm), right=photo (8.13cm)
 *   - h5 font-size=2rem, font-weight=800, text-transform=uppercase, margin-left=2cm
 *   - img height=14cm, width=12cm, margin-left=3.5cm
 *   - Row order: date | customer | cert_number | item | gross weight | purity KT | purity % | signatory
 */
const PhotoCertificateTemplate = ({ test, item, photos = [] }) => {
    if (!test || !item) return null;

    const getMediaUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('blob:') || path.startsWith('data:')) return path;
        const apiRoot = process.env.REACT_APP_API_URL
            ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '')
            : `${window.location.protocol}//${window.location.hostname}:6001`;
        const base = apiRoot;
        return path.startsWith('http') ? path : `${base}/${path}`;
    };

    const primaryPhoto = photos[0] || item.media_path || item.media;
    const purity  = Number(item.purity) || 0;
    const grossWt = (Number(item.gross_weight) || 0).toFixed(3);
    // Python `|in_carat` filter: round(n * 0.24, 2). Python's float repr keeps
    // a minimum of one decimal (22 → "22.0", 22.5 → "22.5"). The "KT" suffix is
    // PRE-PRINTED on PC paper — render the bare number only, otherwise the
    // physical print shows the carat label twice.
    const _ktRaw = Math.round(purity * 0.24 * 100) / 100;
    const ktVal  = Number.isInteger(_ktRaw) ? `${_ktRaw}.0` : _ktRaw.toString();
    const date    = new Date(item.created_at || test.createdon || Date.now())
                        .toLocaleDateString('en-GB', { day:'2-digit', month:'2-digit', year:'2-digit' });
    const certNo  = `${test.auto_number || test.bill_number || ''}-${item.item_no || item.item_number || 'A01'}`;

    return (
        <div className="pc-cert-container">
            <div className="pc-row">
                {/* Left column — data table, mirrors Python's 8.13cm left div */}
                <div className="pc-col-data">
                    <table className="pc-table">
                        <tbody>
                            <tr><td><span className="pc-h5">{date}</span></td></tr>
                            <tr><td><span className="pc-h5">{(test.customer_name || '').toUpperCase()}</span></td></tr>
                            <tr><td><span className="pc-h5">{certNo}</span></td></tr>
                            <tr><td><span className="pc-h5 pc-mb-extra">{(item.item_type || '').toUpperCase()}</span></td></tr>
                            <tr><td><span className="pc-h5 pc-weight">{grossWt}<span className="pc-gm"> GM</span></span></td></tr>
                            <tr><td><span className="pc-h5">{item.show_kt ? ktVal : ''}</span></td></tr>
                            <tr><td><span className="pc-h5 pc-weight">{purity.toFixed(2)}</span></td></tr>
                            <tr><td><span className="pc-h5 signatory">Bhimram</span></td></tr>
                        </tbody>
                    </table>
                </div>

                {/* Right column — photo, mirrors Python's 8.13cm right div */}
                <div className="pc-col-photo">
                    {primaryPhoto && (
                        <img
                            src={getMediaUrl(primaryPhoto)}
                            alt="Jewel"
                            className="pc-jewel-img"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PhotoCertificateTemplate;
