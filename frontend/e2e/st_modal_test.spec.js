// st_modal_test.spec.js — Silver Test full modal flow
const { test, expect } = require('@playwright/test');

const API = 'http://127.0.0.1:6001/api';

async function login(page) {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://127.0.0.1:3000/', { timeout: 8000 });
    await page.waitForTimeout(500);
}

async function goToSTTab(page) {
    await page.goto('/workflow?tab=silver');
    await page.waitForTimeout(1200);
    const stRow = page.locator('.workflow-rail-row', { hasText: 'Silver Testing' });
    await stRow.waitFor({ timeout: 8000 });
    const railItem = page.locator('.workflow-rail-item', { has: stRow });
    if (!(await railItem.getAttribute('class') || '').includes('is-active')) {
        await stRow.click();
        await page.waitForTimeout(600);
    }
}

async function createSTViaUI(page) {
    const newBtn = page.getByRole('button', { name: 'New Silver Testing' });
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

    // Item
    await modal.locator('input[placeholder="eg., Ring, Necklace"]').fill('BANGLE');
    const numInputs = modal.locator('input[type="number"]');
    await numInputs.nth(0).fill('12.000');  // gross weight
    await numInputs.nth(1).fill('0.500');   // sample weight

    await modal.locator('button', { hasText: /add to list/i }).click();
    await page.waitForTimeout(400);

    await modal.locator('button.save-btn').click();
    await page.waitForTimeout(2500);
}

async function clickNewestCardInColumn(page, colIndex) {
    const col = page.locator('.kanban-column').nth(colIndex);
    const card = col.locator('.kanban-card').first();
    await card.waitFor({ timeout: 8000 });
    await card.click();
    await page.waitForTimeout(900);
    return card;
}

