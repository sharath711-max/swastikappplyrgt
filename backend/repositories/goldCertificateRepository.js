const BaseRepository = require('./baseRepository');
const { db, now, genId, getNextSequence, transaction } = require('../db/db');
const SequenceService = require('../services/sequenceService');
const CertificateCalculationService = require('../services/certificateCalculationService');

class GoldCertificateRepository {
    constructor() {
        this.db = db;
    }

    async create(customer_id, items, data, status = 'TODO') {
        const { mode_of_payment = 'Cash', gst = 0, gst_bill_number = '', total_tax = 0 } = data;

        return transaction(() => {
            const nowObj = new Date();
            const timestamp = nowObj.toISOString();
            const certId = genId('GCR');
            const parentAutoNumber = SequenceService.generateGlobalSequence();

            // 1. Insert Parent (Initial values, will be updated by roll-up)
            this.db.prepare(`
                INSERT INTO gold_certificate (
                    id, auto_number, customer_id, status, mode_of_payment, total, 
                    gst, gst_bill_number, total_tax, created, lastmodified
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                certId, parentAutoNumber, customer_id, status, mode_of_payment, 0,
                gst ? 1 : 0, gst_bill_number, total_tax, timestamp, timestamp
            );

            // 2. Insert Items
            const insertedItems = [];
            let itemSeq = 1;
            for (const item of items) {
                const itemId = genId('GCI');
                const itemNumber = `${parentAutoNumber}-${itemSeq++}`;

                // Authoritative calculation
                const calculated = CertificateCalculationService.calculateGoldItem({
                    ...item,
                    is_returned: item.returned
                });

                this.db.prepare(`
                    INSERT INTO gold_certificate_item (
                        id, gold_certificate_id, item_number, item_type,
                        gross_weight, test_weight, net_weight, purity,
                        returned, created, certificate_number, name
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    itemId, certId, itemNumber, item.item_type || 'Item',
                    calculated.gross_weight, calculated.test_weight, calculated.net_weight, calculated.purity,
                    calculated.is_returned ? 1 : 0, timestamp, item.certificate_number || `A${String(itemSeq - 1).padStart(2, '0')}`, item.name || ''
                );

                insertedItems.push({
                    id: itemId,
                    item_number: itemNumber,
                    ...calculated,
                    created: timestamp
                });
            }

            // 3. Roll-up Totals to Parent
            // we use the synchronous version of the DB here usually, but the service is async-ready
            // Since we are in a transaction, let's call the logic directly or ensure updateCertificateTotals works with the raw db
            CertificateCalculationService.updateCertificateTotals(certId, this.db);

            return { id: certId, auto_number: parentAutoNumber, items: insertedItems, created: timestamp };
        })();
    }

    findAll(filters = {}) {
        let query = `
            SELECT 
                gc.*, 
                gc.created as created_at,
                c.name as customer_name,
                (SELECT COUNT(*) FROM gold_certificate_item WHERE gold_certificate_id = gc.id AND deletedon IS NULL) as item_count
            FROM gold_certificate gc
            JOIN customer c ON gc.customer_id = c.id
            WHERE gc.deletedon IS NULL
        `;
        const params = [];
        if (filters.status) { query += " AND gc.status = ?"; params.push(filters.status); }
        if (filters.customer_id) { query += " AND gc.customer_id = ?"; params.push(filters.customer_id); }
        if (filters.search) {
            query += ` AND (
                c.name LIKE ? 
                OR c.phone LIKE ? 
                OR gc.auto_number LIKE ? 
                OR EXISTS (SELECT 1 FROM gold_certificate_item gci WHERE gci.gold_certificate_id = gc.id AND gci.item_number LIKE ?)
            )`;
            const s = `%${filters.search}%`;
            params.push(s, s, s, s);
        }
        query += " ORDER BY gc.created DESC";
        if (filters.limit) { query += " LIMIT ? OFFSET ?"; params.push(filters.limit, filters.offset || 0); }

        return this.db.prepare(query).all(...params);
    }

