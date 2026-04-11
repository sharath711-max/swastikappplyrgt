'use strict';

/**
 * utils/audit.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Correlation-ID-aware structured audit logger for the v2 service layer.
 *
 * HOW IT WORKS
 *   AsyncLocalStorage holds a per-request context object for the lifetime of
 *   each HTTP request (set by the correlationMiddleware).  Every audit.* call
 *   reads from that store automatically — no need to pass requestId around.
 *
 *   Outside of an HTTP request (CLI, tests, background jobs) the store is empty
 *   and requestId is omitted from the log; everything still works.
 *
 * OUTPUT FORMAT
 *   One JSON object per line (NDJSON) — pipe-friendly for Splunk / ELK / grep.
 *
 *   {"ts":"…","event":"START","operation":"…","requestId":"…","type":"gold",…}
 *
 * EVENT TYPES
 *   START    – logged BEFORE a transaction opens (not rolled back on failure)
 *   COMMIT   – logged AFTER a successful commit
 *   ROLLBACK – logged in the catch block (transaction already rolled back)
 *   VALIDATE – logged after pre-transaction validation passes
 *   SEQUENCE – logged every time a new auto_number is minted
 *   STATUS   – logged on every status transition
 *   HTTP_REQ – logged by correlationMiddleware on request arrival
 *   HTTP_RES – logged by correlationMiddleware on response finish
 *
 * USAGE IN SERVICES
 *   const audit = require('../../utils/audit');
 *
 *   audit.start('certificateService.createCertificate', { type, customer_id });
 *   const _txn = transaction(() => { ... });
 *   try {
 *     const result = _txn();
 *     audit.commit('certificateService.createCertificate', { id: result.id, ... });
 *     return result;
 *   } catch (err) {
 *     audit.rollback('certificateService.createCertificate', err, { type });
 *     rethrow(err, ...);
 *   }
 *
 * USAGE IN app.js
 *   const { correlationMiddleware } = require('./utils/audit');
 *   app.use(correlationMiddleware);   // must be first middleware
 */

const { AsyncLocalStorage } = require('async_hooks');
const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');
const { createDailyLogWriter } = require('./logLifecycle');

// ─── Per-request storage ──────────────────────────────────────────────────────

/**
 * The store holds one context object per async call chain:
 *   {
 *     requestId : string,   // UUID from X-Request-Id header or generated
 *     userId    : string,   // from req.user.id (set after auth middleware)
 *     username  : string,   // from req.user.username when available
 *     method    : string,   // HTTP method
 *     url       : string,   // request URL
 *     startMs   : number,   // Date.now() at request entry
 *   }
 */
const _store = new AsyncLocalStorage();

/**
 * Get the current request context.  Returns an empty object when called
 * outside an HTTP request — safe to destructure without guarding.
 * @returns {{ requestId?: string, userId?: string, username?: string, method?: string, url?: string }}
 */
function getContext() {
    return _store.getStore() ?? {};
}

/**
 * Get the current requestId (may be undefined outside HTTP context).
 * @returns {string|undefined}
 */
function getRequestId() {
    return _store.getStore()?.requestId;
}

/**
 * Normalise the inbound request ID header into a short stable string.
 * Falls back to a generated UUID when the header is missing/blank.
 *
 * @param {string|string[]|undefined} rawHeader
 * @returns {string}
 */
function _normaliseRequestId(rawHeader) {
    const requestId = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

    if (typeof requestId !== 'string' || requestId.trim() === '') {
        return crypto.randomUUID();
    }

    return requestId.trim().slice(0, 128);
}

// ─── Log sink ─────────────────────────────────────────────────────────────────

const LOG_DIR  = path.join(__dirname, '..', 'logs');
const _pid     = process.pid;
const _nodeInst = process.env.NODE_APP_INSTANCE ?? '0';
const auditWriter = createDailyLogWriter({
    dir                     : LOG_DIR,
    filePrefix              : 'audit-',
    extension               : '.ndjson',
    envPrefix               : 'AUDIT_LOG',
    defaultMaxBytes         : 10 * 1024 * 1024,
    defaultRetentionDays    : 30,
    defaultCompressAfterDays: 1,
});

// Ensure log directory exists synchronously at module load (safe — runs once)
try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch (_) { /* */ }

/**
 * Assemble and emit one audit entry.
 * Never throws — logging must never abort business logic.
 *
 * @param {string}  event     – START | COMMIT | ROLLBACK | VALIDATE | SEQUENCE | STATUS | …
 * @param {string}  operation – dotted service path e.g. "certificateService.createCertificate"
 * @param {Object}  [extra]   – arbitrary key-value pairs
 * @param {boolean} [isError] – route to stderr in console
 */
function _emit(event, operation, extra = {}, isError = false) {
    try {
        const ctx = getContext();

        const entry = {
            ts        : new Date().toISOString(),
            event,
            operation,
            pid       : _pid,
            node      : _nodeInst,
            // Correlation fields — omitted (not serialised) when undefined
            ...(ctx.requestId ? { requestId : ctx.requestId } : {}),
            ...(ctx.userId    ? { userId    : ctx.userId    } : {}),
            ...(ctx.method    ? { method    : ctx.method    } : {}),
            ...(ctx.url       ? { url       : ctx.url       } : {}),
            // Caller-supplied payload
            ...extra,
        };

        const line = JSON.stringify(entry) + '\n';

        // 1. Console (synchronous — immediately visible in terminal / PM2 logs)
        // Keep this as raw NDJSON so log shippers can parse stdout/stderr directly.
        if (isError) {
            process.stderr.write(line);
        } else {
            process.stdout.write(line);
        }

        // 2. Daily file (async append — non-blocking)
        auditWriter.append(line, () => { /* ignore write errors */ });

    } catch (_) {
        // Absolute last resort — never propagate
    }
}

