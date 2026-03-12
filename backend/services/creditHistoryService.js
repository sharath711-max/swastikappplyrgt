const creditHistoryRepository = require('../repositories/creditHistoryRepository');
const customerRepository = require('../repositories/customerRepository');

class CreditHistoryService {
    /**
     * Records a new transaction and updates customer balance
     */
    async addTransaction(data) {
        const { customer_id, amount, type, mode_of_payment, description } = data;

        // 1. Validation
        if (!customer_id) throw new Error('Customer ID is required');

        const customer = customerRepository.findById(customer_id);
        if (!customer) throw new Error('Customer not found');

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            throw new Error('Amount must be a valid positive number');
        }

        if (!['CREDIT', 'DEBIT'].includes(type)) {
            throw new Error('Type must be either CREDIT or DEBIT');
        }

        if (!description) throw new Error('Description is required for audit trail');

        // 2. Persist
        return await creditHistoryRepository.create({
            customer_id,
            amount: parsedAmount,
            type,
            mode_of_payment: mode_of_payment || 'Cash',
            description
        });
    }

    /**
     * Fetch history for a customer
     */
    async getCustomerHistory(customer_id, query = {}) {
        const limit = parseInt(query.limit) || 20;
        const page = parseInt(query.page) || 1;
        const offset = (page - 1) * limit;

        const records = creditHistoryRepository.findByCustomerId(customer_id, limit, offset);
        const total = creditHistoryRepository.countByCustomerId(customer_id);

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

module.exports = new CreditHistoryService();
