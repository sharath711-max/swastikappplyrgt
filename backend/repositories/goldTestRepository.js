const BaseRepository = require('./baseRepository');
const { db, now, genId, getNextSequence, transaction } = require('../db/db');
const SequenceService = require('../services/sequenceService');
const GoldTestCalculationService = require('../services/goldTestCalculationService');

class GoldTestRepository {
    constructor() {
        this.db = db;
    }

    async create(customer_id, items, status = 'TODO', mode_of_payment = 'Cash') {
        return transaction(() => {
            const nowObj = new Date();
            const timestamp = nowObj.toISOString();
            const testId = genId('GTS');
            const parentAutoNumber = SequenceService.generateGlobalSequence();

            // 1. Insert parent
            this.db.prepare(`
                INSERT INTO gold_test (id, auto_number, customer_id, status, mode_of_payment, total, created, lastmodified)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(testId, parentAutoNumber, customer_id, status, mode_of_payment, 0, timestamp, timestamp);

            // 2. Insert items
            const insertedItems = [];
            let itemSeq = 1;
            for (const item of items) {
                const itemId = genId('GTI');
                const itemNumber = `${parentAutoNumber}-${itemSeq++}`;

                // Use Calculation Authority
                const calculated = GoldTestCalculationService.calculateItem({
                    gross_weight: item.gross_weight || item.weight || item.total_weight || 0,
                    test_weight: item.test_weight || item.sample_weight || 0,
                    purity: item.purity || 0,
                    returned: item.returned || false,
                    item_type: item.item_type || item.item_name || 'Gold Sample'
                });

                this.db.prepare(`
                    INSERT INTO gold_test_item (
                        id, gold_test_id, item_number, item_type, 
                        gross_weight, sample_weight, test_weight, net_weight,
                        purity, fine_weight, item_total,
                        returned, created
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    itemId, testId, itemNumber, calculated.item_type,
                    calculated.gross_weight,
                    item.sample_weight || calculated.test_weight, // Keep raw sample_weight if provided
                    calculated.test_weight,
                    calculated.net_weight,
                    calculated.purity,
                    calculated.fine_weight,
                    calculated.item_total,
                    calculated.returned ? 1 : 0,
                    timestamp
                );

                insertedItems.push({
                    id: itemId,
                    item_number: itemNumber,
                    ...calculated,
                    created: timestamp
                });
            }

            // 3. Roll-up Totals
            GoldTestCalculationService.updateParentTotals(testId, this.db);

            return { id: testId, auto_number: parentAutoNumber, items: insertedItems, created: timestamp };
        })();
    }

    findAll(filters = {}) {
        let query = `
            SELECT 
                gt.*, 
                gt.created as created_at, 
                c.name as customer_name,
                (SELECT COUNT(*) FROM gold_test_item WHERE gold_test_id = gt.id AND deletedon IS NULL) as item_count
            FROM gold_test gt
            JOIN customer c ON gt.customer_id = c.id
            WHERE gt.deletedon IS NULL
        `;
        const params = [];

        if (filters.status) {
            query += " AND gt.status = ?";
            params.push(filters.status);
        }
        if (filters.customer_id) {
            query += " AND gt.customer_id = ?";
            params.push(filters.customer_id);
        }
        if (filters.search) {
            // Updated search to support auto_number and child item_number
            query += ` AND (
                c.name LIKE ? 
                OR c.phone LIKE ? 
                OR gt.auto_number LIKE ? 
                OR EXISTS (SELECT 1 FROM gold_test_item gti WHERE gti.gold_test_id = gt.id AND gti.item_number LIKE ?)
            )`;
            const s = `%${filters.search}%`;
            params.push(s, s, s, s);
        }

        query += " ORDER BY gt.created DESC";
        if (filters.limit) {
            query += " LIMIT ? OFFSET ?";
            params.push(filters.limit, filters.offset || 0);
        }

        return this.db.prepare(query).all(...params);
    }

    count(filters = {}) {
        let query = "SELECT COUNT(*) as total FROM gold_test gt JOIN customer c ON gt.customer_id = c.id WHERE gt.deletedon IS NULL";
        const params = [];
        if (filters.status) { query += " AND gt.status = ?"; params.push(filters.status); }
        if (filters.customer_id) { query += " AND gt.customer_id = ?"; params.push(filters.customer_id); }
        if (filters.search) {
            query += ` AND (
                c.name LIKE ? 
                OR c.phone LIKE ? 
                OR gt.auto_number LIKE ? 
                OR EXISTS (SELECT 1 FROM gold_test_item gti WHERE gti.gold_test_id = gt.id AND gti.item_number LIKE ?)
            )`;
            const s = `%${filters.search}%`;
            params.push(s, s, s, s);
        }

        return this.db.prepare(query).get(...params).total;
    }

