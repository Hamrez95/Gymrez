import { mkdir } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('anatomical machine curl supports deliberate playback, speed, pause and reduced motion', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'ورود به پروفایل hamrez95' }).click();
  await page.getByRole('link', { name: 'دیدن برنامه‌ها' }).click();
  await page.locator('input[type=file]').setInputFiles({ name: 'synthetic-media.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({
    format: 'gymrez-program-archive', version: 1, programs: [{
      title: 'Synthetic media check', filename: 'media.pdf', pdfBase64: Buffer.from('%PDF-1.4\n% synthetic media').toString('base64'),
      training: { weeks: 4, days: [{ title: 'Test', warmup: '', exercises: [{ name: 'جلو بازو دستگاه', label: 'Seated machine biceps curl', sets: 2, target: '10', rest: 60, muscles: ['biceps'] }] }] },
    }],
  })) });
  await page.getByRole('button', { name: 'تأیید و ذخیرهٔ بایگانی' }).click();
  await page.getByRole('button', { name: 'انتخاب به‌عنوان برنامهٔ فعلی' }).click();
  await page.getByRole('link', { name: 'دیدن جلسه‌ها و شروع تمرین' }).click();
  const video = page.locator('video[aria-label="نمای آناتومیک جلو بازو دستگاه"]');
  await expect(video).toBeVisible();
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await page.getByRole('button', { name: 'نمایش حرکت', exact: true }).click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(0);
  await page.getByRole('combobox', { name: 'سرعت نمایش حرکت' }).selectOption('0.5');
  expect(await video.evaluate((element: HTMLVideoElement) => element.playbackRate)).toBe(0.5);
  await page.getByRole('button', { name: 'مکث نمایش' }).click();
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await expect(page.getByText(/FitnessProgrammer.com/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await mkdir('docs/implementation/evidence/T19', { recursive: true });
  await page.screenshot({ path: `docs/implementation/evidence/T19/${testInfo.project.name}-anatomical-curl.png`, fullPage: true });
});
