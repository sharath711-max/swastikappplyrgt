const { db } = require('../db/db');

class BaseRepository {
    constructor(tableName) {
        this.tableName = tableName;
        this.db = db;
    }

    findAll(filters = {}) {
        let query = `SELECT * FROM ${this.tableName} WHERE deletedon IS NULL`;
        const params = [];

        // Optional basic filters
        if (filters.status) {
            query += ` AND status = ?`;
            params.push(filters.status);
        }

        query += ` ORDER BY created DESC`;
        return this.db.prepare(query).all(...params);
    }

    findById(id) {
        return this.db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ? AND deletedon IS NULL`).get(id);
    }

    delete(id) {
        // Enforce soft-delete logic
        const timestamp = new Date().toISOString();
        return this.db.prepare(`UPDATE ${this.tableName} SET deletedon = ?, lastmodified = ? WHERE id = ?`).run(timestamp, timestamp, id);
    }

    restore(id) {
        const timestamp = new Date().toISOString();
        return this.db.prepare(`UPDATE ${this.tableName} SET deletedon = NULL, lastmodified = ? WHERE id = ?`).run(timestamp, id);
    }
}

module.exports = BaseRepository;