    count(filters = {}) {
        let query = "SELECT COUNT(*) as total FROM gold_certificate gc JOIN customer c ON gc.customer_id = c.id WHERE gc.deletedon IS NULL";
        const params = [];
        if (filters.status) { query += " AND gc.status = ?"; params.push(filters.status); }
        if (filters.customer_id) { query += " AND gc.customer_id = ?"; params.push(filters.customer_id); }
        if (filters.search) {
            query += ` AND (
                c.name LIKE ? 
                OR c.phone LIKE ? 
                OR gc.auto_number LIKE ? 
                OR EXISTS (SELECT 1 FROM gold_certificate_item gci WHERE gci.gold_certificate_id = gc.id AND gci.item_number LIKE ?)
            )`;
            const s = `%${filters.search}%`;
            params.push(s, s, s, s);
        }
        return this.db.prepare(query).get(...params).total;
    }

    findById(id) {
        const cert = this.db.prepare(`
            SELECT gc.*, gc.created as created_at, c.name as customer_name, c.phone as customer_phone
            FROM gold_certificate gc
            JOIN customer c ON gc.customer_id = c.id
            WHERE gc.id = ? AND gc.deletedon IS NULL
        `).get(id);

        if (!cert) return null;

        const items = this.db.prepare(`
            SELECT * FROM gold_certificate_item WHERE gold_certificate_id = ? AND deletedon IS NULL
        `).all(id);

        return { ...cert, items };
    }

    updateStatus(id, status) {
        return transaction(() => {
            const current = this.db.prepare("SELECT status FROM gold_certificate WHERE id = ?").get(id);
            const statusHierarchy = { 'TODO': 1, 'IN_PROGRESS': 2, 'DONE': 3 };

            if (current) {
                if (statusHierarchy[current.status] > statusHierarchy[status]) {
                    throw new Error(`Backward move NOT permitted: Cannot move from ${current.status} to ${status}`);
                }
                if (current.status === 'DONE') {
                    throw new Error('409: Cannot update status of a DONE certificate');
                }
            }

            return this.db.prepare(`
                UPDATE gold_certificate SET status = ?, lastmodified = ? WHERE id = ? AND deletedon IS NULL
            `).run(status, now(), id);
        })();
    }

    async updateItem(certId, itemId, updates) {
        return transaction(() => {
            // 0. Check Status (Immutability)
            const parent = this.db.prepare(`SELECT status FROM gold_certificate WHERE id = ?`).get(certId);
            if (parent && parent.status === 'DONE') {
                throw new Error('Cannot edit items of a DONE certificate');
            }

            // 1. Get current item data to merge updates
            const currentItem = this.db.prepare(`
                SELECT * FROM gold_certificate_item WHERE id = ? AND gold_certificate_id = ?
            `).get(itemId, certId);

            if (!currentItem) throw new Error('Item not found');

            // 2. Re-calculate with new updates
            const mergedInput = { ...currentItem, ...updates };
            const calculated = CertificateCalculationService.calculateGoldItem({
                ...mergedInput,
                is_returned: mergedInput.returned == 1
            });

            // 3. Update database
            const fieldsToUpdate = {
                item_type: mergedInput.item_type,
                name: mergedInput.name,
                gross_weight: calculated.gross_weight,
                test_weight: calculated.test_weight,
                net_weight: calculated.net_weight,
                purity: calculated.purity,
                returned: calculated.is_returned ? 1 : 0,
                certificate_number: mergedInput.certificate_number
            };

            const fields = Object.keys(fieldsToUpdate).map(k => `${k} = ?`).join(', ');
            const values = [...Object.values(fieldsToUpdate), itemId, certId];

            this.db.prepare(`
                UPDATE gold_certificate_item SET ${fields}
                WHERE id = ? AND gold_certificate_id = ? AND deletedon IS NULL
            `).run(...values);

            // 4. Update parent roll-up
            CertificateCalculationService.updateCertificateTotals(certId, this.db);

            return { success: true };
        })();
    }

    softDelete(id) {
        return transaction(() => {
            const timestamp = now();
            this.db.prepare("UPDATE gold_certificate SET deletedon = ?, lastmodified = ? WHERE id = ?").run(timestamp, timestamp, id);
            this.db.prepare("UPDATE gold_certificate_item SET deletedon = ? WHERE gold_certificate_id = ?").run(timestamp, id);
        })();
    }
}

module.exports = new GoldCertificateRepository();
