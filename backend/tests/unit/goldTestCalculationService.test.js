const GoldTestCalculationService = require('../../services/goldTestCalculationService');
const { ValidationError } = GoldTestCalculationService;

describe('GoldTestCalculationService', () => {
    describe('calculateItem', () => {
        it('should calculate logical net weight and fine weight correctly when no loss is present', () => {
            const input = {
                gross_weight: 10.000,
                test_weight: 0.500,
                net_weight: 9.500,
                purity: 91.6
            };
            const result = GoldTestCalculationService.calculateItem(input);

            expect(result.gross_weight).toBe(10.000);
            expect(result.test_weight).toBe(0.500);
            expect(result.net_weight).toBe(9.500);
            expect(result.fine_weight).toBe(8.702); // 9.5 * 0.916 = 8.702
            expect(result.loss).toBe(0);
        });

        it('should calculate loss when returned weight is less than logical net weight', () => {
            const input = {
                gross_weight: 10.000,
                test_weight: 0.500,
                net_weight: 9.200, // 0.3g loss
                purity: 91.6
            };
            const result = GoldTestCalculationService.calculateItem(input);

            expect(result.net_weight).toBe(9.200);
            expect(result.loss).toBeCloseTo(0.300, 3);
        });

        it('should throw ValidationError if test weight exceeds gross weight', () => {
            const input = {
                gross_weight: 10.000,
                test_weight: 10.500,
                net_weight: 0,
                purity: 91.6
            };

            expect(() => {
                GoldTestCalculationService.calculateItem(input);
            }).toThrow(ValidationError);
        });

        it('should throw ValidationError if returned weight exceeds logical net weight', () => {
            const input = {
                gross_weight: 10.000,
                test_weight: 0.500,
                net_weight: 10.000, // Logical net is 9.5
                purity: 91.6
            };

            expect(() => {
                GoldTestCalculationService.calculateItem(input);
            }).toThrow(ValidationError);
        });

        it('should validate purity bounds', () => {
            const inputLow = { gross_weight: 10, purity: -1 };
            const inputHigh = { gross_weight: 10, purity: 105 };

            expect(() => GoldTestCalculationService.calculateItem(inputLow)).toThrow(ValidationError);
            expect(() => GoldTestCalculationService.calculateItem(inputHigh)).toThrow(ValidationError);
        });
    });
});
