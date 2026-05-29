'use strict';

// Must be set before any Date usage so getFullYear/Month/Date return IST values.
process.env.TZ = 'Asia/Kolkata';

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const http              = require('http');
const { Server }        = require('socket.io');
const socketManager     = require('./socket');

const { initDb }              = require('./db/db');
const logger                  = require('./utils/logger');
const { getAllowedCorsOrigins, getJwtSecret } = require('./config/env');
const { correlationMiddleware, getRequestId } = require('./utils/audit');
const { globalErrorHandler }  = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 6001;

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
app.use('/api/bills',            require('./routes/billsRoutes'));
app.use('/api/audit',            require('./routes/auditRoutes'));
app.use('/api/system',           require('./routes/systemRoutes'));

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
app.use(globalErrorHandler);

// ── MAINTENANCE POLICE ─────────────────────────────────────────────────────────
// db is captured at load time — avoids calling require() inside a timer callback
// which throws a ReferenceError when Jest tears down the module registry.
// Both timers are .unref()'d so the process (and test runner) can exit freely.
{
    const { db: _maintDb, purgeExpiredIdempotencyKeys } = require('./db/db');
    const _cleanupSql = "DELETE FROM request_log WHERE created_at < datetime('now', '-30 days')";
    const _recycleBinTables = [
        'gold_test', 'silver_test', 
        'gold_certificate', 'silver_certificate', 'photo_certificate',
        'customer'
    ];

    const _maintInterval = setInterval(() => {
        try {
            // 1. Flush request logs
            _maintDb.prepare(_cleanupSql).run();
            
            // 2. Flush Idempotency keys
            const purged = purgeExpiredIdempotencyKeys();
            
            // 3. Flush Recycle Bin (30 days)
            let totalFlushed = 0;
            _recycleBinTables.forEach(table => {
                const result = _maintDb.prepare(`DELETE FROM ${table} WHERE deletedon < datetime('now', '-30 days')`).run();
                totalFlushed += result.changes;
            });

            console.log(`🧹 [MAINTENANCE] Cleaned up request_log (30d), ${purged} idempotency keys, and flushed ${totalFlushed} items from Recycle Bin.`);
        } catch (err) {
            console.error('❌ [MAINTENANCE] Periodic cleanup failed:', err);
        }
    }, 24 * 60 * 60 * 1000); // 24 hours
    _maintInterval.unref();

    const _startupCleanup = setTimeout(() => {
        try {
            _maintDb.prepare(_cleanupSql).run();
            _recycleBinTables.forEach(table => {
                _maintDb.prepare(`DELETE FROM ${table} WHERE deletedon < datetime('now', '-30 days')`).run();
            });
        } catch (_) {}
    }, 5000);
    _startupCleanup.unref();
}

// ── 8. Start server ───────────────────────────────────────────────────────────
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin(origin, cb) { cb(null, isAllowedCorsOrigin(origin)); },
        methods: ['GET', 'POST'],
    },
});

// JWT auth handshake — rejects connections with invalid/missing token.
// Token is passed as ?token=<jwt> in the connection query or auth object.
io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
        const jwt = require('jsonwebtoken');
        socket.user = jwt.verify(token, getJwtSecret());
        next();
    } catch {
        next(new Error('Invalid token'));
    }
});

socketManager.attach(io);

if (require.main === module) {
    httpServer.listen(PORT, () => {
        logger.info(`🚀 Server running on port ${PORT}`);
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

module.exports = app;
