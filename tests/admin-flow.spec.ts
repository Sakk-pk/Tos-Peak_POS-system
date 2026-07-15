import { test, expect } from '@playwright/test';
import { monitorPageErrors, loginAdmin } from './helpers/test-helpers';

test.describe('Admin Control Panel Flow', () => {
  let consoleErrors: string[] = [];
  let failedRequests: string[] = [];

  test.beforeEach(({ page }) => {
    consoleErrors = [];
    failedRequests = [];
    monitorPageErrors(page, consoleErrors, failedRequests);
  });

  test('Admin dashboard load metrics, POS terminal, products, and inventory pages', async ({ page }) => {
    // 1. Login
    await loginAdmin(page);
    await expect(page).toHaveURL(/.*dashboard/);

    // 2. Dashboard KPIs
    const kpiCards = page.locator('div:has-text("Total Users"), div:has-text("Products"), div:has-text("Low Stock")');
    await expect(kpiCards.first()).toBeVisible();

    // 3. Sales Chart Container
    const chartContainer = page.locator('canvas, div:has-text("Sales"), div:has-text("Revenue")').first();
    await expect(chartContainer).toBeVisible();

    // 4. Products Catalog
    await page.goto('/products');
    await expect(page.locator('h1, h2:has-text("Products"), h2:has-text("Product list")').first()).toBeVisible();

    // 5. Inventory Stock Table
    await page.goto('/inventory');
    await expect(page.locator('h1, h2:has-text("Inventory"), h2:has-text("Stock")').first()).toBeVisible();

    // 6. POS Terminal View
    await page.goto('/point-of-sale');
    await expect(page.locator('input[placeholder*="search"], div:has-text("Cart"), div:has-text("POS")').first()).toBeVisible();
  });
});
