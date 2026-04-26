const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { db } = require('../db/db');
require('dotenv').config();
const { sendBackupReport } = require('../utils/mailer');

// AWS S3 Implementation
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// S3 Configuration. Will fallback to mock values to prevent crashing if keys are missing initially.
const s3Config = {
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'MOCK_ACCESS',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'MOCK_SECRET'
    }
};
const S3_BUCKET = process.env.AWS_S3_BUCKET || 'swastikcore-backups';
const s3Client = new S3Client(s3Config);

// Configuration
const BACKUP_DIR = path.join(__dirname, '../../backups');
const DB_PATH = path.join(__dirname, '../../backend/db/lab.db');
const BACKUP_HISTORY_PATH = path.join(BACKUP_DIR, 'history.json');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Encrypts a file using AES-256-CBC.
 * Prepends the 16-byte IV to the output file.
 */
async function encryptFile(inputPath, outputPath, keyHex) {
    if (!keyHex || keyHex.length !== 64) {
        throw new Error('Invalid BACKUP_ENCRYPTION_KEY. Must be a 64-character hex string.');
    }

    return new Promise((resolve, reject) => {
        const algorithm = 'aes-256-cbc';
        const key = Buffer.from(keyHex, 'hex');
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, key, iv);

        const input = fs.createReadStream(inputPath);
        const output = fs.createWriteStream(outputPath);

        output.write(iv); // Prepend IV for decryption later

        input.pipe(cipher).pipe(output);

        output.on('finish', resolve);
        output.on('error', reject);
    });
}

async function uploadToS3(filePath, fileName) {
    if (process.env.AWS_ACCESS_KEY_ID === undefined) {
        console.log(`⚠️ Warning: AWS_ACCESS_KEY_ID is missing in .env. Skipping real S3 Upload for ${fileName}.`);
        return;
    }

    try {
        console.log(`☁️ Uploading ${fileName} to AWS S3 Bucket: ${S3_BUCKET}...`);
        const fileStream = fs.createReadStream(filePath);

        const uploadParams = {
            Bucket: S3_BUCKET,
            Key: `database_snapshots/${fileName}`,
            Body: fileStream,
            ContentType: 'application/octet-stream', // DB binary
            ServerSideEncryption: 'AES256' // Ensuring Enterprise Compliance
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);
        console.log(`✅ AWS S3 Upload Complete: ${fileName}`);
    } catch (err) {
        console.error(`❌ AWS S3 Upload failed for ${fileName}:`, err);
    }
}

/**
 * Appends a backup event to the JSON history file.
 */
function logBackupHistory(detail) {
    try {
        let history = [];
        if (fs.existsSync(BACKUP_HISTORY_PATH)) {
            const content = fs.readFileSync(BACKUP_HISTORY_PATH, 'utf8');
            history = JSON.parse(content);
        }
        
        history.unshift({
            id: crypto.randomUUID().slice(0, 8),
            timestamp: new Date().toISOString(),
            ...detail
        });

        // Keep last 100 entries to avoid file bloat
        if (history.length > 100) history = history.slice(0, 100);

        fs.writeFileSync(BACKUP_HISTORY_PATH, JSON.stringify(history, null, 2));
    } catch (err) {
        console.error('⚠️ Failed to log backup history:', err);
    }
}

