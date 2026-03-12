import React from 'react';
import './CertificatePrint.css';

/**
 * 80mm Thermal Receipt Template for Technician/Quick Results.
 * Strictly adheres to Pillar 4 requirements (80mm width, purity-box).
 */
const ThermalReceipt = ({ test, items, type = 'RESULT' }) => {
    if (!test || !items) return null;

    return (
        <div className="thermal-receipt" data-testid="thermal-container">
            <div className="thermal-header" style={{ textAlign: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0 }}>SWASTIK GOLD LAB</h4>
                <div style={{ fontSize: '12px' }}>{test.id}</div>
            </div>

            <div className="thermal-items">
                {items.map((it, idx) => (
                    <div key={idx} style={{ borderBottom: '1px dashed #000', padding: '5px 0' }}>
                        <div style={{ fontWeight: 'bold' }}>{it.item_type}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Gross: {Number(it.gross_weight).toFixed(3)}g</span>
                            {type === 'RESULT' && (
                                <span className="purity-box" data-testid="purity-box">
                                    {Number(it.purity).toFixed(2)}%
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '10px', fontSize: '10px', textAlign: 'center' }}>
                *** This is a computer generated test report ***
            </div>
        </div>
    );
};

export default ThermalReceipt;
