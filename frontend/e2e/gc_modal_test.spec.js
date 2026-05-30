// gc_modal_test.spec.js — Gold Certificate full modal flow
// Rehabbed for the post-throughput-wave UI: A2 customer combobox, inline
// item rows (no "Add to list"), and id-based Phase2Modal buttons
// (#puritySaveBtn / #puritySubmitBtn / #paymentSubmitBtn).
const { test, expect } = require('@playwright/test');

const API = 'http://127.0.0.1:6001/api';

// ── helpers ──────────────────────────────────────────────────────────────────

async function login(page) {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://127.0.0.1:3000/', { timeout: 8000 });
    await page.waitForTimeout(400);
}

async function goToGCTab(page) {
    await page.goto('/workflow?tab=gold_cert');
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'New Gold Certificate' }).waitFor({ timeout: 8000 });
}

async function getToken(page) {
    const res = await page.request.post(`${API}/auth/login`, {
        data: { username: 'admin', password: 'admin123' },
    });
    return (await res.json()).token;
}

// Opens the New Gold Cert modal, picks an existing customer, fills one inline
// item row, submits. Returns the selected customer's name for later assertions.
async function createCertViaUI(page) {
    await page.getByRole('button', { name: 'New Gold Certificate' }).click();
    const modal = page.locator('.modal.show').last();
    await modal.waitFor({ timeout: 5000 });

    // Customer — A2 combobox
    const combo = modal.locator('.customer-combobox__input');
    await combo.fill('ku');
    await page.waitForTimeout(800);
    const firstOpt = modal.locator('.customer-combobox__option').first();
    await firstOpt.waitFor({ timeout: 5000 });
    const customerName = (await firstOpt.locator('.customer-combobox__opt-name').innerText()).trim();
    await firstOpt.click();
    await page.waitForTimeout(400);

    // Inline item row (no "Add to list" step anymore)
    await modal.locator('input[placeholder="Name"]').first().fill('BANGLE');
    await modal.locator('input[placeholder="Item type"]').first().fill('RING');
    await modal.locator('input[placeholder="Total weight"]').first().fill('10.500');

    await modal.locator('#sampleDetailsSubmitBtn').click();
    await page.waitForTimeout(2500);
    return customerName;
}

async function clickNewestCardInColumn(page, colIndex) {
    const col = page.locator('.kanban-column').nth(colIndex);
    const card = col.locator('.kanban-card').first();
    await card.waitFor({ timeout: 8000 });
    await card.click();
    await page.waitForTimeout(900);
    return card;
}

// ── tests ─────────────────────────────────────────────────────────────────────

