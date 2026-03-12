const { db, transaction, getNextSequence } = require('../db/db');
const { v4: uuidv4 } = require('uuid');
const CertificateCalculationService = require('../services/certificateCalculationService');

class GoldCertificateItemRepository {
    /**
     * Create a new gold certificate item (authoritative backend calculation)
     */
    createItem(certificateId, clientInput) {
        return transaction(() => {
            // 0. CHECK STATUS (IMMUTABILITY)
            const parent = db.prepare('SELECT status FROM gold_certificate WHERE id = ?').get(certificateId);
            if (parent && parent.status === 'DONE') {
                throw new Error('Cannot add items to a DONE certificate');
            }

            // 1. GENERATE IDs
            // Use standard GCI format if possible, or UUID fallback
            const itemId = `GCI${Date.now()}${Math.floor(Math.random() * 1000)}`;

            // 2. CALCULATE AUTHORITATIVE VALUES
            const calculated = CertificateCalculationService.calculateGoldItem(clientInput);

            // 3. GENERATE SEQUENCE NUMBERS IF MISSING
            // We need to count existing items to generate item_no (A001, etc)
            const count = db.prepare('SELECT COUNT(*) as c FROM gold_certificate_item WHERE gold_certificate_id = ?').get(certificateId).c;
            const itemNo = clientInput.item_no || `A${String(count + 1).padStart(3, '0')}`;
            const certNum = clientInput.certificate_number || getNextSequence('gold_cert_seq');

            // 4. INSERT WITH AUTHORITATIVE VALUES ONLY
            db.prepare(`
                INSERT INTO gold_certificate_item (
                    id, gold_certificate_id, 
                    certificate_number, item_no, item_type,
                    gross_weight, test_weight, net_weight,
                    purity, fine_weight,
                    rate_per_gram, item_total,
                    returned,
                    created
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                itemId, certificateId,
                certNum,
                itemNo,
                clientInput.item_name || clientInput.item_type || 'Gold Item',
                calculated.gross_weight,
                calculated.test_weight,
                calculated.net_weight, // Schema requires this
                calculated.purity,
                calculated.fine_weight,
                calculated.rate_per_gram,
                calculated.item_total,
                calculated.is_returned ? 1 : 0, // 'returned' in schema
                new Date().toISOString()
            );

            // 5. UPDATE PARENT ROLL-UP TOTALS
            CertificateCalculationService.updateCertificateTotals(certificateId, db);

            // 6. AUDIT LOG - REMOVED per user request
            // Audit not required.

            return {
                success: true,
                itemId,
                ...calculated,
                certificate_number: certNum,
                item_no: itemNo
            };
        })();
    }

    /**
     * Get items for a certificate
     */
    getCertificateItems(certificateId) {
        // Updated to select columns matching schema and aliasing for frontend compatibility if needed
        return db.prepare(`
            SELECT 
                id, gold_certificate_id as certificate_id,
                certificate_number, item_no, item_type,
                gross_weight, test_weight, net_weight,
                purity, fine_weight,
                rate_per_gram, item_total,
                returned as is_returned,
                created as created_at
            FROM gold_certificate_item 
            WHERE gold_certificate_id = ? AND deletedon IS NULL
            ORDER BY created ASC
        `).all(certificateId);
    }

    /**
     * Update an existing item (recalculates on any change)
     */
    updateItem(itemId, updates) {
        return transaction(() => {
            // 0. CHECK STATUS (IMMUTABILITY)
            const currentItem = db.prepare('SELECT gold_certificate_id FROM gold_certificate_item WHERE id = ?').get(itemId);
            if (!currentItem) throw new Error(`Item ${itemId} not found`);

            const parent = db.prepare('SELECT status FROM gold_certificate WHERE id = ?').get(currentItem.gold_certificate_id);
            if (parent && parent.status === 'DONE') {
                throw new Error('Cannot edit items of a DONE certificate');
            }

            // Get current item
            const current = db.prepare(`
                SELECT * FROM gold_certificate_item WHERE id = ?
            `).get(itemId);

            if (!current) {
                throw new Error(`Item ${itemId} not found`);
            }

            // Merge updates with current values
            // Note: DB columns vs Input keys mapping
            const merged = {
                gross_weight: updates.gross_weight ?? current.gross_weight,
                test_weight: updates.test_weight ?? current.test_weight,
                purity: updates.purity ?? current.purity,
                rate_per_gram: updates.rate_per_gram ?? current.rate_per_gram,
                is_returned: updates.is_returned ?? (current.returned === 1),
                item_name: updates.item_name ?? updates.item_type ?? current.item_type
            };

            // Recalculate
            const calculated = CertificateCalculationService.calculateGoldItem(merged);

            // Update DB
            db.prepare(`
                UPDATE gold_certificate_item
                SET 
                    item_type = ?,
                    gross_weight = ?,
                    test_weight = ?,
                    net_weight = ?,
                    purity = ?,
                    fine_weight = ?,
                    rate_per_gram = ?,
                    item_total = ?,
                    returned = ?
                    -- No updated_at in schema for items
                WHERE id = ?
            `).run(
                merged.item_name,
                calculated.gross_weight,
                calculated.test_weight,
                calculated.net_weight, // Schema has net_weight
                calculated.purity,
                calculated.fine_weight,
                calculated.rate_per_gram,
                calculated.item_total,
                calculated.is_returned ? 1 : 0,
                itemId
            );

            // Update parent totals
            CertificateCalculationService.updateCertificateTotals(current.gold_certificate_id, db);

            return calculated;
        })();
    }

    /**
     * Soft delete an item
     */
    deleteItem(itemId) {
        return transaction(() => {
            const item = db.prepare(`
                SELECT gold_certificate_id FROM gold_certificate_item WHERE id = ?
            `).get(itemId);

            if (!item) {
                throw new Error(`Item ${itemId} not found`);
            }

            // CHECK STATUS (IMMUTABILITY)
            const parent = db.prepare('SELECT status FROM gold_certificate WHERE id = ?').get(item.gold_certificate_id);
            if (parent && parent.status === 'DONE') {
                throw new Error('Cannot delete items from a DONE certificate');
            }

            db.prepare(`
                UPDATE gold_certificate_item 
                SET deletedon = ?
                WHERE id = ?
            `).run(new Date().toISOString(), itemId);

            // Update parent totals
            CertificateCalculationService.updateCertificateTotals(item.gold_certificate_id, db);

            return { success: true, itemId };
        })();
    }

    // Audit functionality removed
}

module.exports = new GoldCertificateItemRepository();
