'use strict';

const crypto = require('crypto');
const testService = require('./testService');
const certificateService = require('./certificateService');
const { BusinessError, ERR } = require('./errors');
const customerRepo = require('../../repositories/customerRepository');
const { db } = require('../../db/db');
const { getRequiredEnv } = require('../../config/env');

const SNAPSHOT_VERSION = 1;
const CURRENT_SNAPSHOT_KEY_VERSION = 'v1';

/**
 * Presentation Layer Abstraction
 * Formats Test and Certificate data for thermal/A4 layouts.
 */

function _formatAmount(amt) {
    if (typeof amt !== 'number') return '0.00';
    return amt.toFixed(2);
}

function _snapshotSecret(version = CURRENT_SNAPSHOT_KEY_VERSION) {
    try {
        if (version === 'v1') {
            return getRequiredEnv('SNAPSHOT_SECRET');
        }

        return getRequiredEnv(`SNAPSHOT_SECRET_${String(version).toUpperCase()}`);
    } catch (_) {
        throw new BusinessError('SNAPSHOT_SECRET_MISSING', ERR.DB_CORRUPTION, 500);
    }
}

function _stableSerialize(value) {
    if (value === null || typeof value !== 'object') {
        return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
        return `[${value.map((item) => _stableSerialize(item)).join(',')}]`;
    }

    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${_stableSerialize(value[key])}`).join(',')}}`;
}

function hashSnapshot(snapshotJson, keyVersion = CURRENT_SNAPSHOT_KEY_VERSION) {
    return crypto
        .createHmac('sha256', _snapshotSecret(keyVersion))
        .update(snapshotJson)
        .digest('hex');
}

function _assertFiniteNumber(value, code) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new BusinessError(code, ERR.DB_CORRUPTION, 500);
    }
}

function validateSnapshotSchema(data) {
    if (!data || typeof data !== 'object') {
        throw new BusinessError('SNAPSHOT_INVALID_DATA', ERR.DB_CORRUPTION, 500);
    }

    if (!data.customer || typeof data.customer !== 'object') {
        throw new BusinessError('SNAPSHOT_INVALID_DATA', ERR.DB_CORRUPTION, 500);
    }

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
        throw new BusinessError('SNAPSHOT_INVALID_DATA', ERR.DB_CORRUPTION, 500);
    }

    if (!data.totals || typeof data.totals !== 'object') {
        throw new BusinessError('SNAPSHOT_INVALID_DATA', ERR.DB_CORRUPTION, 500);
    }

    const totalNumber = Number(data.totals.total);
    const baseNumber = Number(data.totals.base);
    const taxNumber = Number(data.totals.tax);
    _assertFiniteNumber(totalNumber, 'SNAPSHOT_INVALID_TOTAL');
    _assertFiniteNumber(baseNumber, 'SNAPSHOT_INVALID_BASE');
    _assertFiniteNumber(taxNumber, 'SNAPSHOT_INVALID_TAX');

    data.items.forEach((item) => {
        if (!item || typeof item !== 'object') {
            throw new BusinessError('SNAPSHOT_INVALID_ITEM', ERR.DB_CORRUPTION, 500);
        }

        _assertFiniteNumber(Number(item.gross_weight), 'SNAPSHOT_INVALID_GROSS_WEIGHT');
        _assertFiniteNumber(Number(item.test_weight), 'SNAPSHOT_INVALID_TEST_WEIGHT');
        _assertFiniteNumber(Number(item.net_weight), 'SNAPSHOT_INVALID_NET_WEIGHT');
        _assertFiniteNumber(Number(item.purity), 'SNAPSHOT_INVALID_PURITY');
        _assertFiniteNumber(Number(item.fine_weight), 'SNAPSHOT_INVALID_FINE_WEIGHT');
        _assertFiniteNumber(Number(item.item_total), 'SNAPSHOT_INVALID_ITEM_TOTAL');
    });
}

function _snapshotTable(resourceType, metalType) {
    if (resourceType === 'test' && metalType === 'gold') return 'gold_test';
    if (resourceType === 'test' && metalType === 'silver') return 'silver_test';
    if (resourceType === 'certificate' && metalType === 'gold') return 'gold_certificate';
    if (resourceType === 'certificate' && metalType === 'silver') return 'silver_certificate';

    throw new BusinessError(
        `Unsupported print resource: ${resourceType}/${metalType}`,
        ERR.INVALID_TYPE,
        400
    );
}

