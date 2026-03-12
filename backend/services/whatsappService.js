const axios = require('axios');
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

    /**
     * Send a notification when a test is finalized (Moved to DONE)
     */
    async notifyTestCompleted(customerName, customerPhone, testType, autoNumber, totalAmount) {
        if (!customerPhone || customerPhone.length < 10) {
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
        if (!customerPhone || customerPhone.length < 10) return false;

        const message = `*Swastik Lab Digital Receipt*\n\n` +
            `Hello ${customerName}, here is the digital copy of your certificate *(Ref: ${autoNumber})*.\n\n` +
            `Download/View here: ${pdfUrl}\n\n` +
            `Please keep this secure.`;

        return this.sendMessage(customerPhone, message);
    }

    /**
     * Core router that directs the message to the configured provider
     */
    async sendMessage(phoneNumber, text) {
        // Ensure phone number starts with country code, default to India +91 if 10 digits
        const formattedPhone = (phoneNumber.length === 10) ? `+91${phoneNumber}` : phoneNumber;

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
