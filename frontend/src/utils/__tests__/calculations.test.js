import Decimal from 'decimal.js';
import { calculateGstSplit, calculateGoldItem } from '../calculations';

describe('Pillar 3: Unit Testing - Financial Engine (GST & Ledger)', () => {

    describe('calculateGstSplit logic', () => {
        test('GST Mode 1 (Inclusive): 127.12 split should result in base 107.73 and tax 19.39', () => {
            const { base, tax } = calculateGstSplit(127.12, true);
            // 127.12 / 1.18 = 107.7288 -> 107.73
            // 127.12 - 107.73 = 19.39
            expect(base).toBe(107.73);
            expect(tax).toBe(19.39);
        });

        test('GST Mode 0 (Exclusive/Legacy Bill): 150.00 should remain base 150.00 and tax 0.00', () => {
            const { base, tax } = calculateGstSplit(150.00, false);
            expect(base).toBe(150.00);
            expect(tax).toBe(0);
        });
    });

    describe('calculateGoldItem weight balancing (WLH prerequisites)', () => {
        test('Zero Loss: 10.000g gross - 0.500g test = 9.500g net', () => {
            const result = calculateGoldItem({
                gross_weight: 10.000,
                test_weight: 0.500,
                purity: 91.6
            });
            expect(result.net_weight).toBe(9.5);
            expect(result.fine_weight).toBe(8.702); // 9.5 * 0.916 = 8.702
        });

        test('Validation: Invalid inputs should return isValid: false', () => {
            const result = calculateGoldItem({
                gross_weight: 10.000,
                test_weight: 11.000, // Error: Test > Gross
                purity: 91.6
            });
            expect(result.isValid).toBe(false);
        });
    });
});
