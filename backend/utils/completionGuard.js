'use strict';

const crypto = require('crypto');
const { getRequestId } = require('./audit');

function buildCompletionRequestId() {
    return getRequestId() || crypto.randomUUID();
}

function claimCompletion(db, tableName, recordId, requestId) {
    const claimResult = db.prepare(`
        UPDATE ${tableName}
        SET completion_request_id = COALESCE(completion_request_id, ?)
        WHERE id = ?
          AND deletedon IS NULL
          AND status <> 'DONE'
          AND (completion_request_id IS NULL OR completion_request_id = ?)
    `).run(requestId, recordId, requestId);

    if (claimResult.changes > 0) {
        return { state: 'claimed', requestId };
    }

    const row = db.prepare(`
        SELECT status, completion_request_id, done_at
        FROM ${tableName}
        WHERE id = ? AND deletedon IS NULL
    `).get(recordId);

    if (!row) {
        return { state: 'not_found', requestId };
    }

    if (row.status === 'DONE') {
        return {
            state    : 'idempotent',
            requestId: row.completion_request_id || requestId,
            row,
        };
    }

    if (row.completion_request_id && row.completion_request_id !== requestId) {
        return {
            state    : 'in_progress',
            requestId: row.completion_request_id,
            row,
        };
    }

    if (row.completion_request_id === requestId) {
        return { state: 'claimed', requestId };
    }

    return { state: 'blocked', requestId, row };
}

module.exports = {
    buildCompletionRequestId,
    claimCompletion,
};
