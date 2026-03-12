const BaseRepository = require('./baseRepository');
const { transaction } = require('../db/db');

class CertificateRepository extends BaseRepository {
    constructor() {
        super('certificates');
    }

    createComplete(certificateData, items) {
        return transaction(() => {
            const { certificate_no, customer_id, certificate_type, total_weight, total_amount, photo_path, items_count, net_weight } = certificateData;

            const certInfo = this.db.prepare(`
                INSERT INTO certificates (certificate_no, customer_id, certificate_type, total_weight, total_amount, photo_path, status, items_count, net_weight)
                VALUES (?, ?, ?, ?, ?, ?, 'issued', ?, ?)
            `).run(certificate_no, customer_id, certificate_type, total_weight, total_amount, photo_path, items_count || items.length, net_weight || total_weight);

            const certificateId = certInfo.lastInsertRowid;

            if (certificate_type === 'gold' || certificate_type === 'silver') {
                const idPrefix = certificate_type === 'gold' ? 'GCI' : 'SCI';

                // Adjust based on table schema differences
                const insertItem = this.db.prepare(certificate_type === 'gold' ?
                    `INSERT INTO gold_certificate_item (id, certificate_id, item_name, gross_weight, test_weight, purity_percent, rate_per_gram, fine_weight, item_total, sub_certificate_number, is_returned, certificate_required) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` :
                    `INSERT INTO silver_certificate_item (id, certificate_id, item_name, gross_weight, test_weight, purity, rate_per_gram, fine_weight, item_total, metal_type, purity_standard) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                );

                const crypto = require('crypto');

                for (const item of items) {
                    const id = `${idPrefix}${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`;
                    const weightVal = item.gross_weight || item.weight || 0;

                    if (certificate_type === 'gold') {
                        insertItem.run(
                            id, certificateId, item.item_name,
                            weightVal, item.test_weight || 0, item.purity || 0, // purity maps to purity_percent
                            item.rate_per_gram || 0, item.fine_weight || 0, item.item_total || 0,
                            item.sub_certificate_number || null,
                            item.is_returned ? 1 : 0, item.certificate_required === false ? 0 : 1
                        );
                    } else {
                        insertItem.run(
                            id, certificateId, item.item_name,
                            weightVal, item.test_weight || 0, item.purity || 0,
                            item.rate_per_gram || 0, item.fine_weight || 0, item.item_total || 0,
                            'silver', item.purity_standard || 'standard'
                        );
                    }
                }
            } else {
                // Legacy behavior for other types
                const insertItem = this.db.prepare(`
                    INSERT INTO certificate_items (certificate_id, item_name, weight, purity, carat, amount, returned)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `);

                for (const item of items) {
                    insertItem.run(
                        certificateId,
                        item.item_name,
                        item.weight || 0,
                        item.purity || 0,
                        item.carat || '',
                        item.amount || 0,
                        item.returned ? 1 : 0
                    );
                }
            }

            return { id: certificateId, ...certificateData, items };
        })();
    }

    getFullCertificate(id) {
        const certificate = this.db.prepare(`
            SELECT c.*, cust.name as customer_name, cust.phone as customer_phone, cust.address as customer_address
            FROM certificates c
            JOIN customers cust ON c.customer_id = cust.id
            WHERE c.id = ?
        `).get(id);

        if (!certificate) return null;

        let items = [];
        if (certificate.certificate_type === 'gold') {
            items = this.db.prepare(`SELECT * FROM gold_certificate_item WHERE certificate_id = ?`).all(id);
        } else if (certificate.certificate_type === 'silver') {
            items = this.db.prepare(`SELECT * FROM silver_certificate_item WHERE certificate_id = ?`).all(id);
        }

        // Fallback for migration/legacy mixed state
        if (!items || items.length === 0) {
            items = this.db.prepare(`SELECT * FROM certificate_items WHERE certificate_id = ?`).all(id);
        }

        return { ...certificate, items };
    }

    findAll(customerId = null) {
        let query = `
            SELECT c.*, cust.name as customer_name, cust.phone as customer_phone
            FROM certificates c
            JOIN customers cust ON c.customer_id = cust.id
            WHERE c.status != 'deleted'
        `;
        const params = [];
        if (customerId) {
            query += " AND c.customer_id = ?";
            params.push(customerId);
        }
        query += " ORDER BY c.issue_date DESC";
        return this.db.prepare(query).all(...params);
    }

    findByCertificateNo(certNo) {
        const cert = this.db.prepare('SELECT * FROM certificates WHERE certificate_no = ?').get(certNo);
        if (cert) {
            return this.getFullCertificate(cert.id);
        }
        return null;
    }
}

module.exports = new CertificateRepository();
