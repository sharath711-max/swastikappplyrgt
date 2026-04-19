'use strict';

const crypto = require('crypto');
const { db }  = require('../db/db');
const logger  = require('../utils/logger');

// ─── Hash algorithm ───────────────────────────────────────────────────────────

const HASH_ALGO    = 'sha256';
const HASH_VERSION = 'v1';

// ─── Canonical payload builder ────────────────────────────────────────────────
//
// Only stable, immutable fields go into the hash.
// Mutable fields (lastmodified, notes) are deliberately excluded.

function _buildGoldCertPayload(cert, items) {
    return {
        v          : HASH_VERSION,
        type       : 'gold_certificate',
        id         : cert.id,
        auto_number: cert.auto_number,
        customer_id: cert.customer_id,
        gst        : cert.gst ? 1 : 0,
        total      : String(cert.total ?? 0),
        items      : (items || [])
            .slice()
            .sort((a, b) => a.id.localeCompare(b.id))
            .map(i => ({
                id          : i.id,
                item_number : i.item_number,
                gross_weight: String(i.gross_weight ?? 0),
                test_weight : String(i.test_weight  ?? 0),
                purity      : String(i.purity       ?? 0),
                net_weight  : String(i.net_weight   ?? 0),
                fine_weight : String(i.fine_weight  ?? 0),
            })),
    };
}

function _buildSilverCertPayload(cert, items) {
    return {
        ..._buildGoldCertPayload(cert, items),
        type: 'silver_certificate',
    };
}

function _buildPhotoCertPayload(cert, items) {
    return {
        v          : HASH_VERSION,
        type       : 'photo_certificate',
        id         : cert.id,
        auto_number: cert.auto_number,
        customer_id: cert.customer_id,
        total      : String(cert.total ?? 0),
        items      : (items || [])
            .slice()
            .sort((a, b) => a.id.localeCompare(b.id))
            .map(i => ({
                id         : i.id,
                item_number: i.item_number,
                media_path : i.media_path ?? null,
            })),
    };
}

const PAYLOAD_BUILDERS = {
    gold  : _buildGoldCertPayload,
    silver: _buildSilverCertPayload,
    photo : _buildPhotoCertPayload,
};

const ITEM_TABLES = {
    gold  : 'gold_certificate_item',
    silver: 'silver_certificate_item',
    photo : 'photo_certificate_item',
};

const CERT_TABLES = {
    gold  : 'gold_certificate',
    silver: 'silver_certificate',
    photo : 'photo_certificate',
};

// ─── Core hash function ───────────────────────────────────────────────────────

/**
 * computeHash(type, cert, items) → string
 * ────────────────────────────────────────
 * Returns a deterministic hex SHA-256 of the canonical certificate payload.
 * Pure function — no DB access.
 */
function computeHash(type, cert, items) {
    const builder = PAYLOAD_BUILDERS[type];
    if (!builder) throw new Error(`Unknown certificate type for hashing: ${type}`);

    const payload = builder(cert, items);
    const canonical = JSON.stringify(payload, Object.keys(payload).sort());
    return crypto.createHash(HASH_ALGO).update(canonical, 'utf8').digest('hex');
}

// ─── DB helpers ───────────────────────────────────────────────────────────────

/**
 * stampHash(type, certId)
 * ────────────────────────
 * Reads the certificate + its items from the DB, computes the hash,
 * and writes it back to the `snapshot_hash` column.
 * Called after a certificate reaches DONE status.
 *
 * @param {'gold'|'silver'|'photo'} type
 * @param {string} certId
 * @returns {{ hash: string, certId: string }}
 */
function stampHash(type, certId) {
    const certTable = CERT_TABLES[type];
    const itemTable = ITEM_TABLES[type];

    if (!certTable) throw new Error(`Unknown certificate type: ${type}`);

    const cert  = db.prepare(`SELECT * FROM ${certTable} WHERE id = ?`).get(certId);
    if (!cert) throw new Error(`Certificate not found: ${certId}`);

    const items = db.prepare(`SELECT * FROM ${itemTable} WHERE certificate_id = ? AND deletedon IS NULL`).all(certId);

    const hash = computeHash(type, cert, items);

    db.prepare(`UPDATE ${certTable} SET snapshot_hash = ?, lastmodified = ? WHERE id = ?`)
      .run(hash, new Date().toISOString(), certId);

    logger.info(`[CertHash] Stamped ${type} certificate ${certId}: ${hash.slice(0, 16)}…`);
    return { hash, certId };
}

/**
 * verifyHash(type, certId) → VerificationResult
 * ───────────────────────────────────────────────
 * Re-computes the hash from current DB state and compares to stored snapshot_hash.
 *
 * Returns:
 *   { valid: true,  hash, certId, auto_number }
 *   { valid: false, reason, certId, auto_number, storedHash, computedHash }
 */
function verifyHash(type, certId) {
    const certTable = CERT_TABLES[type];
    const itemTable = ITEM_TABLES[type];

    if (!certTable) {
        return { valid: false, reason: 'UNKNOWN_TYPE', certId };
    }

    const cert = db.prepare(`SELECT * FROM ${certTable} WHERE id = ?`).get(certId);
    if (!cert) {
        return { valid: false, reason: 'NOT_FOUND', certId };
    }

    if (!cert.snapshot_hash) {
        return { valid: false, reason: 'NO_HASH', certId, auto_number: cert.auto_number };
    }

    const items = db.prepare(`SELECT * FROM ${itemTable} WHERE certificate_id = ? AND deletedon IS NULL`).all(certId);
    const computedHash = computeHash(type, cert, items);

    if (computedHash === cert.snapshot_hash) {
        return {
            valid      : true,
            hash       : cert.snapshot_hash,
            certId,
            auto_number: cert.auto_number,
            type,
        };
    }

    logger.warn(`[CertHash] Tamper detected on ${type} certificate ${certId}`);
    return {
        valid       : false,
        reason      : 'HASH_MISMATCH',
        certId,
        auto_number : cert.auto_number,
        type,
        storedHash  : cert.snapshot_hash,
        computedHash,
    };
}

/**
 * verifyByAutoNumber(autoNumber) → VerificationResult
 * ─────────────────────────────────────────────────────
 * Locates a certificate by its public auto_number (works across all types).
 * Used by the public /verify endpoint.
 */
function verifyByAutoNumber(autoNumber) {
    for (const [type, table] of Object.entries(CERT_TABLES)) {
        const cert = db.prepare(`SELECT id FROM ${table} WHERE auto_number = ? AND deletedon IS NULL`).get(autoNumber);
        if (cert) {
            return verifyHash(type, cert.id);
        }
    }
    return { valid: false, reason: 'NOT_FOUND', autoNumber };
}

module.exports = {
    computeHash,
    stampHash,
    verifyHash,
    verifyByAutoNumber,
    HASH_VERSION,
};
