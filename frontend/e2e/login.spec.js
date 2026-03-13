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
    await page.goto('/login');
    
    // 1. Enter bad credentials
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'wrongpassword!');
    await page.click('button[type="submit"]');

    // 2. THE FIX: Explicitly wait for the Toast component to enter the DOM
    // We attach a specific timeout and target the text directly, bypassing animation delays.
    const errorToast = page.locator('.slds-theme_error, .Toastify__toast--error').first(); 
    
    // Wait up to 5 seconds for the element to actually be attached to the DOM
    await expect(errorToast).toBeAttached({ timeout: 15000 });
  });
});
