'use strict';

const crypto = require('crypto');
const testService = require('./testService');
const certificateService = require('./certificateService');
const { BusinessError, ERR } = require('./errors');
const customerRepo = require('../../repositories/customerRepository');
const { db, now } = require('../../db/db');
const { getRequiredEnv } = require('../../config/env');

// ── Snapshot versioning ───────────────────────────────────────────────────────
//
// SNAPSHOT_VERSION      — bump when the envelope structure gains/loses top-level keys.
// SCHEMA_VERSION        — bump when the data payload shape changes (field renames,
//                         new required fields in layout).
// SERIALIZATION_VERSION — bump if _stableSerialize's algorithm changes; the same
//                         object would produce a different byte string and invalidate
//                         existing hashes, so old snapshots must be re-sealed.
// HASH_ALGORITHM        — informational label stored in the envelope; actual key
//                         selection is controlled by CURRENT_SNAPSHOT_KEY_VERSION.
//
// Backward compat: snapshots written before these fields were added are treated
// as version 1 / hmac-sha256 everywhere they are read.

const SNAPSHOT_VERSION        = 1;
const SCHEMA_VERSION          = 1;
const SERIALIZATION_VERSION   = 1;
const HASH_ALGORITHM          = 'hmac-sha256';
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
        console.error('Validation failed: not an object', data);
        throw new BusinessError('SNAPSHOT_INVALID_DATA', ERR.DB_CORRUPTION, 500);
    }

    if (!data.customer || typeof data.customer !== 'object') {
        console.error('Validation failed: invalid customer', data);
        throw new BusinessError('SNAPSHOT_INVALID_DATA', ERR.DB_CORRUPTION, 500);
    }

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
        console.error('Validation failed: invalid items', data);
        throw new BusinessError('SNAPSHOT_INVALID_DATA', ERR.DB_CORRUPTION, 500);
    }

    if (!data.totals || typeof data.totals !== 'object') {
        console.error('Validation failed: invalid totals', data);
        throw new BusinessError('SNAPSHOT_INVALID_DATA', ERR.DB_CORRUPTION, 500);
    }

    const totalNumber = Number(data.totals.total);
    const baseNumber = Number(data.totals.base);
    const taxNumber = Number(data.totals.tax);
    try {
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
    } catch (err) {
        console.error('Validation failed:', err.message, data);
        throw err;
    }
}