async function createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `lab_backup_${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, backupName);

    console.log(`📦 Starting primary snapshot...`);
    console.log(`   Source: ${DB_PATH}`);
    console.log(`   Dest:   ${backupPath}`);

    try {
        // --- START GLOBAL LOCK ---
        console.log('🔒 Setting global maintenance lock...');
        db.prepare("INSERT OR REPLACE INTO globals (key, value, created, lastmodified) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)")
          .run('BACKUP_IN_PROGRESS', '1');

        // Get last backup time for report summary
        const lastBackupRow = db.prepare("SELECT value FROM globals WHERE key = 'LAST_BACKUP_AT'").get();
        const sinceTime = lastBackupRow ? lastBackupRow.value : null;
        const backupStartTime = new Date().toISOString();

        // Use SQLite's online backup API if available via better-sqlite3
        await db.backup(backupPath);
        console.log(`✅ Snapshot completed successfully: ${backupName}`);

        // Update last backup time
        db.prepare("INSERT OR REPLACE INTO globals (key, value, created, lastmodified) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)")
          .run('LAST_BACKUP_AT', new Date().toISOString());

        // ENCRYPTION LAYER
        const key = process.env.BACKUP_ENCRYPTION_KEY;
        if (key && key.length === 64) {
            console.log(`🔐 Encrypting backup file...`);
            const encryptedName = `${backupName}.enc`;
            const encryptedPath = `${backupPath}.enc`;
            
            await encryptFile(backupPath, encryptedPath, key);
            
            // Delete unencrypted source
            fs.unlinkSync(backupPath);
            
            console.log(`✅ Encryption complete: ${encryptedName}`);
            
            // Trigger S3 injection for the ENCRYPTED file
            uploadToS3(encryptedPath, encryptedName);
            
            // Send Success Email with Activity Summary
            await sendBackupReport({
                success: true,
                filename: encryptedName,
                timestamp: new Date().toLocaleString('en-IN'),
                encrypted: true,
                since: sinceTime
            });

            // Log to JSON history
            logBackupHistory({
                success: true,
                filename: encryptedName,
                encrypted: true,
                method: 'ONLINE_BACKUP_API'
            });
        } else {
            console.warn('⚠️ BACKUP_ENCRYPTION_KEY missing or invalid. Uploading unencrypted file.');
            uploadToS3(backupPath, backupName);
            await sendBackupReport({
                success: true,
                filename: backupName,
                timestamp: new Date().toLocaleString('en-IN'),
                encrypted: false,
                since: sinceTime
            });

            logBackupHistory({
                success: true,
                filename: backupName,
                encrypted: false,
                method: 'ONLINE_BACKUP_API'
            });
        }

        // Optional: Prune old backups (keep last 7 days)
        pruneOldBackups();

    } catch (err) {
        // Fallback for file copy if db.backup isn't available or fails synchronously
        console.warn('⚠️ SQLite backup API failed/unavailable, falling back to file copy...');
        try {
            fs.copyFileSync(DB_PATH, backupPath);
            console.log(`✅ Backup (Copy) completed successfully: ${backupName}`);
            
            // Re-attempt encryption for fallback path
            const key = process.env.BACKUP_ENCRYPTION_KEY;
            if (key && key.length === 64) {
                const encryptedName = `${backupName}.enc`;
                const encryptedPath = `${backupPath}.enc`;
                await encryptFile(backupPath, encryptedPath, key);
                fs.unlinkSync(backupPath);
                uploadToS3(encryptedPath, encryptedName);
            } else {
                uploadToS3(backupPath, backupName);
            }
        } catch (copyErr) {
            console.error('❌ File copy failed:', copyErr);
            // Send Failure Email
            await sendBackupReport({
                success: false,
                error: err.message || copyErr.message,
                timestamp: new Date().toLocaleString('en-IN')
            });

            logBackupHistory({
                success: false,
                error: err.message || copyErr.message,
                method: 'FALLBACK_FILE_COPY'
            });
        }
    } finally {
        // --- RELEASE GLOBAL LOCK ---
        console.log('🔓 Releasing global maintenance lock...');
        try {
            db.prepare("INSERT OR REPLACE INTO globals (key, value, created, lastmodified) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)")
              .run('BACKUP_IN_PROGRESS', '0');
        } catch (lockErr) {
            console.error('❌ Failed to release maintenance lock:', lockErr);
        }
    }
}

function pruneOldBackups() {
    try {
        const files = fs.readdirSync(BACKUP_DIR);
        const now = Date.now();
        const RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

        files.forEach(file => {
            const filePath = path.join(BACKUP_DIR, file);
            const stats = fs.statSync(filePath);
            if (now - stats.mtimeMs > RETENTION_MS) {
                fs.unlinkSync(filePath);
                console.log(`🗑️ Deleted old snapshot: ${file}`);
            }
        });
    } catch (err) {
        console.error('⚠️ Failed to prune old snapshots:', err);
    }
}

// Run immediately if called directly
if (require.main === module) {
    createBackup();
}

module.exports = { createBackup };
