const { db } = require('../db/db');
const goldTestRepository = require('../repositories/goldTestRepository');
const silverTestRepository = require('../repositories/silverTestRepository');
const goldCertificateRepository = require('../repositories/goldCertificateRepository');
const silverCertificateRepository = require('../repositories/silverCertificateRepository');
const photoCertificateRepository = require('../repositories/photoCertificateRepository');

class RecordService {
    async getRecord(type, id) {
        let record = null;
        let recordType = type; // normalized type

        switch (type) {
            // --- PARENTS ---
            case 'gold-tests':
                record = goldTestRepository.findById(id);
                // record includes items
                break;
            case 'silver-tests':
                record = silverTestRepository.findById(id);
                break;
            case 'gold-certificates':
                record = goldCertificateRepository.findById(id);
                break;
            case 'silver-certificates':
                record = silverCertificateRepository.findById(id);
                break;
            case 'photo-certificates':
                record = photoCertificateRepository.findById(id);
                break;

            // --- ITEMS ---
            // For items, we fetch the row and also try to link to parent
            case 'gold-test-items':
                record = db.prepare(`
                    SELECT t.*, p.customer_id, c.name as customer_name, p.status as parent_status 
                    FROM gold_test_item t
                    JOIN gold_test p ON t.gold_test_id = p.id
                    JOIN customer c ON p.customer_id = c.id
                    WHERE t.id = ? AND t.deletedon IS NULL
                `).get(id);
                if (record) record.parent_type = 'gold-tests';
                break;

            case 'silver-test-items':
                record = db.prepare(`
                    SELECT t.*, p.customer_id, c.name as customer_name, p.status as parent_status 
                    FROM silver_test_item t
                    JOIN silver_test p ON t.silver_test_id = p.id
                    JOIN customer c ON p.customer_id = c.id
                    WHERE t.id = ? AND t.deletedon IS NULL
                `).get(id);
                if (record) record.parent_type = 'silver-tests';
                break;

            case 'gold-certificate-items':
                record = db.prepare(`
                    SELECT t.*, p.customer_id, c.name as customer_name, p.status as parent_status 
                    FROM gold_certificate_item t
                    JOIN gold_certificate p ON t.gold_certificate_id = p.id
                    JOIN customer c ON p.customer_id = c.id
                    WHERE t.id = ? AND t.deletedon IS NULL
                `).get(id);
                if (record) record.parent_type = 'gold-certificates';
                break;

            case 'silver-certificate-items':
                record = db.prepare(`
                    SELECT t.*, p.customer_id, c.name as customer_name, p.status as parent_status 
                    FROM silver_certificate_item t
                    JOIN silver_certificate p ON t.silver_certificate_id = p.id
                    JOIN customer c ON p.customer_id = c.id
                    WHERE t.id = ? AND t.deletedon IS NULL
                `).get(id);
                if (record) record.parent_type = 'silver-certificates';
                break;

            case 'photo-certificate-items':
                record = db.prepare(`
                    SELECT t.*, p.customer_id, c.name as customer_name, p.status as parent_status 
                    FROM photo_certificate_item t
                    JOIN photo_certificate p ON t.photo_certificate_id = p.id
                    JOIN customer c ON p.customer_id = c.id
                    WHERE t.id = ? AND t.deletedon IS NULL
                `).get(id);
                if (record) record.parent_type = 'photo-certificates';
                break;

            // --- HISTORY ---
            case 'credit-history':
                record = db.prepare(`
                    SELECT h.*, c.name as customer_name 
                    FROM credit_history h
                    JOIN customer c ON h.customer_id = c.id
                    WHERE h.id = ?
                `).get(id);
                break;

            case 'weight-loss-history':
                record = db.prepare(`
                    SELECT h.*, c.name as customer_name 
                    FROM weight_loss_history h
                    JOIN customer c ON h.customer_id = c.id
                    WHERE h.id = ?
                `).get(id);
                break;

            default:
                throw new Error('Invalid record type or not implemented');
        }

        if (!record) {
            // For items, check if strict or not. 
            // If manual "record page" request, simpler to throw
            return null;
        }

        return { type, data: record };
    }
}

module.exports = new RecordService();