function _snapshotTable(resourceType, metalType) {
    if (resourceType === 'test' && metalType === 'gold') return 'gold_test';
    if (resourceType === 'test' && metalType === 'silver') return 'silver_test';
    if (resourceType === 'certificate' && metalType === 'gold') return 'gold_certificate';
    if (resourceType === 'certificate' && metalType === 'silver') return 'silver_certificate';
    if (resourceType === 'certificate' && metalType === 'photo') return 'photo_certificate';

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
        if (id.startsWith('PCR')) return 'photo';

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

    if (resourceType === 'certificate' && metalType === 'photo') {
        const row = db.prepare(
            `SELECT id FROM photo_certificate WHERE (id = ? OR auto_number = ?) AND deletedon IS NULL`
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

function getPrintLayout(resourceType, metalType, id, forceRegenerate = false) {
    const resolvedMetalType = metalType || inferMetalType(resourceType, id);
    const resolvedId = resolveCanonicalId(resourceType, resolvedMetalType, id);
    let data;

    if (resourceType === 'test') {
        data = testService.getTest(resolvedMetalType, resolvedId);
    } else if (resourceType === 'certificate' && resolvedMetalType === 'photo') {
        // Direct query — avoids circular dep with photoCertificateRepository
        const cert = db.prepare(`
            SELECT pc.*, c.name AS customer_name, c.phone AS customer_phone
            FROM photo_certificate pc
            JOIN customer c ON pc.customer_id = c.id
            WHERE pc.id = ? AND pc.deletedon IS NULL
        `).get(resolvedId);
        if (!cert) throw new BusinessError(`photo certificate not found: ${resolvedId}`, ERR.NOT_FOUND, 404);
        const items = db.prepare(`
            SELECT * FROM photo_certificate_item
            WHERE photo_certificate_id = ? AND deletedon IS NULL ORDER BY item_number ASC
        `).all(resolvedId);
        data = { ...cert, items };
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

    if (data.print_snapshot && !forceRegenerate) {
        try {
            const parsed = JSON.parse(data.print_snapshot);
            return parsed.data ? parsed.data : parsed;
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

    const fmtBase  = _formatAmount(base);
    const fmtTax   = _formatAmount(total_tax || (total - base));
    const fmtTotal = _formatAmount(total);

    // Canonical timestamp — tests store `created`, certs may store `created_at`
    const recordDate = data.created || data.created_at || data.createdon || null;

    return {
        // ── Normalized envelope fields (schema-versioned) ─────────────────
        base            : fmtBase,
        tax             : fmtTax,
        total           : fmtTotal,
        mode_of_payment : data.mode_of_payment,
        gst_bill_no     : data.gst_bill_number || null,

        header: {
            entity_type : resourceType,
            metal_type  : resolvedMetalType,
            auto_number : data.auto_number,
            status      : data.status,
            created_at  : recordDate,
        },

        customer: {
            name   : customer.name,
            phone  : customer.phone  || null,
            address: customer.address || '',
        },

        items: data.items.map(item => {
            const itemTotal = _formatAmount(item.item_total);
            // item.name = per-item person name (can be null/empty)
            // item.item_type = the metal item description (Ring, Necklace…)
            const personName = item.name  || '';
            const itemType   = item.item_type || item.item_name || item.name || '';

            return {
                // ── Canonical fields ──────────────────────────────────────
                id                 : item.id          || item.item_number || null,
                item_number        : item.item_number || null,
                certificate_number : item.certificate_number || null,
                name               : personName,      // person/customer name for this item
                item_type          : itemType,         // metal item description
                gross_weight       : _formatAmount(item.gross_weight),
                test_weight        : _formatAmount(item.test_weight),
                net_weight         : _formatAmount(item.net_weight),
                purity             : _formatAmount(item.purity),
                fine_weight        : _formatAmount(item.fine_weight),
                item_total         : itemTotal,
                returned           : item.returned == 1 || item.returned === true,

                // ── Aliases — expected by print components ────────────────
                item_name          : itemType,         // MemoCert: item.item_name
                item_no            : item.item_number || null, // SilverCert: item.item_no
                total              : itemTotal,        // MemoCert: item.total

                ...(resolvedMetalType === 'photo'
                    ? { media_path: item.media_path || null }
                    : {}
                ),
            };
        }),

        totals: {
            base : fmtBase,
            tax  : fmtTax,
            total: fmtTotal,
        },

        // ── Flat aliases — expected by print components ───────────────────
        // These mirror the raw-API shape components were originally written against.
        bill_number    : data.auto_number   || data.bill_number || null,
        createdon      : recordDate,
        created_at     : recordDate,
        customer_name  : customer.name,
        customer_phone : customer.phone || null,
        grand_total    : fmtTotal,
        status         : data.status,
    };
}

function createSnapshotEnvelope(resourceType, metalType, id, actorId = null) {
    // Always force regeneration when creating a new snapshot to capture the latest state
    const layout = getPrintLayout(resourceType, metalType, id, true);
    validateSnapshotSchema(layout);

    return {
        // Envelope versioning — all three fields are included in the HMAC input
        // so any version bump also changes the hash, making downgrades detectable.
        version             : SNAPSHOT_VERSION,
        schema_version      : SCHEMA_VERSION,
        serialization_version: SERIALIZATION_VERSION,
        hash_algorithm      : HASH_ALGORITHM,
        generated_at        : now(),
        actor_id            : actorId,
        data                : layout,
    };
}

function serializeSnapshot(resourceType, metalType, id, actorId = null) {
    const snapshot     = createSnapshotEnvelope(resourceType, metalType, id, actorId);
    const snapshotJson = _stableSerialize(snapshot);  // sorted keys, deterministic

    return {
        snapshot,
        snapshotJson,
        snapshotHash          : hashSnapshot(snapshotJson, CURRENT_SNAPSHOT_KEY_VERSION),
        snapshotKeyVersion    : CURRENT_SNAPSHOT_KEY_VERSION,
        schemaVersion         : SCHEMA_VERSION,
        serializationVersion  : SERIALIZATION_VERSION,
        hashAlgorithm         : HASH_ALGORITHM,
    };
}

/**
 * Maps snapshot header {entity_type, metal_type} to the frontend print-route segment.
 * Used to validate that the URL route matches the actual record type.
 */
function mapTypeToRoute(entityType, metalType) {
    if (entityType === 'test'        && metalType === 'gold')   return 'gold-test';
    if (entityType === 'test'        && metalType === 'silver') return 'silver-test';
    if (entityType === 'certificate' && metalType === 'gold')   return 'gold-certificate';
    if (entityType === 'certificate' && metalType === 'silver') return 'silver-certificate';
    if (entityType === 'certificate' && metalType === 'photo')  return 'photo-certificate';
    throw new BusinessError(
        `Cannot map type to route: ${entityType}/${metalType}`,
        ERR.INVALID_TYPE, 400
    );
}

/**
 * Verify HMAC, parse envelope, optionally filter to a single item.
 *
 * @param {object} snapshotRow  DB row with print_snapshot, snapshot_hash, snapshot_key_version
 * @param {string|null} itemIndex  0-based positional index (legacy; kept for backward compat)
 * @param {string|null} itemId     Item ID string (preferred over itemIndex)
 * @param {string|null} expectedRoute  e.g. 'gold-certificate' — when set, validated against snapshot header
 * @returns {object}  Deep-cloned snapshot envelope (or partial envelope for single-item)
 */
function validateAndExtract(snapshotRow, itemIndex = null, itemId = null, expectedRoute = null) {
    const {
        print_snapshot: printSnapshot,
        snapshot_hash: snapshotHash,
        snapshot_key_version: snapshotKeyVersion,
    } = snapshotRow;

    if (!printSnapshot) {
        throw new BusinessError('SNAPSHOT_NOT_FOUND', ERR.NOT_FOUND, 404);
    }

    // ── HMAC integrity check ──────────────────────────────────────────────────
    const keyVersion     = snapshotKeyVersion || CURRENT_SNAPSHOT_KEY_VERSION;
    const calculatedHash = hashSnapshot(printSnapshot, keyVersion);
    if (!snapshotHash) {
        throw new BusinessError('SNAPSHOT_INTEGRITY_FAILURE', ERR.DB_CORRUPTION, 500);
    }
    // timingSafeEqual prevents timing-oracle attacks on the MAC comparison.
    const aBuffer = Buffer.from(calculatedHash, 'hex');
    const bBuffer = Buffer.from(snapshotHash,   'hex');
    if (aBuffer.length !== bBuffer.length || !crypto.timingSafeEqual(aBuffer, bBuffer)) {
        throw new BusinessError('SNAPSHOT_INTEGRITY_FAILURE', ERR.DB_CORRUPTION, 500);
    }

    // ── Parse ─────────────────────────────────────────────────────────────────
    let parsedSnapshot;
    try {
        parsedSnapshot = JSON.parse(printSnapshot);
    } catch (_) {
        throw new BusinessError('SNAPSHOT_INVALID_DATA', ERR.DB_CORRUPTION, 500);
    }

    const snapshot = parsedSnapshot?.data ? parsedSnapshot : {
        // Legacy snapshot written before envelope versioning — treat as v1
        version              : SNAPSHOT_VERSION,
        schema_version       : 1,
        serialization_version: 1,
        hash_algorithm       : 'hmac-sha256',
        generated_at         : null,
        actor_id             : null,
        data                 : parsedSnapshot,
    };

    // ── Envelope version guards ───────────────────────────────────────────────
    if ((snapshot.version ?? 1) > SNAPSHOT_VERSION) {
        throw new BusinessError(
            `Unsupported snapshot envelope version: ${snapshot.version} (max ${SNAPSHOT_VERSION})`,
            ERR.DB_CORRUPTION, 500
        );
    }
    if ((snapshot.schema_version ?? 1) > SCHEMA_VERSION) {
        throw new BusinessError(
            `Unsupported snapshot schema version: ${snapshot.schema_version} (max ${SCHEMA_VERSION})`,
            ERR.DB_CORRUPTION, 500
        );
    }
    if ((snapshot.serialization_version ?? 1) > SERIALIZATION_VERSION) {
        throw new BusinessError(
            `Unsupported snapshot serialization version: ${snapshot.serialization_version} (max ${SERIALIZATION_VERSION})`,
            ERR.DB_CORRUPTION, 500
        );
    }

    const data = snapshot.data;
    validateSnapshotSchema(data);

    // ── Route / type cross-validation ─────────────────────────────────────────
    // Reject requests where the URL route doesn't match what's inside the snapshot.
    // Prevents e.g. /print/gold-certificate/<silver-cert-id> from returning data.
    if (expectedRoute && data.header?.entity_type && data.header?.metal_type) {
        const actualRoute = mapTypeToRoute(data.header.entity_type, data.header.metal_type);
        if (actualRoute !== expectedRoute) {
            throw new BusinessError(
                `Route/type mismatch: URL says "${expectedRoute}" but snapshot is "${actualRoute}"`,
                ERR.INVALID_TYPE, 400
            );
        }
    }

    // ── Full snapshot (no item filter) ────────────────────────────────────────
    if (itemIndex == null && itemId == null) {
        return JSON.parse(JSON.stringify(snapshot));
    }

    // ── Single-item filter ────────────────────────────────────────────────────
    let targetItem;

    if (itemId != null) {
        // Preferred: look up by stable item ID
        targetItem = data.items.find(i => String(i.id) === String(itemId));
        if (!targetItem) {
            throw new BusinessError(
                `Item "${itemId}" not found in snapshot`,
                ERR.ITEM_NOT_FOUND, 404
            );
        }
    } else {
        // Legacy: positional index (kept for backward compat with old URLs)
        const idx = parseInt(itemIndex, 10);
        if (!Number.isInteger(idx) || idx < 0 || idx >= data.items.length) {
            throw new BusinessError('INVALID_ITEM_INDEX', ERR.ITEM_NOT_FOUND, 404);
        }
        targetItem = data.items[idx];
    }

    return JSON.parse(JSON.stringify({
        ...snapshot,
        is_partial: true,
        data: { ...data, items: [targetItem] },
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
    mapTypeToRoute,
    CURRENT_SNAPSHOT_KEY_VERSION,
    SNAPSHOT_VERSION,
    SCHEMA_VERSION,
    SERIALIZATION_VERSION,
    HASH_ALGORITHM,
};
