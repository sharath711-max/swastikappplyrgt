'use strict';

const {
    coerceNumber,
    normalizeWeight,
    subtractWeights,
    safeEquals,
    isPositiveWeight,
    isNonNegativeWeight,
    isWithinMax,
    isWeightEmpty,
    WEIGHT_DECIMAL_PLACES,
    MAX_WEIGHT_GRAMS,
    EQUALITY_EPSILON,
} = require('../../../../shared/domain/validation/normalization');

describe('normalization.coerceNumber', () => {
    test.each([
        [null,         null],
        [undefined,    null],
        ['',           null],
        ['   ',        null],
        ['abc',        null],
        ['1.23abc',    null],
        [NaN,          null],
        [Infinity,     null],
        [-Infinity,    null],
        [0,            0],
        [1.5,          1.5],
        ['1.5',        1.5],
        ['  2.0 ',     2.0],
        [-3,          -3],
    ])('coerceNumber(%p) === %p', (input, expected) => {
        expect(coerceNumber(input)).toBe(expected);
    });
});

describe('normalization.normalizeWeight', () => {
    test('null and empty values return null', () => {
        expect(normalizeWeight(null)).toBeNull();
        expect(normalizeWeight(undefined)).toBeNull();
        expect(normalizeWeight('')).toBeNull();
        expect(normalizeWeight('  ')).toBeNull();
    });

    test('rounds to 3 decimal places (half-up)', () => {
        expect(normalizeWeight(1.2344)).toBe(1.234);
        expect(normalizeWeight(1.2345)).toBe(1.235);
        expect(normalizeWeight(1.2346)).toBe(1.235);
    });

    test('eliminates floating-point garbage', () => {
        expect(normalizeWeight(0.1 + 0.2)).toBe(0.300);
    });

    test('passes through finite numbers and strings', () => {
        expect(normalizeWeight('10.5')).toBe(10.5);
        expect(normalizeWeight(0)).toBe(0);
    });

    test('honors decimal precision constant', () => {
        expect(WEIGHT_DECIMAL_PLACES).toBe(3);
    });
});

describe('normalization.subtractWeights', () => {
    test('classic floating-point: 0.3 - 0.1', () => {
        expect(subtractWeights(0.3, 0.1)).toBe(0.2);
    });

    test('null minuend returns null', () => {
        expect(subtractWeights(null, 1)).toBeNull();
    });

    test('null subtrahend treated as zero', () => {
        expect(subtractWeights(5, null)).toBe(5);
    });

    test('normalizes result to 3 decimals', () => {
        expect(subtractWeights(10.1239, 0.0009)).toBe(10.123);
    });
});

describe('normalization.safeEquals', () => {
    test('within epsilon counts as equal', () => {
        expect(safeEquals(0.300, 0.3001)).toBe(true);
    });

    test('beyond epsilon counts as different', () => {
        expect(safeEquals(0.300, 0.301)).toBe(false);
    });

    test('both null counts as equal', () => {
        expect(safeEquals(null, null)).toBe(true);
    });

    test('one null one number is not equal', () => {
        expect(safeEquals(null, 0)).toBe(false);
    });

    test('default epsilon', () => {
        expect(EQUALITY_EPSILON).toBe(0.0005);
    });
});

describe('normalization predicates', () => {
    test('isPositiveWeight', () => {
        expect(isPositiveWeight(0)).toBe(false);
        expect(isPositiveWeight(0.0001)).toBe(false);
        expect(isPositiveWeight(0.001)).toBe(true);
        expect(isPositiveWeight(-1)).toBe(false);
        expect(isPositiveWeight(null)).toBe(false);
    });

    test('isNonNegativeWeight', () => {
        expect(isNonNegativeWeight(0)).toBe(true);
        expect(isNonNegativeWeight(-0.001)).toBe(false);
        expect(isNonNegativeWeight(null)).toBe(false);
    });

    test('isWithinMax', () => {
        expect(isWithinMax(MAX_WEIGHT_GRAMS)).toBe(true);
        expect(isWithinMax(MAX_WEIGHT_GRAMS + 0.001)).toBe(false);
        expect(isWithinMax(null)).toBe(false);
    });

    test('isWeightEmpty', () => {
        expect(isWeightEmpty(null)).toBe(true);
        expect(isWeightEmpty('')).toBe(true);
        expect(isWeightEmpty('   ')).toBe(true);
        expect(isWeightEmpty(0)).toBe(false);
        expect(isWeightEmpty('0')).toBe(false);
        expect(isWeightEmpty('abc')).toBe(false);
    });
});
