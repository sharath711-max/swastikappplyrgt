const fs = require('fs');
const path = require('path');
const { createDailyLogWriter } = require('./logLifecycle');

const LOG_DIR = path.join(__dirname, '..', 'logs');
const logWriter = createDailyLogWriter({
    dir                     : LOG_DIR,
    filePrefix              : '',
    extension               : '.log',
    envPrefix               : 'APP_LOG',
    defaultMaxBytes         : 5 * 1024 * 1024,
    defaultRetentionDays    : 14,
    defaultCompressAfterDays: 1,
});

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

const formatMessage = (level, message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${metaStr}\n`;
};

const log = (level, message, meta = {}) => {
    const msg = formatMessage(level, message, meta);

    // Asynchronous append to avoid blocking (could use a stream for high throughput)
    logWriter.append(msg, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
        }
    });

    // Also log to console for development visibility
    if (level === 'error') {
        console.error(msg.trim());
    } else {
        console.log(msg.trim());
    }
};

module.exports = {
    info: (message, meta) => log('info', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    error: (message, meta) => log('error', message, meta),
    debug: (message, meta) => log('debug', message, meta),
    runMaintenance: () => logWriter.runMaintenance(),
    getActiveLogFile: () => logWriter.getActiveFilePath(),
};
