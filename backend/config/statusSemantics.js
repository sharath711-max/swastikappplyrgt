'use strict';

const PYTHON_TO_SERN_STATUS = Object.freeze({
    ongoing  : 'TODO',
    pending  : 'IN_PROGRESS',
    completed: 'DONE',
});

const SERN_TO_PYTHON_STATUS = Object.freeze({
    TODO       : 'ongoing',
    IN_PROGRESS: 'pending',
    DONE       : 'completed',
});

const STATUS_SEMANTICS = Object.freeze({
    ongoing: Object.freeze({
        sernStatus: 'TODO',
        pythonLabel: 'ongoing',
        sernLabel: 'Ongoing',
        operatorMeaning: 'Intake exists and the next operator action is to enter test or certificate results.',
        nextOperatorAction: 'Add results and submit to Tested.',
    }),
    pending: Object.freeze({
        sernStatus: 'IN_PROGRESS',
        pythonLabel: 'pending',
        sernLabel: 'Tested',
        operatorMeaning: 'Results exist and the next operator action is payment, delivery, certificate print, or final completion.',
        nextOperatorAction: 'Collect payment or delivery details and finalize to Completed.',
    }),
    completed: Object.freeze({
        sernStatus: 'DONE',
        pythonLabel: 'completed',
        sernLabel: 'Completed',
        operatorMeaning: 'Business workflow is finished and the record participates in bills, reports, receipts, and reconciliation.',
        nextOperatorAction: 'Review, print, reprint, or audited correction only.',
    }),
});

function normalizePythonStatus(status) {
    return String(status || '').trim().toLowerCase();
}

function toNodeStatus(pythonStatus, { strict = false } = {}) {
    const normalized = normalizePythonStatus(pythonStatus);
    const mapped = PYTHON_TO_SERN_STATUS[normalized];
    if (!mapped && strict) {
        throw new Error(`Unknown Python workflow status: ${pythonStatus}`);
    }
    return mapped || pythonStatus;
}

function toPythonStatus(nodeStatus, { strict = false } = {}) {
    const normalized = String(nodeStatus || '').trim().toUpperCase();
    const mapped = SERN_TO_PYTHON_STATUS[normalized];
    if (!mapped && strict) {
        throw new Error(`Unknown SERN workflow status: ${nodeStatus}`);
    }
    return mapped || nodeStatus;
}

module.exports = {
    PYTHON_TO_SERN_STATUS,
    SERN_TO_PYTHON_STATUS,
    STATUS_SEMANTICS,
    toNodeStatus,
    toPythonStatus,
};
