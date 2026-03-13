const { test, expect } = require('@playwright/test');

test.describe('Login Functionality', () => {

  test('Successfully logs in with valid admin credentials', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');

    // Fill in the admin credentials using the newly patched name attributes
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    
    // Click the submit button
    await page.click('button[type="submit"]');
    
    // Expect successful navigation to the dashboard or workflow page
    await expect(page).toHaveURL('http://127.0.0.1:3000/');
    
    // Optionally check if a welcome toast or something indicating success appears
    const toast = page.locator('.toast-success, .swastik-toast, .Toastify__toast').first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(/Welcome/i);
  });

  test('Fails to log in with invalid credentials', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');

    // Fill in invalid credentials
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // Click the submit button
    await page.click('button[type="submit"]');
    
    // Expect failure toast or error message
    const errorMsg = page.locator('.slds-theme_error, .toast-error, .Toastify__toast--error').first();
    await expect(errorMsg).toBeVisible();
  });
});
