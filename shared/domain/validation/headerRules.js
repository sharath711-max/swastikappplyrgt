'use strict';

const { validateItem } = require('./itemRules');
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

function validateHeader({ workflow_type, context, customer_id, items }) {
    assertWorkflowType(workflow_type);
    const ctx = defaultContext(context);
    const errors = [];
    const warnings = [];

    const hasCustomer = customer_id !== null && customer_id !== undefined && String(customer_id).trim() !== '';
    if (!hasCustomer) {
        errors.push(err(ERROR_CODES.MISSING_CUSTOMER, 'customer_id', 'Customer is required'));
    }

    const itemList = Array.isArray(items) ? items : [];
    if (itemList.length === 0) {
        errors.push(err(ERROR_CODES.MISSING_ITEMS, 'items', 'At least one item is required'));
    }

    const itemResults = itemList.map((data, idx) => {
        const result = validateItem({ workflow_type, context: ctx, data });
        result.errors.forEach(e => {
            errors.push({ ...e, field: `items[${idx}].${e.field}`, item_index: idx });
        });
        result.warnings.forEach(w => {
            warnings.push({ ...w, field: `items[${idx}].${w.field}`, item_index: idx });
        });
        return result;
    });

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        normalized: {
            customer_id: hasCustomer ? customer_id : null,
            items: itemResults.map(r => r.normalized),
        },
        item_results: itemResults,
        workflow_type,
        context: ctx,
    };
}

module.exports = { validateHeader };
