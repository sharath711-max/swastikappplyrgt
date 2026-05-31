import React from 'react';
import GoldCert from './GoldCert';
import SilverCert from './SilverCert';
import PhotoCert from './PhotoCert';
import MemoCert from './MemoCert';
import PaymentCert from './PaymentCert';
import SmallCert from './SmallCert';

/**
 * Unified Print Manager for the SwastikCore print architecture.
 * Determines and renders the designated certificate template based on record type.
 * Supports layout variants: 'full' (default), 'small' (compact sticker cert).
 */
const PrintManager = ({ type, data, item, photos = [], layout = 'full' }) => {
    // Small certificate layout — Python parity (gold & silver only). Python shipped the
    // same test-slip layout under both gold_test/ and gold_certificate/ (small_certificate.html),
    // so the tests and the gold/silver certs share the SmallCert component.
    // PC is intentionally excluded: Python's photo small slip dropped the photo and the
    // cert#, leaving a bill-only stub with no operator value over the full PCI.
    if (layout === 'small') {
        const isSilver = type === 'silver-test' || type === 'ST' || type === 'silver' || type === 'SC';
        const isGold   = type === 'gold-test'   || type === 'GT' || type === 'certificate' || type === 'gold' || type === 'GC';
        if (!isSilver && !isGold) {
            return (
                <div style={{ padding: '40px', color: '#64748b', textAlign: 'center' }}>
                    <h3 className="fw-bold">Small Certificate Not Available</h3>
                    <p>Small certificate printing is restricted to Gold/Silver tests and Gold/Silver certificates.</p>
                </div>
            );
        }
        return <SmallCert test={data} item={item} recordType={isSilver ? 'silver' : 'gold'} />;
    }

    switch (type) {
        case 'GT':
        case 'gold':
        case 'certificate':
        case 'small-certificate':
            return <GoldCert test={data} item={item} recordType="gold" />;

        case 'ST':
        case 'silver':
            return <SilverCert test={data} item={item} />;

        case 'PC':
        case 'photo':
            return <PhotoCert test={data} item={item} photos={photos} />;

        case 'memo':
        case 'gold-test':
        case 'silver-test':
            return <MemoCert test={data} items={item ? [item] : (data.items || [])} />;

        case 'payment':
            return <PaymentCert trx={data} />;

        default:
            return (
                <div style={{ padding: '40px', color: '#64748b', textAlign: 'center' }}>
                    <h3 className="fw-bold">Document Error</h3>
                    <p>Unsupported document type: <strong>{type}</strong></p>
                    <button className="btn btn-secondary mt-3" onClick={() => window.history.back()}>Go Back</button>
                </div>
            );
    }
};

export default PrintManager;
