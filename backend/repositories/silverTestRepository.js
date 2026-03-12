const { db, now, genId, getNextSequence, transaction } = require('../db/db');
const SequenceService = require('../services/sequenceService');
const SilverTestCalculationService = require('../services/silverTestCalculationService');

class SilverTestRepository {
    constructor() {
        this.db = db;
    }

    async create(customer_id, items, status = 'TODO', mode_of_payment = 'Cash') {
        return transaction(() => {
            const nowObj = new Date();
            const timestamp = nowObj.toISOString();
            const testId = genId('STS');
            const parentAutoNumber = SequenceService.generateGlobalSequence();

            // 1. Insert parent
            this.db.prepare(`
                INSERT INTO silver_test (id, auto_number, customer_id, status, mode_of_payment, total, created, lastmodified)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(testId, parentAutoNumber, customer_id, status, mode_of_payment, 0, timestamp, timestamp);

            // 2. Insert items
            const insertedItems = [];
            let itemSeq = 1;
            for (const item of items) {
                const itemId = genId('STI');
                const itemNumber = `${parentAutoNumber}-${itemSeq++}`;

                // Use Calculation Authority
                const calculated = SilverTestCalculationService.calculateItem({
                    gross_weight: item.gross_weight || item.weight || item.total_weight || 0,
                    test_weight: item.test_weight || item.sample_weight || 0,
                    purity: item.purity || 0,
                    returned: item.returned || false,
                    item_type: item.item_type || item.item_name || 'Silver Sample'
                });

                this.db.prepare(`
                    INSERT INTO silver_test_item (
                        id, silver_test_id, item_number, item_type, 
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
            SilverTestCalculationService.updateParentTotals(testId, this.db);

            return { id: testId, auto_number: parentAutoNumber, items: insertedItems, created: timestamp };
        })();
    }

    findAll(filters = {}) {
        let query = `
            SELECT 
                st.*, 
                st.created as created_at, 
                c.name as customer_name,
                (SELECT COUNT(*) FROM silver_test_item WHERE silver_test_id = st.id AND deletedon IS NULL) as item_count
            FROM silver_test st
            JOIN customer c ON st.customer_id = c.id
            WHERE st.deletedon IS NULL
        `;
        const params = [];

        if (filters.status) {
            query += " AND st.status = ?";
            params.push(filters.status);
        }
        if (filters.customer_id) {
            query += " AND st.customer_id = ?";
            params.push(filters.customer_id);
        }
        if (filters.search) {
            query += ` AND (
                c.name LIKE ? 
                OR c.phone LIKE ? 
                OR st.auto_number LIKE ? 
                OR EXISTS (SELECT 1 FROM silver_test_item sti WHERE sti.silver_test_id = st.id AND sti.item_number LIKE ?)
            )`;
            const s = `%${filters.search}%`;
            params.push(s, s, s, s);
        }

        query += " ORDER BY st.created DESC";
        if (filters.limit) {
            query += " LIMIT ? OFFSET ?";
            params.push(filters.limit, filters.offset || 0);
        }

        return this.db.prepare(query).all(...params);
    }

    count(filters = {}) {
        let query = "SELECT COUNT(*) as total FROM silver_test st JOIN customer c ON st.customer_id = c.id WHERE st.deletedon IS NULL";
        const params = [];
        if (filters.status) { query += " AND st.status = ?"; params.push(filters.status); }
        if (filters.customer_id) { query += " AND st.customer_id = ?"; params.push(filters.customer_id); }
        if (filters.search) {
            query += ` AND (
                c.name LIKE ? 
                OR c.phone LIKE ? 
                OR st.auto_number LIKE ? 
                OR EXISTS (SELECT 1 FROM silver_test_item sti WHERE sti.silver_test_id = st.id AND sti.item_number LIKE ?)
            )`;
            const s = `%${filters.search}%`;
            params.push(s, s, s, s);
        }

        return this.db.prepare(query).get(...params).total;
    }

    findById(id) {
        const test = this.db.prepare(`
            SELECT st.*, st.created as created_at, c.name as customer_name, c.phone as customer_phone
            FROM silver_test st
            JOIN customer c ON st.customer_id = c.id
            WHERE st.id = ? AND st.deletedon IS NULL
        `).get(id);

        if (!test) return null;

        const items = this.db.prepare(`
            SELECT * FROM silver_test_item WHERE silver_test_id = ? AND deletedon IS NULL
        `).all(id);

        return { ...test, items };
    }

    updateStatus(id, status) {
        return transaction(() => {
            const current = this.db.prepare("SELECT status FROM silver_test WHERE id = ?").get(id);
            const statusHierarchy = { 'TODO': 1, 'IN_PROGRESS': 2, 'DONE': 3 };

            if (current) {
                if (statusHierarchy[current.status] > statusHierarchy[status]) {
                    throw new Error(`Backward move NOT permitted: Cannot move from ${current.status} to ${status}`);
                }
                if (current.status === 'DONE') {
                    throw new Error('409: Cannot change status of a DONE test');
                }
            }

            const timestamp = now();
            let query = "UPDATE silver_test SET status = ?, lastmodified = ?";
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
        })();
    }

    updateItem(testId, itemId, updates) {
        return transaction(() => {
            // Check Immutability
            const parent = this.db.prepare(`SELECT status FROM silver_test WHERE id = ?`).get(testId);
            if (parent && parent.status === 'DONE') {
                throw new Error('409: Cannot edit items of a DONE test');
            }

            // Get current item for merging
            const current = this.db.prepare(`SELECT * FROM silver_test_item WHERE id = ?`).get(itemId);
            if (!current) throw new Error('Item not found');

            const merged = { ...current, ...updates };

            // Recalculate
            const calculated = SilverTestCalculationService.calculateItem({
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
                UPDATE silver_test_item SET ${fields}
                WHERE id = ? AND silver_test_id = ? AND deletedon IS NULL
            `).run(...values);

            // Roll-up
            SilverTestCalculationService.updateParentTotals(testId, this.db);

            return result;
        })();
    }

    finalize(id, items, mode_of_payment, weightLossAmount) {
        return transaction(() => {
            // Check current status
            const current = this.db.prepare("SELECT status FROM silver_test WHERE id = ?").get(id);
            if (current && current.status === 'DONE') {
                throw new Error('409: Silver test is already finalized and immutable');
            }

            const timestamp = now();

            // 1. Update items with final values and recalculate Charge
            for (const item of items) {
                const currentItem = this.db.prepare("SELECT * FROM silver_test_item WHERE id = ?").get(item.id);
                if (currentItem) {
                    const calculated = SilverTestCalculationService.calculateItem({
                        gross_weight: currentItem.gross_weight,
                        test_weight: currentItem.test_weight,
                        purity: item.purity,
                        returned: item.returned == 1 || item.returned === true,
                        item_type: currentItem.item_type
                    });

                    this.db.prepare(`
                        UPDATE silver_test_item 
                        SET purity = ?, returned = ?, fine_weight = ?, item_total = ?
                        WHERE id = ? AND silver_test_id = ? AND deletedon IS NULL
                    `).run(calculated.purity, calculated.returned ? 1 : 0, calculated.fine_weight, calculated.item_total, item.id, id);
                }
            }

            // 2. Finalize Parent Roll-up and Status
            SilverTestCalculationService.updateParentTotals(id, this.db);

            this.db.prepare(`
                UPDATE silver_test 
                SET status = 'DONE', mode_of_payment = ?, done_at = ?, lastmodified = ? 
                WHERE id = ? AND deletedon IS NULL
            `).run(mode_of_payment, timestamp, timestamp, id);

            // 3. Record Weight Loss if applicable
            if (weightLossAmount > 0) {
                const wlhId = genId('WLH');
                const test = this.db.prepare("SELECT customer_id FROM silver_test WHERE id = ?").get(id);

                if (test) {
                    this.db.prepare(`
                        INSERT INTO weight_loss_history (id, customer_id, amount, reason, created)
                        VALUES (?, ?, ?, ?, ?)
                    `).run(wlhId, test.customer_id, weightLossAmount, `Silver Test Finalization: ${id}`, timestamp);
                }
            }

            return { success: true };
        })();
    }

    softDelete(id) {
        return transaction(() => {
            const current = this.db.prepare("SELECT status FROM silver_test WHERE id = ?").get(id);
            if (current && current.status === 'DONE') {
                throw new Error('409: Cannot delete a finalized test');
            }
            const timestamp = now();
            this.db.prepare("UPDATE silver_test SET deletedon = ?, lastmodified = ? WHERE id = ?").run(timestamp, timestamp, id);
            this.db.prepare("UPDATE silver_test_item SET deletedon = ? WHERE silver_test_id = ?").run(timestamp, id);
        })();
    }

    updateResults(id, items, mode_of_payment, total) {
        return transaction(() => {
            const current = this.db.prepare("SELECT status FROM silver_test WHERE id = ?").get(id);
            if (current && current.status === 'DONE') {
                throw new Error('409: Cannot update results of a DONE test');
            }

            const timestamp = now();

            // 1. Update items
            for (const item of items) {
                const currentItem = this.db.prepare("SELECT * FROM silver_test_item WHERE id = ?").get(item.id);
                if (currentItem) {
                    const calculated = SilverTestCalculationService.calculateItem({
                        gross_weight: currentItem.gross_weight,
                        test_weight: item.test_weight !== undefined ? Number(item.test_weight) : currentItem.test_weight,
                        purity: item.purity || 0,
                        returned: item.returned == 1 || item.returned === true,
                        item_type: currentItem.item_type,
                        net_weight: item.net_weight
                    });

                    this.db.prepare(`
                        UPDATE silver_test_item 
                        SET purity = ?, returned = ?, fine_weight = ?, item_total = ?,
                            test_weight = ?, net_weight = ?
                        WHERE id = ? AND silver_test_id = ? AND deletedon IS NULL
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
            SilverTestCalculationService.updateParentTotals(id, this.db);

            let query = "UPDATE silver_test SET lastmodified = ?";
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
                this.db.prepare("UPDATE silver_test SET status = 'IN_PROGRESS', in_progress_at = COALESCE(in_progress_at, ?) WHERE id = ?").run(timestamp, id);
            }

            return { success: true };
        })();
    }
}

module.exports = new SilverTestRepository();
