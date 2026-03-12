
/**
 * Utility for generating consistent auto-numbers across the application.
 * Format: <PREFIX>-<TIMESTAMP><SEQUENCE>
 * Example: GT-2026013115152800001
 */

function formatTimestamp(date) {
    const pad = (n) => String(n).padStart(2, '0');
    const YYYY = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const DD = pad(date.getDate());
    const HH = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${YYYY}${MM}${DD}${HH}${mm}${ss}`;
}

/**
 * Generates formatted auto number
 * @param {string} prefix - The prefix (e.g., GT, GTI)
 * @param {string} batchId - The timestamp string (YYYYMMDDHHmmss)
 * @param {number} sequence - The sequence number (1, 2, 3...)
 * @returns {string} - e.g. GT-2026013115152800001
 */
function generateAutoNumber(prefix, batchId, sequence) {
    const seqStr = String(sequence).padStart(5, '0');
    return `${prefix}-${batchId}${seqStr}`;
}

module.exports = { formatTimestamp, generateAutoNumber };
