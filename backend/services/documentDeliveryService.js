const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const goldTestService = require('./goldTestService');
const silverTestService = require('./silverTestService');
const certificateService = require('./certificateService');
const whatsappService = require('./whatsappService');
const logger = require('../utils/logger');
const { generateDeliveryDocumentHTML } = require('../utils/deliveryDocumentTemplate');
const { getJwtSecret } = require('../config/env');

const DELIVERY_SCOPE = 'workflow_delivery_document';
const PDF_CACHE_DIR = path.join(__dirname, '..', 'tmp', 'delivery-pdfs');
const IMAGE_MIME_TYPES = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp'
};

class DocumentDeliveryService {
    constructor() {
        fs.mkdirSync(PDF_CACHE_DIR, { recursive: true });
    }

    isFastTestMode() {
        return process.env.NODE_ENV === 'test' && process.env.ENABLE_REAL_DELIVERY_IN_TESTS !== 'true';
    }

    getPublicBaseUrl() {
        return (
            process.env.PUBLIC_BASE_URL ||
            process.env.APP_PUBLIC_URL ||
            process.env.BACKEND_PUBLIC_URL ||
            `http://localhost:${process.env.PORT || 5000}`
        ).replace(/\/+$/, '');
    }

    getTokenSecret() {
        return process.env.DELIVERY_SIGNING_SECRET || getJwtSecret();
    }

    getLinkTtlHours() {
        const raw = Number.parseInt(process.env.DELIVERY_LINK_TTL_HOURS || '168', 10);
        return Number.isFinite(raw) && raw > 0 ? raw : 168;
    }

    getDocumentLabel(type) {
        const labels = {
            gold: 'Gold Test Certificate',
            silver: 'Silver Test Certificate',
            gold_cert: 'Gold Certificate',
            silver_cert: 'Silver Certificate',
            photo_cert: 'Photo Certificate'
        };

        return labels[type] || type;
    }

    issueSecureToken({ type, id, autoNumber }) {
        return jwt.sign(
            {
                scope: DELIVERY_SCOPE,
                type,
                id,
                autoNumber
            },
            this.getTokenSecret(),
            { expiresIn: `${this.getLinkTtlHours()}h` }
        );
    }

    verifySecureToken(token) {
        const payload = jwt.verify(token, this.getTokenSecret());
        if (payload.scope !== DELIVERY_SCOPE) {
            throw new Error('Invalid delivery token.');
        }
        return payload;
    }

    getLinkExpiryIso() {
        return new Date(Date.now() + this.getLinkTtlHours() * 60 * 60 * 1000).toISOString();
    }

    buildVerifyUrl(autoNumber) {
        return `${this.getPublicBaseUrl()}/verify/${encodeURIComponent(autoNumber)}`;
    }

    buildSecurePdfUrl(type, id, autoNumber) {
        const token = this.issueSecureToken({ type, id, autoNumber });
        return `${this.getPublicBaseUrl()}/api/public/documents/${encodeURIComponent(token)}`;
    }

    async deliverCompletedRecord(type, id) {
        const record = await this.loadCompletedRecord(type, id);
        const pdfUrl = this.buildSecurePdfUrl(type, id, record.auto_number);
        const verifyUrl = this.buildVerifyUrl(record.auto_number);
        const expiresAt = this.getLinkExpiryIso();

        if (this.isFastTestMode()) {
            return {
                ok: true,
                skipped: true,
                pdfGenerated: false,
                pdfUrl,
                verifyUrl,
                expiresAt,
                message: 'Moved to Completed and prepared the delivery packet.'
            };
        }

        const pdf = await this.ensurePdf(type, record);

        if (!this.hasDeliverablePhone(record.customer_phone)) {
            logger.warn('Skipping workflow delivery because customer phone is missing.', {
                type,
                id,
                autoNumber: record.auto_number
            });

            return {
                ok: false,
                skipped: true,
                pdfGenerated: true,
                pdfFile: pdf.filename,
                pdfUrl,
                verifyUrl,
                expiresAt,
                message: 'Moved to Completed. PDF is ready, but the customer does not have a valid phone number on file.'
            };
        }

        const sent = await whatsappService.sendCompletedPacket({
            customerName: record.customer_name,
            customerPhone: record.customer_phone,
            documentLabel: this.getDocumentLabel(type),
            autoNumber: record.auto_number,
            totalAmount: Number(record.total || 0),
            paymentMode: record.mode_of_payment || 'Pending',
            pdfUrl,
            verifyUrl,
            expiresAt
        });

        return {
            ok: !!sent,
            skipped: false,
            pdfGenerated: true,
            pdfFile: pdf.filename,
            pdfUrl,
            verifyUrl,
            expiresAt,
            message: sent
                ? 'Moved to Completed and sent the secure receipt packet to the customer phone.'
                : 'Moved to Completed. PDF is ready, but the phone delivery provider did not confirm receipt.'
        };
    }

