const { db, genId, now } = require('../db/db');

/**
 * Generates a globally consistent item number.
 * Format: <PREFIX>-<TIMESTAMP><SEQUENCE>
 * TIMESTAMP: yyyyMMddHHmmss
 * SEQUENCE: 5-digit zero-padded, scoped per SECOND.
 * 
 * @param {string} prefix - The prefix for the item (GTI, STI, GCI, SCI, PCI).
 * @returns {string} The generated item number.
 */
function getNextItemNumber(prefix) {
    const date = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestampStr = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
    const key = `ITEM_SEQ_${timestampStr}`;

    // Use a transaction to ensure atomic increment for the sequence
    const sequence = db.transaction(() => {
        let row = db.prepare("SELECT value FROM globals WHERE key = ?").get(key);

        if (!row) {
            // Initialize sequence for this second
            const id = genId('GLB');
            const ts = now();
            try {
                db.prepare("INSERT INTO globals (id, key, value, created, lastmodified) VALUES (?, ?, ?, ?, ?)").run(id, key, '0', ts, ts);
            } catch (error) {
                // Handle rare race condition if another process inserted the key
                row = db.prepare("SELECT value FROM globals WHERE key = ?").get(key);
                if (!row) throw error; // Should not happen
            }
        }

        // Increment sequence
        db.prepare("UPDATE globals SET value = CAST(value AS INTEGER) + 1, lastmodified = ? WHERE key = ?").run(now(), key);

        // Fetch the updated sequence
        const updatedRow = db.prepare("SELECT value FROM globals WHERE key = ?").get(key);
        return parseInt(updatedRow.value, 10);
    })();

    const seqStr = String(sequence).padStart(5, '0');
    return `${prefix}-${timestampStr}${seqStr}`;
}

module.exports = { getNextItemNumber };
