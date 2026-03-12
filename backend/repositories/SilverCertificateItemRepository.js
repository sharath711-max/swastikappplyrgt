const { db, transaction, getNextSequence } = require('../db/db');
const { v4: uuidv4 } = require('uuid');
const CertificateService = require('../services/certificateService');
const CertificateCalculationService = require('../services/certificateCalculationService');

class SilverCertificateItemRepository {
    /**
     * Internal helper to check if certificate is immutable
     */
    _checkImmutability(certificateId) {
        const parent = db.prepare('SELECT status FROM silver_certificate WHERE id = ?').get(certificateId);
        if (parent && parent.status === 'DONE') {
            throw new Error('409: Certificate is in DONE status and cannot be modified');
        }
    }

    /**
     * Create a new silver certificate item
     */
    createItem(certificateId, clientInput) {
        return transaction(() => {
            // 0. IMMUTABILITY CHECK
            this._checkImmutability(certificateId);

            // 1. GENERATE IDs
            const itemId = `SCI${Date.now()}${Math.floor(Math.random() * 1000)}`;

            // 2. CALCULATE
            const calculated = CertificateCalculationService.calculateSilverItem(clientInput);

            // 3. GENERATE SEQUENCE NUMBERS
            const count = db.prepare('SELECT COUNT(*) as c FROM silver_certificate_item WHERE silver_certificate_id = ? AND deletedon IS NULL').get(certificateId).c;
            const itemNo = clientInput.item_no || `A${String(count + 1).padStart(3, '0')}`;
            const certNum = clientInput.certificate_number || `SC-${getNextSequence('silver_cert_seq')}`;

            // 4. INSERT
            db.prepare(`
                INSERT INTO silver_certificate_item (
                    id, silver_certificate_id, 
                    certificate_number, item_no, item_type,
                    gross_weight, test_weight, net_weight,
                    purity, fine_weight, item_total,
                    returned,
                    created
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                itemId, certificateId,
                certNum,
                itemNo,
                calculated.item_name,
                calculated.gross_weight,
                calculated.test_weight,
                calculated.net_weight,
                calculated.purity,
                calculated.fine_weight,
                clientInput.item_total || 0,
                calculated.is_returned ? 1 : 0,
                new Date().toISOString()
            );

            // 5. UPDATE PARENT TOTALS
            CertificateCalculationService.updateCertificateTotals(certificateId, db);

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
     * Get items
     */
    getCertificateItems(certificateId) {
        return db.prepare(`
            SELECT 
                id, silver_certificate_id as certificate_id,
                certificate_number, item_no, item_type,
                gross_weight, test_weight, net_weight,
                purity, item_total,
                returned as is_returned,
                created as created_at
            FROM silver_certificate_item 
            WHERE silver_certificate_id = ? AND deletedon IS NULL
            ORDER BY created ASC
        `).all(certificateId);
    }

    updateItem(itemId, updates) {
        return transaction(() => {
            const current = db.prepare(`SELECT * FROM silver_certificate_item WHERE id = ?`).get(itemId);
            if (!current) throw new Error(`Item ${itemId} not found`);

            // Check immutability
            this._checkImmutability(current.silver_certificate_id);

            const merged = {
                gross_weight: updates.gross_weight ?? current.gross_weight,
                test_weight: updates.test_weight ?? current.test_weight,
                purity: updates.purity ?? current.purity,
                is_returned: updates.is_returned ?? (current.returned === 1),
                item_name: updates.item_name ?? updates.item_type ?? current.item_type
            };

            const calculated = CertificateCalculationService.calculateSilverItem(merged);

            db.prepare(`
                UPDATE silver_certificate_item
                SET 
                    item_type = ?,
                    gross_weight = ?,
                    test_weight = ?,
                    net_weight = ?,
                    purity = ?,
                    fine_weight = ?,
                    item_total = ?,
                    returned = ?
                WHERE id = ?
            `).run(
                calculated.item_name,
                calculated.gross_weight,
                calculated.test_weight,
                calculated.net_weight,
                calculated.purity,
                calculated.fine_weight,
                updates.item_total ?? current.item_total,
                calculated.is_returned ? 1 : 0,
                itemId
            );

            CertificateCalculationService.updateCertificateTotals(current.silver_certificate_id, db);

            return calculated;
        })();
    }

    deleteItem(itemId) {
        return transaction(() => {
            const item = db.prepare(`SELECT silver_certificate_id FROM silver_certificate_item WHERE id = ?`).get(itemId);
            if (!item) throw new Error(`Item ${itemId} not found`);

            // Check immutability
            this._checkImmutability(item.silver_certificate_id);

            db.prepare(`UPDATE silver_certificate_item SET deletedon = ? WHERE id = ?`)
                .run(new Date().toISOString(), itemId);

            CertificateCalculationService.updateCertificateTotals(item.silver_certificate_id, db);

            return { success: true, itemId };
        })();
    }
}

module.exports = new SilverCertificateItemRepository();
