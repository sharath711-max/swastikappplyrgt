'use strict';

const { db, now, transaction } = require('../db/db');
const { writeAuditLog } = require('./auditLogService');
const seqSvc = require('./v2/sequenceService');

const VALID_TYPES = new Set(['IN', 'OUT']);

function _validate(type, amount) {
    const normalizedType = String(type || '').trim().toUpperCase();
    if (!VALID_TYPES.has(normalizedType)) {
        throw Object.assign(new Error('Type must be IN or OUT'), { statusCode: 400 });
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw Object.assign(new Error('Amount must be a positive number'), { statusCode: 400 });
    }
    return { normalizedType, parsedAmount };
}

function createEntry({ type, amount, description, date }) {
    const { normalizedType, parsedAmount } = _validate(type, amount);
    const entryDate = date || new Date().toISOString().split('T')[0];
    const ts = now();

    const _txn = transaction(() => {
        const autoNumber = seqSvc.generateTechnicalAutoNumber('CR');
        const info = db.prepare(
            `INSERT INTO cash_register (auto_number, date, type, amount, description, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`
        ).run(autoNumber, entryDate, normalizedType, parsedAmount, description || '', ts);

        const entry = db.prepare('SELECT * FROM cash_register WHERE id = ?').get(info.lastInsertRowid);
        writeAuditLog({ action: 'CASH_ENTRY_CREATE', entityType: 'cash_register', entityId: String(info.lastInsertRowid), newValue: normalizedType });
        return entry;
    });

    return _txn();
}

function deleteEntry(id) {
    const _txn = transaction(() => {
        const result = db.prepare('DELETE FROM cash_register WHERE id = ?').run(id);
        if (result.changes === 0) {
            throw Object.assign(new Error('Entry not found'), { statusCode: 404 });
        }
        writeAuditLog({ action: 'CASH_ENTRY_DELETE', entityType: 'cash_register', entityId: String(id) });
        return { success: true };
    });

    return _txn();
}

module.exports = { createEntry, deleteEntry };
