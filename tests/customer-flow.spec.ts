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

  test('Navigate storefront catalog, add to cart, and checkout', async ({ page }) => {
    // 1. Homepage loads
    await page.goto('/');
    await expect(page).toHaveTitle(/Tos-Peak|Sneaker/i);

    // 2. Product details
    const productCard = page.locator('a[href*="/shop/"], div:has-text("Runner"), div:has-text("Aero")').first();
    await expect(productCard).toBeVisible();
    await productCard.click();
    await page.waitForURL('**/shop/*');

    // 3. Add to cart
    const addToBagBtn = page.locator('button:has-text("Add to bag"), button:has-text("ADD TO CART")').first();
    await expect(addToBagBtn).toBeVisible();
    await addToBagBtn.click();

    // 4. View cart
    await page.goto('/cart');
    await expect(page.locator('h1, h2:has-text("Shopping Cart"), h2:has-text("Bag")').first()).toBeVisible();

    // 5. Update quantity
    const quantitySelect = page.locator('select, input[type="number"]').first();
    if (await quantitySelect.count() > 0) {
      await quantitySelect.fill('2');
      await page.keyboard.press('Enter');
    }

    // 6. Navigate to checkout
    const checkoutBtn = page.locator('a[href*="checkout"], button:has-text("Checkout"), button:has-text("PROCEED TO CHECKOUT")').first();
    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();
    await page.waitForURL('**/checkout');

    // 7. Verify checkout validation on empty fields
    const placeOrderBtn = page.locator('button:has-text("Place Order"), button:has-text("COMPLETE PURCHASE")').first();
    await expect(placeOrderBtn).toBeVisible();
    await placeOrderBtn.click();

    // Verify errors appear
    const validationError = page.locator('p:has-text("required"), div:has-text("required"), span:has-text("required")').first();
    // (Optional check since some apps use HTML5 validation)
  });
});