function getImmutableSnapshot(resourceType, metalType, id) {
    const table = _snapshotTable(resourceType, metalType);
    const row = db.prepare(
        `SELECT id, print_snapshot, snapshot_hash, snapshot_key_version, status FROM ${table} WHERE id = ? AND deletedon IS NULL`
    ).get(id);

    if (!row) {
        throw new BusinessError(`${resourceType} not found: ${id}`, ERR.NOT_FOUND, 404);
    }

    if (row.status !== 'DONE') {
        throw new BusinessError(
            `No immutable snapshot found. ${resourceType} ${id} is not finalized.`,
            ERR.STATUS_INVALID,
            404
        );
    }

    return validateAndExtract(row);
}

function inferMetalType(resourceType, id) {
    if (!id || typeof id !== 'string') {
        throw new BusinessError(`Cannot infer type from ID: "${id}"`, ERR.INVALID_TYPE, 400);
    }

    if (resourceType === 'test') {
        if (id.startsWith('GTS')) return 'gold';
        if (id.startsWith('STS')) return 'silver';

        const goldRow = db.prepare(
            'SELECT id FROM gold_test WHERE (id = ? OR auto_number = ?) AND deletedon IS NULL'
        ).get(id, id);
        if (goldRow) return 'gold';

        const silverRow = db.prepare(
            'SELECT id FROM silver_test WHERE (id = ? OR auto_number = ?) AND deletedon IS NULL'
        ).get(id, id);
        if (silverRow) return 'silver';
    }

    if (resourceType === 'certificate') {
        if (id.startsWith('GCR')) return 'gold';
        if (id.startsWith('SCR')) return 'silver';

        const goldRow = db.prepare(
            'SELECT id FROM gold_certificate WHERE (id = ? OR auto_number = ? OR gst_bill_number = ?) AND deletedon IS NULL'
        ).get(id, id, id);
        if (goldRow) return 'gold';

        const silverRow = db.prepare(
            'SELECT id FROM silver_certificate WHERE (id = ? OR auto_number = ? OR gst_bill_number = ?) AND deletedon IS NULL'
        ).get(id, id, id);
        if (silverRow) return 'silver';
    }

    throw new BusinessError(
        `Cannot infer ${resourceType} type from ID: "${id}"`,
        ERR.INVALID_TYPE,
        404
    );
}

function resolveCanonicalId(resourceType, metalType, id) {
    if (resourceType === 'test') {
        const table = metalType === 'gold' ? 'gold_test' : 'silver_test';
        const row = db.prepare(
            `SELECT id FROM ${table} WHERE (id = ? OR auto_number = ?) AND deletedon IS NULL`
        ).get(id, id);
        return row?.id || id;
    }

    if (resourceType === 'certificate') {
        const table = metalType === 'gold' ? 'gold_certificate' : 'silver_certificate';
        const row = db.prepare(
            `SELECT id FROM ${table} WHERE (id = ? OR auto_number = ? OR gst_bill_number = ?) AND deletedon IS NULL`
        ).get(id, id, id);
        return row?.id || id;
    }

    return id;
}

function getPrintLayout(resourceType, metalType, id) {
    const resolvedMetalType = metalType || inferMetalType(resourceType, id);
    const resolvedId = resolveCanonicalId(resourceType, resolvedMetalType, id);
    let data;

    if (resourceType === 'test') {
        data = testService.getTest(resolvedMetalType, resolvedId);
    } else if (resourceType === 'certificate') {
        data = certificateService.getCertificate(resolvedMetalType, resolvedId);
    } else {
        throw new BusinessError(`Unknown resourceType: ${resourceType}`, ERR.INVALID_TYPE, 400);
    }

    if (!data) {
        throw new BusinessError(`${resourceType} not found: ${id}`, ERR.NOT_FOUND, 404);
    }

    const customer = customerRepo.findById(data.customer_id);
    if (!customer) {
        throw new BusinessError(`Customer not found for ${resourceType} ${id}`, ERR.CUSTOMER_NOT_FOUND, 404);
    }

    if (data.print_snapshot) {
        try {
            return JSON.parse(data.print_snapshot);
        } catch (e) {
            // Fallthrough to regenerate dynamically if parse fails
        }
    }

    // Determine Base, Tax, Total
    const total = data.total || 0;
    const total_tax = data.total_tax || 0;
    
    // Reverse Inclusive GST extraction if tax exists
    let base = total - total_tax;
    if (total_tax === 0 && data.gst) { // Backwards compat fallback
         base = total / 1.18;
    }

    return {
        base: _formatAmount(base),
        tax: _formatAmount(total_tax || (total - base)),
        total: _formatAmount(total),
        mode_of_payment: data.mode_of_payment,
        gst_bill_no: data.gst_bill_number || null,
        header: {
            entity_type: resourceType,
            metal_type: resolvedMetalType,
            auto_number: data.auto_number,
            status: data.status,
            created_at: data.created_at,
        },
        customer: {
            name: customer.name,
            phone: customer.phone,
            address: customer.address || '',
        },
        items: data.items.map(item => ({
            item_number: item.item_number,
            certificate_number: item.certificate_number || null,
            name: item.name || item.item_type || '',
            gross_weight: _formatAmount(item.gross_weight),
            test_weight: _formatAmount(item.test_weight),
            net_weight: _formatAmount(item.net_weight),
            purity: _formatAmount(item.purity),
            fine_weight: _formatAmount(item.fine_weight),
            item_total: _formatAmount(item.item_total),
            returned: item.returned == 1 || item.returned === true,
        })),
        totals: {
            base: _formatAmount(base),
            tax: _formatAmount(total_tax || (total - base)),
            total: _formatAmount(total)
        }
    };
}

