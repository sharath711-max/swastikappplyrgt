'use strict';

/**
 * photoCertSaveResults.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * GAP-C regression guard: photoCertificateService.saveResults() must persist
 * EVERY editable item field, not just media + purity. Previously the operator
 * could edit show_kt / weights / name / item_type / returned in the UI and
 * those edits were silently dropped on save (UI ≠ persisted truth — silent
 * data loss).
 *
 * Each test sets up a fresh photo cert in TODO status (the only state where
 * updateItem accepts edits), mutates a field via saveResults, then re-reads
 * the row directly from the DB and asserts the edit survived.
 *
 * Final test pins the contract end-to-end: a multi-field UI snapshot saved
 * once must come back identical on the next read (the c22 invariant from
 * the spec — "GET item == UI state before save").
 */

const { db, initDb, genId, now } = require('../../db/db');
const photoCertRepo  = require('../../repositories/photoCertificateRepository');
const photoCertSvc   = require('../../services/v2/photoCertificateService');

beforeAll(() => initDb());

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeCustomer() {
    const id = genId('CUS');
    const ts = now();
    db.prepare(`
        INSERT INTO customer (id, name, phone, balance, created, lastmodified)
        VALUES (?, ?, ?, 0, ?, ?)
    `).run(id, 'GapCTest', String(Date.now()).slice(-10), ts, ts);
    return id;
}

async function makeCertWithItem(customerId) {
    const cert = await photoCertRepo.create(
        customerId,
        [{
            name: 'Initial Name',
            item_type: 'Pendant',
            gross_weight: 5,
            test_weight: 0.1,
            net_weight: 4.9,
            purity: 91.6,
            fine_weight: 4.49,
            item_total: 0,
            returned: 0,
            show_kt: 0,
        }],
        { mode_of_payment: 'Cash' },
        'TODO'
    );
    return { certId: cert.id, itemId: cert.items[0].id };
}

function readItem(itemId) {
    return db.prepare('SELECT * FROM photo_certificate_item WHERE id = ?').get(itemId);
}

function cleanup(certId, customerId) {
    db.prepare('DELETE FROM photo_certificate_item WHERE photo_certificate_id = ?').run(certId);
    db.prepare('DELETE FROM photo_certificate WHERE id = ?').run(certId);
    db.prepare('DELETE FROM customer WHERE id = ?').run(customerId);
}

// ─── Field-by-field round-trip tests (mirrors spec c14–c21) ──────────────────

