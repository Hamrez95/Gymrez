import { expect, test } from '@playwright/test';

test('imports an actionable plan and honest baseline, then persists a workout', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'ورود به پروفایل hamrez95' }).click();
  await page.getByRole('link', { name: 'دیدن برنامه‌ها' }).click();
  const input = page.locator('input[type=file]');
  const program = {
    title: 'Plan A', filename: 'a.pdf', pdfBase64: Buffer.from('%PDF-1.4\n% test').toString('base64'),
  };
  const original = { format: 'gymrez-program-archive', version: 1, profile: 'hamrez95', currentIndex: 0 };
  async function importFile(programs: unknown[], measurements: unknown[] = []) {
    await input.setInputFiles({
      name: 'archive.json', mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({ ...original, programs, measurements })),
    });
  }
  await importFile([program]);
  await expect(page.getByRole('heading', { name: 'Plan A' })).toBeVisible();
  await importFile([{
    ...program,
    training: { weeks: 6, days: [{
      title: 'جلسه A', warmup: '',
      exercises: [{ name: 'پرس سینه', label: 'Chest press', sets: 2, target: '۸–۱۰', rest: 60, muscles: ['chest'], assists: ['triceps'] }],
    }] },
  }], [{ date: '2025-01-09', source: 'ترازوی تست', weight: 68.4, bmi: 22.3 }]);

  await page.getByRole('link', { name: 'دیدن جلسه‌ها و شروع تمرین' }).click();
  await expect(page.getByRole('img', { name: 'نمای روبه‌رو' })).toBeVisible();
  await expect(page.getByText(/اصلی.*سینه/)).toBeVisible();
  await page.getByRole('button', { name: 'شروع تمرین' }).click();
  await page.getByRole('spinbutton', { name: 'تکرار', exact: true }).fill('9');
  await page.getByRole('spinbutton', { name: 'وزنه (کیلوگرم)' }).fill('30');
  await page.getByRole('spinbutton', { name: 'تکرار مانده (RIR)' }).fill('0');
  await page.getByRole('button', { name: 'ثبت ست', exact: true }).click();
  await expect(page.getByRole('timer')).toBeVisible();
  await page.getByRole('button', { name: 'مکث تایمر' }).click();
  await expect(page.getByRole('button', { name: 'ادامهٔ تایمر' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'ادامهٔ تایمر' })).toBeVisible();
  await page.getByRole('button', { name: 'پایان و ذخیرهٔ جلسه' }).click();
  await expect(page.getByText(/ست‌ها و نوبت‌های ثبت‌شده/)).toBeVisible();

  await page.getByRole('link', { name: 'Gymrez — خانه' }).click();
  await page.getByRole('button', { name: 'ورود به پروفایل hamrez95' }).click();
  await page.getByRole('link', { name: 'دیدن سابقه' }).click();
  await expect(page.getByRole('img', { name: 'نمودار وزن' })).toBeVisible();
  await expect(page.getByText('برای دیدن روند، یک اندازه‌گیری دیگر ثبت کن.')).toBeVisible();
  await page.getByRole('button', { name: 'انتخاب پروفایل Ryxy' }).click();
  await expect(page.getByText(/هنوز اندازه‌ای ثبت نشده/)).toBeVisible();
});
