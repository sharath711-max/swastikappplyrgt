const { db, now, genId, transaction } = require('../db/db');
const seqSvc = require('../services/v2/sequenceService');

class WeightLossHistoryRepository {
    constructor() {
        this.db = db;
    }

    /**
     * Append a new weight loss record (standalone — opens its own transaction).
     */
    async create(data) {
        const { customer_id, amount, reason, mode_of_payment = null } = data;

        return transaction(() => {
            return this.insertWithinTransaction(this.db, { customer_id, amount, reason, mode_of_payment });
        })();
    }

    /**
     * Insert a WLH row using an EXTERNAL transaction-bound db handle.
     * Used by finalize/payment flows so the WLH commit is atomic with the
     * surrounding workflow — if the outer transaction rolls back, no WLH row
     * is left behind. Returns null when amount is not strictly > 0 (per spec).
     */
    insertWithinTransaction(tx, { customer_id, amount, reason, mode_of_payment = null }) {
        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            return null;
        }
        const id = genId('WLH');
        const autoNumber = seqSvc.generateTechnicalAutoNumber('WLH');
        const cashAutoNumber = seqSvc.generateTechnicalAutoNumber('CR');
        const timestamp = now();
        tx.prepare(`
            INSERT INTO weight_loss_history (id, auto_number, customer_id, amount, reason, mode_of_payment, created)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, autoNumber, customer_id, numericAmount, reason, mode_of_payment, timestamp);

        // Mirror the WLH amount into cash_register as an OUT movement so the
        // running Cash In Hand balance reflects the payout. Same transaction
        // handle: outer rollback discards both rows together.
        const today = timestamp.split('T')[0]; // YYYY-MM-DD
        tx.prepare(`
            INSERT INTO cash_register (auto_number, date, type, amount, description, created_at)
            VALUES (?, ?, 'OUT', ?, ?, ?)
        `).run(cashAutoNumber, today, numericAmount, `WLH: ${reason}`, timestamp);

        return { id, auto_number: autoNumber, customer_id, amount: numericAmount, reason, mode_of_payment, created: timestamp };
    }

    // ── Read paths exclude soft-deleted rows by default ──────────────────────

    findAll(limit = 50, offset = 0) {
        return this.db.prepare(`
            SELECT w.*, c.name as customer_name
            FROM weight_loss_history w
            LEFT JOIN customer c ON w.customer_id = c.id
            WHERE w.deletedon IS NULL
            ORDER BY w.created DESC
            LIMIT ? OFFSET ?
        `).all(limit, offset);
    }

    countAll() {
        return this.db.prepare(
            `SELECT COUNT(*) as total FROM weight_loss_history WHERE deletedon IS NULL`
        ).get().total;
    }

    findByCustomerId(customer_id, limit = 50, offset = 0) {
        return this.db.prepare(`
            SELECT w.*, c.name as customer_name
            FROM weight_loss_history w
            LEFT JOIN customer c ON w.customer_id = c.id
            WHERE w.customer_id = ?
              AND w.deletedon IS NULL
            ORDER BY w.created DESC
            LIMIT ? OFFSET ?
        `).all(customer_id, limit, offset);
    }

    countByCustomerId(customer_id) {
        return this.db.prepare(
            `SELECT COUNT(*) as total FROM weight_loss_history
             WHERE customer_id = ? AND deletedon IS NULL`
        ).get(customer_id).total;
    }

    /**
     * Find a single record (Read-Only). Returns the row even if soft-deleted
     * — admin/audit needs visibility.
     */
    findById(id) {
        return this.db.prepare(`SELECT * FROM weight_loss_history WHERE id = ?`).get(id);
    }

    /**
     * Soft-delete a WLH row. Idempotent.
     */
    softDelete(id) {
        return transaction(() => {
            const row = this.db.prepare('SELECT deletedon FROM weight_loss_history WHERE id = ?').get(id);
            if (!row) return { success: false, reason: 'not_found' };
            if (row.deletedon) return { success: true, alreadyDeleted: true };

            this.db.prepare('UPDATE weight_loss_history SET deletedon = ? WHERE id = ?').run(now(), id);
            return { success: true, alreadyDeleted: false };
        })();
    }

    /**
     * Restore a soft-deleted WLH row.
     */
    restore(id) {
        return transaction(() => {
            const row = this.db.prepare('SELECT deletedon FROM weight_loss_history WHERE id = ?').get(id);
            if (!row) return { success: false, reason: 'not_found' };
            if (!row.deletedon) return { success: true, alreadyActive: true };

            this.db.prepare('UPDATE weight_loss_history SET deletedon = NULL WHERE id = ?').run(id);
            return { success: true, alreadyActive: false };
        })();
    }
}

module.exports = new WeightLossHistoryRepository();
