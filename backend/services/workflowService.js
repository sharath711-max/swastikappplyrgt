const { db } = require('../db/db');
const goldTestService = require('./goldTestService');
const silverTestService = require('./silverTestService');
const certificateService = require('./certificateService');

class WorkflowService {
    async getAllItems() {
        const query = `
            SELECT 
                'gold' as type, gt.id, gt.customer_id, gt.status, 
                'Gold Test' as description, 
                gt.total as total, gt.mode_of_payment, gt.created as createdon, 
                c.name as customer_name
            FROM gold_test gt
            JOIN customer c ON gt.customer_id = c.id
            WHERE gt.deletedon IS NULL
            
            UNION ALL
            
            SELECT 
                'silver' as type, st.id, st.customer_id, st.status, 
                'Silver Test' as description, 
                st.total as total, st.mode_of_payment, st.created as createdon, 
                c.name as customer_name
            FROM silver_test st
            JOIN customer c ON st.customer_id = c.id
            WHERE st.deletedon IS NULL

            UNION ALL

            SELECT 
                'gold_cert' as type, gc.id, gc.customer_id, gc.status,
                'Gold Certificate' as description,
                gc.total as total, gc.mode_of_payment, gc.created as createdon,
                c.name as customer_name
            FROM gold_certificate gc
            JOIN customer c ON gc.customer_id = c.id
            WHERE gc.deletedon IS NULL

            UNION ALL

            SELECT 
                'silver_cert' as type, sc.id, sc.customer_id, sc.status,
                'Silver Certificate' as description,
                sc.total as total, sc.mode_of_payment, sc.created as createdon,
                c.name as customer_name
            FROM silver_certificate sc
            JOIN customer c ON sc.customer_id = c.id
            WHERE sc.deletedon IS NULL

            UNION ALL

            SELECT 
                'photo_cert' as type, pc.id, pc.customer_id, pc.status,
                'Photo Certificate' as description,
                pc.total as total, pc.mode_of_payment, pc.created as createdon,
                c.name as customer_name
            FROM photo_certificate pc
            JOIN customer c ON pc.customer_id = c.id
            WHERE pc.deletedon IS NULL

            ORDER BY createdon DESC
        `;
        return db.prepare(query).all();
    }

    async updateStatus(type, id, status) {
        // Map frontend type to service type
        const serviceType = type.replace('_cert', '');

        let result;
        switch (serviceType) {
            case 'gold':
                result = type === 'gold' ? await goldTestService.updateStatus(id, status) : await certificateService.updateStatus('gold', id, status);
                break;
            case 'silver':
                result = type === 'silver' ? await silverTestService.updateStatus(id, status) : await certificateService.updateStatus('silver', id, status);
                break;
            case 'photo':
                result = await certificateService.updateStatus('photo', id, status);
                break;
            default:
                throw new Error('Invalid item type: ' + type);
        }

        // --- GAP 3: Digital Delivery via SMS ---
        if (status === 'DONE') {
            try {
                // Fetch the customer info and purity to send SMS
                const { db } = require('../db/db');
                const whatsappService = require('./whatsappService');

                let testRecord;
                let purityStr = '';

                if (type === 'gold' || type === 'silver') {
                    const table = type === 'gold' ? 'gold_test' : 'silver_test';
                    const itemsTable = type === 'gold' ? 'gold_test_item' : 'silver_test_item';

                    testRecord = db.prepare(`
                        SELECT t.auto_number, c.name, c.phone, i.purity
                        FROM ${table} t
                        JOIN customer c ON t.customer_id = c.id
                        LEFT JOIN ${itemsTable} i ON i.${table}_id = t.id
                        WHERE t.id = ?
                    `).get(id);

                    if (testRecord && testRecord.purity) {
                        purityStr = testRecord.purity + '%';
                    }
                } else if (type.includes('_cert')) {
                    const table = type === 'gold_cert' ? 'gold_certificate' : type === 'silver_cert' ? 'silver_certificate' : 'photo_certificate';

                    testRecord = db.prepare(`
                        SELECT t.auto_number, c.name, c.phone
                        FROM ${table} t
                        JOIN customer c ON t.customer_id = c.id
                        WHERE t.id = ?
                    `).get(id);
                }

                if (testRecord && testRecord.phone) {
                    let msg = `*Swastik Lab*\n\nHello ${testRecord.name}, your ${type.replace('_', ' ').toUpperCase()} *(Ref: ${testRecord.auto_number})* is complete!`;
                    if (purityStr) msg += `\nTested Purity: *${purityStr}*`;
                    msg += `\n\nVerify digitally here: https://swastiklab.com/verify/${testRecord.auto_number}`;
                    msg += `\n\nPlease collect your physical certificate at the front desk.`;

                    whatsappService.sendMessage(testRecord.phone, msg);
                }
            } catch (err) {
                console.error('[SMS Dispatch Failed]', err.message);
            }
        }

        return result;
    }
}

module.exports = new WorkflowService();