    findById(id) {
        const test = this.db.prepare(`
            SELECT gt.*, gt.created as created_at, c.name as customer_name, c.phone as customer_phone
            FROM gold_test gt
            JOIN customer c ON gt.customer_id = c.id
            WHERE gt.id = ? AND gt.deletedon IS NULL
        `).get(id);

        if (!test) return null;

        const items = this.db.prepare(`
            SELECT * FROM gold_test_item WHERE gold_test_id = ? AND deletedon IS NULL
        `).all(id);

        return { ...test, items };
    }

    updateStatus(id, status) {
        const timestamp = now();

        // No Backward Move Rule
        const current = this.db.prepare("SELECT status FROM gold_test WHERE id = ?").get(id);
        const statusHierarchy = { 'TODO': 1, 'IN_PROGRESS': 2, 'DONE': 3 };

        if (current) {
            if (statusHierarchy[current.status] > statusHierarchy[status]) {
                throw new Error(`Backward move NOT permitted: Cannot move from ${current.status} to ${status}`);
            }
            if (current.status === 'DONE') {
                throw new Error('409: Cannot update status of a DONE test');
            }
        }

        let query = "UPDATE gold_test SET status = ?, lastmodified = ?";
        const params = [status, timestamp];

        if (status === 'IN_PROGRESS') {
            query += ", in_progress_at = COALESCE(in_progress_at, ?)";
            params.push(timestamp);
        } else if (status === 'DONE') {
            query += ", done_at = COALESCE(done_at, ?)";
            params.push(timestamp);
        }

        query += " WHERE id = ? AND deletedon IS NULL";
        params.push(id);

        return this.db.prepare(query).run(...params);
    }

    updateTotal(id, total) {
        return this.db.prepare(`
            UPDATE gold_test SET total = ?, lastmodified = ? WHERE id = ? AND deletedon IS NULL
        `).run(total, now(), id);
    }

    updateItem(testId, itemId, updates) {
        return transaction(() => {
            // Check Immutability
            const parent = this.db.prepare(`SELECT status FROM gold_test WHERE id = ?`).get(testId);
            if (parent && parent.status === 'DONE') {
                throw new Error('409: Cannot edit items of a DONE test');
            }

            // Get current item for merging
            const current = this.db.prepare(`SELECT * FROM gold_test_item WHERE id = ?`).get(itemId);
            if (!current) throw new Error('Item not found');

            const merged = { ...current, ...updates };

            // Recalculate
            const calculated = GoldTestCalculationService.calculateItem({
                gross_weight: merged.gross_weight,
                test_weight: merged.test_weight,
                purity: merged.purity,
                returned: merged.returned == 1 || merged.returned === true,
                item_type: merged.item_type
            });

            const fieldsToUpdate = {
                item_type: calculated.item_type,
                gross_weight: calculated.gross_weight,
                test_weight: calculated.test_weight,
                net_weight: calculated.net_weight,
                purity: calculated.purity,
                fine_weight: calculated.fine_weight,
                item_total: calculated.item_total,
                returned: calculated.returned ? 1 : 0
            };

            const fields = Object.keys(fieldsToUpdate).map(k => `${k} = ?`).join(', ');
            const values = [...Object.values(fieldsToUpdate), itemId, testId];

            const result = this.db.prepare(`
                UPDATE gold_test_item SET ${fields}
                WHERE id = ? AND gold_test_id = ? AND deletedon IS NULL
            `).run(...values);

            // Roll-up
            GoldTestCalculationService.updateParentTotals(testId, this.db);

            return result;
        })();
    }

    finalize(id, items, mode_of_payment, weightLossAmount) {
        return transaction(() => {
            // Check current status
            const current = this.db.prepare("SELECT status FROM gold_test WHERE id = ?").get(id);
            if (current && current.status === 'DONE') {
                throw new Error('409: Gold test is already finalized and immutable');
            }

            const timestamp = now();

            // 1. Update items with final values and recalculate Charge
            for (const item of items) {
                const currentItem = this.db.prepare("SELECT * FROM gold_test_item WHERE id = ?").get(item.id);
                if (currentItem) {
                    const calculated = GoldTestCalculationService.calculateItem({
                        gross_weight: currentItem.gross_weight,
                        test_weight: currentItem.test_weight,
                        purity: item.purity,
                        returned: item.returned == 1 || item.returned === true,
                        item_type: currentItem.item_type
                    });

                    this.db.prepare(`
                        UPDATE gold_test_item 
                        SET purity = ?, returned = ?, fine_weight = ?, item_total = ?
                        WHERE id = ? AND gold_test_id = ? AND deletedon IS NULL
                    `).run(calculated.purity, calculated.returned ? 1 : 0, calculated.fine_weight, calculated.item_total, item.id, id);
                }
            }

            // 2. Finalize Parent Roll-up and Status
            GoldTestCalculationService.updateParentTotals(id, this.db);

            this.db.prepare(`
                UPDATE gold_test 
                SET status = 'DONE', mode_of_payment = ?, done_at = ?, lastmodified = ? 
                WHERE id = ? AND deletedon IS NULL
            `).run(mode_of_payment, timestamp, timestamp, id);

            // 3. Record Weight Loss if applicable
            if (weightLossAmount > 0) {
                const wlhId = genId('WLH');
                const test = this.db.prepare("SELECT customer_id FROM gold_test WHERE id = ?").get(id);

                if (test) {
                    this.db.prepare(`
                        INSERT INTO weight_loss_history (id, customer_id, amount, reason, created)
                        VALUES (?, ?, ?, ?, ?)
                    `).run(wlhId, test.customer_id, weightLossAmount, `Gold Test Finalization: ${id}`, timestamp);
                }
            }

            return { success: true };
        })();
    }

