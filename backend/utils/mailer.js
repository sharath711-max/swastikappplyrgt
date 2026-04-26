'use strict';

const nodemailer = require('nodemailer');
const { db } = require('../db/db');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Sends a backup report email.
 * @param {Object} report - { success, filename, size, error, timestamp }
 */
async function sendBackupReport(report) {
    const recipients = process.env.BACKUP_NOTIFICATION_EMAILS;
    if (!recipients) {
        console.log('⚠️ No backup notification emails configured. Skipping email.');
        return;
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('⚠️ SMTP credentials missing. Skipping email.');
        return;
    }

    // --- ACTIVITY SUMMARY GENERATION ---
    let activityHtml = '';
    if (report.success && report.since) {
        try {
            const since = report.since;
            const stats = {
                goldTests: db.prepare("SELECT COUNT(*) as n FROM gold_test WHERE created > ?").get(since).n,
                silverTests: db.prepare("SELECT COUNT(*) as n FROM silver_test WHERE created > ?").get(since).n,
                goldCerts: db.prepare("SELECT COUNT(*) as n FROM gold_certificate WHERE created > ?").get(since).n,
                silverCerts: db.prepare("SELECT COUNT(*) as n FROM silver_certificate WHERE created > ?").get(since).n,
                photoCerts: db.prepare("SELECT COUNT(*) as n FROM photo_certificate WHERE created > ?").get(since).n,
                totalRevenue: (
                    (db.prepare("SELECT SUM(total) as s FROM gold_test WHERE created > ? AND status='DONE'").get(since).s || 0) +
                    (db.prepare("SELECT SUM(total) as s FROM silver_test WHERE created > ? AND status='DONE'").get(since).s || 0) +
                    (db.prepare("SELECT SUM(total) as s FROM gold_certificate WHERE created > ? AND status='DONE'").get(since).s || 0) +
                    (db.prepare("SELECT SUM(total) as s FROM silver_certificate WHERE created > ? AND status='DONE'").get(since).s || 0) +
                    (db.prepare("SELECT SUM(total) as s FROM photo_certificate WHERE created > ? AND status='DONE'").get(since).s || 0)
                ).toFixed(2),
                deletions: db.prepare("SELECT COUNT(*) as n FROM audit_logs WHERE action LIKE '%DELETE%' AND created > ?").get(since).n
            };

            activityHtml = `
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px;">
                    <h4 style="margin-top: 0; color: #333;">📊 Activity Summary (Since Last Backup)</h4>
                    <p style="font-size: 13px; color: #666; margin-bottom: 10px;">Period: ${new Date(since).toLocaleString('en-IN')} to Now</p>
                    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                        <tr><td style="padding: 4px 0;">New Gold Tests:</td><td style="text-align: right; font-weight: bold;">${stats.goldTests}</td></tr>
                        <tr><td style="padding: 4px 0;">New Silver Tests:</td><td style="text-align: right; font-weight: bold;">${stats.silverTests}</td></tr>
                        <tr><td style="padding: 4px 0;">New Certificates:</td><td style="text-align: right; font-weight: bold;">${stats.goldCerts + stats.silverCerts + stats.photoCerts}</td></tr>
                        <tr style="border-top: 1px solid #ddd;"><td style="padding: 8px 0; font-weight: bold;">Total Revenue Collected:</td><td style="text-align: right; font-weight: bold; color: #28a745;">₹${stats.totalRevenue}</td></tr>
                        <tr><td style="padding: 4px 0; color: #dc3545;">Records Deleted:</td><td style="text-align: right; font-weight: bold; color: #dc3545;">${stats.deletions}</td></tr>
                    </table>
                </div>
            `;
        } catch (err) {
            console.error('⚠️ Failed to generate activity summary:', err);
            activityHtml = '<p style="color: #666; font-style: italic;">(Activity summary unavailable for this period)</p>';
        }
    }

    const subject = `[Swastik Lab] Backup ${report.success ? 'Success' : 'FAILED'} - ${new Date().toLocaleDateString('en-IN')}`;
    
    const html = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: ${report.success ? '#28a745' : '#dc3545'};">
                Database Backup ${report.success ? 'Completed Successfully' : 'Failed'}
            </h2>
            <hr />
            <p><strong>Status:</strong> ${report.success ? '✅ Success' : '❌ Failure'}</p>
            <p><strong>Timestamp:</strong> ${report.timestamp || new Date().toLocaleString('en-IN')}</p>
            ${report.success ? `
                <p><strong>File Name:</strong> ${report.filename}</p>
                <p><strong>Storage:</strong> Local + AWS S3</p>
                <p><strong>Encryption:</strong> AES-256-CBC (Active)</p>
            ` : `
                <p style="color: #dc3545;"><strong>Error:</strong> ${report.error || 'Unknown error occurred during backup'}</p>
            `}
            
            ${activityHtml}

            <hr />
            <p style="font-size: 12px; color: #666;">
                This is an automated report from Swastik Gold & Silver Lab System.
            </p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"Swastik Lab System" <${process.env.SMTP_USER}>`,
            to: recipients,
            subject: subject,
            html: html,
        });
        console.log(`✅ Backup report email sent to: ${recipients}`);
    } catch (err) {
        console.error('❌ Failed to send backup report email:', err);
    }
}

module.exports = { sendBackupReport };
