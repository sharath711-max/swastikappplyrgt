import React from 'react';
import { calculateGstSplit } from '../../utils/calculations';

const PriceCalculationTable = ({ total, includeGst, modeOfPayment }) => {
    const isInclusive = includeGst && modeOfPayment !== 'bill';
    const { base, tax } = calculateGstSplit(total, isInclusive);

    return (
        <div className="price-calculation-card p-3 border rounded bg-white shadow-sm">
            <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small fw-bold">Base Amount</span>
                <span className="base-amount fw-bold">₹{base.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small fw-bold">
                    {isInclusive ? 'GST (18% Incl.)' : 'Tax (Excl.)'}
                </span>
                <span className="tax-amount fw-bold">₹{tax.toFixed(2)}</span>
            </div>
            <hr className="my-2" />
            <div className="d-flex justify-content-between">
                <span className="fw-bold">Grand Total</span>
                <span className="grand-total fw-bold text-primary fs-5">₹{Number(total).toFixed(2)}</span>
            </div>
        </div>
    );
};

export default PriceCalculationTable;
