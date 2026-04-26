'use strict';

const crypto = require('crypto');

const HASH_SECRET = process.env.HMAC_SECRET || 'fallback_secret_for_development_only';
const HASH_ALGO = 'sha256';

function sortKeysRecursively(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(sortKeysRecursively);
    }
    const sortedKeys = Object.keys(obj).sort();
    const result = {};
    for (const key of sortedKeys) {
        result[key] = sortKeysRecursively(obj[key]);
    }
    return result;
}

function stableStringify(obj) {
    return JSON.stringify(sortKeysRecursively(obj));
}

function generateHmac(snapshot) {
    const canonical = stableStringify(snapshot);
    return crypto.createHmac(HASH_ALGO, HASH_SECRET).update(canonical, 'utf8').digest('hex');
}

function verifyHmac(snapshot, hash) {
    const computedHash = generateHmac(snapshot);
    if (computedHash !== hash) {
        throw new Error('HMAC verification failed. Snapshot may have been tampered with.');
    }
    return true;
}

module.exports = {
    generateHmac,
    verifyHmac,
    stableStringify
};