    async getPdfByToken(token) {
        const payload = this.verifySecureToken(token);
        const record = await this.loadCompletedRecord(payload.type, payload.id);

        if (!record || record.auto_number !== payload.autoNumber) {
            throw new Error('Document not found.');
        }

        const pdf = await this.ensurePdf(payload.type, record);

        return {
            filePath: pdf.filePath,
            filename: pdf.filename,
            record,
            payload
        };
    }

    async loadCompletedRecord(type, id) {
        let record = null;

        switch (type) {
            case 'gold':
                record = await goldTestService.getTestDetails(id);
                break;
            case 'silver':
                record = await silverTestService.getTestDetails(id);
                break;
            case 'gold_cert':
                record = await certificateService.getCertificate('gold', id);
                break;
            case 'silver_cert':
                record = await certificateService.getCertificate('silver', id);
                break;
            case 'photo_cert':
                record = await certificateService.getCertificate('photo', id);
                break;
            default:
                throw new Error(`Unsupported workflow type: ${type}`);
        }

        if (!record) {
            throw new Error('Completed record not found.');
        }

        if (record.status !== 'DONE') {
            throw new Error('The record is not complete yet.');
        }

        return record;
    }

    hasDeliverablePhone(phone) {
        const digits = String(phone || '').replace(/\D/g, '');
        return digits.length >= 10;
    }

    getPdfFilename(type, record) {
        const safeAutoNumber = String(record.auto_number || record.id || 'document')
            .replace(/[^A-Za-z0-9_-]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        return `${safeAutoNumber}-${type}-packet.pdf`;
    }

    getPdfPath(type, record) {
        return path.join(PDF_CACHE_DIR, this.getPdfFilename(type, record));
    }

    ensureDirectoryExists(filePath) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    ensurePdf(type, record) {
        const filePath = this.getPdfPath(type, record);
        const filename = this.getPdfFilename(type, record);

        if (fs.existsSync(filePath)) {
            return Promise.resolve({ filePath, filename, created: false });
        }

        this.ensureDirectoryExists(filePath);
        return this.generatePdf(type, record, filePath).then(() => ({
            filePath,
            filename,
            created: true
        }));
    }

    async generatePdf(type, record, filePath) {
        let chromium;
        try {
            ({ chromium } = require('playwright'));
        } catch (error) {
            throw new Error('PDF generation is unavailable because Playwright is not installed.');
        }

        const html = generateDeliveryDocumentHTML({
            record: this.normalizeRecord(type, record),
            verifyUrl: this.buildVerifyUrl(record.auto_number),
            generatedAt: new Date().toISOString()
        });

        const browser = await chromium.launch({ headless: true });
        try {
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle' });
            await page.pdf({
                path: filePath,
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '0',
                    right: '0',
                    bottom: '0',
                    left: '0'
                }
            });
        } finally {
            await browser.close();
        }
    }

    normalizeRecord(type, record) {
        const items = (record.items || []).map((item, index) => ({
            reference: item.certificate_number || item.item_number || `Item-${index + 1}`,
            name: item.name || item.item_type || `Item ${index + 1}`,
            grossWeight: Number(item.gross_weight || item.total_weight || item.weight || 0),
            testWeight: Number(item.test_weight || item.sample_weight || 0),
            netWeight: Number(
                item.net_weight !== undefined && item.net_weight !== null
                    ? item.net_weight
                    : item.gross_weight || item.total_weight || item.weight || 0
            ),
            purity: Number.isFinite(Number(item.purity)) ? Number(item.purity) : null,
            amount: Number(item.item_total || 0),
            returned: Boolean(item.returned),
            photoDataUri: this.readPhotoDataUri(item.media || item.media_path)
        }));

        const calculatedTotal = items.reduce((sum, item) => sum + item.amount, 0);

        return {
            label: this.getDocumentLabel(type),
            autoNumber: record.auto_number || record.id,
            customerName: record.customer_name || 'Walk-in customer',
            customerPhone: record.customer_phone || 'Not provided',
            paymentMode: record.mode_of_payment || 'Pending',
            issueDate: record.done_at || record.lastmodified || record.created_at || record.created,
            totalAmount: Number(record.total || calculatedTotal || 0),
            items
        };
    }

    readPhotoDataUri(mediaPath) {
        if (!mediaPath) return null;

        const normalized = String(mediaPath).replace(/^\/+/, '').replace(/\//g, path.sep);
        const absolutePath = path.isAbsolute(normalized)
            ? normalized
            : path.join(__dirname, '..', normalized);

        if (!fs.existsSync(absolutePath)) return null;

        const ext = path.extname(absolutePath).toLowerCase();
        const mimeType = IMAGE_MIME_TYPES[ext];
        if (!mimeType) return null;

        const buffer = fs.readFileSync(absolutePath);
        return `data:${mimeType};base64,${buffer.toString('base64')}`;
    }
}

module.exports = new DocumentDeliveryService();
