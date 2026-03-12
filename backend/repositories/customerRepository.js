const BaseRepository = require('./baseRepository');
const { genId, now } = require('../db/db');

class CustomerRepository extends BaseRepository {
    constructor() {
        super('customer');
    }

    create(customer) {
        const { name, phone, notes } = customer;
        const id = genId('CUS');
        const timestamp = now();

        this.db.prepare(`
            INSERT INTO customer (id, name, phone, notes, balance, created, lastmodified)
            VALUES (?, ?, ?, ?, 0, ?, ?)
        `).run(id, name, phone, notes, timestamp, timestamp);

        return { id, name, phone, notes, balance: 0, created: timestamp };
    }

    update(id, customer) {
        const { name, phone, notes } = customer;
        const timestamp = now();

        this.db.prepare(`
            UPDATE customer
            SET name = ?, phone = ?, notes = ?, lastmodified = ?
            WHERE id = ?
        `).run(name, phone, notes, timestamp, id);

        return this.findById(id);
    }

    findAll() {
        return this.db.prepare(`
            SELECT c.*, 
            c.created as created_at -- alias for compatibility
            FROM customer c
            WHERE c.deletedon IS NULL
            ORDER BY c.lastmodified DESC
        `).all();
    }

    findByPhone(phone) {
        return this.db.prepare('SELECT * FROM customer WHERE phone = ? AND deletedon IS NULL').get(phone);
    }

    toggleStatus(id) {
        // In the new schema "status" column was removed in favor of just deletedon checks?
        // But the previous schema had "status". The request says: deletedon DATETIME NULL.
        // It doesn't explicitly mention a 'status' column for active/inactive, only deletedon.
        // But wait, the user request says: "deletedon DATETIME NULL".
        // The previous init.sql (which I viewed) had: status TEXT NOT NULL DEFAULT 'DONE'.
        // The *new* request REMOVES 'status' and keeps 'deletedon'.
        // So toggleStatus essentially means soft-delete or restore.

        const customer = this.findById(id);
        if (!customer) return null;

        const newDeletedOn = customer.deletedon ? null : now();
        this.db.prepare('UPDATE customer SET deletedon = ?, lastmodified = ? WHERE id = ?').run(newDeletedOn, now(), id);

        return { ...customer, deletedon: newDeletedOn };
    }

    // Helper to search (used by service)
    search(query) {
        return this.db.prepare(`
            SELECT * FROM customer 
            WHERE (name LIKE ? OR phone LIKE ?) AND deletedon IS NULL
            LIMIT 10
        `).all(`%${query}%`, `%${query}%`);
    }
}

module.exports = new CustomerRepository();
