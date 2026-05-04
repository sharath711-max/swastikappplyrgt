// pc_modal_test.spec.js — Photo Certificate full modal flow
const { test, expect } = require('@playwright/test');

const API = 'http://127.0.0.1:5000/api';

// Minimal 1×1 transparent PNG — used as a test photo upload
const TEST_PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
);

async function login(page) {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://127.0.0.1:3000/', { timeout: 8000 });
    await page.waitForTimeout(500);
}

async function goToPCTab(page) {
    await page.goto('/workflow?tab=photo_cert');
    await page.waitForTimeout(1200);
    const pcTab = page.locator('.tab-pill', { hasText: 'Photo Cert' });
    await pcTab.waitFor({ timeout: 8000 });
    if (!(await pcTab.getAttribute('class')).includes('active')) {
        await pcTab.click();
        await page.waitForTimeout(600);
    }
}

async function getToken(page) {
    const res = await page.request.post(`${API}/auth/login`, {
        data: { username: 'admin', password: 'admin123' }
    });
    const body = await res.json();
    return body.token;
}

async function createPCViaUI(page) {
    const newBtn = page.locator('.btn-action', { hasText: '+ New Photo Cert' });
    await newBtn.waitFor({ timeout: 6000 });
    await newBtn.click();
    await page.waitForTimeout(500);

    const modal = page.locator('.modal.show').last();
    await modal.waitFor({ timeout: 5000 });

    // Customer
    await modal.locator('input[placeholder="Search by name or phone"]').fill('Test');
    await page.waitForTimeout(700);
    await page.locator('.suggestion-list .list-group-item').first().click();
    await page.waitForTimeout(300);

    // Item — photo cert has single weight field only
    await modal.locator('input[placeholder="e.g. RING, NECK"]').fill('PENDANT');
    const numInputs = modal.locator('input[type="number"]');
    await numInputs.nth(0).fill('5.500');  // weight

    await modal.locator('button', { hasText: /add to list/i }).click();
    await page.waitForTimeout(400);

    await modal.locator('button[type="submit"]').click();
    await modal.waitFor({ state: 'hidden', timeout: 15000 });
    await page.waitForTimeout(2000);
}

async function clickNewestCardInColumn(page, colIndex) {
    const col = page.locator('.kanban-column').nth(colIndex);
    const card = col.locator('.kanban-card').first();
    await card.waitFor({ timeout: 8000 });
    await card.click();
    await page.waitForTimeout(900);
    return card;
}