// ─── Public audit API ─────────────────────────────────────────────────────────

const audit = {

    /**
     * Log that a service is about to open a transaction.
     * Called BEFORE db.transaction() — not rolled back on failure.
     * @param {string} operation
     * @param {Object} [context]
     */
    start(operation, context = {}) {
        _emit('START', operation, context);
    },

    /**
     * Log a successful transaction commit.
     * @param {string} operation
     * @param {Object} [result]  – safe subset: ids, auto_number, totals (no PII)
     */
    commit(operation, result = {}) {
        _emit('COMMIT', operation, result);
    },

    /**
     * Log a transaction rollback (error path).
     * @param {string}    operation
     * @param {Error|any} err
     * @param {Object}    [context]
     */
    rollback(operation, err, context = {}) {
        _emit('ROLLBACK', operation, {
            error     : err?.message,
            errorCode : err?.code,
            status    : err?.statusCode,
            ...context,
        }, true);
    },

    /**
     * Log that pre-transaction validation passed (inputs are sane).
     * @param {string} operation
     * @param {Object} [summary]  – sanitised input summary, no PII
     */
    validate(operation, summary = {}) {
        _emit('VALIDATE', operation, summary);
    },

    /**
     * Log every auto_number minted — enables gap-detection in audits.
     * @param {string}      operation
     * @param {string}      autoNumber  – e.g. "20260411-003"
     * @param {string}      type        – 'gold' | 'silver'
     * @param {string|null} [recordId]  – the record that owns this number
     */
    sequence(operation, autoNumber, type, recordId = null) {
        _emit('SEQUENCE', operation, { auto_number: autoNumber, type, record_id: recordId });
    },

    /**
     * Log a status transition.
     * @param {string} operation
     * @param {string} id
     * @param {string} from
     * @param {string} to
     */
    statusChange(operation, id, from, to) {
        _emit('STATUS', operation, { record_id: id, from, to });
    },

    /**
     * Log an arbitrary informational event.
     * @param {string} operation
     * @param {Object} [data]
     */
    info(operation, data = {}) {
        _emit('INFO', operation, data);
    },

    // ── Expose store helpers so middleware can set context ────────────────────

    /** @internal – used only by correlationMiddleware */
    _store,
    getContext,
    getRequestId,
};

// ─── Express middleware ───────────────────────────────────────────────────────

/**
 * correlationMiddleware
 * ─────────────────────
 * Must be registered in app.js BEFORE any route or other middleware.
 *
 *   const { correlationMiddleware } = require('./utils/audit');
 *   app.use(correlationMiddleware);
 *
 * What it does:
 *   1. Reads X-Request-Id header or generates a UUID.
 *   2. Sets X-Request-Id on the response.
 *   3. Opens an AsyncLocalStorage run() scope that covers the entire
 *      request/response lifecycle, including all service calls.
 *   4. Logs HTTP_REQ on arrival and HTTP_RES on finish.
 *   5. Attaches requestId to req for backward-compat (req.requestId still set).
 *
 * @type {import('express').RequestHandler}
 */
function correlationMiddleware(req, res, next) {
    const requestId = _normaliseRequestId(req.headers['x-request-id']);
    const requestUrl = req.originalUrl || req.url;
    const startMs = Date.now();

    // Backward compat: keep req.requestId so existing logger calls keep working
    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);

    const ctx = {
        requestId,
        userId : null,   // populated by setUserId() after auth middleware runs
        username: null,
        method : req.method,
        url    : requestUrl,
        startMs,
    };

    // Run the rest of the middleware chain + route handler inside this store scope
    _store.run(ctx, () => {
        // Log HTTP arrival
        _emit('HTTP_REQ', 'http', {
            method  : req.method,
            url     : requestUrl,
            ip      : req.ip,
            ua      : req.headers['user-agent']?.slice(0, 80),
        });

        // Log HTTP completion on response finish
        res.once('finish', () => {
            const duration = Date.now() - startMs;
            _emit(
                res.statusCode >= 500 ? 'HTTP_RES_ERROR' : 'HTTP_RES',
                'http',
                {
                    method  : req.method,
                    url     : requestUrl,
                    status  : res.statusCode,
                    ms      : duration,
                },
                res.statusCode >= 500
            );
        });

        next();
    });
}

/**
 * setUserId
 * ─────────
 * Call this inside your auth middleware AFTER verifying the JWT/session,
 * to enrich all subsequent audit log entries with the authenticated user.
 *
 *   const { setUserId } = require('./utils/audit');
 *   // inside authMiddleware, after token verification:
 *   setUserId(req.user.id, req.user.username);
 *
 * @param {string} userId
 * @param {string|null} [username]
 */
function setUserId(userId, username = null) {
    const ctx = _store.getStore();
    if (ctx) {
        ctx.userId = userId;
        if (username != null) ctx.username = username;
    }
}

module.exports = {
    ...audit,
    audit,          // the main audit object (used in services)
    correlationMiddleware,
    setUserId,
    getContext,
    getRequestId,
    runAuditMaintenance: () => auditWriter.runMaintenance(),
};
