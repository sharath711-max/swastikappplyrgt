'use strict';

const crypto = require('crypto');
const { db } = require('../db/db');
const { getContext, getRequestId } = require('../utils/audit');

const insertAuditLogStmt = db.prepare(`
    INSERT INTO audit_logs (
        id,
        request_id,
        user_id,
        username,
        action,
        event,
        operation,
        entity_type,
        entity_id,
        field,
        old_value,
        new_value,
        method,
        url,
        metadata_json,
        ip_address
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

function toNullableString(value, maxLength = 4000) {
    if (value == null) return null;

    let text;
    if (typeof value === 'string') {
        text = value;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
        text = String(value);
    } else {
        try {
            text = JSON.stringify(value);
        } catch (_) {
            text = String(value);
        }
    }

    return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function toJsonString(value, maxLength = 16000) {
    if (value == null) return null;

    let text;
    try {
        text = JSON.stringify(value);
    } catch (_) {
        text = JSON.stringify({ serialization_error: true });
    }

    return text.length > maxLength ? text.slice(0, maxLength) : text;
}

/**
 * Write one audit row to the database.
 * The current request correlation fields are pulled from AsyncLocalStorage.
 *
 * @param {Object} entry
 * @returns {Object}
 */
function writeAuditLog(entry = {}) {
    const ctx = getContext();

    const requestId = entry.requestId ?? getRequestId() ?? null;
    const userId = entry.userId ?? ctx.userId ?? 'system';
    const username = entry.username ?? ctx.username ?? 'system';
    const action = toNullableString(entry.action ?? entry.event ?? 'AUDIT', 120) ?? 'AUDIT';
    const event = toNullableString(entry.event ?? action, 120);
    const operation = toNullableString(entry.operation ?? action, 255);
    const entityType = toNullableString(entry.entityType ?? entry.entity_type ?? 'system', 120) ?? 'system';
    const entityId = toNullableString(entry.entityId ?? entry.entity_id ?? requestId ?? action, 255) ?? 'system';
    const field = toNullableString(entry.field, 120);
    const oldValue = toNullableString(entry.oldValue ?? entry.old_value);
    const newValue = toNullableString(entry.newValue ?? entry.new_value);
    const method = toNullableString(entry.method ?? ctx.method, 16);
    const url = toNullableString(entry.url ?? ctx.url, 2048);
    const metadataJson = toJsonString(entry.metadata ?? entry.meta);
    const ipAddress = toNullableString(entry.ipAddress ?? entry.ip_address, 120);

    const row = {
        id: crypto.randomUUID(),
        request_id: requestId,
        user_id: userId,
        username,
        action,
        event,
        operation,
        entity_type: entityType,
        entity_id: entityId,
        field,
        old_value: oldValue,
        new_value: newValue,
        method,
        url,
        metadata_json: metadataJson,
        ip_address: ipAddress,
    };

    insertAuditLogStmt.run(
        row.id,
        row.request_id,
        row.user_id,
        row.username,
        row.action,
        row.event,
        row.operation,
        row.entity_type,
        row.entity_id,
        row.field,
        row.old_value,
        row.new_value,
        row.method,
        row.url,
        row.metadata_json,
        row.ip_address
    );

    return row;
}

module.exports = {
    writeAuditLog,
};
