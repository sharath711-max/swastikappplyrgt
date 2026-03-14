const BaseRepository = require('./baseRepository');
const { db, now, genId, getNextSequence, transaction } = require('../db/db');
const SequenceService = require('../services/sequenceService');
const CertificateCalculationService = require('../services/certificateCalculationService');

class SilverCertificateRepository {
    constructor() {
        this.db = db;
    }

    async create(customer_id, items, status = 'TODO') {
        return transaction(() => {
            const nowObj = new Date();
            const timestamp = nowObj.toISOString();
            const certId = genId('SCR');
            const parentAutoNumber = SequenceService.generateGlobalSequence();

            // 1. Insert Parent
            this.db.prepare(`
                INSERT INTO silver_certificate (id, auto_number, customer_id, status, created, lastmodified)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(certId, parentAutoNumber, customer_id, status, timestamp, timestamp);

            // 2. Insert Items
            const insertedItems = [];
            let itemSeq = 1;
            for (const item of items) {
                const itemId = genId('SCI');
                const itemNumber = `${parentAutoNumber}-${itemSeq++}`;
                const certNum = item.certificate_number || `SC-${getNextSequence('silver_cert_seq')}`;

                // Recalculate to be sure
                const calculated = CertificateCalculationService.calculateSilverItem(item);

                this.db.prepare(`
                    INSERT INTO silver_certificate_item (
                        id, silver_certificate_id, item_number, certificate_number, 
                        name, item_type, gross_weight, test_weight, net_weight, 
                        purity, fine_weight, item_total, returned, created
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    itemId, certId, itemNumber, certNum,
                    item.name || item.item_name || calculated.item_name,
                    item.item_type || item.item_name || calculated.item_name,
                    calculated.gross_weight, calculated.test_weight,
                    calculated.net_weight, calculated.purity, calculated.fine_weight,
                    item.item_total || 0, calculated.is_returned ? 1 : 0, timestamp
                );

                insertedItems.push({
                    id: itemId,
                    item_number: itemNumber,
                    certificate_number: certNum,
                    ...calculated,
                    item_total: item.item_total || 0,
                    created: timestamp
                });
            }

            // 3. Roll-up Totals
            CertificateCalculationService.updateCertificateTotals(certId, this.db);

            return { id: certId, auto_number: parentAutoNumber, items: insertedItems, created: timestamp };
        })();
    }

    findAll(filters = {}) {
        let query = `
            SELECT 
                sc.*, 
                sc.created as created_at,
                c.name as customer_name,
                (SELECT COUNT(*) FROM silver_certificate_item WHERE silver_certificate_id = sc.id AND deletedon IS NULL) as item_count
            FROM silver_certificate sc
            JOIN customer c ON sc.customer_id = c.id
            WHERE sc.deletedon IS NULL
        `;
        const params = [];
        if (filters.status) { query += " AND sc.status = ?"; params.push(filters.status); }
        if (filters.customer_id) { query += " AND sc.customer_id = ?"; params.push(filters.customer_id); }
        if (filters.search) {
            query += ` AND (
                c.name LIKE ? 
                OR c.phone LIKE ? 
                OR sc.auto_number LIKE ? 
                OR EXISTS (SELECT 1 FROM silver_certificate_item sci WHERE sci.silver_certificate_id = sc.id AND sci.item_number LIKE ?)
            )`;
            const s = `%${filters.search}%`;
            params.push(s, s, s, s);
        }
        query += " ORDER BY sc.created DESC";
        if (filters.limit) { query += " LIMIT ? OFFSET ?"; params.push(filters.limit, filters.offset || 0); }

        return this.db.prepare(query).all(...params);
    }

    count(filters = {}) {
        let query = "SELECT COUNT(*) as total FROM silver_certificate sc JOIN customer c ON sc.customer_id = c.id WHERE sc.deletedon IS NULL";
        const params = [];
        if (filters.status) { query += " AND sc.status = ?"; params.push(filters.status); }
        if (filters.customer_id) { query += " AND sc.customer_id = ?"; params.push(filters.customer_id); }
        if (filters.search) {
            query += ` AND (
                c.name LIKE ? 
                OR c.phone LIKE ? 
                OR sc.auto_number LIKE ? 
                OR EXISTS (SELECT 1 FROM silver_certificate_item sci WHERE sci.silver_certificate_id = sc.id AND sci.item_number LIKE ?)
            )`;
            const s = `%${filters.search}%`;
            params.push(s, s, s, s);
        }
        return this.db.prepare(query).get(...params).total;
    }

    findById(id) {
        const cert = this.db.prepare(`
            SELECT sc.*, sc.created as created_at, c.name as customer_name, c.phone as customer_phone
            FROM silver_certificate sc
            JOIN customer c ON sc.customer_id = c.id
            WHERE sc.id = ? AND sc.deletedon IS NULL
        `).get(id);

        if (!cert) return null;

        const items = this.db.prepare(`
            SELECT * FROM silver_certificate_item WHERE silver_certificate_id = ? AND deletedon IS NULL
        `).all(id);

        return { ...cert, items };
    }

