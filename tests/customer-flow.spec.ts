import { test, expect } from '@playwright/test';
import { monitorPageErrors } from './helpers/test-helpers';

test.describe('Customer Storefront Flow', () => {
  let consoleErrors: string[] = [];
  let failedRequests: string[] = [];

  test.beforeEach(({ page }) => {
    consoleErrors = [];
    failedRequests = [];
    monitorPageErrors(page, consoleErrors, failedRequests);
  });

  test('Register customer, login, browse, add to cart, and checkout', async ({ page }) => {
    // 1. Register a new customer
    await page.goto('/register');
    const uniqueEmail = `qa_customer_${Date.now()}@example.com`;
    await page.locator('input[name="name"]').fill('QA Storefront User');
    await page.locator('input[name="email"]').fill(uniqueEmail);
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('input[name="password_confirmation"]').fill('password123');
    await page.locator('button[type="submit"], button:has-text("Register"), button:has-text("SIGN UP")').click();

    // After registration, Laravel Breeze automatically logs the user in and redirects to home page
    await page.waitForURL('https://tos-peakpos-system-production.up.railway.app/');

    // 2. Product details
    const productLink = page.locator('a[href*="/shop/"]').first();
    await productLink.waitFor({ state: 'visible', timeout: 10000 });
    await productLink.click();
    await page.waitForURL('**/shop/*');

    // 3. Add to cart
    const addToBagBtn = page.locator('button:has-text("Add to bag"), button:has-text("ADD TO CART")').first();
    await expect(addToBagBtn).toBeVisible();
    await addToBagBtn.click();

    // 4. View cart
    await page.goto('/cart');

    // 5. Navigate to checkout (user is logged in, so checkout should load successfully!)
    const checkoutBtn = page.locator('a[href*="checkout"], button:has-text("Checkout"), button:has-text("PROCEED TO CHECKOUT")').first();
    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();
    await page.waitForURL('**/checkout');

    // 6. Verify checkout input fields exist
    const submitBtn = page.locator('button[type="submit"], button:has-text("Place Order"), button:has-text("Order")').first();
    await expect(submitBtn).toBeVisible();
  });
});
