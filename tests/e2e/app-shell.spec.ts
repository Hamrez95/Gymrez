import { mkdir } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

test('entry preview selects a profile and the app navigation works', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'امروز کی تمرین می‌کنه؟' })).toBeVisible();
  await expect(page.getByRole('button', { name: /ورود به پیش‌نمایش/ })).toHaveCount(2);
  await mkdir('docs/implementation/evidence/T04', { recursive: true });
  await page.screenshot({ path: `docs/implementation/evidence/T04/entry-${testInfo.project.name}.png`, fullPage: true });

  await page.locator('.pace-profile-card').nth(1).getByRole('button').click();
  await expect(page).toHaveURL(/\/dashboard\/demo-b$/);
  await expect(page.getByRole('heading', { name: 'سلام، ورزشکار ب' })).toBeVisible();
  await page.screenshot({ path: `docs/implementation/evidence/T04/dashboard-${testInfo.project.name}.png`, fullPage: true });

  await page.getByRole('link', { name: 'برنامه‌ها', exact: true }).click();
  await expect(page).toHaveURL(/\/programs$/);
  await expect(page.getByRole('heading', { name: /برنامه‌ها/ })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/dashboard\/demo-b$/);
});

test('profile switching, theme control, and navigation adapt across reference widths', async ({ page }) => {
  await page.goto('/dashboard/demo-a');
  await page.getByRole('button', { name: 'انتخاب پروفایل ورزشکار ب' }).click();
  await expect(page).toHaveURL(/\/dashboard\/demo-b$/);
  await expect(page.getByRole('button', { name: 'انتخاب پروفایل ورزشکار ب' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'روشن کردن تم' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  for (const width of [360, 390, 430, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasHorizontalOverflow, `unexpected horizontal overflow at ${width}px`).toBe(false);
    if (width <= 760) {
      await expect(page.getByRole('navigation', { name: 'ناوبری اصلی' }).last()).toBeVisible();
      const targetSize = await page.locator('.pace-mobile-nav a').first().evaluate(element => element.getBoundingClientRect().height);
      expect(targetSize).toBeGreaterThanOrEqual(44);
    } else {
      await expect(page.getByRole('navigation', { name: 'ناوبری اصلی' }).first()).toBeVisible();
    }
  }
});

test('authentication preview and unknown routes state the current limits', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'ورود به حساب' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'ورود', exact: true })).toBeDisabled();
  await expect(page.getByRole('status')).toContainText('اطلاعاتی ارسال نمی‌شود');

  await page.goto('/route-that-does-not-exist');
  await expect(page.getByRole('heading', { name: /صفحه پیدا نشد/ })).toBeVisible();
});
