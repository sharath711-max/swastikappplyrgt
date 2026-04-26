'use strict';

const { BusinessError, ERR } = require('./v2/errors');
const { isStrict, parityLog } = require('../config/systemMode');

// ─── Entity → table mapping ───────────────────────────────────────────────────

const TABLE_MAP = Object.freeze({
    gold       : 'gold_test',
    silver     : 'silver_test',
    gold_cert  : 'gold_certificate',
    silver_cert: 'silver_certificate',
    photo_cert : 'photo_certificate',
});

// ─── Allowed transitions ──────────────────────────────────────────────────────
//
// Shape: { [entityType]: { [fromStatus]: string[] } }
//
// Tests complete via explicit "finalize" action (not a bare status move),
// so DONE is not listed as a reachable target here — the workflow service
// guards that path separately.  Certificates may be moved TODO → IN_PROGRESS
// manually; DONE requires finalization too.

const ALLOWED_TRANSITIONS = Object.freeze({
    gold: Object.freeze({
        TODO       : ['IN_PROGRESS'],
        IN_PROGRESS: [],          // only via finalize action
        DONE       : [],          // terminal
    }),
    silver: Object.freeze({
        TODO       : ['IN_PROGRESS'],
        IN_PROGRESS: [],
        DONE       : [],
    }),
    gold_cert: Object.freeze({
        TODO       : ['IN_PROGRESS'],
        IN_PROGRESS: ['DONE'],    // certificates can be directly finalized
        DONE       : [],
    }),
    silver_cert: Object.freeze({
        TODO       : ['IN_PROGRESS'],
        IN_PROGRESS: ['DONE'],
        DONE       : [],
    }),
    photo_cert: Object.freeze({
        TODO       : ['IN_PROGRESS'],
        IN_PROGRESS: ['DONE'],
        DONE       : [],
    }),
});

// Statuses that are considered terminal (no outbound transitions)
const TERMINAL_STATUSES = new Set(['DONE']);

// Numeric rank for "forward only" guard
const STATUS_RANK = Object.freeze({ TODO: 0, IN_PROGRESS: 1, DONE: 2 });

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * assertTransitionAllowed(type, fromStatus, toStatus)
 * ────────────────────────────────────────────────────
 * Throws BusinessError if the transition is not permitted.
 * Does NOT touch the database — pure guard.
 */
function assertTransitionAllowed(type, fromStatus, toStatus) {
    if (!TABLE_MAP[type]) {
        throw new BusinessError(`Unknown entity type: ${type}`, ERR.INVALID_TYPE, 400);
    }

    if (fromStatus === toStatus) {
        throw new BusinessError(
            `Already in status ${toStatus}`,
            ERR.STATUS_INVALID, 409,
        );
    }

    if (TERMINAL_STATUSES.has(fromStatus)) {
        throw new BusinessError(
            `${type} is already ${fromStatus} and cannot be moved`,
            ERR.IMMUTABLE, 409,
        );
    }

    const from = STATUS_RANK[fromStatus];
    const to   = STATUS_RANK[toStatus];
    if (from === undefined || to === undefined) {
        throw new BusinessError(
            `Invalid status value: ${fromStatus} → ${toStatus}`,
            ERR.STATUS_INVALID, 400,
        );
    }

    if (to < from) {
        throw new BusinessError(
            `Status cannot move backward (${fromStatus} → ${toStatus})`,
            ERR.STATUS_BACKWARD, 409,
        );
    }

    const allowed = ALLOWED_TRANSITIONS[type]?.[fromStatus] ?? [];
    if (!allowed.includes(toStatus)) {
        if (isStrict()) {
            throw new BusinessError(
                `Transition ${fromStatus} → ${toStatus} is not allowed for ${type}. ` +
                `Allowed: [${allowed.join(', ') || 'none'}]`,
                ERR.STATUS_INVALID, 409,
            );
        } else {
            parityLog('workflow.state_machine.transition', { type, fromStatus, toStatus });
        }
    }
}

/**
 * canTransition(type, fromStatus, toStatus) → boolean
 * ─────────────────────────────────────────────────────
 * Non-throwing variant for conditional UI / service logic.
 */
function canTransition(type, fromStatus, toStatus) {
    try {
        assertTransitionAllowed(type, fromStatus, toStatus);
        return true;
    } catch {
        return false;
    }
}

/**
 * nextStatuses(type, fromStatus) → string[]
 * ──────────────────────────────────────────
 * Returns the set of statuses reachable from fromStatus for a given type.
 */
function nextStatuses(type, fromStatus) {
    return ALLOWED_TRANSITIONS[type]?.[fromStatus] ?? [];
}

/**
 * tableFor(type) → string
 * ────────────────────────
 * Returns the DB table name for an entity type.
 * Throws BusinessError if type is unknown.
 */
function tableFor(type) {
    const table = TABLE_MAP[type];
    if (!table) throw new BusinessError(`Unknown entity type: ${type}`, ERR.INVALID_TYPE, 400);
    return table;
}

/**
 * isTerminal(status) → boolean
 */
function isTerminal(status) {
    return TERMINAL_STATUSES.has(status);
}

module.exports = {
    ALLOWED_TRANSITIONS,
    TABLE_MAP,
    STATUS_RANK,
    assertTransitionAllowed,
    canTransition,
    nextStatuses,
    tableFor,
    isTerminal,
};
