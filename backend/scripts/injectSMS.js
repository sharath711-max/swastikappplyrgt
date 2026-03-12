const fs = require('fs');
const path = require('path');

const wsPath = path.join(__dirname, '../../backend/services/workflowService.js');
let ws = fs.readFileSync(wsPath, 'utf8');

const replacement = `    async updateStatus(type, id, status) {
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
                    
                    testRecord = db.prepare(\`
                        SELECT t.auto_number, c.name, c.phone, i.purity
                        FROM \${table} t
                        JOIN customer c ON t.customer_id = c.id
                        LEFT JOIN \${itemsTable} i ON i.\${table}_id = t.id
                        WHERE t.id = ?
                    \`).get(id);
                    
                    if (testRecord && testRecord.purity) {
                        purityStr = testRecord.purity + '%';
                    }
                } else if (type.includes('_cert')) {
                    const table = type === 'gold_cert' ? 'gold_certificate' : type === 'silver_cert' ? 'silver_certificate' : 'photo_certificate';
                    
                    testRecord = db.prepare(\`
                        SELECT t.auto_number, c.name, c.phone
                        FROM \${table} t
                        JOIN customer c ON t.customer_id = c.id
                        WHERE t.id = ?
                    \`).get(id);
                }

                if (testRecord && testRecord.phone) {
                    let msg = \`*Swastik Lab*\\n\\nHello \${testRecord.name}, your \${type.replace('_', ' ').toUpperCase()} *(Ref: \${testRecord.auto_number})* is complete!\`;
                    if (purityStr) msg += \`\\nTested Purity: *\${purityStr}*\`;
                    msg += \`\\n\\nPlease collect your certificate at the front desk.\`;
                    
                    whatsappService.sendMessage(testRecord.phone, msg);
                }
            } catch (err) {
                console.error('[SMS Dispatch Failed]', err.message);
            }
        }

        return result;
    }`;

ws = ws.replace(/async updateStatus\(type, id, status\) \{[\s\S]*?\n    \}/m, replacement);

fs.writeFileSync(wsPath, ws);
console.log('workflowService.js updated with SMS triggers.');
