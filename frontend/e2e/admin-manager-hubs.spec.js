import { test, expect } from '@playwright/test';

test.describe('Admin & Manager hubs — Phase 1 scaffolding', () => {
  test('Sidebar shows Admin and Manager sub-links for Sales', async ({ page }) => {
    await page.goto('/');
    // Expand Sales by clicking its parent row
    await page.getByText('Sales & Demand', { exact: false }).first().click();
    await expect(page.getByRole('link', { name: /Admin/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Manager/ }).first()).toBeVisible();
  });

  test('Admin page renders 10 tabs for Sales', async ({ page }) => {
    await page.goto('/sales/admin');
    await expect(page.locator('.page-title')).toContainText('Admin');
    const tabs = page.locator('.tab-item');
    await expect(tabs).toHaveCount(10);
  });

  test('Manager page renders 7 tabs for Sales', async ({ page }) => {
    await page.goto('/sales/manager');
    await expect(page.locator('.page-title')).toContainText('Manager');
    const tabs = page.locator('.tab-item');
    await expect(tabs).toHaveCount(7);
  });

  test('New departments appear on dashboard', async ({ page }) => {
    await page.goto('/');
    for (const name of ['Contact Center', 'Marketing', 'Telehealth']) {
      await expect(page.getByText(name).first()).toBeVisible();
    }
  });

  test('/data-flow renders seeded edges', async ({ page }) => {
    await page.goto('/data-flow');
    await expect(page.locator('.page-title')).toContainText('Cross-Department Data Flow');
    // Has at least one row
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  test('Admin page for new Telehealth dept works', async ({ page }) => {
    await page.goto('/telehealth/admin');
    await expect(page.locator('.page-title')).toContainText('Telehealth');
    await expect(page.locator('.page-title')).toContainText('Admin');
  });

  test('Invalid dept redirects to dashboard', async ({ page }) => {
    await page.goto('/does-not-exist/admin');
    // The redirect sends us to "/" which renders Dashboard
    await expect(page).toHaveURL(/\/$/);
  });
});
