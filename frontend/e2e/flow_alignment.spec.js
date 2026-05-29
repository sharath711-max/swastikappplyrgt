// flow_alignment.spec.js
// ─────────────────────────────────────────────────────────────────────────────
// Fast, mocked Playwright spec that targets the SPECIFIC misalignment classes
// the user has hit in the Kanban flow — without walking the full 5-stage
// pipeline. Runs in ~5-10s per test, no real backend traffic.
//
// Strategy:
//   • page.route('**/api/**') intercepts every request.
//   • We hand back canned responses that simulate a draft test sitting in the
//     "Tested" column with mode_of_payment="Pending" — the exact precondition
//     under which the production bug fires.
//   • The test opens Phase2Modal directly, reads the Mode dropdown's visible
//     text + state value, then clicks Finalize and inspects the OUTGOING
//     POST payload. Mismatch → fail with a precise breakpoint.
//
// What this catches:
//   1. <Form.Select value="X"> where "X" is not in the <option> list — the
//      dropdown renders the first option visually while state holds X. Bug.
//   2. Stale state on remount (modal opened with persisted draft values that
//      differ from what the dropdown actually shows).
//   3. Any future drift between the visible Mode and the POSTed mode_of_payment.
// ─────────────────────────────────────────────────────────────────────────────

const { test, expect } = require('@playwright/test');

const FROZEN_TEST = {
    id: 'STSTEST123',
    type: 'silver',
    auto_number: 'ST26-999',
    status: 'IN_PROGRESS',
    customer_id: 'CUS-FAKE',
    customer: { name: 'Fixture Customer', phone: '9999999999' },
    mode_of_payment: 'Pending',     // ← this is the poisoned value
    total: 500,
    gst: 0,
    items: [{
        id: 'STITEST1',
        item_number: 'ST26-999-1',
        item_name: 'BANGLE',
        gross_weight: 12.000,
        test_weight: 0.500,
        net_weight: 11.500,
        purity: 88.5,
        returned: 0,
    }],
};

async function mockBackend(page) {
    await page.route('**/api/**', async (route) => {
        const url = route.request().url();
        const method = route.request().method();

        // Auth
        if (url.includes('/login') || url.includes('/auth')) {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    token: 'fake-token',
                    user: { id: 'U1', username: 'admin', role: 'admin' },
                }),
            });
        }
        // Customers
        if (url.includes('/customers')) {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ data: [FROZEN_TEST.customer] }),
            });
        }
        // Workflow board (kanban data)
        if (url.includes('/workflow') || url.includes('/kanban')) {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    data: { todo: [], in_progress: [FROZEN_TEST], done: [] },
                }),
            });
        }
        // Single test fetch
        if (/\/silver-tests\/STSTEST123(\?|$)/.test(url) && method === 'GET') {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ data: FROZEN_TEST }),
            });
        }
        // Finalize — let the test capture this
        if (url.includes('/silver-tests/STSTEST123/finalize') && method === 'POST') {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true }),
            });
        }
        // Default — empty success
        return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: null }),
        });
    });
}

