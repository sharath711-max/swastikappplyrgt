import React from 'react';
import GoldCert from './GoldCert';
import SilverCert from './SilverCert';
import PhotoCert from './PhotoCert';
import MemoCert from './MemoCert';
import PaymentCert from './PaymentCert';

/**
 * Unified Print Manager for the SwastikCore print architecture.
 * Determines and renders the designated certificate template based on record type.
 */
const PrintManager = ({ type, data, item, photos = [] }) => {
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