    softDelete(id) {
        return transaction(() => {
            const timestamp = now();
            this.db.prepare("UPDATE gold_test SET deletedon = ?, lastmodified = ? WHERE id = ?").run(timestamp, timestamp, id);
            this.db.prepare("UPDATE gold_test_item SET deletedon = ? WHERE gold_test_id = ?").run(timestamp, id);
        })();
    }

    updateResults(id, items, mode_of_payment, total) {
        return transaction(() => {
            const current = this.db.prepare("SELECT status FROM gold_test WHERE id = ?").get(id);
            if (current && current.status === 'DONE') {
                throw new Error('409: Cannot update results of a DONE test');
            }

            const timestamp = now();

            // 1. Update items
            for (const item of items) {
                const currentItem = this.db.prepare("SELECT * FROM gold_test_item WHERE id = ?").get(item.id);
                if (currentItem) {
                    const calculated = GoldTestCalculationService.calculateItem({
                        gross_weight: currentItem.gross_weight,
                        test_weight: item.test_weight !== undefined ? Number(item.test_weight) : currentItem.test_weight,
                        purity: item.purity,
                        returned: item.returned == 1 || item.returned === true,
                        item_type: currentItem.item_type,
                        net_weight: item.net_weight
                    });

                    this.db.prepare(`
                        UPDATE gold_test_item 
                        SET purity = ?, returned = ?, fine_weight = ?, item_total = ?,
                            test_weight = ?, net_weight = ?
                        WHERE id = ? AND gold_test_id = ? AND deletedon IS NULL
                    `).run(
                        calculated.purity,
                        calculated.returned ? 1 : 0,
                        calculated.fine_weight,
                        calculated.item_total,
                        calculated.test_weight,
                        calculated.net_weight,
                        item.id,
                        id
                    );
                }
            }

            // 2. Update parent and Roll-up
            GoldTestCalculationService.updateParentTotals(id, this.db);

            let query = "UPDATE gold_test SET lastmodified = ?";
            const params = [timestamp];

            if (mode_of_payment !== undefined) {
                query += ", mode_of_payment = ?";
                params.push(mode_of_payment);
            }

            if (total !== undefined) {
                query += ", total = ?";
                params.push(total);
            }

            query += " WHERE id = ? AND deletedon IS NULL";
            params.push(id);

            this.db.prepare(query).run(...params);

            if (mode_of_payment !== undefined && current.status === 'TODO') {
                this.db.prepare("UPDATE gold_test SET status = 'IN_PROGRESS', in_progress_at = COALESCE(in_progress_at, ?) WHERE id = ?").run(timestamp, id);
            }

            return { success: true };
        })();
    }

    getStats(startDate, endDate) {
        let query = `
            SELECT 
                COUNT(*) as total_tests,
                SUM(gt.total) as total_amount,
                SUM((SELECT SUM(test_weight) FROM gold_test_item WHERE gold_test_id = gt.id AND deletedon IS NULL)) as total_gold_weight,
                AVG((SELECT AVG(purity) FROM gold_test_item WHERE gold_test_id = gt.id AND deletedon IS NULL)) as avg_purity,
                COUNT(CASE WHEN gt.status = 'TODO' THEN 1 END) as pending,
                COUNT(CASE WHEN gt.status = 'IN_PROGRESS' THEN 1 END) as in_progress,
                COUNT(CASE WHEN gt.status = 'DONE' THEN 1 END) as completed
            FROM gold_test gt
            WHERE gt.deletedon IS NULL
        `;
        const params = [];
        if (startDate) { query += " AND DATE(gt.created) >= DATE(?)"; params.push(startDate); }
        if (endDate) { query += " AND DATE(gt.created) <= DATE(?)"; params.push(endDate); }

        return this.db.prepare(query).get(...params);
    }
}

module.exports = new GoldTestRepository();