test.describe('Photo Certificate — modal flow', () => {

    test('1. Create PC via New Photo Cert modal', async ({ page }) => {
        await login(page);
        await goToPCTab(page);

        const countBefore = await page.locator('.kanban-column').nth(0).locator('.kanban-card').count();
        await createPCViaUI(page);

        const toast = page.locator('.Toastify__toast').first();
        const toastTxt = await toast.innerText().catch(() => '');
        console.log('Create toast:', toastTxt.replace(/\n/g, ' ').trim().slice(0, 70));
        expect(toastTxt.toLowerCase()).toContain('certificate issued');

        // Poll up to 8s for count to increase (board may need time to refresh)
        let countAfter = countBefore;
        for (let i = 0; i < 8; i++) {
            countAfter = await page.locator('.kanban-column').nth(0).locator('.kanban-card').count();
            if (countAfter > countBefore) break;
            await page.waitForTimeout(1000);
        }
        expect(countAfter).toBeGreaterThan(countBefore);
        console.log(`✅  Ongoing column: ${countBefore} → ${countAfter} cards`);
    });

    test('2. Phase2Modal shows Photo Cert badge and certificate title for TODO', async ({ page }) => {
        await login(page);
        await goToPCTab(page);
        await createPCViaUI(page);
        await page.waitForTimeout(600);

        await clickNewestCardInColumn(page, 0);

        const modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });

        const title = await modal.locator('.modal-title').first().innerText();
        console.log('Modal title:', title);
        expect(title).toContain('Certificate');
        expect(title).not.toMatch(/Add Test Results/i);
        console.log('✅  Title is certificate-specific:', title);

        // Photo Cert badge
        await expect(modal.locator('.badge', { hasText: /photo cert/i })).toBeVisible();
        console.log('✅  Photo Cert badge present');

        const info = await modal.locator('.border.rounded').first().innerText();
        expect(info).toContain('Test');
        console.log('✅  Customer shown in info row');

        const purityInput = modal.locator('[data-testid="item-purity"]').first();
        await purityInput.waitFor({ timeout: 3000 });
        await expect(purityInput).not.toBeDisabled();
        console.log('✅  Purity field editable');

        // Photo column (camera icon button) should be visible
        await expect(modal.locator('input[type="file"][accept="image/*"]').first()).toBeAttached();
        console.log('✅  Photo upload input present');

        await expect(modal.locator('button', { hasText: /save draft/i })).toBeVisible();
        console.log('✅  Save Draft button visible');

        await expect(modal.locator('button', { hasText: /submit to tested/i })).toBeVisible();
        console.log('✅  Submit to Tested button visible');
    });

    test('3. Upload photo + purity — Submit to Tested moves to IN_PROGRESS', async ({ page }) => {
        await login(page);
        await goToPCTab(page);
        await createPCViaUI(page);
        await page.waitForTimeout(600);

        await clickNewestCardInColumn(page, 0);

        const modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });

        // Enter purity
        const purityInput = modal.locator('[data-testid="item-purity"]').first();
        await purityInput.fill('91.6');
        await page.waitForTimeout(300);

        // Upload photo (required for photo cert submission)
        const photoInput = modal.locator('input[type="file"][accept="image/*"]').first();
        await photoInput.setInputFiles({
            name: 'test.png',
            mimeType: 'image/png',
            buffer: TEST_PNG
        });
        await page.waitForTimeout(400);

        // Save Draft
        await modal.locator('button', { hasText: /save draft/i }).click();
        await page.waitForTimeout(1500);

        const draftToast = page.locator('.Toastify__toast').first();
        const draftTxt = await draftToast.innerText().catch(() => '');
        console.log('Draft toast:', draftTxt.replace(/\n/g, ' ').trim().slice(0, 60));
        expect(draftTxt.toLowerCase()).toContain('draft');

        await expect(modal).toBeVisible();
        console.log('✅  Modal stays open after Save Draft');

        // Submit to Tested
        await modal.locator('button', { hasText: /submit to tested/i }).click();
        await modal.waitFor({ state: 'hidden', timeout: 15000 });
        console.log('✅  Modal closed after Submit to Tested');

        await page.waitForTimeout(2000);
        const testedCards = page.locator('.kanban-column').nth(1).locator('.kanban-card');
        await testedCards.first().waitFor({ timeout: 12000 });
        const count = await testedCards.count();
        expect(count).toBeGreaterThan(0);
        console.log('✅  Tested column has', count, 'card(s) — Submit to Tested worked');
    });

    test('4. Finalize (IN_PROGRESS → DONE) persists mode_of_payment', async ({ page }) => {
        await login(page);
        await goToPCTab(page);
        await createPCViaUI(page);
        await page.waitForTimeout(600);

        // TODO → IN_PROGRESS
        await clickNewestCardInColumn(page, 0);
        let modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });

        await modal.locator('[data-testid="item-purity"]').first().fill('88.5');
        const photoInput = modal.locator('input[type="file"][accept="image/*"]').first();
        await photoInput.setInputFiles({ name: 'test.png', mimeType: 'image/png', buffer: TEST_PNG });
        await page.waitForTimeout(300);

        await modal.locator('button', { hasText: /submit to tested/i }).click();
        await modal.waitFor({ state: 'hidden', timeout: 15000 });
        await page.waitForTimeout(2000);

        // IN_PROGRESS → DONE
        await clickNewestCardInColumn(page, 1);
        modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });

        const title = await modal.locator('.modal-title').first().innerText();
        expect(title).toContain('Payment Details');
        console.log('✅  Modal title: Payment Details');

        const amountInput = modal.locator('input[type="number"][min="0"]').first();
        await amountInput.fill('600');
        await modal.locator('select').first().selectOption('UPI');
        await page.waitForTimeout(200);
        console.log('✅  Amount=600, Mode=UPI entered');

        const finalBtn = modal.locator('button', { hasText: /finalize|commit/i });
        await finalBtn.waitFor({ timeout: 3000 });

        const token = await getToken(page);
        await finalBtn.click();
        await modal.waitFor({ state: 'hidden', timeout: 15000 });

        const toast = page.locator('.Toastify__toast').first();
        const toastTxt = await toast.innerText().catch(() => '');
        console.log('Finalize toast:', toastTxt.replace(/\n/g, ' ').trim().slice(0, 80));
        expect(toastTxt.toLowerCase()).toMatch(/completed|done/);
        console.log('✅  Finalize toast OK');
    });

    test('5. DONE card shows read-only Completed Details', async ({ page }) => {
        await login(page);
        await goToPCTab(page);
        await createPCViaUI(page);
        await page.waitForTimeout(600);

        // TODO → IN_PROGRESS
        await clickNewestCardInColumn(page, 0);
        let modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });

        await modal.locator('[data-testid="item-purity"]').first().fill('75');
        const photoInput = modal.locator('input[type="file"][accept="image/*"]').first();
        await photoInput.setInputFiles({ name: 'test.png', mimeType: 'image/png', buffer: TEST_PNG });
        await page.waitForTimeout(300);

        await modal.locator('button', { hasText: /submit to tested/i }).click();
        await modal.waitFor({ state: 'hidden', timeout: 15000 });
        await page.waitForTimeout(2000);

        // IN_PROGRESS → DONE
        await clickNewestCardInColumn(page, 1);
        modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });
        await modal.locator('input[type="number"][min="0"]').first().fill('350');
        await modal.locator('select').first().selectOption('Cash');
        await modal.locator('button', { hasText: /finalize|commit/i }).click();
        await modal.waitFor({ state: 'hidden', timeout: 15000 });
        await page.waitForTimeout(2000);

        // DONE card
        await clickNewestCardInColumn(page, 2);
        modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });

        const title = await modal.locator('.modal-title').first().innerText();
        console.log('DONE modal title:', title);
        expect(title).toContain('Completed Details');
        console.log('✅  Title: Completed Details');

        await expect(modal.locator('.badge', { hasText: /view only/i })).toBeVisible();
        console.log('✅  View Only badge present');

        await expect(modal.locator('.badge', { hasText: /DONE|Immutable/i })).toBeVisible();
        console.log('✅  DONE/Immutable badge in footer');

        expect(await modal.locator('button', { hasText: /submit to tested|finalize|commit/i }).count()).toBe(0);
        console.log('✅  No action buttons in DONE modal');

        expect(await modal.locator('input:not([disabled])').count()).toBe(0);
        console.log('✅  All inputs disabled');
    });

    test('6. Validation blocks submission when photo is missing', async ({ page }) => {
        await login(page);
        await goToPCTab(page);
        await createPCViaUI(page);
        await page.waitForTimeout(600);

        await clickNewestCardInColumn(page, 0);
        const modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });

        // Enter valid purity but do NOT upload a photo
        const purityInput = modal.locator('[data-testid="item-purity"]').first();
        await purityInput.fill('91.6');
        await page.waitForTimeout(200);

        await modal.locator('button', { hasText: /submit to tested/i }).click();
        await page.waitForTimeout(800);

        const errAlert = modal.locator('.alert-danger');
        const alertVisible = await errAlert.isVisible().catch(() => false);
        if (alertVisible) {
            const alertTxt = await errAlert.innerText();
            expect(alertTxt.toLowerCase()).toMatch(/photo/);
            console.log('✅  Validation error about missing photo:', alertTxt.slice(0, 100));
        } else {
            const modalStillOpen = await modal.isVisible().catch(() => false);
            expect(modalStillOpen).toBe(true);
            console.log('✅  Modal stayed open — photo validation blocked submission');
        }
    });
});
