const goldTestRepository = require('../repositories/goldTestRepository');
const customerRepository = require('../repositories/customerRepository');
const whatsappService = require('./whatsappService');


class GoldTestService {
    // Math moved to GoldTestCalculationService

    async createTest(data) {
        const { customer_id, items, status, mode_of_payment = 'Cash' } = data;

        // 1. Verify customer
        const customer = customerRepository.findById(customer_id);
        if (!customer) throw new Error('Customer not found');

        // 2. Map items for creation
        const processedItems = items.map(item => ({
            ...item,
            gross_weight: parseFloat(item.gross_weight || item.total_weight || item.weight || 0),
            test_weight: parseFloat(item.test_weight || item.sample_weight || 0),
            purity: parseFloat(item.purity || 0),
            returned: Boolean(item.returned)
        }));

        // 3. Save to repository (calculation happens in repo transaction)
        return goldTestRepository.create(customer_id, processedItems, status, mode_of_payment);
    }

    async getTests(filters) {
        const tests = goldTestRepository.findAll(filters);
        const total = goldTestRepository.count(filters);
        return {
            tests,
            pagination: {
                total,
                pages: Math.ceil(total / (filters.limit || 20))
            }
        };
    }

    async getTestDetails(id) {
        const test = goldTestRepository.findById(id);
        if (!test) throw new Error('Gold test not found');
        return test;
    }

    async updateStatus(id, status) {
        const result = goldTestRepository.updateStatus(id, status);
        if (result.changes === 0) throw new Error('Gold test not found');
        return true;
    }

    async finalizeTest(id, data) {
        const { items, mode_of_payment, weight_loss } = data;
        const result = goldTestRepository.finalize(id, items, mode_of_payment, weight_loss || 0);

        // Asynchronously notify customer via WhatsApp Webhook if finalized successfully
        if (result && result.success) {
            try {
                const test = goldTestRepository.findById(id);
                if (test && test.customer_id) {
                    const customer = customerRepository.findById(test.customer_id);
                    if (customer) {
                        whatsappService.notifyTestCompleted(
                            customer.name,
                            customer.phone,
                            'Gold Test',
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

    async updateItem(testId, itemId, updates) {
        // Validations for updates
        if (updates.gross_weight !== undefined && updates.gross_weight <= 0) throw new Error('Gross weight must be > 0');
        if (updates.purity !== undefined && (updates.purity < 0 || updates.purity > 100)) throw new Error('Purity must be between 0 and 100');

        const result = goldTestRepository.updateItem(testId, itemId, updates);
        return result.changes > 0;
    }

    async deleteTest(id) {
        const test = goldTestRepository.findById(id);
        if (!test) throw new Error('Gold test not found');
        if (test.status === 'IN_PROGRESS') throw new Error('Cannot delete test in progress');

        return goldTestRepository.softDelete(id);
    }

    async getSummaryStats(startDate, endDate) {
        const summary = goldTestRepository.getStats(startDate, endDate);
        // Add trends logic here if needed (e.g. daily breakdown)
        return summary;
    }

    async saveTestResults(id, data) {
        const { items, mode_of_payment, total } = data;

        // Validate items
        items.forEach(item => {
            const purity = parseFloat(item.purity);
            if (isNaN(purity) || purity < 0 || purity > 100) {
                throw new Error(`Invalid purity for item ${item.item_no}: ${item.purity}`);
            }
            if (item.returned === undefined || item.returned === null) {
                throw new Error(`Returned status required for item ${item.item_no}`);
            }
        });

        // Validate payment fields if provided (Required for Lab Phase-2)
        if (mode_of_payment && !['Cash', 'UPI', 'Balance'].includes(mode_of_payment)) {
            throw new Error('Invalid mode of payment');
        }
        if (total !== undefined && (isNaN(parseFloat(total)) || parseFloat(total) < 0)) {
            throw new Error('Invalid total amount');
        }

        return goldTestRepository.updateResults(id, items, mode_of_payment, total);
    }
}

module.exports = new GoldTestService();
