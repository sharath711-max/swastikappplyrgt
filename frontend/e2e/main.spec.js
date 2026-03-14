const { test, expect } = require('@playwright/test');

const API_BASE = process.env.E2E_API_URL || 'http://127.0.0.1:5000/api';
const DEFAULT_ADMIN = {
    username: 'admin',
    password: 'admin123',
};
const TEST_USER = {
    username: `pw_admin_${Date.now()}`,
    password: 'Playwright#123',
    role: 'admin',
};

function buildUniqueCustomerData() {
    const seed = Date.now();
    return {
        name: `Playwright Customer ${seed}`,
        phone: `9${String(seed).slice(-9)}`,
    };
}

function uniqueText(prefix) {
    return `${prefix} ${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

async function getApiToken(request) {
    const response = await request.post(`${API_BASE}/auth/login`, {
        data: { username: TEST_USER.username, password: TEST_USER.password },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('token');
    return body.token;
}

async function apiGetWithAuth(request, token, path) {
    const response = await request.get(`${API_BASE}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok(), `GET ${path} failed with status ${response.status()}`).toBeTruthy();
    return response.json();
}

async function apiPostWithAuth(request, token, path, data) {
    const response = await request.post(`${API_BASE}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
        data,
    });
    expect(response.ok(), `POST ${path} failed with status ${response.status()}`).toBeTruthy();
    return response.json();
}

async function apiPatchWithAuth(request, token, path, data) {
    const response = await request.patch(`${API_BASE}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
        data,
    });
    expect(response.ok(), `PATCH ${path} failed with status ${response.status()}`).toBeTruthy();
    return response.json();
}

async function login(page) {
    await page.goto('/login');
    await page.getByPlaceholder('Enter laboratory ID').fill(TEST_USER.username);
    await page.getByPlaceholder('Enter secure password').fill(TEST_USER.password);
    await page.getByRole('button', { name: /access system/i }).click();
    await expect(page).toHaveURL('http://127.0.0.1:3000/');
    await expect(page.getByRole('heading', { name: `Welcome back, ${TEST_USER.username}` })).toBeVisible();
}

