const customerRepository = require('../repositories/customerRepository');

class CustomerService {
    async getAllCustomers() {
        return customerRepository.findAll();
    }

    async getCustomerById(id) {
        return customerRepository.findById(id);
    }

    validateCustomer(customerData) {
        const { name, phone, notes } = customerData;

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

        return { ...customerData, name: trimmedName };
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
