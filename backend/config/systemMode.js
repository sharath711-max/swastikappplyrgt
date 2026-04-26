'use strict';

const logger = require('../utils/logger');

const SYSTEM_MODE = (process.env.SYSTEM_MODE || 'PARITY').toUpperCase();

if (!['PARITY', 'STRICT'].includes(SYSTEM_MODE)) {
    throw new Error(`Invalid SYSTEM_MODE "${SYSTEM_MODE}". Must be PARITY or STRICT.`);
}

if (process.env.NODE_ENV === 'production' && SYSTEM_MODE !== 'STRICT') {
    throw new Error("Production must run in STRICT mode");
}

function isParity() { return SYSTEM_MODE === 'PARITY'; }
function isStrict() { return SYSTEM_MODE === 'STRICT'; }

// ─── Bypass counters ──────────────────────────────────────────────────────────

const _bypassCounters = Object.create(null);

function parityLog(rule, data = {}) {
    _bypassCounters[rule] = (_bypassCounters[rule] || 0) + 1;
    logger.warn({ event: 'PARITY_BYPASS', rule, count: _bypassCounters[rule], ...data });
}

function getBypassSummary() {
    return { ...Object.fromEntries(Object.entries(_bypassCounters).sort((a, b) => b[1] - a[1])) };
}

// ─── Periodic summary dump (every 5 min, PARITY mode only) ───────────────────

if (isParity()) {
    setInterval(() => {
        const summary = getBypassSummary();
        if (Object.keys(summary).length > 0) {
            logger.warn({ event: 'BYPASS_SUMMARY', SYSTEM_MODE, summary });
        }
    }, 5 * 60 * 1000).unref();
}

module.exports = { isParity, isStrict, parityLog, getBypassSummary, SYSTEM_MODE };