test.describe('Gold Certificate — modal flow', () => {

    test('1. Create GC via New Gold Cert modal', async ({ page }) => {
        await login(page);
        await goToGCTab(page);

        const countBefore = await page.locator('.kanban-column').nth(0).locator('.kanban-card').count();
        await createCertViaUI(page);

        const toast = page.locator('.Toastify__toast').first();
        const toastTxt = await toast.innerText().catch(() => '');
        console.log('Issue toast:', toastTxt.replace(/\n/g, ' ').trim().slice(0, 70));
        expect(toastTxt.toLowerCase()).toMatch(/created|issued/);

        const countAfter = await page.locator('.kanban-column').nth(0).locator('.kanban-card').count();
        expect(countAfter).toBeGreaterThan(countBefore);
        console.log(`✅  Ongoing column: ${countBefore} → ${countAfter} cards`);
    });

    test('2. Phase2Modal opens with correct title for TODO cert', async ({ page }) => {
        await login(page);
        await goToGCTab(page);
        const customerName = await createCertViaUI(page);
        await page.waitForTimeout(600);

        await clickNewestCardInColumn(page, 0);
        const modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });

        const title = await modal.locator('.modal-title').first().innerText();
        console.log('Modal title:', title);
        expect(title).toContain('Certificate');
        expect(title).not.toMatch(/Add Test Results/i);

        // Customer shown in the info row (whoever we just picked)
        const info = await modal.locator('#purityModalCustomerName').innerText();
        expect(info.trim()).toBe(customerName);
        console.log('✅  Customer shown in info row:', info.trim());

        // Purity input editable
        const purityInput = modal.locator('[data-testid="item-purity"]').first();
        await purityInput.waitFor({ timeout: 3000 });
        await expect(purityInput).not.toBeDisabled();
        console.log('✅  Purity field editable');

        // Save + Submit buttons present (renamed; target by id)
        await expect(modal.locator('#puritySaveBtn')).toBeVisible();
        await expect(modal.locator('#puritySubmitBtn')).toBeVisible();
        console.log('✅  Save + Submit buttons visible');
    });

    test('3. Save keeps modal open — then Submit moves to IN_PROGRESS', async ({ page }) => {
        await login(page);
        await goToGCTab(page);
        await createCertViaUI(page);
        await page.waitForTimeout(600);

        await clickNewestCardInColumn(page, 0);
        const modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });

        const purityInput = modal.locator('[data-testid="item-purity"]').first();
        await purityInput.fill('91.6');
        await page.waitForTimeout(300);

        // ── Save (draft) ──
        await modal.locator('#puritySaveBtn').click();
        await page.waitForTimeout(1500);
        await expect(modal).toBeVisible();
        console.log('✅  Modal stays open after Save');

        const purityVal = await purityInput.inputValue();
        expect(parseFloat(purityVal)).toBeCloseTo(91.6, 1);
        console.log('✅  Purity retained after draft save:', purityVal);

        // ── Submit → Tested ──
        await modal.locator('#puritySubmitBtn').click();
        await page.waitForTimeout(3000);
        expect(await modal.isVisible().catch(() => false)).toBe(false);
        console.log('✅  Modal closed after Submit');

        await page.waitForTimeout(1500);
        const testedCards = page.locator('.kanban-column').nth(1).locator('.kanban-card');
        await testedCards.first().waitFor({ timeout: 6000 });
        expect(await testedCards.count()).toBeGreaterThan(0);
        console.log('✅  Tested column populated — Submit worked');
    });

    test('4. Delivered (IN_PROGRESS → DONE) persists mode_of_payment', async ({ page }) => {
        await login(page);
        await goToGCTab(page);
        await createCertViaUI(page);
        await page.waitForTimeout(600);

        // TODO → IN_PROGRESS
        await clickNewestCardInColumn(page, 0);
        let modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });
        await modal.locator('[data-testid="item-purity"]').first().fill('88.5');
        await modal.locator('#puritySubmitBtn').click();
        await page.waitForTimeout(2500);

        // IN_PROGRESS card → Payment & Delivery
        await clickNewestCardInColumn(page, 1);
        modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });

        const title = await modal.locator('.modal-title').first().innerText();
        console.log('IN_PROGRESS modal title:', title);
        expect(title).toContain('Payment & Delivery');

        await modal.locator('input[placeholder="0.00"]').first().fill('500');
        await modal.locator('select').first().selectOption('UPI');
        await page.waitForTimeout(200);
        console.log('✅  Amount=500, Mode=UPI entered');

        const token = await getToken(page);
        await modal.locator('#paymentSubmitBtn').click();
        await page.waitForTimeout(3500);

        // Verify via API: most recent DONE gold cert has mode_of_payment = UPI
        const listRes = await page.request.get(`${API}/certificates?type=gold&status=DONE&limit=1`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const listBody = await listRes.json();
        const latestDone = (listBody.certificates || [])[0];
        expect(latestDone, 'a DONE gold cert should exist').toBeTruthy();
        const certRes = await page.request.get(`${API}/certificates/${latestDone.id}?type=gold`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const cert = await certRes.json();
        console.log('Latest DONE cert — status:', cert.status, '| mode:', cert.mode_of_payment, '| total:', cert.total);
        expect(cert.status).toBe('DONE');
        expect(cert.mode_of_payment).toBe('UPI');
        expect(Number(cert.total)).toBeGreaterThan(0);
        console.log('✅  mode_of_payment=UPI persisted after Delivered');
    });

    test('5. DONE card shows read-only / sealed details', async ({ page }) => {
        await login(page);
        await goToGCTab(page);
        await createCertViaUI(page);
        await page.waitForTimeout(600);

        // TODO → IN_PROGRESS
        await clickNewestCardInColumn(page, 0);
        let modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });
        await modal.locator('[data-testid="item-purity"]').first().fill('75');
        await modal.locator('#puritySubmitBtn').click();
        await page.waitForTimeout(2500);

        // IN_PROGRESS → DONE
        await clickNewestCardInColumn(page, 1);
        modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });
        await modal.locator('input[placeholder="0.00"]').first().fill('300');
        await modal.locator('select').first().selectOption('Cash');
        await modal.locator('#paymentSubmitBtn').click();
        await page.waitForTimeout(3500);

        // Open the DONE card
        await clickNewestCardInColumn(page, 2);
        modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });

        const title = await modal.locator('.modal-title').first().innerText();
        console.log('DONE modal title:', title);
        expect(title).toContain('Completed');

        await expect(modal.locator('.badge, .slds-badge', { hasText: /sealed/i }).first()).toBeVisible();
        await expect(modal.locator('.badge', { hasText: /immutable|done/i }).first()).toBeVisible();
        console.log('✅  Sealed + Immutable badges present');

        // No action buttons; inputs disabled
        expect(await modal.locator('#puritySubmitBtn, #paymentSubmitBtn, #puritySaveBtn').count()).toBe(0);
        expect(await modal.locator('input:not([disabled])').count()).toBe(0);
        console.log('✅  No action buttons; all inputs disabled');
    });

    test('6. Validation blocks Submit when purity is 0', async ({ page }) => {
        await login(page);
        await goToGCTab(page);
        await createCertViaUI(page);
        await page.waitForTimeout(600);

        await clickNewestCardInColumn(page, 0);
        const modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });

        await modal.locator('[data-testid="item-purity"]').first().fill('0');
        await page.waitForTimeout(200);
        await modal.locator('#puritySubmitBtn').click();
        await page.waitForTimeout(800);

        const errAlert = modal.locator('.alert-danger');
        if (await errAlert.isVisible().catch(() => false)) {
            const alertTxt = await errAlert.innerText();
            console.log('Validation error:', alertTxt.slice(0, 100));
            expect(alertTxt.toLowerCase()).toMatch(/valid|fail|invalid|required|purity/);
            console.log('✅  Validation blocks Submit with purity=0 (alert)');
        }
        // Either way, a blocked submit must leave the modal open (no transition).
        expect(await modal.isVisible().catch(() => false)).toBe(true);
        console.log('✅  Modal stayed open — Submit blocked by validation');
    });
});
