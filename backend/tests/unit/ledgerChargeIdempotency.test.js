'use strict';

/**
 * ledgerChargeIdempotency.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Runtime regression guard for the customer-centric CH/WLH refactor.
 *
 * Asserts that ledgerSvc.chargeCertificate(...) is atomic + idempotent:
 *   • First call: cert.ledger_charged_at NULL → set, DEBIT inserted.
 *   • Second call: cert.ledger_charged_at already set → no-op, no extra DEBIT.
 *
 * Without these guarantees, a network retry or duplicate request would
 * double-bill the customer.
 */

const { db, initDb, genId, now } = require('../../db/db');
const ledgerSvc = require('../../services/v2/ledgerService');

beforeAll(() => initDb());

function makeCustomer() {
    const id = genId('CUS');
    const ts = now();
    db.prepare(`
        INSERT INTO customer (id, name, phone, balance, created, lastmodified)
        VALUES (?, ?, ?, 0, ?, ?)
    `).run(id, 'IdempotencyTest', String(Date.now()).slice(-10), ts, ts);
    return id;
}

function makeCertRow(certTable, customer_id) {
    const id = genId(certTable === 'gold_certificate' ? 'GCR'
                  : certTable === 'silver_certificate' ? 'SCR' : 'PCR');
    const ts = now();
    db.prepare(`
        INSERT INTO ${certTable}
          (id, auto_number, customer_id, status, total, created, lastmodified)
        VALUES (?, ?, ?, 'IN_PROGRESS', 100, ?, ?)
    `).run(id, `AUTO-${id}`, customer_id, ts, ts);
    return id;
}

function countDebits(customer_id) {
    return db.prepare(
        `SELECT COUNT(*) AS cnt FROM credit_history WHERE customer_id = ? AND type = 'DEBIT'`
    ).get(customer_id).cnt;
}

function readChargedAt(certTable, cert_id) {
    return db.prepare(`SELECT ledger_charged_at FROM ${certTable} WHERE id = ?`).get(cert_id)?.ledger_charged_at;
}

describe.each([
    ['gold',   'gold_certificate'],
    ['silver', 'silver_certificate'],
    ['photo',  'photo_certificate'],
])('chargeCertificate atomic idempotency — %s', (certType, certTable) => {

    test('first call charges, second call is a no-op (no double-billing)', () => {
        const customerId = makeCustomer();
        const certId = makeCertRow(certTable, customerId);

        // Pre-conditions
        expect(readChargedAt(certTable, certId)).toBeNull();
        expect(countDebits(customerId)).toBe(0);

        // First call: should insert a DEBIT and stamp ledger_charged_at
        const r1 = ledgerSvc.chargeCertificate(certType, {
            cert_id        : certId,
            customer_id    : customerId,
            amount         : 100,
            entry_type     : 'DEBIT',
            description    : 'idempotency test charge',
            mode_of_payment: 'Cash',
        });
        expect(r1.alreadyCharged).toBe(false);
        expect(r1.debit).not.toBeNull();
        expect(readChargedAt(certTable, certId)).not.toBeNull();
        const debitsAfterFirst = countDebits(customerId);
        expect(debitsAfterFirst).toBeGreaterThanOrEqual(1);

        // Second call: must be a no-op — no extra DEBIT, gate already set
        const r2 = ledgerSvc.chargeCertificate(certType, {
            cert_id        : certId,
            customer_id    : customerId,
            amount         : 100,
            entry_type     : 'DEBIT',
            description    : 'idempotency test charge (retry)',
            mode_of_payment: 'Cash',
        });
        expect(r2.alreadyCharged).toBe(true);
        expect(r2.debit).toBeNull();
        expect(countDebits(customerId)).toBe(debitsAfterFirst);

        // Cleanup
        db.prepare(`DELETE FROM credit_history WHERE customer_id = ?`).run(customerId);
        db.prepare(`DELETE FROM ${certTable} WHERE id = ?`).run(certId);
        db.prepare(`DELETE FROM customer WHERE id = ?`).run(customerId);
    });
});

describe('ledger insert no longer carries workflow back-references', () => {
    test('credit_history table has no reference_type / reference_id columns', () => {
        const cols = db.prepare(`PRAGMA table_info(credit_history)`).all().map(r => r.name);
        expect(cols).not.toContain('reference_type');
        expect(cols).not.toContain('reference_id');
    });

    test('weight_loss_history table has no ref_id column', () => {
        const cols = db.prepare(`PRAGMA table_info(weight_loss_history)`).all().map(r => r.name);
        expect(cols).not.toContain('ref_id');
    });

    test('Each cert table carries ledger_charged_at column', () => {
        for (const t of ['gold_certificate', 'silver_certificate', 'photo_certificate']) {
            const cols = db.prepare(`PRAGMA table_info(${t})`).all().map(r => r.name);
            expect(cols).toContain('ledger_charged_at');
        }
    });
});

// ─── Photo is a first-class source_type (no longer coerced to gold) ──────────

describe('GAP-B: Photo Certificate is its own domain category', () => {
    test('_validateAppendEntry accepts photo as a source_type', () => {
        // Direct invocation — pulled in via the public surface to avoid
        // exporting internals just for this test.
        const validate = ledgerSvc._validateAppendEntry;
        const ok = () => validate('photo', {
            customer_id: 'CUS-X',
            amount: 50,
            entry_type: 'DEBIT',
            description: 'PC charge',
        });
        expect(ok).not.toThrow();
    });

    test('_validateAppendEntry rejects unknown source_type with the new message', () => {
        const validate = ledgerSvc._validateAppendEntry;
        const fail = () => validate('platinum', {
            customer_id: 'CUS-X',
            amount: 50,
            entry_type: 'DEBIT',
            description: 'bogus',
        });
        expect(fail).toThrow(/gold.*silver.*photo.*cash/i);
    });

    test('chargeCertificate("photo", ...) does NOT coerce to gold internally', () => {
        // Assert via source code: the line `certType === 'photo' ? 'gold'` is gone.
        const fs = require('fs');
        const path = require('path');
        const src = fs.readFileSync(
            path.join(__dirname, '../../services/v2/ledgerService.js'),
            'utf8'
        );
        expect(src).not.toMatch(/certType\s*===\s*'photo'\s*\?\s*'gold'/);
        expect(src).not.toMatch(/'photo'\s*\?\s*'gold'\s*:\s*certType/);
        // Validator allowlist must include photo
        expect(src).toMatch(/\['gold',\s*'silver',\s*'photo',\s*'cash'\]/);
    });
});
