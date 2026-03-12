const silverTestRepository = require('../repositories/silverTestRepository');
const customerRepository = require('../repositories/customerRepository');
const whatsappService = require('./whatsappService');

class SilverTestService {
    async createTest(data) {
        const { customer_id, items, status = 'TODO', mode_of_payment = 'Cash' } = data;

        const customer = customerRepository.findById(customer_id);
        if (!customer) throw new Error('Customer not found');

        // Enforcement: Intake Phase (TODO)
        // If status is TODO, we must ensure purity and payment fields are NOT processed as meaningful results yet.
        // Actually, repository create handles initial totals. 
        // We strip purity for TODO intake if client sent them.
        const processedItems = items.map(item => {
            const cleanItem = {
                item_name: item.item_name || item.item_type || item.item || 'Silver Sample',
                gross_weight: parseFloat(item.gross_weight || item.total_weight || item.weight || 0),
                sample_weight: parseFloat(item.sample_weight || 0),
                test_weight: parseFloat(item.test_weight || 0), // Often 0 at intake
                returned: Boolean(item.returned)
            };

            if (status !== 'TODO') {
                cleanItem.purity = parseFloat(item.purity || 0);
            } else {
                cleanItem.purity = 0; // Intake has no purity
            }

            return cleanItem;
        });

        const result = await silverTestRepository.create(
            customer_id,
            processedItems,
            status,
            status === 'TODO' ? 'Pending' : mode_of_payment
        );

        return result;
    }

    async getTests(filters) {
        const tests = silverTestRepository.findAll(filters);
        const total = silverTestRepository.count(filters);
        return {
            tests,
            pagination: {
                total,
                pages: Math.ceil(total / (filters.limit || 20))
            }
        };
    }

    async getTestDetails(id) {
        const test = silverTestRepository.findById(id);
        if (!test) throw new Error('Silver test not found');
        return test;
    }

    async updateStatus(id, status) {
        // Repository handles immutability check
        const result = silverTestRepository.updateStatus(id, status);
        if (result.changes === 0) throw new Error('Update failed or Record not found');
        return true;
    }

    async updateItem(testId, itemId, updates) {
        // Repository handles immutability and recalculation
        const result = silverTestRepository.updateItem(testId, itemId, updates);
        if (result.changes === 0) throw new Error('Item update failed');
        return true;
    }

    async finalizeTest(id, data) {
        // Testing Phase -> DONE
        const { items, mode_of_payment, weight_loss } = data;

        // Finalize items often involves setting the final purity
        const result = silverTestRepository.finalize(id, items, mode_of_payment, weight_loss || 0);

        // Notify customer
        if (result && result.success) {
            try {
                const test = silverTestRepository.findById(id);
                if (test && test.customer_id) {
                    const customer = customerRepository.findById(test.customer_id);
                    if (customer) {
                        whatsappService.notifyTestCompleted(
                            customer.name,
                            customer.phone,
                            'Silver Test',
                            test.auto_number,
                            test.total || 0
                        ).catch(err => console.error('[WhatsApp Hook Error]', err));
                    }
                }
            } catch (notifyErr) {
                console.error('[WhatsApp Trigger Failed]', notifyErr);
            }
        }

        return result;
    }

    async saveTestResults(id, data) {
        // This is used for Testing Phase (IN_PROGRESS)
        const { items, mode_of_payment, total } = data;

        items.forEach(item => {
            if (item.purity !== undefined) {
                const p = parseFloat(item.purity);
                if (isNaN(p) || p <= 0 || p > 100) {
                    throw new Error(`Invalid purity for item: ${item.purity || 'empty'}. Must be between 0 and 100%.`);
                }
            }
        });

        if (total !== undefined && (isNaN(parseFloat(total)) || parseFloat(total) < 0)) {
            throw new Error('Invalid total amount');
        }

        return silverTestRepository.updateResults(id, items, mode_of_payment, total);
    }

    async deleteTest(id) {
        return silverTestRepository.softDelete(id);
    }
}

module.exports = new SilverTestService();
