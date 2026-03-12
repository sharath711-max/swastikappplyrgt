const { db, now, genId, transaction } = require('../db/db');

class CreditHistoryRepository {
    constructor() {
        this.db = db;
    }

    /**
     * Append a new transaction to the ledger
     */
    async create(data) {
        const { customer_id, amount, type, mode_of_payment, description } = data;

        return transaction(() => {
            const id = genId('CHS');
            const timestamp = now();

            // 1. Insert into credit_history (Append-Only)
            this.db.prepare(`
                INSERT INTO credit_history (id, customer_id, amount, type, mode_of_payment, description, created)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(id, customer_id, amount, type, mode_of_payment, description, timestamp);

            // 2. Trigger Balance Roll-up
            this.updateCustomerBalance(customer_id);

            return { id, customer_id, amount, type, mode_of_payment, description, created: timestamp };
        })();
    }

    /**
     * Informational roll-up of history records to update customer balance
     * Formula: Balance = SUM(DEBIT) - SUM(CREDIT)
     * DEBIT: Customer owes us more (+)
     * CREDIT: Customer paid us / returned goods (-)
     */
    updateCustomerBalance(customer_id) {
        const result = this.db.prepare(`
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END), 0) as total_debit,
                COALESCE(SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END), 0) as total_credit
            FROM credit_history
            WHERE customer_id = ?
        `).get(customer_id);

        const newBalance = result.total_debit - result.total_credit;

        this.db.prepare(`
            UPDATE customer 
            SET balance = ?, lastmodified = ? 
            WHERE id = ?
        `).run(newBalance, now(), customer_id);

        return newBalance;
    }

    /**
     * Find history for a specific customer
     */
    findByCustomerId(customer_id, limit = 50, offset = 0) {
        return this.db.prepare(`
            SELECT * FROM credit_history 
            WHERE customer_id = ? 
            ORDER BY created DESC 
            LIMIT ? OFFSET ?
        `).all(customer_id, limit, offset);
    }

    /**
     * Count history records for a customer
     */
    countByCustomerId(customer_id) {
        return this.db.prepare(`
            SELECT COUNT(*) as total FROM credit_history WHERE customer_id = ?
        `).get(customer_id).total;
    }

    /**
     * Find a single transaction record (Read-Only)
     */
    findById(id) {
        return this.db.prepare(`SELECT * FROM credit_history WHERE id = ?`).get(id);
    }
}

module.exports = new CreditHistoryRepository();
