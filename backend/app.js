require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db/db');
const logger = require('./utils/logger'); // Import Logger

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const crypto = require('crypto');

// Request Logging Middleware
app.use((req, res, next) => {
    req.requestId = req.headers['x-request-id'] || crypto.randomUUID();
    res.setHeader('X-Request-Id', req.requestId);

    logger.info(`${req.method} ${req.url}`, { ip: req.ip, requestId: req.requestId });
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.url} completed`, {
            status: res.statusCode,
            duration: `${duration}ms`,
            requestId: req.requestId
        });
    });
    next();
});

// Initialize Database
try {
    initDb();
} catch (error) {
    process.exit(1);
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/public/verify', require('./routes/verifyRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/certificates/:id', require('./routes/certificateItemRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/gold-tests', require('./routes/goldTestRoutes'));
app.use('/api/silver-tests', require('./routes/silverTestRoutes'));

app.use('/api/weight-loss', require('./routes/weightLossRoutes'));
app.use('/api/cash-register', require('./routes/cashRoutes'));
app.use('/api/workflow', require('./routes/workflowRoutes'));
app.use('/api/credit-history', require('./routes/creditHistoryRoutes'));
app.use('/api/list', require('./routes/listRoutes'));
app.use('/api/records', require('./routes/recordRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Swastik API is running' });
});

// Serve static files from the 'public' folder (frontend build)
app.use(express.static(path.join(__dirname, 'public')));

// Handle React routing, return all requests to React app
// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    // Check if the request is for API, skip
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }

    const indexPath = path.join(__dirname, 'public', 'index.html');

    // Check if index.html exists (e.g. in production or after build)
    const fs = require('fs');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        // In development (or if build is missing), provide a clear message
        res.status(200).send(`
            <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
                <h1>Swastik Gold & Silver Lab - API Server</h1>
                <p>The backend is running successfully on port ${PORT}.</p>
                <p>If you are looking for the Frontend, please visit <a href="http://localhost:3000">http://localhost:3000</a> (Development)</p>
                <p><em>(public/index.html not found)</em></p>
            </div>
        `);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(`Error handling ${req.method} ${req.url}: ${err.message}`, { stack: err.stack, requestId: req.requestId });
    console.error(err.stack); // Keep console for dev
    res.status(500).json({ error: 'Something went wrong!', traceId: req.requestId });
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        logger.info(`🚀 Server running on port ${PORT}`);
        console.log(`🚀 Server running on port ${PORT}`);
    });
}
// Trigger restart 4

module.exports = app;