test.describe('Swastik Gold & Silver Lab - Full E2E', () => {
    test.beforeAll(async ({ request }) => {
        const bootstrapLogin = await request.post(`${API_BASE}/auth/login`, {
            data: DEFAULT_ADMIN,
        });
        expect(bootstrapLogin.status()).toBe(200);

        const bootstrapBody = await bootstrapLogin.json();
        const response = await request.post(`${API_BASE}/auth/register`, {
            headers: { Authorization: `Bearer ${bootstrapBody.token}` },
            data: TEST_USER,
        });

        if (response.status() !== 201) {
            const payload = await response.text();
            throw new Error(`Unable to create Playwright test user (${response.status()}): ${payload}`);
        }
    });

    test.beforeEach(async ({ context }) => {
        await context.clearCookies();
    });

    test('renders login page', async ({ page }) => {
        await page.goto('/login');
        await expect(page.locator('h2')).toContainText('SWASTIK LAB');
        await expect(page.getByPlaceholder('Enter laboratory ID')).toBeVisible();
        await expect(page.getByPlaceholder('Enter secure password')).toBeVisible();
        await expect(page.getByRole('button', { name: /access system/i })).toBeVisible();
    });

    test('enforces required login fields', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('button', { name: /access system/i }).click();
        await expect(page.locator('.is-invalid')).toHaveCount(2);
        await expect(page.getByText('Username is required')).toBeVisible();
        await expect(page.getByText('Password is required')).toBeVisible();
    });

    test('redirects protected routes to login without auth', async ({ page }) => {
        const protectedRoutes = ['/', '/customers', '/workflow', '/list-views'];

        for (const route of protectedRoutes) {
            await page.goto(route);
            await expect(page).toHaveURL(/\/login$/);
        }
    });

    test('allows admin login and core navigation', async ({ page }) => {
        await login(page);

        await page.getByRole('link', { name: 'Customers' }).click();
        await expect(page).toHaveURL('http://127.0.0.1:3000/customers');
        await expect(page.getByRole('heading', { name: 'Customer Directory' })).toBeVisible();

        await page.getByRole('link', { name: 'Workflow Board' }).click();
        await expect(page).toHaveURL('http://127.0.0.1:3000/workflow');
        await expect(page.getByRole('heading', { name: 'Laboratory Workflow' })).toBeVisible();

        await page.getByRole('link', { name: 'List Views' }).click();
        await expect(page).toHaveURL(/\/list-views/);
        await expect(page.getByRole('heading', { name: /List Views/ })).toBeVisible();

        await page.locator('.user-menu-btn').click();
        await page.getByRole('button', { name: 'User Management' }).click();
        await expect(page).toHaveURL('http://127.0.0.1:3000/admin/users');
        await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();

        await page.locator('.user-menu-btn').click();
        await page.getByRole('button', { name: 'Logout' }).click();
        await expect(page).toHaveURL(/\/login$/);
    });

    test('loads all protected frontend routes', async ({ page }) => {
        await login(page);

        const checks = [
            { route: '/', text: 'Welcome back,' },
            { route: '/customers', text: 'Customer Directory' },
            { route: '/workflow', text: 'Laboratory Workflow' },
            { route: '/list-views', text: 'List Views' },
            { route: '/certificates', text: 'Certificates' },
            { route: '/gold-test', text: 'Gold Testing Kanban' },
            { route: '/weight-loss', text: 'Weight Loss Records' },
            { route: '/cash-in-hand', text: 'Cash In Hand' },
            { route: '/admin/users', text: 'User Management' },
        ];

        for (const check of checks) {
            await page.goto(check.route);
            await expect(page).not.toHaveURL(/\/login$/);
            await expect(page.getByText(check.text).first()).toBeVisible();
        }
    });

    test('navigates list views categories and subtabs', async ({ page }) => {
        await login(page);
        await page.goto('/list-views');

        await page.locator('.category-tab-item', { hasText: 'Certificates' }).click();
        await expect(page).toHaveURL(/category=certificates/);
        await expect(page.getByText('Certificates List Views')).toBeVisible();

        await page.getByRole('button', { name: 'Photo Certificates' }).click();
        await expect(page).toHaveURL(/tab=photo-certificates/);

        await page.locator('.category-tab-item', { hasText: 'Ledger' }).click();
        await expect(page).toHaveURL(/category=ledger/);
        await page.getByRole('button', { name: 'Weight Loss' }).click();
        await expect(page).toHaveURL(/tab=weight-loss-history/);
    });

    test('supports workflow tab and search interactions', async ({ page }) => {
        await login(page);
        await page.goto('/workflow');
        await expect(page.getByRole('heading', { name: 'Laboratory Workflow' })).toBeVisible();

        await page.locator('.tab-pill', { hasText: 'Silver Test' }).click();
        await expect(page).toHaveURL(/tab=silver/);

        const query = uniqueText('E2E-NO-MATCH');
        await page.locator('#workflow-search').fill(query);
        await expect(page.getByText('Showing').first()).toBeVisible();
        await expect(page.getByText(query).first()).toBeVisible();
        await page.getByText(/Clear/).first().click();
    });

    test('executes workflow status progression with data-level verification', async ({ page, request }) => {
        const token = await getApiToken(request);
        const customer = buildUniqueCustomerData();

        const createdCustomer = await apiPostWithAuth(request, token, '/customers', customer);
        expect(createdCustomer).toHaveProperty('id');

        const createdTest = await apiPostWithAuth(request, token, '/gold-tests', {
            customer_id: createdCustomer.id,
            status: 'TODO',
            mode_of_payment: 'Cash',
            items: [
                {
                    item_type: 'Ring',
                    gross_weight: 10,
                    test_weight: 1.5,
                    purity: 91.6,
                    returned: true,
                },
            ],
        });

        expect(createdTest.success).toBe(true);
        const testId = createdTest.data.id;

        await login(page);
        await page.goto('/workflow?tab=gold');
        await expect(page.getByRole('heading', { name: 'Laboratory Workflow' })).toBeVisible();

        const ongoingColumn = page.locator('.kanban-column').filter({
            has: page.locator('.column-title', { hasText: 'Ongoing' }),
        }).first();
        const testedColumn = page.locator('.kanban-column').filter({
            has: page.locator('.column-title', { hasText: 'Tested' }),
        }).first();
        const completedColumn = page.locator('.kanban-column').filter({
            has: page.locator('.column-title', { hasText: 'Completed' }),
        }).first();

        await page.locator('#workflow-search').fill(customer.name);
        const todoCard = ongoingColumn.locator('.kanban-card', { hasText: customer.name }).first();
        await expect(todoCard).toBeVisible({ timeout: 20000 });

        // Validate forward-only workflow guard.
        await todoCard.dragTo(completedColumn);

        const todoState = await apiGetWithAuth(request, token, `/gold-tests/${testId}`);
        expect(todoState.data.status).toBe('TODO');
        await expect(ongoingColumn.locator('.kanban-card', { hasText: customer.name }).first()).toBeVisible();

        await todoCard.dragTo(testedColumn);
        let inProgressState = await apiGetWithAuth(request, token, `/gold-tests/${testId}`);
        expect(inProgressState.data.status).toBe('IN_PROGRESS');

        // Prepare phase-2 data so Tested -> Completed is valid.
        const resultItems = (inProgressState.data.items || []).map((item) => ({
            id: item.id,
            purity: Number(item.purity) > 0 ? Number(item.purity) : 91.6,
            returned: true,
            test_weight: Number(item.test_weight) > 0 ? Number(item.test_weight) : 1.5,
        }));
        await apiPostWithAuth(request, token, `/gold-tests/${testId}/results`, {
            items: resultItems,
            mode_of_payment: 'Cash',
            total: 500,
        });

        await page.getByRole('button', { name: 'Refresh' }).click();
        inProgressState = await apiGetWithAuth(request, token, `/gold-tests/${testId}`);
        expect(inProgressState.data.status).toBe('IN_PROGRESS');
        expect(Number(inProgressState.data.total || 0)).toBeGreaterThan(0);

        const testedCard = testedColumn.locator('.kanban-card', { hasText: customer.name }).first();
        await expect(testedCard).toBeVisible({ timeout: 10000 });

        // Final transition to Completed is validated through workflow API and reflected in UI.
        await apiPatchWithAuth(request, token, `/workflow/gold/${testId}/status`, { status: 'DONE' });
        await page.getByRole('button', { name: 'Refresh' }).click();
        const doneState = await apiGetWithAuth(request, token, `/gold-tests/${testId}`);
        expect(doneState.data.status).toBe('DONE');
        await expect(completedColumn.locator('.kanban-card', { hasText: customer.name }).first()).toBeVisible({ timeout: 10000 });
    });

    test('executes customer business flow with validation handling', async ({ page, request }) => {
        const customer = buildUniqueCustomerData();

        await login(page);
        await page.getByRole('link', { name: 'Customers' }).click();
        await expect(page).toHaveURL('http://127.0.0.1:3000/customers');
        await expect(page.getByRole('heading', { name: 'Customer Directory' })).toBeVisible();

        await page.getByRole('button', { name: /Add New Customer/i }).click();

        const modal = page.getByRole('dialog');
        await expect(modal).toBeVisible();
        await expect(modal.getByText('Add New Customer')).toBeVisible();

        const nameInput = modal.getByPlaceholder('Enter customer name (min 2 characters)');
        const phoneInput = modal.getByPlaceholder('Enter 10-digit mobile number');
        const saveButton = modal.getByRole('button', { name: 'Save Customer' });

        await expect(saveButton).toBeDisabled();

        await nameInput.fill('1');
        await nameInput.blur();
        await expect(modal.getByText('Minimum 2 characters required')).toBeVisible();

        await phoneInput.fill('12345');
        await phoneInput.blur();
        await expect(modal.getByText('Must be exactly 10 digits')).toBeVisible();
        await expect(saveButton).toBeDisabled();

        await nameInput.fill(customer.name);
        await phoneInput.fill(customer.phone);
        await expect(saveButton).toBeEnabled();
        await saveButton.click();
        await expect(page.getByText(/Customer Created Successfully/i)).toBeVisible({ timeout: 10000 });

        await expect(modal).toBeHidden();

        const searchInput = page.getByPlaceholder('Find by name, phone or record identification...');
        await searchInput.fill(customer.name);
        await expect(page.getByText(customer.name)).toBeVisible();
        await expect(page.getByText(`+91 ${customer.phone}`)).toBeVisible();

        await page.locator('.customer-item-card', { hasText: customer.name }).first().click();
        await expect(page).toHaveURL(/\/customers\/.+/);
        await expect(page.getByText('Customer Information')).toBeVisible();

        // Duplicate customer to verify warning/error toast behavior
        await page.goto('/customers');
        await page.getByRole('button', { name: /Add New Customer/i }).click();
        const dupModal = page.getByRole('dialog');
        await dupModal.getByPlaceholder('Enter customer name (min 2 characters)').fill(`${customer.name} Duplicate`);
        await dupModal.getByPlaceholder('Enter 10-digit mobile number').fill(customer.phone);
        await dupModal.getByRole('button', { name: 'Save Customer' }).click();
        await expect(page.getByText('Customer with this phone already exists')).toBeVisible({ timeout: 10000 });
        await expect(
            dupModal.locator('.invalid-feedback').filter({ hasText: /already registered|already exists/i })
        ).toBeVisible();
        await page.locator('.modal.show .btn-close').first().click();

        // Data-level verification through authenticated API
        const token = await getApiToken(request);
        const customers = await apiGetWithAuth(request, token, '/customers');
        const created = customers.find((c) => c.phone === customer.phone && c.name === customer.name);
        expect(created).toBeTruthy();
    });

    test('creates cash in hand entry from UI', async ({ page, request }) => {
        const description = uniqueText('Playwright Cash Entry');
        const txDate = new Date().toISOString().split('T')[0];

        await login(page);
        await page.goto('/cash-in-hand');
        await expect(page.getByText('Cash In Hand')).toBeVisible();

        await page.getByRole('button', { name: /New Entry/i }).click();
        const modal = page.locator('.modal-overlay').filter({ hasText: 'Record Cash Transaction' });
        await expect(modal).toBeVisible();

        await modal.locator('input[type="date"]').fill(txDate);
        await modal.locator('input[type="number"]').fill('123');
        await modal.locator('input[type="text"]').fill(description);
        await modal.getByRole('button', { name: 'Save Entry' }).click();
        await expect(
            page.locator('.toast-container .slds-toast').filter({ hasText: /Cash entry recorded|Entry recorded/i }).first()
        ).toBeVisible({ timeout: 10000 });
        await expect(modal).toBeHidden({ timeout: 10000 });

        const token = await getApiToken(request);
        const payload = await apiGetWithAuth(
            request,
            token,
            `/cash-register?start_date=${txDate}&end_date=${txDate}&limit=500`
        );
        expect(payload.success).toBe(true);
        const hit = payload.data.find((row) => row.description === description);
        expect(hit).toBeTruthy();
    });

    test('creates weight loss record from UI', async ({ page, request }) => {
        const reason = uniqueText('Playwright Weight Loss');

        await login(page);
        await page.goto('/weight-loss');
        await expect(page.getByText('Weight Loss Records')).toBeVisible();

        await page.getByRole('button', { name: /Add Record/i }).click();
        const modal = page.locator('.modal-overlay').filter({ hasText: 'Record Weight Loss' });
        await expect(modal).toBeVisible();

        // Service requires a customer_id; pick the first real customer option.
        await modal.locator('select').first().selectOption({ index: 1 });
        await modal.locator('input[type="number"]').fill('55');
        await modal.locator('textarea').fill(reason);
        await modal.getByRole('button', { name: 'Save Record' }).click();
        await expect(page.getByText(/Weight loss record added successfully/i)).toBeVisible({ timeout: 10000 });

        const token = await getApiToken(request);
        const payload = await apiGetWithAuth(request, token, '/weight-loss?limit=200');
        expect(payload.success).toBe(true);
        const hit = payload.data.find((row) => row.reason === reason);
        expect(hit).toBeTruthy();
    });

    test('opens certificates modal and closes cleanly', async ({ page }) => {
        await login(page);
        await page.goto('/certificates');

        await page.getByRole('button', { name: /New Certificate/i }).click();
        await expect(page.getByText('Issue New Certificate')).toBeVisible();
        await page.locator('.modal.show .btn-close').first().click();
        await expect(page.getByText('Issue New Certificate')).toBeHidden();
    });

    test('opens gold test modal and validates empty add item', async ({ page }) => {
        await login(page);
        await page.goto('/gold-test');
        await expect(page.getByText('Gold Testing Kanban')).toBeVisible();

        await page.getByRole('button', { name: /New Sample Entry/i }).click();
        const modal = page.getByRole('dialog');
        await expect(modal.getByText('New Sample Entry')).toBeVisible();
        await modal.getByRole('button', { name: /Add to List/i }).click();
        await expect(page.getByText('Please enter Item Type and Gross Weight')).toBeVisible();
        await modal.getByRole('button', { name: 'Cancel' }).click();
    });

    test('validates user management reset password minimum length', async ({ page }) => {
        await login(page);
        await page.goto('/admin/users');
        await expect(page.getByText('User Management')).toBeVisible();

        await page.getByRole('button', { name: 'Reset Password' }).first().click();
        const modal = page.locator('.modal.show');
        await expect(modal.getByText('Reset Password')).toBeVisible();
        await modal.getByPlaceholder('Enter new password').fill('123');
        await modal.getByRole('button', { name: 'Confirm Reset' }).click();
        await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();
        await page.locator('.modal.show .btn-close').first().click();
    });

    test('loads public verify page and shows result state', async ({ page }) => {
        await page.goto(`/verify/E2E-${Date.now()}`);
        await expect(page.getByText('Swastik Digital Ledger')).toBeVisible();
        await expect(page.getByText(/Verification Failed|Authentic Record Found/)).toBeVisible({ timeout: 20000 });
    });

    test('handles record and print fallback pages for invalid ids', async ({ page }) => {
        const badId = `pw-missing-${Date.now()}`;

        await login(page);

        await page.goto(`/record/gold-tests/${badId}`);
        await expect(page.getByText(/Failed to fetch record details.|Record not found./)).toBeVisible({ timeout: 15000 });

        await page.goto(`/print/gold-test/${badId}`);
        await expect(page.getByText('Record Not Found')).toBeVisible({ timeout: 15000 });
    });
});
