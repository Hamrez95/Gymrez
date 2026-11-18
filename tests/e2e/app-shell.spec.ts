import { test, expect } from '@playwright/test';

test('guest preview opens directly and profile selection changes the home dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'امروز کی تمرین می‌کنه؟' })).toBeVisible();
  await expect(page.getByText('hamrez95', { exact: true })).toBeVisible();
  await expect(page.getByText('Ryxy', { exact: true })).toBeVisible();
  await expect(page.getByLabel('ایمیل')).toHaveCount(0);
  await expect(page.getByLabel('رمز عبور')).toHaveCount(0);

  await page.getByRole('button', { name: 'ورود به پروفایل Ryxy' }).click();
  await expect(page).toHaveURL(/\/dashboard\/00000000-0000-4000-8000-000000000002$/);
  await expect(page.getByRole('heading', { name: 'سلام، Ryxy' })).toBeVisible();
  await expect(page.getByText(/پیش‌نمایش بدون ورود/).first()).toBeVisible();
});

test('direct dashboard routes open without login and unknown routes stay explicit', async ({ page }) => {
  await page.goto('/dashboard/00000000-0000-4000-8000-000000000001');
  await expect(page.getByRole('heading', { name: 'سلام، hamrez95' })).toBeVisible();

  await page.goto('/route-that-does-not-exist');
  await expect(page.getByRole('heading', { name: /صفحه پیدا نشد/ })).toBeVisible();
});
