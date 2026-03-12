/**
 * ID Generation and Validation Utilities
 * Enforces strict pattern: ^[A-Z]{3}[A-Za-z0-9]{15}$
 */

const crypto = require('crypto');

// Strict Regex for 18-char ID (3 uppercase prefix + 15 alphanumeric)
const ID_REGEX = /^[A-Z]{3}[A-Za-z0-9]{15}$/;

const validateId = (id) => {
    if (!id || typeof id !== 'string') return false;
    return ID_REGEX.test(id);
};

const generateId = (prefix) => {
    if (!prefix || !/^[A-Z]{3}$/.test(prefix)) {
        throw new Error('Prefix must be exactly 3 uppercase letters.');
    }

    const timestamp = Date.now().toString(36).toUpperCase(); // Base36 timestamp (approx 8-9 chars)
    // We need 15 chars suffix. Timestamp is ~8. We need ~7 random chars.
    // However, sticking to the existing logic of filling the rest is safer for collision resistance.
    // But we must ensure the "fill" uses the correct charset [A-Za-z0-9].

    // Alphanumeric charset: 0-9, A-Z, a-z
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    let suffix = timestamp;

    // Fill remaining length to reach 15 chars for suffix
    while (suffix.length < 15) {
        const randomByte = crypto.randomBytes(1)[0];
        suffix += chars[randomByte % chars.length];
    }

    // Combine Prefix + Suffix
    const id = `${prefix}${suffix}`;

    // Final sanity check (just in case)
    if (!validateId(id)) {
        // Fallback or retry if something weird happened (unlikely)
        return generateId(prefix);
    }

    return id;
};

module.exports = {
    validateId,
    generateId,
    ID_REGEX
};
