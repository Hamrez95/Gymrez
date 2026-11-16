import { mkdir } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

test('PACE primitives expose accessible states and fit mobile/desktop viewports', async ({ page }, testInfo) => {
  await page.goto('/__design-system');
  await expect(page.getByRole('heading', { name: 'سامانه طراحی PACE' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'غیرفعال' })).toBeDisabled();
  await expect(page.locator('button[aria-busy="true"]')).toBeDisabled();
  await expect(page.getByLabel('تعداد تکرار')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');

  await page.getByRole('button', { name: 'باز کردن پنجره' }).click();
  await expect(page.getByRole('dialog', { name: 'جزئیات نمونه' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
  const output = `docs/implementation/evidence/T03/${testInfo.project.name}.png`;
  await mkdir('docs/implementation/evidence/T03', { recursive: true });
  await page.screenshot({ path: output, fullPage: true });
});
