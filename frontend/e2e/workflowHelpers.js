// workflowHelpers.js — shared E2E harness for the workflow-board create→test→bill flow.
// NOT a spec file (no .spec) so Playwright won't run it directly.
//
// Encapsulates the post-throughput-wave interaction model so the six workflow
// specs share ONE source of truth for: A2 customer combobox, inline item rows
// (no "Add to list"), the create submit button, and the id-based Phase2Modal
// action buttons. When the UI drifts again, fix it here once.
const { expect } = require('@playwright/test');

const API = 'http://127.0.0.1:6001/api';

// Stable Phase2Modal action buttons (id > visible text — survives label churn).
const BTN = Object.freeze({
    save: '#puritySaveBtn',        // Save draft (no status change)
    submit: '#puritySubmitBtn',    // TODO → IN_PROGRESS  (label "Submit")
    deliver: '#paymentSubmitBtn',  // IN_PROGRESS → DONE  (label "Delivered")
});

// Current Phase2Modal titles per stage (post-rename).
const TITLE = Object.freeze({
    inProgress: 'Payment & Delivery',
    done: 'Completed',
});

async function login(page) {
    await page.addInitScript(() => {
        const style = document.createElement('style');
        style.innerHTML = 'iframe { display: none !important; }';
        document.head.appendChild(style);
    });
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://127.0.0.1:3000/', { timeout: 8000 });
    await page.waitForTimeout(400);
}

async function getToken(page) {
    const res = await page.request.post(`${API}/auth/login`, {
        data: { username: 'admin', password: 'admin123' },
    });
    return (await res.json()).token;
}

// Navigate to a workflow queue and wait for its "+ New {label}" header button.
async function gotoWorkflow(page, tab, newLabel) {
    await page.goto(`/workflow?tab=${tab}`);
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: newLabel }).waitFor({ timeout: 8000 });
}

// A2 combobox: type → debounce → wait for an option → pick it. Returns the name.
async function selectCustomer(modal, page, query = 'ku') {
    const combo = modal.locator('.customer-combobox__input');
    await combo.fill(query);
    await page.waitForTimeout(800);
    const opt = modal.locator('.customer-combobox__option').first();
    await opt.waitFor({ timeout: 5000 });
    const name = (await opt.locator('.customer-combobox__opt-name').innerText()).trim();
    await opt.click();
    await page.waitForTimeout(400);
    return name;
}

// Fill the inline item row (no "Add to list" step). testWeight is filled only
// when the field exists (tests have it; certs don't).
async function fillInlineItemRow(modal, item = {}) {
    const { name = 'ITEM', itemType = 'RING', weight = '10.500', testWeight = '0.300' } = item;
    await modal.locator('input[placeholder="Name"]').first().fill(name);
    await modal.locator('input[placeholder="Item type"]').first().fill(itemType);
    await modal.locator('input[placeholder="Total weight"]').first().fill(weight);
    const tw = modal.locator('input[placeholder="Test weight"]').first();
    if (await tw.count()) await tw.fill(testWeight);
}

// Open "+ New {newLabel}", pick a customer, fill one item, submit. Returns
// { customer }. Assumes you're already on the right workflow queue.
async function createRecord(page, { newLabel, item } = {}) {
    await page.getByRole('button', { name: newLabel }).click();
    const modal = page.locator('.modal.show').last();
    await modal.waitFor({ timeout: 5000 });
    const customer = await selectCustomer(modal, page);
    await fillInlineItemRow(modal, item);
    await modal.locator('#sampleDetailsSubmitBtn').click();
    await modal.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    await dismissDevErrorOverlay(page); // clear dev-only StrictMode close artifact, if any
    return { customer };
}

// Dismiss the CRA dev runtime-error overlay if it appeared. The overlay is a
// dev-only React-Bootstrap + StrictMode double-mount artifact on modal close
// (see workflowHelpers notes) — it has ZERO production impact but renders a
// full-viewport iframe that blocks the test. Scoped + specific: only removes
// the dev overlay, never suppresses real assertions/errors.
async function dismissDevErrorOverlay(page) {
    await page.evaluate(() => {
        const kill = (el) => { try { el.remove(); } catch (_e) {} };
        document.querySelectorAll('iframe#webpack-dev-server-client-overlay').forEach(kill);
        // react-error-overlay renders a max-z-index full-screen iframe
        document.querySelectorAll('body > iframe').forEach((f) => {
            const z = parseInt(getComputedStyle(f).zIndex || '0', 10);
            const r = f.getBoundingClientRect();
            if (z > 1000000 || (r.width > window.innerWidth * 0.8 && r.height > window.innerHeight * 0.8)) kill(f);
        });
    }).catch(() => {});
}

// Wait for the newest card (column 0=Ongoing, 1=Tested, 2=Completed) and open it.
async function openNewestCard(page, colIndex) {
    await dismissDevErrorOverlay(page); // a prior modal close may have raised the dev overlay
    const card = page.locator('.kanban-column').nth(colIndex).locator('.kanban-card').first();
    await card.waitFor({ timeout: 12000 });
    await card.click();
    await page.waitForTimeout(900);
    const modal = page.locator('.modal.show').last();
    await modal.waitFor({ timeout: 5000 });
    return modal;
}

module.exports = {
    API, BTN, TITLE,
    login, getToken, gotoWorkflow,
    selectCustomer, fillInlineItemRow, createRecord, openNewestCard,
    dismissDevErrorOverlay,
};
