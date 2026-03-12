import React from 'react';
import './PhotoCertificatePrint.css';

/**
 * High-fidelity print template for Photo Certificates.
 * Replaces the digital layout with a physical stationery overlay (ghost print).
 */
const PhotoCertificateTemplate = ({ test, item, photos = [] }) => {
    if (!test || !item) return null;

    // Use full base URL for images. Handle local caching if needed.
    const getMediaUrl = (path) => {
        if (!path) return '';
        // If it's a blob/object URL already, just return it
        if (path.startsWith('blob:') || path.startsWith('data:')) return path;

        // Otherwise prefix with backend domain if it is relative
        const urlObj = new URL(window.location.href);
        const baseUrl = `${urlObj.protocol}//${urlObj.hostname}:5000`;
        return path.startsWith('http') ? path : `${baseUrl}/${path}`;
    };

    // Use the first capture for the primary photo overlay
    const primaryPhoto = photos[0] || item.media_path || item.media;

    // Purity Calculation Logic (KT)
    const purityVal = Number(item.purity) || 0;
    const ktVal = ((purityVal / 100) * 24).toFixed(2);

    return (
        <div className="pc-certificate-container" id="certificate-print-document">
            {/* 1. Date */}
            <div className="print-field pos-date">
                {new Date(item.created_at || test.createdon || Date.now()).toLocaleDateString('en-IN')}
            </div>

            {/* 2. Customer Name */}
            <div className="print-field pos-name">
                {(test.customer_name || 'ANONYMOUS').toUpperCase()}
            </div>

            {/* 3. Case Ref / Ref Code */}
            <div className="print-field pos-refcode">
                {test.auto_number || test.bill_number}-{item.item_no || item.item_number || 'A01'}
            </div>

            {/* 4. Article / Item Description */}
            <div className="print-field pos-article">
                {(item.item_type || 'GOLD SAMPLE').toUpperCase()}
            </div>

            {/* 5. Gross Weight */}
            <div className="print-field pos-weight">
                {(Number(item.gross_weight) || 0).toFixed(3)}g
            </div>

            {/* 6. Purity KT */}
            <div className="print-field pos-result-kt">
                {ktVal} KT
            </div>

            {/* 7. Purity % */}
            <div className="print-field pos-result-pct">
                {purityVal.toFixed(2)}%
            </div>

            {/* 8. Authorized / Verified By */}
            <div className="print-field pos-verified">
                {(test.technician_name || 'AUTHORIZED SIGNATORY').toUpperCase()}
            </div>

            {/* 9. Jewel Photo (Absolute positioning overlay) */}
            {primaryPhoto && (
                <img
                    src={getMediaUrl(primaryPhoto)}
                    alt="Jewel Sample"
                    className="pos-jewel-photo"
                />
            )}
        </div>
    );
};

export default PhotoCertificateTemplate;