describe('GAP-C: photoCertificateService.saveResults persists every editable field', () => {

    test('Test 1 — show_kt edit persists', async () => {
        const customerId = makeCustomer();
        const { certId, itemId } = await makeCertWithItem(customerId);

        photoCertSvc.saveResults(certId, { items: [{ id: itemId, show_kt: true }] });
        expect(readItem(itemId).show_kt).toBe(1);

        photoCertSvc.saveResults(certId, { items: [{ id: itemId, show_kt: false }] });
        expect(readItem(itemId).show_kt).toBe(0);

        cleanup(certId, customerId);
    });

    test('Test 2 — weight edits persist (gross/test/net/fine/item_total)', async () => {
        const customerId = makeCustomer();
        const { certId, itemId } = await makeCertWithItem(customerId);

        photoCertSvc.saveResults(certId, {
            items: [{
                id: itemId,
                gross_weight: 10.250,
                test_weight : 0.500,
                net_weight  : 9.750,
                fine_weight : 8.928,
                item_total  : 50000,
            }],
        });

        const after = readItem(itemId);
        expect(after.gross_weight).toBeCloseTo(10.250, 3);
        expect(after.test_weight ).toBeCloseTo(0.500,  3);
        expect(after.net_weight  ).toBeCloseTo(9.750,  3);
        expect(after.fine_weight ).toBeCloseTo(8.928,  3);
        expect(after.item_total  ).toBeCloseTo(50000,  2);

        cleanup(certId, customerId);
    });

    test('Test 3 — name and item_type edits persist', async () => {
        const customerId = makeCustomer();
        const { certId, itemId } = await makeCertWithItem(customerId);

        photoCertSvc.saveResults(certId, {
            items: [{ id: itemId, name: 'Custom Tag 42', item_type: 'Bracelet' }],
        });

        const after = readItem(itemId);
        expect(after.name).toBe('Custom Tag 42');
        expect(after.item_type).toBe('Bracelet');

        cleanup(certId, customerId);
    });

    test('Test 4 — returned flag persists', async () => {
        const customerId = makeCustomer();
        const { certId, itemId } = await makeCertWithItem(customerId);

        photoCertSvc.saveResults(certId, { items: [{ id: itemId, returned: true }] });
        expect(readItem(itemId).returned).toBe(1);

        photoCertSvc.saveResults(certId, { items: [{ id: itemId, returned: false }] });
        expect(readItem(itemId).returned).toBe(0);

        cleanup(certId, customerId);
    });

    test('Test 5 — media (media_path) and purity still work (no regression)', async () => {
        const customerId = makeCustomer();
        const { certId, itemId } = await makeCertWithItem(customerId);

        photoCertSvc.saveResults(certId, {
            items: [{ id: itemId, media: '/uploads/abc.jpg', purity: 75.0 }],
        });
        const after = readItem(itemId);
        expect(after.media_path).toBe('/uploads/abc.jpg');
        expect(after.purity).toBeCloseTo(75.0, 2);

        cleanup(certId, customerId);
    });

    test('Test 6 — absent fields leave stored values untouched', async () => {
        const customerId = makeCustomer();
        const { certId, itemId } = await makeCertWithItem(customerId);
        const before = readItem(itemId);

        // Save with ONLY purity changed
        photoCertSvc.saveResults(certId, { items: [{ id: itemId, purity: 80.5 }] });
        const after = readItem(itemId);

        expect(after.purity).toBeCloseTo(80.5, 2);
        // Everything else should be unchanged
        expect(after.name        ).toBe(before.name);
        expect(after.item_type   ).toBe(before.item_type);
        expect(after.gross_weight).toBe(before.gross_weight);
        expect(after.test_weight ).toBe(before.test_weight);
        expect(after.net_weight  ).toBe(before.net_weight);
        expect(after.fine_weight ).toBe(before.fine_weight);
        expect(after.item_total  ).toBe(before.item_total);
        expect(after.returned    ).toBe(before.returned);
        expect(after.show_kt     ).toBe(before.show_kt);

        cleanup(certId, customerId);
    });

    // c22: "GET item == UI state before save"
    test('Test 7 — full UI snapshot round-trips exactly (c22 invariant)', async () => {
        const customerId = makeCustomer();
        const { certId, itemId } = await makeCertWithItem(customerId);

        const uiSnapshot = {
            id          : itemId,
            name        : 'C22 Tag',
            item_type   : 'Necklace',
            gross_weight: 22.000,
            test_weight : 0.250,
            net_weight  : 21.750,
            fine_weight : 19.916,
            item_total  : 99500,
            purity      : 91.62,
            returned    : false,
            show_kt     : true,
            media       : '/uploads/c22.jpg',
        };

        photoCertSvc.saveResults(certId, { items: [uiSnapshot] });
        const persisted = readItem(itemId);

        // Every field forwarded by the UI must match what we read back
        expect(persisted.name        ).toBe(uiSnapshot.name);
        expect(persisted.item_type   ).toBe(uiSnapshot.item_type);
        expect(persisted.gross_weight).toBeCloseTo(uiSnapshot.gross_weight, 3);
        expect(persisted.test_weight ).toBeCloseTo(uiSnapshot.test_weight,  3);
        expect(persisted.net_weight  ).toBeCloseTo(uiSnapshot.net_weight,   3);
        expect(persisted.fine_weight ).toBeCloseTo(uiSnapshot.fine_weight,  3);
        expect(persisted.item_total  ).toBeCloseTo(uiSnapshot.item_total,   2);
        expect(persisted.purity      ).toBeCloseTo(uiSnapshot.purity,       2);
        expect(persisted.returned    ).toBe(0);  // false → 0
        expect(persisted.show_kt     ).toBe(1);  // true  → 1
        expect(persisted.media_path  ).toBe(uiSnapshot.media);

        cleanup(certId, customerId);
    });
});
