'use strict';

const { db, transaction } = require('../db/db');
const { writeAuditLog } = require('./auditLogService');

// Per-gram rates — legacy keys, retained for backwards compatibility.
const RATE_KEYS = new Set(['gold_rate_per_gram', 'silver_rate_per_gram']);

// Per-workflow flat per-item prices — mirrors Python's PRICE class
// constants on each workflow model (app/models.py):
//   GoldTest.PRICE        = 30
//   GoldCertificate.PRICE = 50
//   SilverCertificate.PRICE = 100
//   PhotoCertificate.PRICE = 50
// Silver Test (ST) has no Python ancestor; per the locked GT=ST mirroring
// decision (docs/print-service-architecture.md §4), default to GT's price.
const PRICE_DEFAULTS = {
    price_gold_test:   30,
    price_silver_test: 30,
    price_gold_cert:   50,
    price_silver_cert: 100,
    price_photo_cert:  50,
};
const PRICE_KEYS = new Set(Object.keys(PRICE_DEFAULTS));

const ALL_KEYS = [...RATE_KEYS, ...PRICE_KEYS];

function updateRates(input) {
    if (!input || typeof input !== 'object') {
        throw Object.assign(new Error('Input body is required'), { statusCode: 400 });
    }

    // Accept any subset of rate/price keys in a single call.
    const candidates = ALL_KEYS
        .filter(k => input[k] !== undefined)
        .map(k => ({ key: k, value: input[k] }));

    if (candidates.length === 0) {
        throw Object.assign(new Error('At least one rate or price is required'), { statusCode: 400 });
    }

    for (const { key, value } of candidates) {
        if (typeof value !== 'number' || value < 0) {
            throw Object.assign(
                new Error(`${key} must be a non-negative number`),
                { statusCode: 400 }
            );
        }
    }

    const upsert = db.prepare(
        `INSERT INTO globals (key, value, created, lastmodified)
         VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, lastmodified = CURRENT_TIMESTAMP`
    );

    const _txn = transaction(() => {
        const updated = {};
        for (const { key, value } of candidates) {
            upsert.run(key, String(value));
            updated[key] = value;
            writeAuditLog({ action: 'UPDATE_RATE', entityType: 'config', entityId: key, newValue: value });
        }
        return updated;
    });

    return _txn();
}

function getRates() {
    const placeholders = ALL_KEYS.map(() => '?').join(',');
    const rows = db.prepare(
        `SELECT key, value FROM globals WHERE key IN (${placeholders})`
    ).all(...ALL_KEYS);

    const result = {};
    for (const row of rows) {
        result[row.key] = parseFloat(row.value) || 0;
    }
    // Fill per-workflow price defaults when not yet persisted, so the
    // frontend can always rely on a numeric value being present.
    for (const [key, defaultValue] of Object.entries(PRICE_DEFAULTS)) {
        if (result[key] === undefined) result[key] = defaultValue;
    }
    return result;
}

module.exports = { updateRates, getRates, PRICE_DEFAULTS };
