/* eslint-disable strict */
'use strict';

const Decimal = require('decimal.js');

const WEIGHT_DECIMAL_PLACES = 3;
const MAX_WEIGHT_GRAMS = 100000;
const MIN_POSITIVE_WEIGHT = 0.001;
const EQUALITY_EPSILON = 0.0005;

function coerceNumber(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') return null;
        const num = Number(trimmed);
        return Number.isFinite(num) ? num : null;
    }
    return null;
}

function normalizeWeight(value) {
    const num = coerceNumber(value);
    if (num === null) return null;
    return new Decimal(num).toDecimalPlaces(WEIGHT_DECIMAL_PLACES, Decimal.ROUND_HALF_UP).toNumber();
}

function subtractWeights(a, b) {
    const na = normalizeWeight(a);
    const nb = normalizeWeight(b);
    if (na === null) return null;
    const sub = new Decimal(na).minus(nb === null ? 0 : nb);
    return sub.toDecimalPlaces(WEIGHT_DECIMAL_PLACES, Decimal.ROUND_HALF_UP).toNumber();
}

function safeEquals(a, b, epsilon) {
    const tol = typeof epsilon === 'number' ? epsilon : EQUALITY_EPSILON;
    const na = normalizeWeight(a);
    const nb = normalizeWeight(b);
    if (na === null && nb === null) return true;
    if (na === null || nb === null) return false;
    return Math.abs(na - nb) <= tol;
}

function isPositiveWeight(value) {
    const n = normalizeWeight(value);
    return n !== null && n >= MIN_POSITIVE_WEIGHT;
}

function isNonNegativeWeight(value) {
    const n = normalizeWeight(value);
    return n !== null && n >= 0;
}

function isWithinMax(value) {
    const n = normalizeWeight(value);
    return n !== null && n <= MAX_WEIGHT_GRAMS;
}

function isWeightEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    return false;
}

module.exports = {
    WEIGHT_DECIMAL_PLACES,
    MAX_WEIGHT_GRAMS,
    MIN_POSITIVE_WEIGHT,
    EQUALITY_EPSILON,
    coerceNumber,
    normalizeWeight,
    subtractWeights,
    safeEquals,
    isPositiveWeight,
    isNonNegativeWeight,
    isWithinMax,
    isWeightEmpty,
};
