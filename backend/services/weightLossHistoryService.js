const weightLossHistoryRepository = require('../repositories/weightLossHistoryRepository');
const customerRepository = require('../repositories/customerRepository');

class WeightLossHistoryService {
    /**
     * Records a new material loss entry
     */
    async addEntry(data) {
        const { customer_id, amount, reason } = data;

        // 1. Validation
        if (!customer_id) throw new Error('Customer ID is required');

        const customer = customerRepository.findById(customer_id);
        if (!customer) throw new Error('Customer not found');

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            throw new Error('Weight loss amount must be a valid positive number');
        }

        if (!reason) throw new Error('Reason is required for audit integrity');

        // 2. Persist
        return await weightLossHistoryRepository.create({
            customer_id,
            amount: parsedAmount,
            reason
        });
    }

    /**
     * Fetch history for a customer
     */
    async getCustomerHistory(customer_id, query = {}) {
        const limit = parseInt(query.limit) || 20;
        const page = parseInt(query.page) || 1;
        const offset = (page - 1) * limit;

        const records = customer_id
            ? weightLossHistoryRepository.findByCustomerId(customer_id, limit, offset)
            : weightLossHistoryRepository.findAll(limit, offset);

        const total = customer_id
            ? weightLossHistoryRepository.countByCustomerId(customer_id)
            : weightLossHistoryRepository.countAll();

        return {
            records,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current_page: page
            }
        };
    }
}

module.exports = new WeightLossHistoryService();
