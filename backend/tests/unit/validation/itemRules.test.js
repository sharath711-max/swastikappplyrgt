'use strict';

const { validateItem } = require('../../../../shared/domain/validation/itemRules');
const { ERROR_CODES, OPERATIONS, ACTORS } = require('../../../../shared/domain/validation/errorCodes');
const { MAX_WEIGHT_GRAMS } = require('../../../../shared/domain/validation/normalization');

const baseGood = {
    item_type:     'RING',
    description:   'Yellow gold ring',
    gross_weight:  10,
    sample_weight: 1,
    returned:      false,
};

const runWith = (overrides = {}, workflow_type = 'GT') =>
    validateItem({
        workflow_type,
        context: { operation: OPERATIONS.CREATE, actor: ACTORS.USER },
        data: { ...baseGood, ...overrides },
    });

const codesIn = (result) => result.errors.map(e => e.code);
const errorsFor = (result, field) => result.errors.filter(e => e.field === field);

describe('validateItem — workflow_type guard', () => {
    test('throws on unsupported workflow_type', () => {
        expect(() =>
            validateItem({ workflow_type: 'XX', data: baseGood })
        ).toThrow(/Unsupported workflow_type/);
    });

    test.each(['GT', 'ST', 'GC', 'SC', 'PC'])('accepts %s', (wt) => {
        expect(runWith({}, wt).valid).toBe(true);
    });
});

describe('validateItem — happy path', () => {
    test('returns valid with normalized weights', () => {
        const result = runWith();
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
        expect(result.warnings).toEqual([]);
        expect(result.normalized).toEqual({ gross: 10, sample: 1, net: 9 });
    });

    test('empty sample → net equals gross', () => {
        const result = runWith({ sample_weight: '' });
        expect(result.valid).toBe(true);
        expect(result.normalized).toEqual({ gross: 10, sample: null, net: 10 });
    });

    test('null sample → net equals gross', () => {
        const result = runWith({ sample_weight: null });
        expect(result.valid).toBe(true);
        expect(result.normalized.net).toBe(10);
    });

    test('sample equals gross → net = 0', () => {
        const result = runWith({ sample_weight: 10 });
        expect(result.valid).toBe(true);
        expect(result.normalized.net).toBe(0);
    });

    test('precision: 0.3 - 0.1 normalizes cleanly', () => {
        const result = runWith({ gross_weight: 0.3, sample_weight: 0.1 });
        expect(result.normalized).toEqual({ gross: 0.3, sample: 0.1, net: 0.2 });
    });

    test('rounds gross to 3 dp', () => {
        const result = runWith({ gross_weight: 1.23456, sample_weight: 0 });
        expect(result.normalized.gross).toBe(1.235);
    });
});

describe('validateItem — required fields', () => {
    test('missing item_type', () => {
        const result = runWith({ item_type: '' });
        expect(result.valid).toBe(false);
        expect(codesIn(result)).toContain(ERROR_CODES.MISSING_ITEM_TYPE);
        expect(errorsFor(result, 'item_type')).toHaveLength(1);
    });

    test('whitespace-only item_type', () => {
        expect(codesIn(runWith({ item_type: '   ' }))).toContain(ERROR_CODES.MISSING_ITEM_TYPE);
    });

    test('missing description', () => {
        expect(codesIn(runWith({ description: '' }))).toContain(ERROR_CODES.MISSING_DESCRIPTION);
    });

    test('missing gross_weight', () => {
        expect(codesIn(runWith({ gross_weight: '' }))).toContain(ERROR_CODES.MISSING_GROSS_WEIGHT);
    });

    test('null gross_weight', () => {
        expect(codesIn(runWith({ gross_weight: null }))).toContain(ERROR_CODES.MISSING_GROSS_WEIGHT);
    });
});

describe('validateItem — gross weight rules', () => {
    test('zero is rejected (must be > 0)', () => {
        expect(codesIn(runWith({ gross_weight: 0 }))).toContain(ERROR_CODES.GROSS_WEIGHT_NOT_POSITIVE);
    });

    test('negative gross', () => {
        expect(codesIn(runWith({ gross_weight: -5 }))).toContain(ERROR_CODES.GROSS_WEIGHT_NEGATIVE);
    });

    test('above max is rejected', () => {
        const result = runWith({ gross_weight: MAX_WEIGHT_GRAMS + 1 });
        expect(codesIn(result)).toContain(ERROR_CODES.GROSS_WEIGHT_TOO_LARGE);
    });

    test('extremely large value (regression case)', () => {
        expect(codesIn(runWith({ gross_weight: 9999999999.999 })))
            .toContain(ERROR_CODES.GROSS_WEIGHT_TOO_LARGE);
    });

    test('invalid string', () => {
        expect(codesIn(runWith({ gross_weight: 'abc' }))).toContain(ERROR_CODES.INVALID_GROSS_WEIGHT);
    });

    test('string numeric is accepted', () => {
        expect(runWith({ gross_weight: '10' }).valid).toBe(true);
    });

    test('at max boundary is accepted', () => {
        expect(runWith({ gross_weight: MAX_WEIGHT_GRAMS }).valid).toBe(true);
    });
});

describe('validateItem — sample weight rules', () => {
    test('negative sample', () => {
        expect(codesIn(runWith({ sample_weight: -1 }))).toContain(ERROR_CODES.SAMPLE_WEIGHT_NEGATIVE);
    });

    test('sample > gross', () => {
        expect(codesIn(runWith({ gross_weight: 5, sample_weight: 10 })))
            .toContain(ERROR_CODES.SAMPLE_EXCEEDS_GROSS);
    });

    test('sample above max', () => {
        expect(codesIn(runWith({ sample_weight: MAX_WEIGHT_GRAMS + 1 })))
            .toContain(ERROR_CODES.SAMPLE_WEIGHT_TOO_LARGE);
    });

    test('invalid sample string', () => {
        expect(codesIn(runWith({ sample_weight: 'xx' }))).toContain(ERROR_CODES.INVALID_SAMPLE_WEIGHT);
    });
});

describe('validateItem — multiple errors per field & multi-error', () => {
    test('multiple distinct errors surfaced together', () => {
        const result = runWith({ item_type: '', description: '', gross_weight: 0 });
        expect(result.errors.length).toBeGreaterThanOrEqual(3);
        expect(codesIn(result)).toEqual(expect.arrayContaining([
            ERROR_CODES.MISSING_ITEM_TYPE,
            ERROR_CODES.MISSING_DESCRIPTION,
            ERROR_CODES.GROSS_WEIGHT_NOT_POSITIVE,
        ]));
    });

    test('each error carries severity and source', () => {
        const result = runWith({ gross_weight: 0 });
        const e = result.errors[0];
        expect(e.severity).toBe('error');
        expect(e.source).toBe('domain.validation');
    });
});

describe('validateItem — context defaults', () => {
    test('omitted context defaults to CREATE/USER', () => {
        const result = validateItem({ workflow_type: 'GT', data: baseGood });
        expect(result.context).toEqual({ operation: 'CREATE', actor: 'USER' });
    });
});
