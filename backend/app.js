'use strict';

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const { initDb }              = require('./db/db');
const logger                  = require('./utils/logger');
const { getAllowedCorsOrigins } = require('./config/env');
const { correlationMiddleware, getRequestId } = require('./utils/audit');

const app  = express();
const PORT = process.env.PORT || 5000;

const allowedCorsOrigins = new Set(getAllowedCorsOrigins());
const isAllowedCorsOrigin = (origin) => !origin || allowedCorsOrigins.has(origin);

// ── 1. Correlation ID + audit tracing (MUST be first) ────────────────────────
//   Opens an AsyncLocalStorage context for the full request/response lifecycle.
//   Reads X-Request-Id header or generates a UUID.
//   Sets req.requestId for backward-compat with existing logger calls.
//   Emits HTTP_REQ (arrival) and HTTP_RES / HTTP_RES_ERROR (finish) audit events.
app.use(correlationMiddleware);

// ── 2. CORS ───────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && !allowedCorsOrigins.has(origin)) {
        return res.status(403).json({ error: 'CORS origin not allowed.' });
    }
    return next();
});

app.use(cors({
    origin(origin, callback) {
        callback(null, isAllowedCorsOrigin(origin));
    },
    methods     : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Accept', 'Authorization', 'Content-Type', 'X-Request-Id'],
}));

// ── 3. Body parsing + static uploads ─────────────────────────────────────────
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── 4. Database init ──────────────────────────────────────────────────────────
try {
    initDb();
} catch (error) {
    process.exit(1);
}

// ── 5. API routes ─────────────────────────────────────────────────────────────
app.use('/api/auth',             require('./routes/authRoutes'));
app.use('/api/public/documents', require('./routes/publicDocumentRoutes'));
app.use('/api/public/verify',    require('./routes/verifyRoutes'));
app.use('/api/customers',        require('./routes/customerRoutes'));
app.use('/api/certificates/:id', require('./routes/certificateItemRoutes'));
app.use('/api/certificates',     require('./routes/certificateRoutes'));
app.use('/api/gold-tests',       require('./routes/goldTestRoutes'));
app.use('/api/silver-tests',     require('./routes/silverTestRoutes'));
app.use('/api/weight-loss',      require('./routes/weightLossRoutes'));
app.use('/api/print',            require('./routes/printRoutes'));
app.use('/api/cash-register',    require('./routes/cashRoutes'));
app.use('/api/workflow',         require('./routes/workflowRoutes'));
app.use('/api/credit-history',   require('./routes/creditHistoryRoutes'));
app.use('/api/list',             require('./routes/listRoutes'));
app.use('/api/records',          require('./routes/recordRoutes'));
app.use('/api/analytics',        require('./routes/analyticsRoutes'));

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Swastik API is running' });
});

// ── 6. Frontend (SPA fallback) ────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }

    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(200).send(`
            <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
                <h1>Swastik Gold &amp; Silver Lab — API Server</h1>
                <p>The backend is running successfully on port ${PORT}.</p>
                <p>Frontend: <a href="http://localhost:3000">http://localhost:3000</a> (development)</p>
                <p><em>(public/index.html not found — run the frontend build first)</em></p>
            </div>
        `);
    }
});

// ── 7. Global error handler ───────────────────────────────────────────────────
//   BusinessError / ValidationError → status from err.statusCode (4xx), with
//   machine-readable `code` and optional `details` field.
//   Anything else → 500 with a traceId for the audit log.
app.use((err, req, res, next) => {  // eslint-disable-line no-unused-vars
    const requestId  = req.requestId ?? getRequestId();
    const statusCode = err.statusCode ?? 500;

    logger.error(`Error handling ${req.method} ${req.url}: ${err.message}`, {
        stack     : err.stack,
        requestId,
        errorCode : err.code,
        statusCode,
    });

    if (statusCode < 500) {
        return res.status(statusCode).json({
            error  : err.message,
            code   : err.code,
            ...(err.details != null ? { details: err.details } : {}),
            requestId,
        });
    }

    res.status(500).json({ error: 'Something went wrong!', traceId: requestId });
});

// ── MAINTENANCE POLICE ─────────────────────────────────────────────────────────
setInterval(() => {
    try {
        const { db } = require('./db/db');
        db.prepare("DELETE FROM request_log WHERE created_at < datetime('now', '-30 days')").run();
        console.log('🧹 [MAINTENANCE] Cleaned up request_log older than 30 days');
    } catch (err) {
        console.error('🧹 [MAINTENANCE] Failed to cleanup request_log', err);
    }
}, 24 * 60 * 60 * 1000); // 24 hours (Runs in background)

// Kick off one immediately on startup safely after small delay
setTimeout(() => {
    try {
        const { db } = require('./db/db');
        db.prepare("DELETE FROM request_log WHERE created_at < datetime('now', '-30 days')").run();
    } catch(e) {}
}, 5000);

// ── 8. Start server ───────────────────────────────────────────────────────────
if (require.main === module) {
    app.listen(PORT, () => {
        logger.info(`🚀 Server running on port ${PORT}`);
        console.log(`🚀 Server running on port ${PORT}`);
    });
}
// Trigger restart 4

module.exports = app;