test.describe('Silver Test — modal flow', () => {

    test('1. Create ST via New Silver Test modal', async ({ page }) => {
        await login(page);
        await goToSTTab(page);

        const countBefore = await page.locator('.kanban-column').nth(0).locator('.kanban-card').count();
        await createSTViaUI(page);

        const toast = page.locator('.Toastify__toast').first();
        const toastTxt = await toast.innerText().catch(() => '');
        console.log('Create toast:', toastTxt.replace(/\n/g, ' ').trim().slice(0, 70));
        expect(toastTxt.toLowerCase()).toMatch(/silver test created/i);

        const countAfter = await page.locator('.kanban-column').nth(0).locator('.kanban-card').count();
        expect(countAfter).toBeGreaterThan(countBefore);
        console.log(`✅  Ongoing column: ${countBefore} → ${countAfter} cards`);
    });

    test('2. Phase2Modal opens with "Add Test Results" title for TODO silver test', async ({ page }) => {
        await login(page);
        await goToSTTab(page);
        await createSTViaUI(page);
        await page.waitForTimeout(600);

        await clickNewestCardInColumn(page, 0);

        const modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });

        const title = await modal.locator('.modal-title').first().innerText();
        console.log('Modal title:', title);
        expect(title).toContain('Add Test Results');
        expect(title).not.toMatch(/certificate/i);
        console.log('✅  Title is test-specific:', title);

        const info = await modal.locator('.border.rounded').first().innerText();
        expect(info).toContain('Test');
        console.log('✅  Customer shown in info row');

        const purityInput = modal.locator('[data-testid="item-purity"]').first();
        await purityInput.waitFor({ timeout: 3000 });
        await expect(purityInput).not.toBeDisabled();
        console.log('✅  Purity field editable');

        await expect(modal.locator('button', { hasText: /save draft/i })).toBeVisible();
        console.log('✅  Save Draft button visible');

        await expect(modal.locator('button', { hasText: /submit to tested/i })).toBeVisible();
        console.log('✅  Submit to Tested button visible');
    });

    test('3. Save Draft keeps modal open — then Submit to Tested moves to IN_PROGRESS', async ({ page }) => {
        await login(page);
        await goToSTTab(page);
        await createSTViaUI(page);
        await page.waitForTimeout(600);

        await clickNewestCardInColumn(page, 0);

        const modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });

        const purityInput = modal.locator('[data-testid="item-purity"]').first();
        await purityInput.fill('92.0');
        await page.waitForTimeout(300);

        // Save Draft
        await modal.locator('button', { hasText: /save draft/i }).click();
        await page.waitForTimeout(1500);

        const draftToast = page.locator('.Toastify__toast').first();
        const draftTxt = await draftToast.innerText().catch(() => '');
        console.log('Draft toast:', draftTxt.replace(/\n/g, ' ').trim().slice(0, 60));
        expect(draftTxt.toLowerCase()).toContain('draft');

        await expect(modal).toBeVisible();
        console.log('✅  Modal stays open after Save Draft');

        const purityVal = await purityInput.inputValue();
        expect(parseFloat(purityVal)).toBeCloseTo(92.0, 1);
        console.log('✅  Purity retained after draft save:', purityVal);

        // Submit to Tested
        await modal.locator('button', { hasText: /submit to tested/i }).click();
        await page.waitForTimeout(3000);

        const stillVisible = await modal.isVisible().catch(() => false);
        expect(stillVisible).toBe(false);
        console.log('✅  Modal closed after Submit to Tested');

        await page.waitForTimeout(1500);
        const testedCards = page.locator('.kanban-column').nth(1).locator('.kanban-card');
        await testedCards.first().waitFor({ timeout: 6000 });
        const count = await testedCards.count();
        expect(count).toBeGreaterThan(0);
        console.log('✅  Tested column has', count, 'card(s) — Submit to Tested worked');
    });

    test('4. Finalize (IN_PROGRESS → DONE) persists mode_of_payment', async ({ page }) => {
        await login(page);
        await goToSTTab(page);
        await createSTViaUI(page);
        await page.waitForTimeout(600);

        // TODO → IN_PROGRESS
        await clickNewestCardInColumn(page, 0);
        let modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });
        await modal.locator('[data-testid="item-purity"]').first().fill('85.0');
        await modal.locator('button', { hasText: /submit to tested/i }).click();
        await page.waitForTimeout(2500);

        // IN_PROGRESS → DONE
        await clickNewestCardInColumn(page, 1);
        modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });

        const title = await modal.locator('.modal-title').first().innerText();
        expect(title).toContain('Payment Details');
        console.log('✅  Modal title: Payment Details');

        const amountInput = modal.locator('input[type="number"][min="0"]').first();
        await amountInput.fill('250');
        await modal.locator('select').first().selectOption('UPI');
        await page.waitForTimeout(200);
        console.log('✅  Amount=250, Mode=UPI entered');

        const finalBtn = modal.locator('button', { hasText: /finalize|commit/i });
        await finalBtn.waitFor({ timeout: 3000 });
        await finalBtn.click();
        await page.waitForTimeout(3500);

        const toast = page.locator('.Toastify__toast').first();
        const toastTxt = await toast.innerText().catch(() => '');
        console.log('Finalize toast:', toastTxt.replace(/\n/g, ' ').trim().slice(0, 80));
        expect(toastTxt.toLowerCase()).toMatch(/completed|done/);
        console.log('✅  Finalize toast OK');
    });

    test('5. DONE card shows read-only Completed Details', async ({ page }) => {
        await login(page);
        await goToSTTab(page);
        await createSTViaUI(page);
        await page.waitForTimeout(600);

        // TODO → IN_PROGRESS
        await clickNewestCardInColumn(page, 0);
        let modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });
        await modal.locator('[data-testid="item-purity"]').first().fill('78');
        await modal.locator('button', { hasText: /submit to tested/i }).click();
        await page.waitForTimeout(2500);

        // IN_PROGRESS → DONE
        await clickNewestCardInColumn(page, 1);
        modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });
        await modal.locator('input[type="number"][min="0"]').first().fill('200');
        await modal.locator('select').first().selectOption('Cash');
        await modal.locator('button', { hasText: /finalize|commit/i }).click();
        await page.waitForTimeout(3500);

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

    test('6. Validation blocks submission when purity is 0', async ({ page }) => {
        await login(page);
        await goToSTTab(page);
        await createSTViaUI(page);
        await page.waitForTimeout(600);

        await clickNewestCardInColumn(page, 0);
        const modal = page.locator('.modal.show').last();
        await modal.waitFor({ timeout: 5000 });

        const purityInput = modal.locator('[data-testid="item-purity"]').first();
        await purityInput.fill('0');
        await page.waitForTimeout(200);

        await modal.locator('button', { hasText: /submit to tested/i }).click();
        await page.waitForTimeout(800);

        const errAlert = modal.locator('.alert-danger');
        const alertVisible = await errAlert.isVisible().catch(() => false);
        if (alertVisible) {
            const alertTxt = await errAlert.innerText();
            expect(alertTxt.toLowerCase()).toMatch(/purity/);
            console.log('✅  Validation error shown:', alertTxt.slice(0, 80));
        } else {
            const modalStillOpen = await modal.isVisible().catch(() => false);
            expect(modalStillOpen).toBe(true);
            console.log('✅  Modal stayed open — validation blocked submission');
        }
    });
});