test('ST Phase2 — mode_of_payment alignment between dropdown, state, and POST', async ({ page }) => {
    await mockBackend(page);

    // Capture outgoing finalize payload
    let finalizeBody = null;
    page.on('request', (req) => {
        if (req.method() === 'POST' && req.url().includes('/silver-tests/STSTEST123/finalize')) {
            finalizeBody = req.postData();
        }
    });

    // Force-login by injecting token (skip the form so the spec stays fast)
    await page.goto('/');
    await page.evaluate(() => {
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('user', JSON.stringify({ id: 'U1', username: 'admin', role: 'admin' }));
    });
    await page.goto('/workflow?tab=silver');
    await page.waitForTimeout(800);

    // Open the IN_PROGRESS card (column index 1)
    const card = page.locator('.kanban-column').nth(1).locator('.kanban-card').first();
    await card.waitFor({ timeout: 6000 });
    await card.click();

    const modal = page.locator('.modal.show').last();
    await modal.waitFor({ timeout: 5000 });

    // ─── Checkpoint: Mode dropdown initial render ───────────────────────────
    const modeSelect = modal.locator('select').first();
    const initial = await modeSelect.evaluate((el) => ({
        visibleText: el.options[el.selectedIndex]?.text ?? '',
        stateValue : el.value,
        hasPendingOption: Array.from(el.options).some((o) => o.value === 'Pending'),
    }));

    console.log('\n──── CHECKPOINT 1: Phase2 opened with draft mode_of_payment=Pending ────');
    console.log(`  visibleText      : ${JSON.stringify(initial.visibleText)}`);
    console.log(`  stateValue       : ${JSON.stringify(initial.stateValue)}`);
    console.log(`  hasPendingOption : ${initial.hasPendingOption}`);

    const aligned1 = initial.visibleText === initial.stateValue;
    if (!aligned1) {
        console.log(
            `  >>> MISALIGNMENT: dropdown shows "${initial.visibleText}" ` +
            `but <select>.value is "${initial.stateValue}". <<<`
        );
        console.log(
            `  ROOT CAUSE: Phase2Modal.js initialises ` +
            `setModeOfPayment(test.mode_of_payment || 'Cash'). ` +
            `When test.mode_of_payment is a value not in the <option> set ` +
            `(Cash/UPI/Balance), the browser falls back to displaying the first ` +
            `option but state retains the off-list value.`
        );
    }

    // ─── Click Finalize and inspect the POST payload ────────────────────────
    await modal.locator('button', { hasText: /finalize|commit/i }).click();
    await page.waitForTimeout(1500);

    const payload = finalizeBody ? JSON.parse(finalizeBody) : null;
    console.log('\n──── CHECKPOINT 2: POST /finalize payload ────');
    console.log(`  payload.mode_of_payment : ${JSON.stringify(payload?.mode_of_payment)}`);

    const aligned2 = payload && payload.mode_of_payment === initial.visibleText;
    if (!aligned2) {
        console.log(
            `  >>> MISALIGNMENT: visibleText="${initial.visibleText}" ` +
            `but payload.mode_of_payment="${payload?.mode_of_payment}". <<<`
        );
        console.log(
            `  IMPACT: backend stores "${payload?.mode_of_payment}" while user thought ` +
            `"${initial.visibleText}" was selected. Receipt + ledger will be wrong.`
        );
    }

    // Hard fail when either checkpoint misaligns — that's the breakpoint.
    expect(aligned1, 'Dropdown visible text must match <select>.value').toBe(true);
    expect(aligned2, 'POST mode_of_payment must match what user sees').toBe(true);
});

test('ST Phase2 — explicit Mode change propagates to payload (sanity)', async ({ page }) => {
    // Same scaffold but proves the happy path: user explicitly picks UPI →
    // payload says UPI. If the bug above is fixed correctly, this still passes.
    await mockBackend(page);
    let finalizeBody = null;
    page.on('request', (req) => {
        if (req.method() === 'POST' && req.url().includes('/silver-tests/STSTEST123/finalize')) {
            finalizeBody = req.postData();
        }
    });

    await page.goto('/');
    await page.evaluate(() => {
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('user', JSON.stringify({ id: 'U1', username: 'admin', role: 'admin' }));
    });
    await page.goto('/workflow?tab=silver');
    await page.waitForTimeout(800);

    const card = page.locator('.kanban-column').nth(1).locator('.kanban-card').first();
    await card.click();
    const modal = page.locator('.modal.show').last();
    await modal.waitFor({ timeout: 5000 });

    const modeSelect = modal.locator('select').first();
    await modeSelect.selectOption('UPI');
    await page.waitForTimeout(150);

    const visible = await modeSelect.evaluate(
        (el) => el.options[el.selectedIndex]?.text ?? ''
    );
    expect(visible).toBe('UPI');

    await modal.locator('button', { hasText: /finalize|commit/i }).click();
    await page.waitForTimeout(1500);

    const payload = finalizeBody ? JSON.parse(finalizeBody) : null;
    expect(payload?.mode_of_payment).toBe('UPI');
});
