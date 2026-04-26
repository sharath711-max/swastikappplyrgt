'use strict';

/**
 * errors.js  —  v2 error taxonomy
 * ─────────────────────────────────────────────────────────────────────────────
 * BusinessError  – known, user-facing violations (validation, status conflicts,
 *                  not-found, immutability).  Maps to a specific HTTP status
 *                  and a stable machine-readable code.
 *
 * SystemError    – unexpected infrastructure failures (DB corruption, missing
 *                  rows mid-transaction, sequence table inconsistency).
 *                  Always 500.  Wraps the original cause.
 *
 * ValidationError – subclass of BusinessError, specifically for field-level
 *                   validation failures.  Carries a `details` array.
 *
 * ERR            – frozen code registry; import and use instead of raw strings.
 */

// ─── Error code registry ─────────────────────────────────────────────────────
const ERR = Object.freeze({
    // 400 — bad input
    VALIDATION          : 'VALIDATION',
    INVALID_TYPE        : 'INVALID_TYPE',
    MISSING_FIELD       : 'MISSING_FIELD',
    INVALID_AMOUNT      : 'INVALID_AMOUNT',
    INVALID_PURITY      : 'INVALID_PURITY',
    ITEMS_EMPTY         : 'ITEMS_EMPTY',
    MISSING_PAYMENT     : 'MISSING_PAYMENT',

    // 404 — not found
    NOT_FOUND           : 'NOT_FOUND',
    CUSTOMER_NOT_FOUND  : 'CUSTOMER_NOT_FOUND',
    ITEM_NOT_FOUND      : 'ITEM_NOT_FOUND',
    CERT_NOT_FOUND      : 'CERT_NOT_FOUND',
    TEST_NOT_FOUND      : 'TEST_NOT_FOUND',

    // 409 — state conflict
    IMMUTABLE           : 'IMMUTABLE',
    STATUS_BACKWARD     : 'STATUS_BACKWARD',
    STATUS_INVALID      : 'STATUS_INVALID',
    CANNOT_DELETE       : 'CANNOT_DELETE',
    NO_CERT_ITEMS       : 'NO_CERT_ITEMS',

    // 500 — system / infrastructure
    SEQUENCE_FAILURE    : 'SEQUENCE_FAILURE',
    ROLLUP_FAILURE      : 'ROLLUP_FAILURE',
    LEDGER_FAILURE      : 'LEDGER_FAILURE',
    DB_CORRUPTION       : 'DB_CORRUPTION',
});

// ─── Error classes ────────────────────────────────────────────────────────────

/**
 * BusinessError — a known, expected failure that the caller should handle.
 * Never wraps another error; the cause is the business rule itself.
 */
class BusinessError extends Error {
    /**
     * @param {string} message    – human-readable
     * @param {string} code       – ERR.* constant
     * @param {number} [statusCode=400]
     * @param {any}    [details]  – optional extra context (field list etc.)
     */
    constructor(message, code, statusCode = 400, details = null) {
        super(message);
        this.name       = 'BusinessError';
        this.code       = code;
        this.statusCode = statusCode;
        this.details    = details;
    }
}

/**
 * ValidationError — subset of BusinessError for field-level failures.
 * Always 422 Unprocessable Entity.
 */
class ValidationError extends BusinessError {
    /**
     * @param {string}   message
     * @param {string[]} [details]  – one message per invalid field
     */
    constructor(message, details = []) {
        super(message, ERR.VALIDATION, 422, details);
        this.name = 'ValidationError';
    }
}

/**
 * SystemError — an unexpected infrastructure failure.
 * Always 500.  Wraps the original error for stack-trace preservation.
 */
class SystemError extends Error {
    /**
     * @param {string} message
     * @param {Error|null}  [cause]    – original error
     * @param {Object}      [context]  – debugging data (ids, type, step, …)
     */
    constructor(message, cause = null, context = {}) {
        super(message);
        this.name       = 'SystemError';
        this.statusCode = 500;
        this.cause      = cause;
        this.context    = context;
    }
}

/**
 * Utility: wrap an unknown thrown value into either SystemError (if it is not
 * already a BusinessError / SystemError) or re-throw as-is.
 *
 * @param {any}    err
 * @param {string} operation – e.g. 'certificateService.createCertificate'
 * @param {Object} [context]
 * @returns {never}
 */
function rethrow(err, operation, context = {}) {
    if (err instanceof BusinessError || err instanceof SystemError) {
        // Annotate with operation chain if not already present
        err.operation = err.operation || operation;
        throw err;
    }

    // Map SQLite trigger failures (integrity guard) to a 409 Conflict
    // instead of letting them bubble as a 500 SystemError.
    if (err.code === 'SQLITE_CONSTRAINT_TRIGGER' && err.message.includes('finalized')) {
        throw new BusinessError(err.message, ERR.IMMUTABLE, 409);
    }

    throw new SystemError(
        `Unexpected failure in ${operation}: ${err.message}`,
        err,
        { operation, ...context }
    );
}

module.exports = { BusinessError, ValidationError, SystemError, ERR, rethrow };
