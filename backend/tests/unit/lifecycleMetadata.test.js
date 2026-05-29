'use strict';

/**
 * lifecycleMetadata.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates the uniform lifecycle-metadata contract for business-entity
 * tables (created / lastmodified / deletedon) AND the read-path enforcement
 * that excludes soft-deleted rows from balances, lists, and analytics.
 *
 * Three groups:
 *   A. Schema compliance — every business table has the three columns.
 *   B. Soft-delete behavior — _rollupBalance excludes soft-deleted rows.
 *   C. Restore behavior — restoring re-includes a row in the balance.
 */

const { db, initDb, genId, now } = require('../../db/db');
const ledgerSvc = require('../../services/v2/ledgerService');
const creditHistoryRepo = require('../../repositories/creditHistoryRepository');
const wlhRepo = require('../../repositories/weightLossHistoryRepository');

beforeAll(() => initDb());

// ─── Group A: Schema compliance ──────────────────────────────────────────────

describe('Group A — Lifecycle metadata on business-entity tables', () => {

    test.each([
        'customer',
        'gold_test', 'silver_test',
        'gold_test_item', 'silver_test_item',
        'gold_certificate', 'silver_certificate', 'photo_certificate',
        'gold_certificate_item', 'silver_certificate_item', 'photo_certificate_item',
        'credit_history', 'weight_loss_history', 'receipts',
        'users',
    ])('%s has created + lastmodified + deletedon', (table) => {
        const cols = db.prepare(`PRAGMA table_info(${table})`).all().map(r => r.name);
        expect(cols).toContain('created');
        expect(cols).toContain('lastmodified');
        expect(cols).toContain('deletedon');
    });

    test('receipts no longer has the legacy created_at column', () => {
        const cols = db.prepare(`PRAGMA table_info(receipts)`).all().map(r => r.name);
        expect(cols).not.toContain('created_at');
        expect(cols).toContain('created');
    });

    test('audit_logs is correctly excluded — append-only by design', () => {
        const cols = db.prepare(`PRAGMA table_info(audit_logs)`).all().map(r => r.name);
        // audit_logs has `created` but no soft-delete by deliberate choice
        expect(cols).toContain('created');
        expect(cols).not.toContain('deletedon');
    });
});

// ─── Group B: Soft-delete behavior ───────────────────────────────────────────

function makeCustomer() {
    const id = genId('CUS');
    const ts = now();
    db.prepare(`
        INSERT INTO customer (id, name, phone, balance, created, lastmodified)
        VALUES (?, ?, ?, 0, ?, ?)
    `).run(id, 'LifecycleTest', String(Date.now()).slice(-10), ts, ts);
    return id;
}

