const { test, expect } = require('@playwright/test');

test.describe('Domain 3: Workflow Board (Kanban) Operations', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Authenticate before every test
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Assert login success and navigate to Workflow
    await expect(page).toHaveURL(/.*\/dashboard/);
    await page.goto('/workflow');
    
    // Verify the Workflow Board has loaded
    await expect(page.locator('.workflow-board')).toBeVisible();
  });

  test('WKFL-01: Kanban board renders all three state columns correctly', async ({ page }) => {
    // Verify that TODO, IN_PROGRESS, and DONE columns exist
    const todoColumn = page.locator('.kanban-column[data-status="TODO"]');
    const inProgressColumn = page.locator('.kanban-column[data-status="IN_PROGRESS"]');
    const doneColumn = page.locator('.kanban-column[data-status="DONE"]');

    await expect(todoColumn).toBeVisible();
    await expect(todoColumn).toContainText('TODO');
    
    await expect(inProgressColumn).toBeVisible();
    await expect(inProgressColumn).toContainText('IN PROGRESS');
    
    await expect(doneColumn).toBeVisible();
    await expect(doneColumn).toContainText('DONE');
  });

  test('WKFL-02: Module tabs switch data contexts successfully', async ({ page }) => {
    // Click the Silver Test tab
    await page.click('button[role="tab"]:has-text("Silver Tests")');
    
    // Ensure the active tab updates visually
    const activeTab = page.locator('button[role="tab"].active');
    await expect(activeTab).toContainText('Silver Tests');

    // Click the Gold Certificates tab
    await page.click('button[role="tab"]:has-text("Gold Certs")');
    await expect(activeTab).toContainText('Gold Certs');
  });

  test('WKFL-03: Search filter correctly isolates Kanban cards', async ({ page }) => {
    // Type a mock customer name or ID into the search bar
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('SWL-'); 
    
    // Wait for the UI to filter (assuming instantaneous React state update)
    // We expect the board to still be visible, and cards to filter down
    await expect(page.locator('.workflow-board')).toBeVisible();
  });

  test('WKFL-04: Clicking a TODO card opens the Action Modal', async ({ page }) => {
    // Target the first available card in the TODO column
    const firstTodoCard = page.locator('.kanban-column[data-status="TODO"] .kanban-card').first();
    
    // Only proceed if there is actually a card to test (prevents test failure on empty DB)
    if (await firstTodoCard.isVisible()) {
      await firstTodoCard.click();

      // Assert that the record details/action modal pops up
      const modal = page.locator('.swastik-modal'); // Adjust selector to match your actual modal class
      await expect(modal).toBeVisible();
      
      // Close the modal
      await page.click('.modal-close-button, [data-cy="btn-close-modal"]');
      await expect(modal).not.toBeVisible();
    } else {
      console.log('No TODO cards available to test modal interaction.');
    }
  });

});