    updateStatus(id, status) {
        return transaction(() => {
            const current = this.db.prepare("SELECT status FROM silver_certificate WHERE id = ?").get(id);
            const statusHierarchy = { 'TODO': 1, 'IN_PROGRESS': 2, 'DONE': 3 };

            if (current) {
                if (statusHierarchy[current.status] > statusHierarchy[status]) {
                    throw new Error(`Backward move NOT permitted: Cannot move from ${current.status} to ${status}`);
                }
                if (current.status === 'DONE') {
                    throw new Error('409: Cannot change status of a DONE certificate');
                }
            }

            const nowTs = now();
            return this.db.prepare(`
                UPDATE silver_certificate SET status = ?, lastmodified = ? WHERE id = ? AND deletedon IS NULL
            `).run(status, nowTs, id);
        })();
    }

    /**
     * Update certificate results (purity, payment, etc.)
     */
    updateResults(id, data) {
        return transaction(() => {
            const current = this.findById(id);
            if (!current) throw new Error('Certificate not found');
            if (current.status === 'DONE') throw new Error('409: Certificate is immutable');

            const { items, mode_of_payment, gst, total, total_tax, gst_bill_number } = data;

            // 1. Update Items (Purity, Returned, etc.)
            if (items && Array.isArray(items)) {
                for (const item of items) {
                    if (item.id) {
                        // Repository updateItem handles calculations and parent roll-up
                        this.updateItem(id, item.id, item);
                    }
                }
            }

            // 2. Update Parent Financials
            const updates = [];
            const values = [];

            if (mode_of_payment !== undefined) { updates.push('mode_of_payment = ?'); values.push(mode_of_payment); }
            if (gst !== undefined) { updates.push('gst = ?'); values.push(gst); }
            if (total !== undefined) { updates.push('total = ?'); values.push(total); }
            if (total_tax !== undefined) { updates.push('total_tax = ?'); values.push(total_tax); }
            if (gst_bill_number !== undefined) { updates.push('gst_bill_number = ?'); values.push(gst_bill_number); }

            if (updates.length > 0) {
                values.push(now(), id);
                this.db.prepare(`
                    UPDATE silver_certificate 
                    SET ${updates.join(', ')}, lastmodified = ? 
                    WHERE id = ?
                `).run(...values);
            }

            return this.findById(id);
        })();
    }

    /**
     * Finalize (Set status to DONE)
     */
    finalize(id) {
        return transaction(() => {
            const result = this.updateStatus(id, 'DONE');
            // Force one last roll-up
            CertificateCalculationService.updateCertificateTotals(id, this.db);
            return result;
        })();
    }

    updateItem(certId, itemId, updates) {
        return transaction(() => {
            const parent = this.db.prepare('SELECT status FROM silver_certificate WHERE id = ?').get(certId);
            if (parent && parent.status === 'DONE') {
                throw new Error('409: Parent certificate is DONE and items cannot be modified');
            }

            const currentItem = this.db.prepare(`
                SELECT * FROM silver_certificate_item WHERE id = ? AND silver_certificate_id = ? AND deletedon IS NULL
            `).get(itemId, certId);

            if (!currentItem) throw new Error('Item not found');

            const mergedInput = { ...currentItem, ...updates };
            const calculated = CertificateCalculationService.calculateSilverItem({
                gross_weight: mergedInput.gross_weight,
                test_weight: mergedInput.test_weight,
                purity: mergedInput.purity,
                is_returned: mergedInput.returned == 1 || mergedInput.returned === true,
                item_name: mergedInput.name || mergedInput.item_type
            });

            const fieldsToUpdate = {
                name: mergedInput.name,
                item_type: mergedInput.item_type,
                gross_weight: calculated.gross_weight,
                test_weight: calculated.test_weight,
                net_weight: calculated.net_weight,
                purity: calculated.purity,
                fine_weight: calculated.fine_weight,
                item_total: updates.item_total !== undefined ? updates.item_total : mergedInput.item_total || 0,
                returned: calculated.is_returned ? 1 : 0,
                certificate_number: mergedInput.certificate_number
            };

            const fields = Object.keys(fieldsToUpdate).map(k => `${k} = ?`).join(', ');
            const values = [...Object.values(fieldsToUpdate), itemId, certId];

            const result = this.db.prepare(`
                UPDATE silver_certificate_item SET ${fields}
                WHERE id = ? AND silver_certificate_id = ? AND deletedon IS NULL
            `).run(...values);

            if (result.changes > 0) {
                CertificateCalculationService.updateCertificateTotals(certId, this.db);
            }

            return result;
        })();
    }

    softDelete(id) {
        return transaction(() => {
            const current = this.db.prepare('SELECT status FROM silver_certificate WHERE id = ?').get(id);
            if (current && current.status === 'DONE') throw new Error('409: Cannot delete a DONE certificate');

            const timestamp = now();
            this.db.prepare("UPDATE silver_certificate SET deletedon = ?, lastmodified = ? WHERE id = ?").run(timestamp, timestamp, id);
            this.db.prepare("UPDATE silver_certificate_item SET deletedon = ? WHERE silver_certificate_id = ?").run(timestamp, id);
        })();
    }
}

module.exports = new SilverCertificateRepository();
