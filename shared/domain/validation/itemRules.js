/* eslint-disable strict */
'use strict';

const {
    coerceNumber,
    normalizeWeight,
    subtractWeights,
    isWeightEmpty,
    MAX_WEIGHT_GRAMS,
} = require('./normalization');

const {
    ERROR_CODES,
    SEVERITY,
    SOURCE,
    SUPPORTED_WORKFLOW_TYPES,
    OPERATIONS,
    ACTORS,
} = require('./errorCodes');

function err(code, field, message) {
    return { code, field, message, severity: SEVERITY.ERROR, source: SOURCE.DOMAIN_VALIDATION };
}

function defaultContext(context) {
    return {
        operation: (context && context.operation) || OPERATIONS.CREATE,
        actor:     (context && context.actor)     || ACTORS.USER,
    };
}

function assertWorkflowType(workflowType) {
    if (!SUPPORTED_WORKFLOW_TYPES.includes(workflowType)) {
        throw new Error(`Unsupported workflow_type: ${workflowType}`);
    }
}

function validateItem({ workflow_type, context, data }) {
    assertWorkflowType(workflow_type);
    const ctx = defaultContext(context);
    const errors = [];
    const warnings = [];
    const d = data || {};

    const itemType = typeof d.item_type === 'string' ? d.item_type.trim() : '';
    const description = typeof d.description === 'string' ? d.description.trim() : '';

    if (!itemType) {
        errors.push(err(ERROR_CODES.MISSING_ITEM_TYPE, 'item_type', 'Item type is required'));
    }
    if (!description) {
        errors.push(err(ERROR_CODES.MISSING_DESCRIPTION, 'description', 'Description / tag is required'));
    }

    const grossRaw = d.gross_weight;
    const sampleRaw = d.sample_weight;

    const grossEmpty = isWeightEmpty(grossRaw);
    const grossNumber = coerceNumber(grossRaw);
    const sampleNumber = coerceNumber(sampleRaw);
    const sampleEmpty = isWeightEmpty(sampleRaw);

    let grossNormalized = null;
    let sampleNormalized = null;
    let netNormalized = null;

    if (grossEmpty) {
        errors.push(err(ERROR_CODES.MISSING_GROSS_WEIGHT, 'gross_weight', 'Gross weight is required'));
    } else if (grossNumber === null) {
        errors.push(err(ERROR_CODES.INVALID_GROSS_WEIGHT, 'gross_weight', 'Gross weight is not a valid number'));
    } else if (grossNumber < 0) {
        errors.push(err(ERROR_CODES.GROSS_WEIGHT_NEGATIVE, 'gross_weight', 'Gross weight cannot be negative'));
    } else if (grossNumber === 0) {
        errors.push(err(ERROR_CODES.GROSS_WEIGHT_NOT_POSITIVE, 'gross_weight', 'Gross weight must be greater than zero'));
    } else if (grossNumber > MAX_WEIGHT_GRAMS) {
        errors.push(err(ERROR_CODES.GROSS_WEIGHT_TOO_LARGE, 'gross_weight', `Gross weight exceeds maximum allowed (${MAX_WEIGHT_GRAMS}g)`));
    } else {
        grossNormalized = normalizeWeight(grossRaw);
    }

    if (!sampleEmpty) {
        if (sampleNumber === null) {
            errors.push(err(ERROR_CODES.INVALID_SAMPLE_WEIGHT, 'sample_weight', 'Sample weight is not a valid number'));
        } else if (sampleNumber < 0) {
            errors.push(err(ERROR_CODES.SAMPLE_WEIGHT_NEGATIVE, 'sample_weight', 'Sample weight cannot be negative'));
        } else if (sampleNumber > MAX_WEIGHT_GRAMS) {
            errors.push(err(ERROR_CODES.SAMPLE_WEIGHT_TOO_LARGE, 'sample_weight', `Sample weight exceeds maximum allowed (${MAX_WEIGHT_GRAMS}g)`));
        } else {
            sampleNormalized = normalizeWeight(sampleRaw);
        }
    }

    if (grossNormalized !== null && sampleNormalized !== null && sampleNormalized > grossNormalized) {
        errors.push(err(ERROR_CODES.SAMPLE_EXCEEDS_GROSS, 'sample_weight', 'Sample weight cannot exceed gross weight'));
    }

    if (grossNormalized !== null) {
        netNormalized = sampleNormalized === null
            ? grossNormalized
            : subtractWeights(grossNormalized, sampleNormalized);

        if (netNormalized !== null && netNormalized < 0) {
            errors.push(err(ERROR_CODES.NET_WEIGHT_NEGATIVE, 'net_weight', 'Net weight cannot be negative'));
            netNormalized = null;
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        normalized: {
            gross:  grossNormalized,
            sample: sampleNormalized,
            net:    netNormalized,
        },
        workflow_type,
        context: ctx,
    };
}

module.exports = { validateItem };
