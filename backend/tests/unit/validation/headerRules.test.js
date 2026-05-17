'use strict';

const { validateHeader } = require('../../../../shared/domain/validation/headerRules');
const { ERROR_CODES } = require('../../../../shared/domain/validation/errorCodes');

const goodItem = {
    item_type:     'RING',
    description:   'Yellow gold ring',
    gross_weight:  10,
    sample_weight: 1,
};

const codesIn = (result) => result.errors.map(e => e.code);
const fieldsIn = (result) => result.errors.map(e => e.field);

describe('validateHeader — happy path', () => {
    test('valid header with single item', () => {
        const result = validateHeader({
            workflow_type: 'GT',
            customer_id: 'cust-1',
            items: [goodItem],
        });
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
        expect(result.normalized.customer_id).toBe('cust-1');
        expect(result.normalized.items[0]).toEqual({ gross: 10, sample: 1, net: 9 });
    });

    test('valid header with multiple items', () => {
        const result = validateHeader({
            workflow_type: 'ST',
            customer_id: 42,
            items: [goodItem, { ...goodItem, gross_weight: 5, sample_weight: 0 }],
        });
        expect(result.valid).toBe(true);
        expect(result.normalized.items).toHaveLength(2);
    });
});

describe('validateHeader — required fields', () => {
    test('missing customer_id', () => {
        const result = validateHeader({ workflow_type: 'GT', customer_id: null, items: [goodItem] });
        expect(result.valid).toBe(false);
        expect(codesIn(result)).toContain(ERROR_CODES.MISSING_CUSTOMER);
    });

    test('empty-string customer_id', () => {
        const result = validateHeader({ workflow_type: 'GT', customer_id: '   ', items: [goodItem] });
        expect(codesIn(result)).toContain(ERROR_CODES.MISSING_CUSTOMER);
    });

    test('empty items array', () => {
        const result = validateHeader({ workflow_type: 'GT', customer_id: 'c', items: [] });
        expect(codesIn(result)).toContain(ERROR_CODES.MISSING_ITEMS);
    });

    test('missing items field altogether', () => {
        const result = validateHeader({ workflow_type: 'GT', customer_id: 'c' });
        expect(codesIn(result)).toContain(ERROR_CODES.MISSING_ITEMS);
    });
});

describe('validateHeader — item errors are namespaced by index', () => {
    test('field is prefixed with items[N]', () => {
        const result = validateHeader({
            workflow_type: 'GT',
            customer_id: 'c',
            items: [{ ...goodItem, gross_weight: 0 }],
        });
        expect(fieldsIn(result)).toContain('items[0].gross_weight');
    });

    test('errors from different items are distinguishable', () => {
        const result = validateHeader({
            workflow_type: 'GT',
            customer_id: 'c',
            items: [
                { ...goodItem, item_type: '' },
                { ...goodItem, gross_weight: 0 },
            ],
        });
        const fields = fieldsIn(result);
        expect(fields).toEqual(expect.arrayContaining([
            'items[0].item_type',
            'items[1].gross_weight',
        ]));
        const item0Errors = result.errors.filter(e => e.item_index === 0);
        const item1Errors = result.errors.filter(e => e.item_index === 1);
        expect(item0Errors.length).toBeGreaterThan(0);
        expect(item1Errors.length).toBeGreaterThan(0);
    });
});

describe('validateHeader — workflow_type guard', () => {
    test('throws on unsupported type', () => {
        expect(() =>
            validateHeader({ workflow_type: 'ZZ', customer_id: 'c', items: [goodItem] })
        ).toThrow(/Unsupported workflow_type/);
    });
});
