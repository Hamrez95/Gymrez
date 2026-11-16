import { test, expect } from '@playwright/test';

test('authentication stays closed until a publishable Supabase client is configured', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'ورود به حساب' })).toBeVisible();
  await expect(page.getByLabel('ایمیل')).toBeDisabled();
  await expect(page.getByLabel('رمز عبور')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'ورود', exact: true })).toBeDisabled();
  await expect(page.getByText(/ثبت‌نام عمومی/)).toBeVisible();
  await expect(page.getByRole('button', { name: /ساخت حساب|ثبت‌نام/ })).toHaveCount(0);
});

test('protected data routes return to login and unknown routes stay explicit', async ({ page }) => {
  await page.goto('/dashboard/00000000-0000-4000-8000-000000000001');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'ورود به حساب' })).toBeVisible();

  await page.goto('/route-that-does-not-exist');
  await expect(page.getByRole('heading', { name: /صفحه پیدا نشد/ })).toBeVisible();
});
