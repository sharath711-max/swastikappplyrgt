const fs = require('fs');
const path = require('path');
const { db } = require('../db/db');
require('dotenv').config();

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

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
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

async function createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `lab_backup_${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, backupName);

    console.log(`📦 Starting primary snapshot...`);
    console.log(`   Source: ${DB_PATH}`);
    console.log(`   Dest:   ${backupPath}`);

    try {
        // Use SQLite's online backup API if available via better-sqlite3
        // giving the file name directly allows better-sqlite3 to safely copy
        await db.backup(backupPath);
        console.log(`✅ Snapshot completed successfully: ${backupName}`);

        // GAP 1: Trigger Native AWS S3 injection here asynchronously
        uploadToS3(backupPath, backupName);

        // Optional: Prune old backups (keep last 7 days)
        pruneOldBackups();

    } catch (err) {
        // Fallback for file copy if db.backup isn't available or fails synchronously
        console.warn('⚠️ SQLite backup API failed/unavailable, falling back to file copy...');
        try {
            fs.copyFileSync(DB_PATH, backupPath);
            console.log(`✅ Backup (Copy) completed successfully: ${backupName}`);
            uploadToS3(backupPath, backupName);
        } catch (copyErr) {
            console.error('❌ File copy failed:', copyErr);
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
