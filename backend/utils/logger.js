'use strict';

const fs   = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'logs');

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

function _logFilePath() {
    const d   = new Date();
    const ymd = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return path.join(LOG_DIR, `${ymd}.log`);
}

function _append(msg) {
    fs.appendFile(_logFilePath(), msg, () => {});
}

const formatMessage = (level, message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const metaStr   = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
};

const log = (level, message, meta = {}) => {
    const msg = formatMessage(level, message, meta);
    _append(msg);
    if (level === 'error') console.error(msg.trim());
    else                   console.log(msg.trim());
};

module.exports = {
    info  : (message, meta) => log('info',  message, meta),
    warn  : (message, meta) => log('warn',  message, meta),
    error : (message, meta) => log('error', message, meta),
    debug : (message, meta) => log('debug', message, meta),
    runMaintenance  : () => {},
    getActiveLogFile: () => _logFilePath(),
};
