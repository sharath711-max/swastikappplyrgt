'use strict';

const { db, transaction } = require('../db/db');
const { writeAuditLog } = require('./auditLogService');

const RATE_KEYS = new Set(['gold_rate_per_gram', 'silver_rate_per_gram']);

function updateRates({ gold_rate_per_gram, silver_rate_per_gram }) {
    if (gold_rate_per_gram === undefined && silver_rate_per_gram === undefined) {
        throw Object.assign(new Error('At least one rate is required'), { statusCode: 400 });
    }

    const candidates = [
        { key: 'gold_rate_per_gram',   value: gold_rate_per_gram },
        { key: 'silver_rate_per_gram', value: silver_rate_per_gram },
    ].filter(r => r.value !== undefined);

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
    const rows = db.prepare(
        `SELECT key, value FROM globals WHERE key IN ('gold_rate_per_gram','silver_rate_per_gram')`
    ).all();
    const result = {};
    for (const row of rows) {
        result[row.key] = parseFloat(row.value) || 0;
    }
    return result;
}

module.exports = { updateRates, getRates };
