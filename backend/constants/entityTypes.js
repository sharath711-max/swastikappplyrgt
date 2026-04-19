'use strict';

/**
 * Single source of truth for all entity type strings.
 * Import this everywhere — never hardcode these strings.
 */

const CERT_TYPES = Object.freeze(['gold_certificate', 'silver_certificate', 'photo_certificate']);
const TEST_TYPES = Object.freeze(['gold_test', 'silver_test']);
const ALL_LEDGER_REF_TYPES = Object.freeze([...TEST_TYPES, ...CERT_TYPES]);

// Workflow-layer type tokens (used by workflowService / routes)
const WORKFLOW_CERT_TYPES = Object.freeze(['gold_cert', 'silver_cert', 'photo_cert']);
const WORKFLOW_TEST_TYPES = Object.freeze(['gold', 'silver']);
const ALL_WORKFLOW_TYPES  = Object.freeze([...WORKFLOW_TEST_TYPES, ...WORKFLOW_CERT_TYPES]);

// Metal type tokens (used by certificateService, printService)
const METAL_TYPES = Object.freeze(['gold', 'silver', 'photo']);

module.exports = {
    CERT_TYPES,
    TEST_TYPES,
    ALL_LEDGER_REF_TYPES,
    WORKFLOW_CERT_TYPES,
    WORKFLOW_TEST_TYPES,
    ALL_WORKFLOW_TYPES,
    METAL_TYPES,
};
