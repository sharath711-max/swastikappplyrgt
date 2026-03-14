const logger = require('../utils/logger'); // Assuming a logger exists, or we use console

/**
 * SwastikCore — WhatsApp Notification Service
 * Architected to be provider-agnostic. Currently set up with templates for:
 * 1. UltraMsg (Easy API wrapper for WhatsApp Web)
 * 2. Twilio (Official WhatsApp Business API)
 */
class WhatsAppService {
    constructor() {
        // Read from environment variables
        this.provider = process.env.WHATSAPP_PROVIDER || 'MOCK'; // 'ULTRAMSG', 'TWILIO', 'MOCK'

        // UltraMsg Config
        this.ultraMsgInstanceId = process.env.ULTRAMSG_INSTANCE_ID;
        this.ultraMsgToken = process.env.ULTRAMSG_TOKEN;

        // Twilio Config
        this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
        this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
        this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    }

    formatPhoneNumber(phoneNumber) {
        const digits = String(phoneNumber || '').replace(/\D/g, '');

        if (digits.length === 10) return `+91${digits}`;
        if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
        if (String(phoneNumber || '').startsWith('+')) return phoneNumber;

        return digits ? `+${digits}` : '';
    }

    /**
     * Send a notification when a test is finalized (Moved to DONE)
     */
    async notifyTestCompleted(customerName, customerPhone, testType, autoNumber, totalAmount) {
        if (!this.formatPhoneNumber(customerPhone)) {
            console.warn(`[WhatsApp] Invalid phone number for ${customerName}`);
            return false;
        }

        const formattedType = testType.replace('_', ' ').toUpperCase();

        // The message template
        const message = `*Swastik Gold & Silver Testing*\n\n` +
            `Hello ${customerName}, your ${formattedType} *(Ref: ${autoNumber})* is completed and ready for pickup!\n` +
            `Total Bill: ₹${totalAmount}\n\n` +
            `Thank you for choosing Swastik Lab. You can view your digital report by requesting a PDF link.`;

        return this.sendMessage(customerPhone, message);
    }

    /**
     * Send a digital receipt / certificate link
     */
    async sendDigitalReceipt(customerName, customerPhone, autoNumber, pdfUrl) {
        if (!this.formatPhoneNumber(customerPhone)) return false;

        const message = `*Swastik Lab Digital Receipt*\n\n` +
            `Hello ${customerName}, here is the digital copy of your certificate *(Ref: ${autoNumber})*.\n\n` +
            `Download/View here: ${pdfUrl}\n\n` +
            `Please keep this secure.`;

        return this.sendMessage(customerPhone, message);
    }

    async sendCompletedPacket({
        customerName,
        customerPhone,
        documentLabel,
        autoNumber,
        totalAmount,
        paymentMode,
        pdfUrl,
        verifyUrl,
        expiresAt
    }) {
        if (!this.formatPhoneNumber(customerPhone)) {
            logger.warn(`[WhatsApp] Invalid phone number for ${customerName || autoNumber}`);
            return false;
        }

        const amount = Number(totalAmount || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        const expiry = expiresAt
            ? new Date(expiresAt).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })
            : 'soon';

        const message = `*SWASTIK GOLD AND SILVER LAB*\n\n` +
            `Digital Receipt Ready\n` +
            `Hello ${customerName}, your ${documentLabel} is complete.\n\n` +
            `Reference: ${autoNumber}\n` +
            `Amount: Rs. ${amount}\n` +
            `Payment: ${paymentMode || 'Pending'}\n\n` +
            `Secure PDF: ${pdfUrl}\n` +
            `Verify online: ${verifyUrl}\n\n` +
            `For your privacy, this delivery link expires on ${expiry}.`;

        return this.sendMessage(customerPhone, message);
    }

    /**
     * Core router that directs the message to the configured provider
     */
    async sendMessage(phoneNumber, text) {
        const formattedPhone = this.formatPhoneNumber(phoneNumber);

        if (!formattedPhone) {
            logger.warn('[WhatsApp] Unable to send message because phone formatting failed.');
            return false;
        }

        console.log(`[WhatsApp] Attempting to send message to ${formattedPhone} via ${this.provider}...`);

        try {
            switch (this.provider) {
                case 'ULTRAMSG':
                    return await this._sendUltraMsg(formattedPhone, text);
                case 'TWILIO':
                    return await this._sendTwilio(formattedPhone, text);
                case 'MOCK':
                default:
                    // In Development, just print to console
                    console.log(`\n========== WHATSAPP MOCK ==========`);
                    console.log(`To: ${formattedPhone}`);
                    console.log(`Message:\n${text}`);
                    console.log(`===================================\n`);
                    return true;
            }
        } catch (error) {
            console.error(`[WhatsApp Error] Failed to send message to ${formattedPhone}:`, error.message);
            return false;
        }
    }

    // --- Private Provider Implementations ---

    async _sendUltraMsg(phone, text) {
        const axios = require('axios');
        // UltraMsg requires just phone without '+'
        const to = phone.replace('+', '');
        const url = `https://api.ultramsg.com/${this.ultraMsgInstanceId}/messages/chat`;

        const response = await axios.post(url, {
            token: this.ultraMsgToken,
            to: to,
            body: text
        }, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data;
    }

    async _sendTwilio(phone, text) {
        // Lazy load twilio to save memory if not used
        const client = require('twilio')(this.twilioAccountSid, this.twilioAuthToken);

        const response = await client.messages.create({
            from: `whatsapp:${this.twilioPhoneNumber}`,
            body: text,
            to: `whatsapp:${phone}`
        });
        return response.sid;
    }
}

module.exports = new WhatsAppService();
