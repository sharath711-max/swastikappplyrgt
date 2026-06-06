const customerRepository = require('../repositories/customerRepository');

class CustomerService {
    async getAllCustomers() {
        return customerRepository.findAll();
    }

    async getCustomersPaged(opts) {
        const { rows, total, page, pageSize } = customerRepository.findPaged(opts);
        return {
            data: rows,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.max(1, Math.ceil(total / pageSize)),
            },
        };
    }

    async getCustomerById(id) {
        return customerRepository.findById(id);
    }

    validateCustomer(customerData) {
        const { name, phone, notes, balance } = customerData;

        // Name Validation
        if (!name || typeof name !== 'string') {
            throw new Error('Name is required');
        }
        const trimmedName = name.trim();
        if (trimmedName.length < 2) {
            throw new Error('Name must be at least 2 characters long');
        }
        if (/^\d+$/.test(trimmedName)) {
            throw new Error('Name cannot be purely numeric');
        }

        // Phone Validation
        if (!phone) {
            throw new Error('Phone is required');
        }
        if (!/^\d{10}$/.test(phone)) {
            throw new Error('Phone must be exactly 10 digits (0-9)');
        }

        // Notes Validation
        if (notes && notes.length > 255) {
            throw new Error('Notes cannot exceed 255 characters');
        }

        // Balance Validation — optional opening balance on create. Defaults to 0.
        // Update path ignores balance (see customerRepository.update); ledger
        // moves use credit_history, not direct customer.balance writes.
        let validatedBalance = 0;
        if (balance !== undefined && balance !== null && balance !== '') {
            const n = Number(balance);
            if (!Number.isFinite(n)) {
                throw new Error('Balance must be a number');
            }
            if (n < 0) {
                throw new Error('Balance cannot be negative');
            }
            validatedBalance = n;
        }

        return { ...customerData, name: trimmedName, balance: validatedBalance };
    }

    async createCustomer(customerData) {
        // Validate inputs
        const validatedData = this.validateCustomer(customerData);

        // Check for existing phone
        if (validatedData.phone) {
            const existing = customerRepository.findByPhone(validatedData.phone);
            if (existing) throw new Error('Customer with this phone already exists');
        }
        return customerRepository.create(validatedData);
    }

    async updateCustomer(id, customerData) {
        // Validate inputs
        const validatedData = this.validateCustomer(customerData);
        
        // Check if phone is being changed to one that already exists
        if (validatedData.phone) {
            const existing = customerRepository.findByPhone(validatedData.phone);
            if (existing && existing.id !== id) {
                 throw new Error('Customer with this phone already exists');
            }
        }

        return customerRepository.update(id, validatedData);
    }

    async toggleStatus(id) {
        return customerRepository.toggleStatus(id);
    }

    async searchCustomer(query) {
        return customerRepository.search(query);
    }
}

module.exports = new CustomerService();
