// backend/scripts/auto_archive.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('../utils/logger'); // Using your existing logger

const LIVE_DB_PATH = path.resolve(__dirname, '../db/lab.db');
const currentYear = new Date().getFullYear();
const ARCHIVE_DB_PATH = path.resolve(__dirname, `../db/archive_${currentYear}.db`);

const db = new sqlite3.Database(LIVE_DB_PATH, (err) => {
    if (err) {
        logger.error('Archiver: Failed to connect to live database', err);
        process.exit(1);
    }
});

logger.info('Archiver: Booting up Auto-Archival sequence...');

// We want to archive logs older than 365 days
const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - 365);
const cutoffIso = cutoffDate.toISOString();

db.serialize(() => {
    // 1. Attach the Archive Database
    db.run(`ATTACH DATABASE '${ARCHIVE_DB_PATH}' AS archiveDB;`);

    // 2. Ensure the table exists in the archive
    db.run(`
        CREATE TABLE IF NOT EXISTS archiveDB.audit_logs (
            id INTEGER PRIMARY KEY,
            record_type TEXT,
            record_id TEXT,
            action TEXT,
            old_value TEXT,
            new_value TEXT,
            changed_by TEXT,
            created_at DATETIME
        );
    `);

    // 3. Begin Transaction to ensure no data is lost if the power fails right now
    db.run('BEGIN TRANSACTION;');

    // 4. Copy old logs to the archive
    db.run(`INSERT INTO archiveDB.audit_logs SELECT * FROM main.audit_logs WHERE created_at < ?;`, [cutoffIso], function(err) {
        if (err) logger.error('Archiver: Insert Error', err);
        else logger.info(`Archiver: Successfully copied ${this.changes} old logs to archive.`);
    });

    // 5. Delete them from the live database
    db.run(`DELETE FROM main.audit_logs WHERE created_at < ?;`, [cutoffIso], function(err) {
        if (err) logger.error('Archiver: Delete Error', err);
        else logger.info(`Archiver: Purged ${this.changes} rows from live DB.`);
    });

    // 6. Commit the transaction
    db.run('COMMIT;');

    // 7. Detach the archive safely
    db.run('DETACH DATABASE archiveDB;');

    // 8. THE MOST IMPORTANT COMMAND: Compress the live database to reclaim physical hard drive space
    logger.info('Archiver: Running VACUUM on live database...');
    db.run('VACUUM;', (err) => {
        if (err) logger.error('Archiver: VACUUM failed', err);
        else logger.info('Archiver: VACUUM complete. Database is fully optimized and compressed.');
        
        db.close();
        process.exit(0);
    });
});
