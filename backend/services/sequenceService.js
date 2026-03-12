const { db, transaction } = require('../db/db');

class SequenceService {
    /**
     * Generates a thread-safe, daily resetting global sequence in the format YYYYMMDD-NNN.
     * Starts from 001 every day.
     */
    static generateGlobalSequence() {
        return transaction(() => {
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
}

module.exports = SequenceService;
