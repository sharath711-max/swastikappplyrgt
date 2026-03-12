const SilverTestCalculationService = require('../../services/silverTestCalculationService');
const { ValidationError } = SilverTestCalculationService;

describe('SilverTestCalculationService', () => {
    describe('calculateItem', () => {
        it('should calculate logical net weight and fine weight correctly when no loss is present', () => {
            const input = {
                gross_weight: 100.000,
                test_weight: 5.000,
                net_weight: 95.000,
                purity: 80.5
            };
            const result = SilverTestCalculationService.calculateItem(input);

            expect(result.gross_weight).toBe(100.000);
            expect(result.test_weight).toBe(5.000);
            expect(result.net_weight).toBe(95.000);
            expect(result.fine_weight).toBe(76.475); // 95 * 0.805 = 76.475
            expect(result.loss).toBe(0);
        });

        it('should calculate loss when returned weight is less than logical net weight', () => {
            const input = {
                gross_weight: 100.000,
                test_weight: 5.000,
                net_weight: 93.000, // 2g loss
                purity: 80.5
            };
            const result = SilverTestCalculationService.calculateItem(input);

            expect(result.net_weight).toBe(93.000);
            expect(result.loss).toBeCloseTo(2.000, 3);
        });

        it('should throw ValidationError if test weight exceeds gross weight', () => {
            const input = {
                gross_weight: 10.000,
                test_weight: 10.500,
                net_weight: 0,
                purity: 50.0
            };

            expect(() => {
                SilverTestCalculationService.calculateItem(input);
            }).toThrow(ValidationError);
        });

        it('should throw ValidationError if returned weight exceeds logical net weight', () => {
            const input = {
                gross_weight: 100.000,
                test_weight: 5.000,
                net_weight: 100.000, // Logical net is 95
                purity: 80.5
            };

            expect(() => {
                SilverTestCalculationService.calculateItem(input);
            }).toThrow(ValidationError);
        });

        it('should validate purity bounds', () => {
            const inputLow = { gross_weight: 100, purity: -5 };
            const inputHigh = { gross_weight: 100, purity: 105 };

            expect(() => SilverTestCalculationService.calculateItem(inputLow)).toThrow(ValidationError);
            expect(() => SilverTestCalculationService.calculateItem(inputHigh)).toThrow(ValidationError);
        });
    });
});
