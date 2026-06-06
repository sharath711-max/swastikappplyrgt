'use strict';

/*
 * sharedValidationGate
 *
 * Calls shared/domain/validation and translates results into BusinessError-style
 * throws that the route layer already knows how to render. Also performs hard-fail
 * detection on FE/BE normalized mismatch when the FE payload carries computed
 * normalized values (currently: net_weight).
 *
 * Trust boundary: this runs BEFORE the existing legacy _validate* checks in
 * each create path. Failures here short-circuit the request with HTTP 422 and
 * a `details` array of { code, field, message, severity, source } objects.
 */

const {
    validateHeader,
    safeEquals,
    ERROR_CODES,
    SEVERITY,
    SOURCE,
    OPERATIONS,
    ACTORS,
} = require('../../../shared/domain/validation');

// Backend type strings → workflow_type codes used by the shared module.
const BACKEND_TYPE_TO_WORKFLOW = Object.freeze({
    gold:        'GT',
    silver:      'ST',
    gold_cert:   'GC',
    silver_cert: 'SC',
    photo_cert:  'PC',
});

// TODO(PHASE-UI-SPLIT): same compatibility mapping the FE uses — single source
// field flowed into both item_type and description. Phase-1 only.
// TODO(PHASE-FIELD-NAMING): payloads still use `item_name` / `test_weight` /
// `weight`. Future phase should rename to align with domain names.
function _toValidationItem(raw) {
    const tag = (raw.item_type || raw.item_name || raw.name || '').toString();
    const gross  = raw.gross_weight !== undefined ? raw.gross_weight : raw.weight;
    const sample = raw.sample_weight !== undefined ? raw.sample_weight : raw.test_weight;
    return {
        item_type:     tag,
        description:   tag,
        gross_weight:  gross,
        sample_weight: sample,
        returned:      raw.returned,
    };
}

function _throwValidationFailed(errors) {
    const err = new Error('Validation failed');
    err.statusCode = 422;
    err.code = ERROR_CODES.VALIDATION_FAILED;
    err.details = errors;
    throw err;
}

function _throwMismatch(mismatches) {
    const err = new Error('Normalization mismatch between client and server');
    err.statusCode = 422;
    err.code = ERROR_CODES.VALIDATION_MISMATCH;
    err.details = mismatches;
    throw err;
}

function _detectMismatch(itemResults, rawItems) {
    const mismatches = [];
    for (let idx = 0; idx < itemResults.length; idx++) {
        const beNorm = itemResults[idx].normalized;
        const raw = rawItems[idx] || {};

        // Only verify when FE actually sent its own computed normalized value.
        if (raw.net_weight !== undefined && raw.net_weight !== null && raw.net_weight !== '') {
            const feNet = Number(raw.net_weight);
            if (Number.isFinite(feNet) && beNorm.net !== null && !safeEquals(feNet, beNorm.net)) {
                mismatches.push({
                    code: ERROR_CODES.VALIDATION_MISMATCH,
                    field: `items[${idx}].net_weight`,
                    message: `Client-computed net_weight (${feNet}) does not match server (${beNorm.net})`,
                    severity: SEVERITY.ERROR,
                    source: SOURCE.DOMAIN_VALIDATION,
                    fe_value: feNet,
                    be_value: beNorm.net,
                });
            }
        }
    }
    return mismatches;
}

/**
 * Gate a header-level create payload through the shared validation engine.
 *
 * Accepts either a workflow_type code ('GT'|'ST'|'GC'|'SC'|'PC') directly OR
 * a backend type string mapped via BACKEND_TYPE_TO_WORKFLOW. Callers that know
 * their workflow_type should pass it directly.
 *
 * @param {string} typeOrWorkflow — workflow_type code or backend type alias
 * @param {object} payload        — { customer_id, items }
 * @returns {object} validation result with normalized data
 * @throws {Error & {statusCode:422, code, details}} on validation failure or mismatch
 */
function gateCreate(typeOrWorkflow, payload) {
    const workflow_type = BACKEND_TYPE_TO_WORKFLOW[typeOrWorkflow] || typeOrWorkflow;

    const rawItems = Array.isArray(payload && payload.items) ? payload.items : [];
    const result = validateHeader({
        workflow_type,
        context: { operation: OPERATIONS.CREATE, actor: ACTORS.SYSTEM },
        customer_id: payload && payload.customer_id,
        items: rawItems.map(_toValidationItem),
    });

    if (!result.valid) _throwValidationFailed(result.errors);

    const mismatches = _detectMismatch(result.item_results, rawItems);
    if (mismatches.length > 0) _throwMismatch(mismatches);

    return result;
}

module.exports = {
    gateCreate,
    BACKEND_TYPE_TO_WORKFLOW,
};
