const { db, now, genId, transaction } = require('../db/db');

class WeightLossHistoryRepository {
    constructor() {
        this.db = db;
    }

    /**
     * Append a new weight loss record
     */
    async create(data) {
        const { customer_id, amount, reason } = data;

        return transaction(() => {
            const id = genId('WLH');
            const timestamp = now();

            this.db.prepare(`
                INSERT INTO weight_loss_history (id, customer_id, amount, reason, created)
                VALUES (?, ?, ?, ?, ?)
            `).run(id, customer_id, amount, reason, timestamp);

            return { id, customer_id, amount, reason, created: timestamp };
        })();
    }

    findAll(limit = 50, offset = 0) {
        return this.db.prepare(`
            SELECT w.*, c.name as customer_name 
            FROM weight_loss_history w
            LEFT JOIN customer c ON w.customer_id = c.id
            ORDER BY w.created DESC
            LIMIT ? OFFSET ?
        `).all(limit, offset);
    }

    countAll() {
        return this.db.prepare(`SELECT COUNT(*) as total FROM weight_loss_history`).get().total;
    }

    /**
     * Find history for a specific customer
     */
    findByCustomerId(customer_id, limit = 50, offset = 0) {
        return this.db.prepare(`
            SELECT w.*, c.name as customer_name 
            FROM weight_loss_history w
            LEFT JOIN customer c ON w.customer_id = c.id
            WHERE w.customer_id = ? 
            ORDER BY w.created DESC 
            LIMIT ? OFFSET ?
        `).all(customer_id, limit, offset);
    }

    /**
     * Count history records for a customer
     */
    countByCustomerId(customer_id) {
        return this.db.prepare(`
            SELECT COUNT(*) as total FROM weight_loss_history WHERE customer_id = ?
        `).get(customer_id).total;
    }

    /**
     * Find a single record (Read-Only)
     */
    findById(id) {
        return this.db.prepare(`SELECT * FROM weight_loss_history WHERE id = ?`).get(id);
    }
}

module.exports = new WeightLossHistoryRepository();