function createSnapshotEnvelope(resourceType, metalType, id, actorId = null) {
    const layout = getPrintLayout(resourceType, metalType, id);
    validateSnapshotSchema(layout);

    return {
        version: SNAPSHOT_VERSION,
        generated_at: new Date().toISOString(),
        actor_id: actorId,
        data: layout,
    };
}

function serializeSnapshot(resourceType, metalType, id, actorId = null) {
    const snapshot = createSnapshotEnvelope(resourceType, metalType, id, actorId);
    const snapshotJson = _stableSerialize(snapshot);

    return {
        snapshot,
        snapshotJson,
        snapshotHash: hashSnapshot(snapshotJson, CURRENT_SNAPSHOT_KEY_VERSION),
        snapshotKeyVersion: CURRENT_SNAPSHOT_KEY_VERSION,
    };
}

function validateAndExtract(snapshotRow, itemIndex = null) {
    const {
        print_snapshot: printSnapshot,
        snapshot_hash: snapshotHash,
        snapshot_key_version: snapshotKeyVersion,
    } = snapshotRow;

    if (!printSnapshot) {
        throw new BusinessError('SNAPSHOT_NOT_FOUND', ERR.NOT_FOUND, 404);
    }

    const keyVersion = snapshotKeyVersion || CURRENT_SNAPSHOT_KEY_VERSION;
    const calculatedHash = hashSnapshot(printSnapshot, keyVersion);
    if (!snapshotHash || calculatedHash !== snapshotHash) {
        throw new BusinessError('SNAPSHOT_INTEGRITY_FAILURE', ERR.DB_CORRUPTION, 500);
    }

    let parsedSnapshot;
    try {
        parsedSnapshot = JSON.parse(printSnapshot);
    } catch (_) {
        throw new BusinessError('SNAPSHOT_INVALID_DATA', ERR.DB_CORRUPTION, 500);
    }

    const snapshot = parsedSnapshot?.data ? parsedSnapshot : {
        version: SNAPSHOT_VERSION,
        generated_at: null,
        actor_id: null,
        data: parsedSnapshot,
    };

    if (snapshot.version !== SNAPSHOT_VERSION) {
        throw new BusinessError('UNSUPPORTED_SNAPSHOT_VERSION', ERR.DB_CORRUPTION, 500);
    }

    const data = snapshot.data;
    validateSnapshotSchema(data);

    if (itemIndex == null) {
        return JSON.parse(JSON.stringify(snapshot));
    }

    const idx = parseInt(itemIndex, 10);
    if (!Number.isInteger(idx) || idx < 0 || idx >= data.items.length) {
        throw new BusinessError('INVALID_ITEM_INDEX', ERR.ITEM_NOT_FOUND, 404);
    }

    return JSON.parse(JSON.stringify({
        ...snapshot,
        is_partial: true,
        data: { ...data, items: [data.items[idx]] },
    }));
}

module.exports = {
    getPrintLayout,
    inferMetalType,
    resolveCanonicalId,
    getImmutableSnapshot,
    createSnapshotEnvelope,
    serializeSnapshot,
    validateAndExtract,
    validateSnapshotSchema,
    hashSnapshot,
    CURRENT_SNAPSHOT_KEY_VERSION,
};
