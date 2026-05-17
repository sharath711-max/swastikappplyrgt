// ===========================================================================
// AUTO-GENERATED FROM /shared/domain/validation/errorCodes.js
// DO NOT EDIT — run `npm run sync:validation` at repo root to regenerate.
// Hash verified by scripts/check-validation.js (pre-build, pre-test).
// ===========================================================================
'use strict';

const ERROR_CODES = Object.freeze({
    MISSING_CUSTOMER:        'MISSING_CUSTOMER',
    MISSING_ITEMS:           'MISSING_ITEMS',

    MISSING_ITEM_TYPE:       'MISSING_ITEM_TYPE',
    MISSING_DESCRIPTION:     'MISSING_DESCRIPTION',

    MISSING_GROSS_WEIGHT:    'MISSING_GROSS_WEIGHT',
    INVALID_GROSS_WEIGHT:    'INVALID_GROSS_WEIGHT',
    GROSS_WEIGHT_NOT_POSITIVE: 'GROSS_WEIGHT_NOT_POSITIVE',
    GROSS_WEIGHT_NEGATIVE:   'GROSS_WEIGHT_NEGATIVE',
    GROSS_WEIGHT_TOO_LARGE:  'GROSS_WEIGHT_TOO_LARGE',

    INVALID_SAMPLE_WEIGHT:   'INVALID_SAMPLE_WEIGHT',
    SAMPLE_WEIGHT_NEGATIVE:  'SAMPLE_WEIGHT_NEGATIVE',
    SAMPLE_EXCEEDS_GROSS:    'SAMPLE_EXCEEDS_GROSS',
    SAMPLE_WEIGHT_TOO_LARGE: 'SAMPLE_WEIGHT_TOO_LARGE',

    NET_WEIGHT_NEGATIVE:     'NET_WEIGHT_NEGATIVE',

    VALIDATION_FAILED:       'VALIDATION_FAILED',
    VALIDATION_MISMATCH:     'VALIDATION_MISMATCH',
});

const SEVERITY = Object.freeze({
    ERROR:   'error',
    WARNING: 'warning',
});

const SOURCE = Object.freeze({
    DOMAIN_VALIDATION: 'domain.validation',
});

const SUPPORTED_WORKFLOW_TYPES = Object.freeze(['GT', 'ST', 'GC', 'SC', 'PC']);

const OPERATIONS = Object.freeze({
    CREATE:   'CREATE',
    EDIT:     'EDIT',
    DRAFT:    'DRAFT',
    FINALIZE: 'FINALIZE',
});

const ACTORS = Object.freeze({
    USER:   'USER',
    SYSTEM: 'SYSTEM',
});

module.exports = {
    ERROR_CODES,
    SEVERITY,
    SOURCE,
    SUPPORTED_WORKFLOW_TYPES,
    OPERATIONS,
    ACTORS,
};
