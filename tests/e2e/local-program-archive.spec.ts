import { expect, test } from '@playwright/test';

test('imports a current program and archive once for the selected profile', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'ورود به پروفایل hamrez95' }).click();
  await page.getByRole('link', { name: 'دیدن برنامه‌ها' }).click();
  const picker = page.locator('input[type=file]');
  const bundle = {
    name: 'archive.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({
      format: 'gymrez-program-archive',
      version: 1,
      profile: 'hamrez95',
      currentIndex: 1,
      programs: ['Archived', 'Current'].map(title => ({
        title,
        filename: title + '.pdf',
        pdfBase64: Buffer.from('%PDF-1.4\n% ' + title).toString('base64'),
      })),
    })),
  };
  await picker.setInputFiles(bundle);
  await expect(page.getByRole('region', { name: 'بررسی قبل از ذخیره' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Current', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'انصراف', exact: true }).click();
  await page.reload();
  await expect(page.getByText('آرشیو این پروفایل خالی است.')).toBeVisible();
  await picker.setInputFiles(bundle);
  await page.getByRole('button', { name: 'تأیید و ذخیرهٔ بایگانی' }).click();
  await expect(page.getByText('هنوز برنامهٔ فعلی انتخاب نشده است.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Current', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Archived', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Current', exact: true })).toBeVisible();
  await picker.setInputFiles(bundle);
  await page.getByRole('button', { name: 'تأیید و ذخیرهٔ بایگانی' }).click();
  await expect(page.getByText('برنامه‌های این فایل قبلاً وارد شده‌اند.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Current', exact: true })).toHaveCount(1);

  await page.getByRole('button', { name: 'انتخاب به‌عنوان برنامهٔ فعلی' }).first().click();
  await page.getByRole('link', { name: 'Gymrez — خانه' }).click();
  await page.getByRole('button', { name: 'ورود به پروفایل hamrez95' }).click();
  await expect(page.getByText('Archived', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Gymrez — خانه' }).click();
  await page.getByRole('button', { name: 'ورود به پروفایل Ryxy' }).click();
  await page.getByRole('link', { name: 'دیدن برنامه‌ها' }).click();
  await expect(page.getByText('آرشیو این پروفایل خالی است.')).toBeVisible();
  await picker.setInputFiles(bundle);
  await expect(page.getByRole('alert')).toContainText('برای پروفایل دیگری');
});