describe('Group B — Soft-delete excludes rows from balance roll-up', () => {

    test('soft-deleting a DEBIT removes its amount from the balance', () => {
        const customerId = makeCustomer();

        // Insert one DEBIT directly via ledgerService (atomic + balance roll-up)
        ledgerSvc.recordRevenue('cash', {
            customer_id   : customerId,
            amount        : 500,
            entry_type    : 'DEBIT',
            description   : 'B test charge',
            mode_of_payment: 'Balance',  // no offsetting CREDIT
        });

        // Confirm balance reflects the DEBIT
        const balanceBefore = db.prepare('SELECT balance FROM customer WHERE id = ?').get(customerId).balance;
        expect(balanceBefore).toBe(500);

        // Find the CH row and soft-delete it
        const chRow = db.prepare('SELECT id FROM credit_history WHERE customer_id = ? AND type = ?')
            .get(customerId, 'DEBIT');
        const result = creditHistoryRepo.softDelete(chRow.id);
        expect(result.success).toBe(true);
        expect(result.alreadyDeleted).toBe(false);

        // Balance should now exclude the soft-deleted DEBIT
        const balanceAfter = db.prepare('SELECT balance FROM customer WHERE id = ?').get(customerId).balance;
        expect(balanceAfter).toBe(0);

        // CH row is still present, just marked deleted
        const stillThere = db.prepare('SELECT deletedon FROM credit_history WHERE id = ?').get(chRow.id);
        expect(stillThere.deletedon).not.toBeNull();

        // Cleanup
        db.prepare('DELETE FROM credit_history WHERE customer_id = ?').run(customerId);
        db.prepare('DELETE FROM customer WHERE id = ?').run(customerId);
    });

    test('soft-deleting an already-deleted row is idempotent', () => {
        const customerId = makeCustomer();
        ledgerSvc.recordRevenue('cash', {
            customer_id    : customerId,
            amount         : 100,
            entry_type     : 'DEBIT',
            description    : 'idempotent soft delete test',
            mode_of_payment: 'Balance',
        });
        const chRow = db.prepare('SELECT id FROM credit_history WHERE customer_id = ?').get(customerId);

        const r1 = creditHistoryRepo.softDelete(chRow.id);
        const r2 = creditHistoryRepo.softDelete(chRow.id);
        expect(r1.alreadyDeleted).toBe(false);
        expect(r2.alreadyDeleted).toBe(true);

        db.prepare('DELETE FROM credit_history WHERE customer_id = ?').run(customerId);
        db.prepare('DELETE FROM customer WHERE id = ?').run(customerId);
    });

    test('getHistory does not return soft-deleted rows', () => {
        const customerId = makeCustomer();
        ledgerSvc.recordRevenue('cash', {
            customer_id    : customerId,
            amount         : 250,
            entry_type     : 'DEBIT',
            description    : 'visible test',
            mode_of_payment: 'Balance',
        });
        ledgerSvc.recordRevenue('cash', {
            customer_id    : customerId,
            amount         : 50,
            entry_type     : 'DEBIT',
            description    : 'will-be-deleted',
            mode_of_payment: 'Balance',
        });
        const rows = db.prepare('SELECT id, description FROM credit_history WHERE customer_id = ?').all(customerId);
        const target = rows.find(r => r.description === 'will-be-deleted');
        creditHistoryRepo.softDelete(target.id);

        const history = ledgerSvc.getHistory(customerId);
        const ids = history.map(r => r.id);
        expect(ids).toContain(rows.find(r => r.description === 'visible test').id);
        expect(ids).not.toContain(target.id);

        db.prepare('DELETE FROM credit_history WHERE customer_id = ?').run(customerId);
        db.prepare('DELETE FROM customer WHERE id = ?').run(customerId);
    });
});

// ─── Group C: Restore behavior ────────────────────────────────────────────────

describe('Group C — Restore re-includes a soft-deleted row', () => {

    test('restoring a soft-deleted DEBIT brings its amount back into balance', () => {
        const customerId = makeCustomer();
        ledgerSvc.recordRevenue('cash', {
            customer_id    : customerId,
            amount         : 300,
            entry_type     : 'DEBIT',
            description    : 'restore test',
            mode_of_payment: 'Balance',
        });
        const chRow = db.prepare('SELECT id FROM credit_history WHERE customer_id = ?').get(customerId);

        // Soft-delete → balance drops to 0
        creditHistoryRepo.softDelete(chRow.id);
        expect(db.prepare('SELECT balance FROM customer WHERE id = ?').get(customerId).balance).toBe(0);

        // Restore → balance returns to 300
        const r = creditHistoryRepo.restore(chRow.id);
        expect(r.success).toBe(true);
        expect(r.alreadyActive).toBe(false);
        expect(db.prepare('SELECT balance FROM customer WHERE id = ?').get(customerId).balance).toBe(300);

        // Restore on an already-active row is idempotent
        const r2 = creditHistoryRepo.restore(chRow.id);
        expect(r2.alreadyActive).toBe(true);

        db.prepare('DELETE FROM credit_history WHERE customer_id = ?').run(customerId);
        db.prepare('DELETE FROM customer WHERE id = ?').run(customerId);
    });

    test('WLH soft-delete + restore round-trips cleanly', async () => {
        const customerId = makeCustomer();
        const created = await wlhRepo.create({
            customer_id: customerId,
            amount: 0.150,
            reason: 'lifecycle test',
        });

        // Default read excludes nothing yet
        expect(wlhRepo.findByCustomerId(customerId).map(r => r.id)).toContain(created.id);

        // Soft-delete → list excludes it
        creditHistoryRepo;  // (silence unused — just keeping the import alive)
        const r1 = wlhRepo.softDelete(created.id);
        expect(r1.success).toBe(true);
        expect(wlhRepo.findByCustomerId(customerId).map(r => r.id)).not.toContain(created.id);

        // Restore → it's back
        const r2 = wlhRepo.restore(created.id);
        expect(r2.success).toBe(true);
        expect(wlhRepo.findByCustomerId(customerId).map(r => r.id)).toContain(created.id);

        db.prepare('DELETE FROM weight_loss_history WHERE customer_id = ?').run(customerId);
        db.prepare('DELETE FROM customer WHERE id = ?').run(customerId);
    });
});
