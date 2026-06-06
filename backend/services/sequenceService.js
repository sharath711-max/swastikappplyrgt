const { db, rawTransaction } = require('../db/db');

class SequenceService {
    /**
     * Generates a thread-safe, daily resetting global sequence in the format YYYYMMDD-NNN.
     * Starts from 001 every day.
     */
    static generateGlobalSequence() {
        return rawTransaction(() => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const currentDateStr = `${year}${month}${day}`;

            let lastDateRow = db.prepare("SELECT value FROM globals WHERE key = 'daily_last_date'").get();
            let seqRow = db.prepare("SELECT value FROM globals WHERE key = 'daily_global_seq'").get();

            let lastDate = lastDateRow ? lastDateRow.value : '';
            let currentSeq = seqRow ? parseInt(seqRow.value, 10) : 0;

            if (currentDateStr > lastDate || !lastDateRow) {
                // Reset sequence for new day
                currentSeq = 0;
                lastDate = currentDateStr;

                if (lastDateRow) {
                    db.prepare("UPDATE globals SET value = ?, lastmodified = CURRENT_TIMESTAMP WHERE key = 'daily_last_date'").run(lastDate);
                } else {
                    db.prepare("INSERT INTO globals (key, value, created, lastmodified) VALUES ('daily_last_date', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)").run(lastDate);
                }
            }

            // Increment up to 999, though it can go past if volume is super high
            currentSeq += 1;

            const seqStr = String(currentSeq);
            if (seqRow) {
                db.prepare("UPDATE globals SET value = ?, lastmodified = CURRENT_TIMESTAMP WHERE key = 'daily_global_seq'").run(seqStr);
            } else {
                db.prepare("INSERT INTO globals (key, value, created, lastmodified) VALUES ('daily_global_seq', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)").run(seqStr);
            }

            const paddedSeq = String(currentSeq).padStart(3, '0');
            return `${currentDateStr}-${paddedSeq}`;
        })();
    }

    static generateTechnicalAutoNumber(prefix) {
        return rawTransaction(() => {
            const cleanPrefix = String(prefix || '').trim().toUpperCase();
            if (!cleanPrefix) throw new Error('generateTechnicalAutoNumber: prefix is required');

            const now = new Date(Date.now() + (5.5 * 60 * 60 * 1000));
            const stamp = [
                now.getUTCFullYear(),
                String(now.getUTCMonth() + 1).padStart(2, '0'),
                String(now.getUTCDate()).padStart(2, '0'),
                String(now.getUTCHours()).padStart(2, '0'),
                String(now.getUTCMinutes()).padStart(2, '0'),
                String(now.getUTCSeconds()).padStart(2, '0'),
            ].join('');
            const key = `AUTO_NUMBER_${cleanPrefix}_${stamp}`;

            db.prepare("INSERT OR IGNORE INTO globals (key, value, created, lastmodified) VALUES (?, '0', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)").run(key);
            const row = db.prepare(`
                UPDATE globals
                   SET value = CAST(CAST(value AS INTEGER) + 1 AS TEXT),
                       lastmodified = CURRENT_TIMESTAMP
                 WHERE key = ?
                 RETURNING CAST(value AS INTEGER) AS seq
            `).get(key);

            return `${cleanPrefix}-${stamp}-${row.seq}`;
        })();
    }
}

module.exports = SequenceService;
