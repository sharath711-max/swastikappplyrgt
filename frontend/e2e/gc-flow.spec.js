const { test, expect } = require('@playwright/test');

const API_BASE = process.env.E2E_API_URL || 'http://127.0.0.1:5000/api';
const DEFAULT_ADMIN = { username: 'admin', password: 'admin123' };
const TEST_USER = {
    username: `pw_gc_${Date.now()}`,
    password: 'Playwright#123',
    role: 'admin',
};

test.beforeAll(async ({ request }) => {
    const bootstrapLogin = await request.post(`${API_BASE}/auth/login`, { data: DEFAULT_ADMIN });
    const bootstrapBody = await bootstrapLogin.json();
    await request.post(`${API_BASE}/auth/register`, {
        headers: { Authorization: `Bearer ${bootstrapBody.token}` },
        data: TEST_USER,
    });
});

async function login(page) {
    await page.goto('/login');
    await page.getByPlaceholder('Enter laboratory ID').fill(TEST_USER.username);
    await page.getByPlaceholder('Enter secure password').fill(TEST_USER.password);
    await page.getByRole('button', { name: /access system/i }).click();
    await expect(page).toHaveURL('http://127.0.0.1:3000/');
}

test.describe('GC (Gold Certificate) End to End Flow', () => {
    test('creates a Gold Certificate and verifies it in GC and GCI pages', async ({ page }) => {
        const uniqueCustomerName = `E2E GC Customer ${Date.now()}`;
        const uniqueNumber = `9${String(Date.now()).slice(-9)}`;
        
        await login(page);

        // 1. Create a Customer first so we have someone to issue the GC to
        await page.goto('/customers');
        await page.getByRole('button', { name: /Add New Customer/i }).click();
        const custModal = page.getByRole('dialog');
        await custModal.getByPlaceholder('Enter customer name').fill(uniqueCustomerName);
        await custModal.getByPlaceholder('Enter 10-digit mobile number').fill(uniqueNumber);
        await custModal.getByRole('button', { name: 'Save Customer' }).click();
        await expect(page.getByText(/Customer created/i)).toBeVisible({ timeout: 10000 });

        // 2. Go to Certificates page
        await page.goto('/certificates');

        // 3. Issue a new Gold Certificate
        await page.getByRole('button', { name: 'New Certificate' }).click();
        const certModal = page.getByRole('dialog');
        await expect(certModal).toBeVisible();

        // Select Gold Certificate Type
        const goldRadio = certModal.getByRole('radio', { name: /Gold Certificate/i });
        if (await goldRadio.isVisible()) {
            await goldRadio.check();
        }

        // Search and Select customer
        await certModal.getByPlaceholder('Search by name or phone').fill(uniqueCustomerName);
        await certModal.locator('.list-group-item').filter({ hasText: uniqueCustomerName }).first().click();

        // Fill Item details (GCI)
        await certModal.getByPlaceholder('e.g. RING, NECK').fill('Gold Necklace');
        await certModal.locator('label').filter({ hasText: 'Cert No.' }).locator('..').locator('input').fill('GC-999');
        await certModal.locator('label').filter({ hasText: 'Gross Wt' }).locator('..').locator('input').fill('15.5');
        
        // Add to items list
        await certModal.getByRole('button', { name: /Add to List/i }).click();

        // Save Certificate
        await certModal.getByRole('button', { name: /Issue Certificate/i }).click();

        // Wait for success toast
        await expect(page.locator('.toast').filter({ hasText: /Certificate/i })).toBeVisible({ timeout: 15000 });
        
        // 4. Verify in GC List Page
        await page.goto('/list-views');
        await page.locator('.category-tab-item', { hasText: 'Certificates' }).click();
        await page.getByRole('button', { name: 'Gold Certificates' }).click();
        
        const searchInput = page.getByPlaceholder(/Search/i);
        await searchInput.fill(uniqueCustomerName);
        
        // Look for the GC record
        const recordLink = page.locator('table tr').filter({ hasText: uniqueCustomerName }).first();
        await expect(recordLink).toBeVisible();

        // 5. Navigate to GCI page (Certificate Record Detail)
        await recordLink.getByRole('button', { name: /view/i }).click();
        
        // Navigate to Items Tab
        await page.getByRole('button', { name: /Items \(/i }).click();
        
        // Verify in GCI (Item details)
        await expect(page.getByText('Gold Necklace')).toBeVisible(); // Item type verification
        await expect(page.getByText(/15\.5/)).toBeVisible(); // Weight verification
        await expect(page.getByText('GC-999')).toBeVisible(); 
    });
});
