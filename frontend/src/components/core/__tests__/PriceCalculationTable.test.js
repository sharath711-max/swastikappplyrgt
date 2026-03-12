import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PriceCalculationTable from '../PriceCalculationTable';

describe('Pillar 3: Unit Testing - Financial Engine (PriceCalculationTable)', () => {
    test('GST Mode 1 (Inclusive): 127.12 split should result in base 107.73 and tax 19.39', () => {
        render(<PriceCalculationTable total={127.12} includeGst={true} modeOfPayment="cash" />);

        expect(screen.getByText(/Base Amount/i).parentElement).toHaveTextContent('₹107.73');
        expect(screen.getByText(/GST \(18% Incl.\)/i).parentElement).toHaveTextContent('₹19.39');
        expect(screen.getByText(/Grand Total/i).parentElement).toHaveTextContent('₹127.12');
    });

    test('GST Mode 0 (Exclusive/Legacy Bill): 150.00 should remain base 150.00 and tax 0.00', () => {
        render(<PriceCalculationTable total={150.00} includeGst={false} modeOfPayment="bill" />);

        expect(screen.getByText(/Base Amount/i).parentElement).toHaveTextContent('₹150.00');
        expect(screen.getByText(/Tax \(Excl.\)/i).parentElement).toHaveTextContent('₹0.00');
        expect(screen.getByText(/Grand Total/i).parentElement).toHaveTextContent('₹150.00');
    });
});
