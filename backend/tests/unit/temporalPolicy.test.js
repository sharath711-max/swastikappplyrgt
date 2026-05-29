'use strict';

/**
 * temporalPolicy.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * GAP-E policy decision (E:A): server-side now() is the authoritative
 * `created` timestamp. Any `created` field passed in the request body is
 * intentionally IGNORED — the API does not support backdating.
 *
 * Backdating would weaken:
 *   • DONE-state immutability semantics
 *   • signed snapshot timestamps (HMAC includes created_at)
 *   • balance roll-up ordering
 *   • audit interpretability
 *
 * If historical imports are ever needed, build a separate import tool with
 * explicit semantics. Do NOT relax this rule on the normal create path.
 */

const { db, initDb, genId, now } = require('../../db/db');
const testService = require('../../services/v2/testService');
const certService = require('../../services/v2/certificateService');

beforeAll(() => initDb());

function makeCustomer() {
    const id = genId('CUS');
    const ts = now();
    db.prepare(`
        INSERT INTO customer (id, name, phone, balance, created, lastmodified)
        VALUES (?, ?, ?, 0, ?, ?)
    `).run(id, 'TemporalPolicy', String(Date.now()).slice(-10), ts, ts);
    return id;
}

function readCert(table, id) {
    return db.prepare(`SELECT created FROM ${table} WHERE id = ?`).get(id);
}

function readTest(table, id) {
    return db.prepare(`SELECT created FROM ${table} WHERE id = ?`).get(id);
}

const ATTEMPTED_BACKDATE = '2010-01-01T00:00:00.000Z'; // 16 years in the past

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Temporal policy: client-supplied `created` is ignored on create', () => {

    test.each([
        ['gold',   'gold_test'],
        ['silver', 'silver_test'],
    ])('%s test create — client `created` is dropped, server now() wins', (type, table) => {
        const customerId = makeCustomer();
        const startedAt = Date.now();

        const result = testService.createTest(type, {
            customer_id: customerId,
            created    : ATTEMPTED_BACKDATE,   // <- attempted backdate, must be ignored
            items: [{
                name: 'Item A',
                item_type: 'Ring',
                gross_weight: 5,
                test_weight : 0.1,
            }],
        });

        const stored = readTest(table, result.id);
        expect(stored.created).not.toBe(ATTEMPTED_BACKDATE);

        // Server-side timestamp must be within a reasonable window of the call
        const storedMs = new Date(stored.created).getTime();
        expect(storedMs).toBeGreaterThanOrEqual(startedAt - 5000);
        expect(storedMs).toBeLessThanOrEqual(Date.now() + 5000);

        // Cleanup
        db.prepare(`DELETE FROM ${table}_item WHERE ${table}_id = ?`).run(result.id);
        db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(result.id);
        db.prepare('DELETE FROM customer WHERE id = ?').run(customerId);
    });

    test.each([
        ['gold',   'gold_certificate'],
        ['silver', 'silver_certificate'],
    ])('%s certificate create — client `created` is dropped, server now() wins', (type, table) => {
        const customerId = makeCustomer();
        const startedAt = Date.now();

        const result = certService.createCertificate(type, {
            customer_id: customerId,
            created    : ATTEMPTED_BACKDATE,   // <- ignored
            items: [{
                name: 'Item B',
                item_type: 'Ring',
                gross_weight: 10,
                test_weight : 0.2,
                purity: 91.6,
                rate: 6500,
            }],
        });

        const stored = readCert(table, result.id);
        expect(stored.created).not.toBe(ATTEMPTED_BACKDATE);

        const storedMs = new Date(stored.created).getTime();
        expect(storedMs).toBeGreaterThanOrEqual(startedAt - 5000);
        expect(storedMs).toBeLessThanOrEqual(Date.now() + 5000);

        // Cleanup
        db.prepare(`DELETE FROM ${table}_item WHERE ${table}_id = ?`).run(result.id);
        db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(result.id);
        db.prepare('DELETE FROM credit_history WHERE customer_id = ?').run(customerId);
        db.prepare('DELETE FROM customer WHERE id = ?').run(customerId);
    });

    test('policy is documented in source — testService and certificateService both note the rule', () => {
        const fs = require('fs');
        const path = require('path');
        const ts  = fs.readFileSync(path.join(__dirname, '../../services/v2/testService.js'),        'utf8');
        const cs  = fs.readFileSync(path.join(__dirname, '../../services/v2/certificateService.js'), 'utf8');
        // Both files must mention the temporal policy explicitly so future
        // contributors can't quietly relax the rule.
        expect(ts).toMatch(/temporal policy/i);
        expect(cs).toMatch(/temporal policy/i);
        expect(ts).toMatch(/server-side now\(\)/i);
        expect(cs).toMatch(/server-side now\(\)/i);
    });
});
