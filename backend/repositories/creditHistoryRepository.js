const { db, now, genId, transaction } = require('../db/db');
const seqSvc = require('../services/v2/sequenceService');

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
            const autoNumber = seqSvc.generateTechnicalAutoNumber('CH');
            const timestamp = now();

            // 1. Insert into credit_history (Append-Only)
            this.db.prepare(`
                INSERT INTO credit_history (id, auto_number, customer_id, amount, type, mode_of_payment, description, created)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(id, autoNumber, customer_id, amount, type, mode_of_payment, description, timestamp);

            // 2. Trigger Balance Roll-up
            this.updateCustomerBalance(customer_id);

            return { id, auto_number: autoNumber, customer_id, amount, type, mode_of_payment, description, created: timestamp };
        })();
    }

    /**
     * Informational roll-up of history records to update customer balance
     * Formula: Balance = SUM(DEBIT) - SUM(CREDIT)
     * DEBIT: Customer owes us more (+)
     * CREDIT: Customer paid us / returned goods (-)
     */
    updateCustomerBalance(customer_id) {
        // Soft-deleted CH rows are excluded from the balance roll-up.
        const result = this.db.prepare(`
            SELECT
                COALESCE(SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END), 0) as total_debit,
                COALESCE(SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END), 0) as total_credit
            FROM credit_history
            WHERE customer_id = ?
              AND deletedon IS NULL
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
     * Find history for a specific customer with optional filters.
     * filters: { type, start_date, end_date, min_amount, max_amount }
     */
    findByCustomerId(customer_id, limit = 50, offset = 0, filters = {}) {
        const { clauses, params } = this._buildFilterClauses(customer_id, filters);
        return this.db.prepare(`
            SELECT * FROM credit_history
            WHERE ${clauses}
            ORDER BY created DESC
            LIMIT ? OFFSET ?
        `).all(...params, limit, offset);
    }

    countByCustomerId(customer_id, filters = {}) {
        const { clauses, params } = this._buildFilterClauses(customer_id, filters);
        return this.db.prepare(`
            SELECT COUNT(*) as total FROM credit_history WHERE ${clauses}
        `).get(...params).total;
    }

    /**
     * Fetch all rows for a customer (no pagination) for CSV export.
     * filters: same shape as findByCustomerId
     */
    findAllByCustomerId(customer_id, filters = {}) {
        const { clauses, params } = this._buildFilterClauses(customer_id, filters);
        return this.db.prepare(`
            SELECT id, created, type, amount, mode_of_payment, description
            FROM credit_history
            WHERE ${clauses}
            ORDER BY created ASC
        `).all(...params);
    }

    _buildFilterClauses(customer_id, filters = {}) {
        // Soft-deleted rows are excluded from all customer-facing reads.
        // Pass `filters.includeDeleted = true` for admin/audit views that
        // need to see soft-deleted entries.
        const clauses = ['customer_id = ?'];
        const params = [customer_id];

        if (!filters.includeDeleted) {
            clauses.push('deletedon IS NULL');
        }

        if (filters.type && ['DEBIT', 'CREDIT'].includes(filters.type.toUpperCase())) {
            clauses.push('type = ?');
            params.push(filters.type.toUpperCase());
        }
        if (filters.start_date) {
            clauses.push("date(created) >= date(?)");
            params.push(filters.start_date);
        }
        if (filters.end_date) {
            clauses.push("date(created) <= date(?)");
            params.push(filters.end_date);
        }
        if (filters.min_amount !== undefined && !isNaN(parseFloat(filters.min_amount))) {
            clauses.push('amount >= ?');
            params.push(parseFloat(filters.min_amount));
        }
        if (filters.max_amount !== undefined && !isNaN(parseFloat(filters.max_amount))) {
            clauses.push('amount <= ?');
            params.push(parseFloat(filters.max_amount));
        }

        return { clauses: clauses.join(' AND '), params };
    }

    /**
     * Find a single transaction record (Read-Only).
     * Returns the row even if soft-deleted — admin/audit needs visibility.
     */
    findById(id) {
        return this.db.prepare(`SELECT * FROM credit_history WHERE id = ?`).get(id);
    }

    /**
     * Soft-delete a CH row (sets deletedon = now()). Re-runs the customer
     * balance roll-up so the soft-deleted entry is removed from the total.
     * Idempotent: re-soft-deleting an already-deleted row is a no-op.
     */
    softDelete(id) {
        return transaction(() => {
            const row = this.db.prepare('SELECT customer_id, deletedon FROM credit_history WHERE id = ?').get(id);
            if (!row) return { success: false, reason: 'not_found' };
            if (row.deletedon) return { success: true, alreadyDeleted: true };

            this.db.prepare('UPDATE credit_history SET deletedon = ? WHERE id = ?').run(now(), id);
            this.updateCustomerBalance(row.customer_id);
            return { success: true, alreadyDeleted: false, customer_id: row.customer_id };
        })();
    }

    /**
     * Restore a previously soft-deleted CH row (sets deletedon = NULL).
     * Re-runs the balance roll-up.
     */
    restore(id) {
        return transaction(() => {
            const row = this.db.prepare('SELECT customer_id, deletedon FROM credit_history WHERE id = ?').get(id);
            if (!row) return { success: false, reason: 'not_found' };
            if (!row.deletedon) return { success: true, alreadyActive: true };

            this.db.prepare('UPDATE credit_history SET deletedon = NULL WHERE id = ?').run(id);
            this.updateCustomerBalance(row.customer_id);
            return { success: true, alreadyActive: false, customer_id: row.customer_id };
        })();
    }
}

module.exports = new CreditHistoryRepository();
