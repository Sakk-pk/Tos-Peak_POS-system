import { test, expect } from '@playwright/test';
import { monitorPageErrors } from './helpers/test-helpers';

test.describe('Authentication & Route Protection', () => {
  let consoleErrors: string[] = [];
  let failedRequests: string[] = [];

  test.beforeEach(({ page }) => {
    consoleErrors = [];
    failedRequests = [];
    monitorPageErrors(page, consoleErrors, failedRequests);
  });

  test.afterEach(() => {
    if (consoleErrors.length > 0) {
      console.warn('Console errors detected during test execution:', consoleErrors);
    }
    if (failedRequests.length > 0) {
      console.warn('Network request failures detected during test execution:', failedRequests);
    }
  });

  test('Guest should be redirected to login when trying to access admin dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/login');
    const loginHeading = page.locator('h1, h2, label:has-text("Sign in")').first();
    await expect(loginHeading).toBeVisible();
  });

  test('Guest should be redirected to login when trying to access POS desk', async ({ page }) => {
    await page.goto('/point-of-sale');
    await page.waitForURL('**/login');
  });

  test('Fail login with invalid email or password', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('wronguser@gmail.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"], button:has-text("SIGN IN")').click();
    
    // Check for error banner or message
    const errorAlert = page.locator('div:has-text("incorrect"), div:has-text("fail"), div[role="alert"]').first();
    await expect(errorAlert).toBeVisible();
  });

  test('Register new customer account successfully', async ({ page }) => {
    await page.goto('/register');
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    
    await page.locator('input[name="name"]').fill('QA Test User');
    await page.locator('input[name="email"]').fill(uniqueEmail);
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('input[name="password_confirmation"]').fill('password123');
    await page.locator('button[type="submit"], button:has-text("Register"), button:has-text("SIGN UP")').click();

    // After registration, should redirect to home or login page
    await page.waitForURL(url => url.pathname === '/' || url.pathname.includes('login') || url.pathname.includes('dashboard'));
  });
});
