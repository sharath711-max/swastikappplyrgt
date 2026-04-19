'use strict';

const logger = require('../utils/logger');
const { getRequestId } = require('../utils/audit');

/**
 * globalErrorHandler
 * ──────────────────
 * Express 4-argument error middleware.  Must be registered LAST.
 *
 * BusinessError / ValidationError (statusCode < 500)
 *   → HTTP status from err.statusCode
 *   → body: { error, code, details?, requestId }
 *
 * SystemError / unknown (statusCode ≥ 500 or missing)
 *   → HTTP 500
 *   → body: { error: 'Something went wrong!', traceId }
 *   → full stack logged server-side only
 *
 * Idempotency: any second call after headers are sent is a no-op.
 */
function globalErrorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
    if (res.headersSent) return;

    const requestId  = req.requestId ?? getRequestId() ?? 'unknown';
    const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;

    logger.error(`[${req.method}] ${req.url} → ${statusCode}: ${err.message}`, {
        requestId,
        errorCode : err.code,
        statusCode,
        stack     : err.stack,
        cause     : err.cause?.message,
    });

    if (statusCode < 500) {
        return res.status(statusCode).json({
            error    : err.message,
            code     : err.code     ?? 'ERROR',
            ...(err.details != null ? { details: err.details } : {}),
            requestId,
        });
    }

    return res.status(500).json({
        error  : 'Something went wrong!',
        traceId: requestId,
    });
}

/**
 * notFoundHandler
 * ───────────────
 * Catches any request that fell through all routes.
 * Register immediately before globalErrorHandler.
 */
function notFoundHandler(req, res) {
    const requestId = req.requestId ?? getRequestId() ?? 'unknown';

    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            error    : `API endpoint not found: ${req.method} ${req.path}`,
            code     : 'NOT_FOUND',
            requestId,
        });
    }

    // SPA fallback is handled elsewhere; this only fires for unmatched /api routes.
    return res.status(404).json({ error: 'Not found', requestId });
}

module.exports = { globalErrorHandler, notFoundHandler };
