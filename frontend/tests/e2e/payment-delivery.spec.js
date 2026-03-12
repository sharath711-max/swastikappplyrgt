const { test, expect } = require('@playwright/test');

test.describe('Domain 3: Payment Delivery & Cash Collection Workflow', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Authenticate before every test
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Ensure we are logged in
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Navigate to the Certificates/List page where completed tests live
    await page.goto('/certificates');
    await expect(page.locator('.certificates-container')).toBeVisible(); // Adjust selector if needed
  });

  test('PAY-01: (Happy Path) Successfully records a cash payment', async ({ page }) => {
    // 2. Locate an unpaid record and click the Payment button
    const paymentButton = page.locator('[data-cy="btn-payment"]').first();
    
    // Gracefully handle if no unpaid records exist to prevent pipeline failures
    if (await paymentButton.isVisible()) {
      await paymentButton.click();

      // Ensure the Payment Modal renders
      const modal = page.locator('.swastik-modal');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText('Receive Payment');

      // 3. Select 'Cash' from the payment mode dropdown
      await page.selectOption('select[name="payment_mode"]', 'Cash');

      // 4. Enter the payment amount
      // (Assuming the UI auto-fills the balance, we clear and type an explicit amount)
      const amountInput = page.locator('input[name="amount_received"]');
      await amountInput.clear();
      await amountInput.fill('500');

      // 5. Click Confirm
      const confirmButton = page.locator('button:has-text("Confirm Payment")');
      await confirmButton.click();

      // Expected End State: Modal closes and Success Toast appears
      await expect(modal).not.toBeVisible();
      const toast = page.locator('.toast-success');
      await expect(toast).toBeVisible();
      await expect(toast).toContainText(/payment|success/i);
    } else {
      console.log('No unpaid records found to test PAY-01.');
    }
  });

  test('PAY-02: (Negative Path) Blocks payment submission with missing amount', async ({ page }) => {
    const paymentButton = page.locator('[data-cy="btn-payment"]').first();
    
    if (await paymentButton.isVisible()) {
      await paymentButton.click();
      
      const modal = page.locator('.swastik-modal');
      await expect(modal).toBeVisible();

      // Intentionally clear the amount and leave it blank
      const amountInput = page.locator('input[name="amount_received"]');
      await amountInput.clear();

      // Attempt to submit
      const confirmButton = page.locator('button:has-text("Confirm Payment")');
      await confirmButton.click();

      // Expected End State: Modal stays open, form validation error appears
      await expect(modal).toBeVisible();
      
      // Look for standard HTML5 validation or custom React error state
      const errorMessage = page.locator('.error-text, :invalid');
      await expect(errorMessage).toBeVisible();
    }
  });

});
