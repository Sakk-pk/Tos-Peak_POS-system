import { Page } from '@playwright/test';

// Setup listeners to capture browser logs and request failures
export function monitorPageErrors(page: Page, consoleErrors: string[], failedRequests: string[]) {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[Console Error] ${msg.text()}`);
    }
  });
  page.on('requestfailed', request => {
    failedRequests.push(`[Failed Request] ${request.method()} ${request.url()} - ${request.failure()?.errorText || 'Failed'}`);
  });
}

// Log in helper for admin account
export async function loginAdmin(page: Page) {
  await page.goto('/login');
  await page.locator('input[type="email"], input[name="email"]').fill('admin@gmail.com');
  await page.locator('input[type="password"], input[name="password"]').fill('123456');
  await page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("SIGN IN")').click();
  await page.waitForURL('**/dashboard');
}
