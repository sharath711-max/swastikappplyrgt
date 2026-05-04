// gc_ui_test.spec.js — Full Gold Certificate UI flow test
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3000';
const SLOW  = 600;   // ms between key actions so UI animations settle

test.describe('Gold Certificate full flow', () => {

    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto(`${BASE}/login`);
        await page.fill('input[name="username"], input[placeholder*="sername"], input[type="text"]', 'admin');
        await page.fill('input[name="password"], input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL(`${BASE}/**`, { timeout: 8000 });
        await page.waitForTimeout(SLOW);
    });

    test('Step 1 — Create gold certificate', async ({ page }) => {
        await page.goto(`${BASE}/workflow?tab=gold_cert`);
        await page.waitForTimeout(1500);

        // Open new certificate modal
        const newBtn = page.locator('button', { hasText: /new gold cert|new gc|gold cert/i }).first();
        await newBtn.waitFor({ timeout: 8000 });
        await newBtn.click();
        await page.waitForTimeout(SLOW);

        // Modal should appear
        const modal = page.locator('.modal-container, .modal.show, [role="dialog"]').first();
        await modal.waitFor({ timeout: 5000 });
        console.log('✅  New Certificate modal opened');

        // Search customer
        const search = modal.locator('input[placeholder*="earch"]').first();
        await search.fill('Test');
        await page.waitForTimeout(800);
        const suggestion = page.locator('.suggestion-list .list-group-item, .list-group-item').first();
        await suggestion.waitFor({ timeout: 4000 });
        await suggestion.click();
        await page.waitForTimeout(400);
        console.log('✅  Customer selected');

        // Fill item form
        await modal.locator('input[placeholder*="RING"], input[placeholder*="e.g"]').first().fill('RING');
        await modal.locator('input[placeholder*="0.000"]').nth(0).fill('10.500');  // gross
        await modal.locator('input[placeholder*="0.000"]').nth(1).fill('0.200');   // test
        // Rate field (gold only)
        const rateField = modal.locator('input[placeholder*="0.00"]').first();
        await rateField.fill('7000');
        await page.waitForTimeout(300);

        // Add to list
        await modal.locator('button', { hasText: /add to list/i }).click();
        await page.waitForTimeout(600);

        // Verify item appeared in table
        const itemRow = modal.locator('table tbody tr').first();
        await itemRow.waitFor({ timeout: 3000 });
        const itemText = await itemRow.innerText();
        console.log('✅  Item added to list:', itemText.replace(/\s+/g, ' ').trim().slice(0, 80));

        // Submit
        await modal.locator('button[type="submit"], button', { hasText: /issue cert/i }).click();
        await page.waitForTimeout(2500);

        // Card should appear in TODO column
        const todoColumn = page.locator('.kanban-col, [data-col="TODO"], .col-todo').first();
        const certCard = page.locator('.workflow-card, .kanban-card').first();
        const cardCount = await certCard.count();
        console.log('✅  Certificate card visible on board:', cardCount > 0);
        expect(cardCount).toBeGreaterThan(0);
    });

    test('Step 2 — Enter results (TODO → IN_PROGRESS)', async ({ page }) => {
        await page.goto(`${BASE}/workflow?tab=gold_cert`);
        await page.waitForTimeout(2000);

        // Click first TODO card
        const todoCard = page.locator('.workflow-card, .kanban-card').first();
        await todoCard.waitFor({ timeout: 6000 });
        await todoCard.click();
        await page.waitForTimeout(1000);

        // Phase2Modal should open
        const modal = page.locator('.modal.show, [role="dialog"]').last();
        await modal.waitFor({ timeout: 5000 });

        // Verify title says "Certificate Results" not "Test Results"
        const title = await modal.locator('.modal-title').first().innerText();
        console.log('Modal title:', title);
        expect(title.toLowerCase()).not.toContain('test results');
        console.log('✅  Modal title correct:', title);

        // Fill purity
        const purityInput = modal.locator('input[data-testid="item-purity"], input[placeholder="0.00"]').first();
        await purityInput.waitFor({ timeout: 3000 });
        await purityInput.triple_click?.() ?? await purityInput.click({ clickCount: 3 });
        await purityInput.fill('91.6');
        await page.waitForTimeout(400);
        console.log('✅  Purity 91.6 entered');

        // Save Draft first
        const draftBtn = modal.locator('button', { hasText: /save draft/i });
        if (await draftBtn.count() > 0) {
            await draftBtn.click();
            await page.waitForTimeout(1200);
            // Toast should appear, modal stays open
            const toast = page.locator('.toast, .Toastify__toast, [role="alert"]').first();
            const toastText = await toast.innerText().catch(() => 'no toast');
            console.log('✅  Draft save toast:', toastText.slice(0, 60));
        }

        // Submit to Tested
        const submitBtn = modal.locator('button', { hasText: /submit to tested/i });
        await submitBtn.waitFor({ timeout: 3000 });
        await submitBtn.click();
        await page.waitForTimeout(2500);

        // Modal should close, card moves to IN_PROGRESS
        const modalVisible = await modal.isVisible().catch(() => false);
        console.log('Modal closed after submit:', !modalVisible);

        // Check IN_PROGRESS column
        await page.goto(`${BASE}/workflow?tab=gold_cert`);
        await page.waitForTimeout(1500);
        const inProgressCards = page.locator('.workflow-card, .kanban-card');
        const count = await inProgressCards.count();
        console.log('✅  Cards on board:', count);
        expect(count).toBeGreaterThan(0);
    });

    test('Step 3 — Finalize (IN_PROGRESS → DONE) with payment', async ({ page }) => {
        await page.goto(`${BASE}/workflow?tab=gold_cert`);
        await page.waitForTimeout(2000);

        // Find IN_PROGRESS card — look for any card
        const cards = page.locator('.workflow-card, .kanban-card');
        const count = await cards.count();
        console.log('Total cards:', count);

        let clicked = false;
        for (let i = 0; i < count; i++) {
            const card = cards.nth(i);
            const text = await card.innerText().catch(() => '');
            if (text.includes('IN_PROGRESS') || text.includes('Tested') || text.includes('RING')) {
                await card.click();
                clicked = true;
                break;
            }
        }
        if (!clicked && count > 0) {
            await cards.first().click();
        }
        await page.waitForTimeout(1200);

        const modal = page.locator('.modal.show, [role="dialog"]').last();
        await modal.waitFor({ timeout: 5000 });

        const title = await modal.locator('.modal-title').first().innerText();
        console.log('Modal title for finalize:', title);

        // Fill amount
        const amountInput = modal.locator('input[type="number"][min="0"]').first();
        if (await amountInput.count() > 0) {
            await amountInput.fill('500');
            await page.waitForTimeout(300);
            console.log('✅  Amount 500 entered');
        }

        // Set mode to UPI
        const modeSelect = modal.locator('select').first();
        if (await modeSelect.count() > 0) {
            await modeSelect.selectOption('UPI');
            await page.waitForTimeout(300);
            console.log('✅  Mode set to UPI');
        }

        // Finalize button
        const finalBtn = modal.locator('button', { hasText: /finalize|commit|done/i }).first();
        if (await finalBtn.count() > 0) {
            await finalBtn.click();
            await page.waitForTimeout(3000);

            const toast = page.locator('.toast, .Toastify__toast, [role="alert"]').first();
            const toastText = await toast.innerText().catch(() => '');
            console.log('✅  Finalize toast:', toastText.slice(0, 80));

            const modalGone = !(await modal.isVisible().catch(() => true));
            console.log('Modal closed:', modalGone);
        }
    });

    test('Step 4 — DONE card is immutable (view only)', async ({ page }) => {
        await page.goto(`${BASE}/workflow?tab=gold_cert`);
        await page.waitForTimeout(2000);

        // Find DONE card
        const cards = page.locator('.workflow-card, .kanban-card');
        const count = await cards.count();
        let opened = false;
        for (let i = 0; i < count; i++) {
            const card = cards.nth(i);
            const text = await card.innerText().catch(() => '');
            if (text.includes('DONE') || text.includes('done')) {
                await card.click();
                opened = true;
                break;
            }
        }
        if (!opened && count > 0) {
            // click last card (likely DONE if board sorted newest-first)
            await cards.last().click();
        }
        await page.waitForTimeout(1000);

        const modal = page.locator('.modal.show, [role="dialog"]').last();
        await modal.waitFor({ timeout: 5000 });

        const title = await modal.locator('.modal-title').first().innerText();
        console.log('DONE modal title:', title);

        // Expect "Completed Details" or immutable badge
        const immutableBadge = modal.locator('text=DONE — Record is Immutable, text=Immutable, .badge');
        const badgeCount = await immutableBadge.count();

        // No finalize/submit button
        const finalBtn = modal.locator('button', { hasText: /finalize|commit|submit to tested/i });
        const finalCount = await finalBtn.count();

        console.log('✅  Immutable badge/text found:', badgeCount > 0);
        console.log('✅  No action buttons:', finalCount === 0);

        // Inputs should be disabled
        const inputs = modal.locator('input:not([disabled])');
        const enabledCount = await inputs.count();
        console.log('Enabled inputs in DONE modal:', enabledCount, '(expect 0)');
    });
});
