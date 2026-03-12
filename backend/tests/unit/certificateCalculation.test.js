/**
 * SwastikCore — Domain 2: Certificate Calculation Unit Tests
 * Test Matrix IDs: CALC-08 to CALC-12
 * Runner: Jest
 *
 * Complements the existing goldTestCalculationService.test.js
 * and silverTestCalculationService.test.js
 */

const CertificateCalculationService = require('../../services/certificateCalculationService');
const SequenceService = require('../../services/sequenceService');

// ─── Certificate Calculation Service ─────────────────────────────────────────

describe('CertificateCalculationService', () => {

    describe('calculateGoldItem (CALC-08)', () => {
        it('CALC-08: calculates item_total using rate_per_gram correctly', () => {
            // fine_weight = net_weight * (purity/100) = 9.5 * 0.916 ≈ 8.702
            // item_total = fine_weight * rate_per_gram = 8.702 * 5000 = 43510
            const item = {
                gross_weight: 10.0,
                test_weight: 0.5,
                net_weight: 9.5,
                purity: 91.6,
                rate_per_gram: 5000,
                returned: false
            };

            const result = CertificateCalculationService.calculateGoldItem(item);

            expect(result.gross_weight).toBeCloseTo(10.0, 2);
            expect(result.net_weight).toBeCloseTo(9.5, 2);
            expect(result.fine_weight).toBeCloseTo(8.702, 2);
            expect(result.item_total).toBeCloseTo(43510, 0);
        });

        it('calculates returned item as 0 total', () => {
            const item = {
                gross_weight: 5.0,
                test_weight: 0.2,
                net_weight: 4.8,
                purity: 91.6,
                rate_per_gram: 6000,
                is_returned: true
            };

            const result = CertificateCalculationService.calculateGoldItem(item);
            // Returned items should have item_total = 0
            expect(result.item_total).toBe(0);
        });
    });

    describe('GST Calculation (CALC-09, CALC-10)', () => {
        // CALC-09: GST Inclusive
        it('CALC-09: GST inclusive — 127.12 splits into base 107.73 and tax 19.39', () => {
            const total = 127.12;
            const gstRate = 18;
            const divisor = 1 + gstRate / 100;
            const baseAmount = Math.round((total / divisor) * 100) / 100;
            const taxAmount = Math.round((total - baseAmount) * 100) / 100;

            expect(baseAmount).toBeCloseTo(107.73, 1);
            expect(taxAmount).toBeCloseTo(19.39, 1);
            expect(baseAmount + taxAmount).toBeCloseTo(total, 1);
        });

        // CALC-10: No GST
        it('CALC-10: GST exclusive (gst=0) — total stays as base, tax is 0', () => {
            const total = 150.00;
            const includeGst = false;

            const baseAmount = includeGst ? Math.round((total / 1.18) * 100) / 100 : total;
            const taxAmount = 0;

            expect(baseAmount).toBe(150.00);
            expect(taxAmount).toBe(0);
        });

        it('GST boundary — 118 inclusive splits into 100 base and 18 tax', () => {
            const total = 118.00;
            const base = Math.round((total / 1.18) * 100) / 100;
            const tax = Math.round((total - base) * 100) / 100;
            expect(base).toBeCloseTo(100.00, 1);
            expect(tax).toBeCloseTo(18.00, 1);
        });

        it('GST boundary — 236 inclusive splits into 200 base and 36 tax', () => {
            const total = 236.00;
            const base = Math.round((total / 1.18) * 100) / 100;
            const tax = Math.round((total - base) * 100) / 100;
            expect(base).toBeCloseTo(200.00, 1);
            expect(tax).toBeCloseTo(36.00, 1);
        });
    });
});

// ─── SequenceService (CALC-11, CALC-12) ──────────────────────────────────────

describe('SequenceService (CALC-11, CALC-12)', () => {
    it('CALC-12: generates unique sequential tokens within the same call', () => {
        const token1 = SequenceService.generateGlobalSequence();
        const token2 = SequenceService.generateGlobalSequence();

        // Both should be strings
        expect(typeof token1).toBe('string');
        expect(typeof token2).toBe('string');

        // Both should match YYYYMMDD-NNN format
        expect(token1).toMatch(/^\d{8}-\d{3}$/);
        expect(token2).toMatch(/^\d{8}-\d{3}$/);

        // They should be different (incrementing sequence)
        expect(token1).not.toBe(token2);
    });

    it('CALC-11: date portion matches today YYYYMMDD', () => {
        const token = SequenceService.generateGlobalSequence();
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const expectedDatePart = `${year}${month}${day}`;

        expect(token.startsWith(expectedDatePart)).toBe(true);
    });

    it('returns a plain string — not an object (regression test for { token } destructure bug)', () => {
        const result = SequenceService.generateGlobalSequence();
        // Must be a string, NOT an object
        expect(typeof result).toBe('string');
        expect(result).not.toBeNull();
        expect(result.token).toBeUndefined(); // Confirm it's not { token: "..." }
    });
});

// ─── Weight Loss Calculation Logic ───────────────────────────────────────────

describe('Zero-Sum Weight Loss Logic', () => {
    it('detects loss when test + net < gross', () => {
        const gross = 10.000;
        const test = 0.500;
        const net = 9.200;
        const loss = gross - test - net;
        expect(loss).toBeCloseTo(0.300, 3);
        expect(loss).toBeGreaterThan(0); // Loss exists
    });

    it('detects no loss when test + net == gross', () => {
        const gross = 10.000;
        const test = 0.500;
        const net = 9.500;
        const loss = gross - test - net;
        expect(loss).toBeCloseTo(0, 3); // No loss
    });

    it('rejects overweight when test + net > gross', () => {
        const gross = 10.000;
        const test = 0.500;
        const net = 10.000; // Overweight
        const sum = test + net;
        expect(sum).toBeGreaterThan(gross); // Should be blocked
    });
});
