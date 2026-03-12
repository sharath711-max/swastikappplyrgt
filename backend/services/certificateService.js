const goldCertificateRepository = require('../repositories/goldCertificateRepository');
const silverCertificateRepository = require('../repositories/silverCertificateRepository');
const photoCertificateRepository = require('../repositories/photoCertificateRepository');
const customerRepository = require('../repositories/customerRepository');
const billingService = require('./billingService');
const Decimal = require('decimal.js');
const { ValidationError } = require('../utils/errors');
const CertificateCalculationService = require('./certificateCalculationService');

class CertificateService {
    calculateGoldItem(input) {
        return CertificateCalculationService.calculateGoldItem(input);
    }

    calculateSilverItem(input) {
        return CertificateCalculationService.calculateSilverItem(input);
    }

    async generateCertificate(data) {
        const { customer_id, items, type, status, mode_of_payment, total, gst, gst_bill_number, total_tax } = data;

        // 1. Verify customer
        const customer = customerRepository.findById(customer_id);
        if (!customer) throw new Error('Customer not found');

        // 2. Process items
        const processedItems = items.map(item => {
            if (type === 'gold') {
                const calcs = this.calculateGoldItem(item);
                return { ...item, ...calcs };
            } else if (type === 'silver') {
                const calcs = this.calculateSilverItem(item);
                return { ...item, ...calcs };
            } else if (type === 'photo') {
                const bill = billingService.calculateCertificateBill(1, gst);
                return {
                    ...item,
                    item_total: bill.netAmount,
                    gross_weight: parseFloat(item.gross_weight || item.weight || 0),
                    test_weight: parseFloat(item.test_weight || 0),
                    purity: parseFloat(item.purity || 0)
                };
            }
            return item;
        });

        // 3. Dispatch to Repo
        let result;
        if (type === 'gold') {
            result = await goldCertificateRepository.create(customer_id, processedItems, {
                mode_of_payment, total, gst, gst_bill_number, total_tax
            }, status);
        } else if (type === 'silver') {
            result = await silverCertificateRepository.create(customer_id, processedItems, status);
        } else if (type === 'photo') {
            result = await photoCertificateRepository.create(customer_id, processedItems, {
                mode_of_payment, total, gst, gst_bill_number, total_tax
            }, status);
        } else {
            throw new Error('Invalid certificate type');
        }

        return result;
    }

    async getCertificate(type, id) {
        if (type === 'gold') return goldCertificateRepository.findById(id);
        if (type === 'silver') return silverCertificateRepository.findById(id);
        if (type === 'photo') return photoCertificateRepository.findById(id);
        throw new Error('Invalid certificate type');
    }

    async listCertificates(type, filters) {
        if (type === 'gold') return goldCertificateRepository.findAll(filters);
        if (type === 'silver') return silverCertificateRepository.findAll(filters);
        if (type === 'photo') return photoCertificateRepository.findAll(filters);
        throw new Error('Invalid certificate type');
    }

    async updateStatus(type, id, status) {
        if (type === 'gold') return goldCertificateRepository.updateStatus(id, status);
        if (type === 'silver') return silverCertificateRepository.updateStatus(id, status);
        if (type === 'photo') return photoCertificateRepository.updateStatus(id, status);
        throw new Error('Invalid certificate type');
    }

    async getCertificateByNo(id) {
        // Infer type from ID prefix
        let type;
        if (id.startsWith('GCR')) type = 'gold';
        else if (id.startsWith('SCR')) type = 'silver';
        else if (id.startsWith('PCR')) type = 'photo';
        else throw new Error('Invalid certificate ID format');

        return this.getCertificate(type, id);
    }

    // Add update item methods dispatching to repositories if needed

    async saveResults(type, id, data) {
        const { items, mode_of_payment, total, gst } = data;

        if (type === 'photo') {
            // Update items
            for (const item of items) {
                const updates = {};
                if (item.media !== undefined) updates.media_path = item.media;
                if (item.purity !== undefined) updates.purity = parseFloat(item.purity);

                await photoCertificateRepository.updateItem(id, item.id, updates);
            }
            // Update Parent
            if (mode_of_payment !== undefined || total !== undefined || gst !== undefined) {
                const cert = await photoCertificateRepository.findById(id);
                if (cert) {
                    await photoCertificateRepository.updatePayment(
                        id,
                        mode_of_payment || cert.mode_of_payment,
                        total !== undefined ? total : cert.total,
                        gst !== undefined ? gst : cert.gst
                    );
                }
            }
            return { success: true };
        } else if (type === 'silver') {
            return silverCertificateRepository.updateResults(id, data);
        } else if (type === 'gold') {
            // Forward to existing logic if needed
            throw new Error('Update not implemented for gold via certificateService');
        }

        return { success: false, error: 'Unknown type' };
    }
}

module.exports = new CertificateService();
