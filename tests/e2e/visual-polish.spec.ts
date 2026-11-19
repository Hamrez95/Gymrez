import { mkdir } from 'node:fs/promises';
import { test, expect } from '@playwright/test';
test('motion controls, real-data empty states and profile continuity', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'امروز کی تمرین می‌کنه؟' })).toBeVisible();
  await page.locator('.pace-profile-card img').first().evaluate((img: HTMLImageElement) => img.decode());
  await mkdir('docs/implementation/evidence/T19', { recursive: true });
  await page.screenshot({ path: `docs/implementation/evidence/T19/${testInfo.project.name}-entry.png`, fullPage: true });
  await page.getByRole('button', { name: 'ورود به پروفایل hamrez95' }).click();
  await page.getByRole('link', { name: 'دیدن برنامه‌ها' }).click();
  await page.locator('input[type=file]').setInputFiles({ name: 'synthetic.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({
    format: 'gymrez-program-archive', version: 1, profile: 'hamrez95', currentIndex: 0, measurements: [], programs: [{
      title: 'Synthetic motion plan', filename: 'motion.pdf', pdfBase64: Buffer.from('%PDF-1.4\n% synthetic').toString('base64'),
      training: { weeks: 4, guide: [], days: [{ title: 'Synthetic day', warmup: 'Warm up', exercises: [{ name: 'جلو بازو نمونه', label: 'Dumbbell curl', sets: 1, target: '8', rest: 0, unit: 'reps', muscles: ['biceps'], assists: [] }] }] },
    }],
  })) });
  await page.getByRole('link', { name: 'دیدن جلسه‌ها و شروع تمرین' }).click();
  await expect(page.getByRole('img', { name: 'نمای شماتیک جلو بازو نمونه' })).toBeVisible();
  await page.getByRole('button', { name: 'مکث نمایش' }).click();
  await page.getByRole('button', { name: 'وضعیت پایان' }).click();
  await page.screenshot({ path: `docs/implementation/evidence/T19/${testInfo.project.name}-exercise.png`, fullPage: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('link', { name: 'پیشرفت', exact: true }).last().click();
  await expect(page.getByRole('heading', { name: 'مسیر قدرت تو' })).toBeVisible();
  await expect(page.getByText('با پایان اولین تمرین، آمار و تقویم تو شروع می‌شود.')).toBeVisible();
  await page.getByRole('button', { name: 'انتخاب پروفایل Ryxy' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'انتخاب پروفایل Ryxy' })).toHaveAttribute('aria-pressed', 'true');
  await page.screenshot({ path: `docs/implementation/evidence/T19/${testInfo.project.name}-progress.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
