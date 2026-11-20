import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import type { Workout } from '../../src/features/training/trainingModel';

test.afterEach(async ({ page }, info) => {
  if (info.status !== info.expectedStatus) console.log('Synthetic sync page at failure:', await page.locator('body').innerText().catch(() => 'unavailable'));
});

// Entirely synthetic API and identity. No production credentials or personal data.
const profileId = '11111111-1111-4111-8111-111111111111';
const householdId = '22222222-2222-4222-8222-222222222222';
const userId = '33333333-3333-4333-8333-333333333333';
const day = { title: 'جلسهٔ آزمایشی', warmup: '', exercises: [{ name: 'پرس آزمایشی', label: 'Synthetic press', sets: 2, target: '8–12', rest: 0, muscles: ['chest'], assists: [] }] };
type Row = { id: string; profile_id: string; plan_snapshot: Workout; revision: number; status: string };

async function installDevice(context: BrowserContext, records: Map<string, Row>, readings: Record<string, unknown>[]) {
  let disconnected = false;
  const expiry = Math.floor(Date.now() / 1000) + 86400;
  const token = ['eyJhbGciOiJIUzI1NiJ9', Buffer.from(JSON.stringify({ sub: userId, exp: expiry, role: 'authenticated' })).toString('base64url'), 'synthetic-signature'].join('.');
  await context.addInitScript(({ token, expiry, userId }) => {
    const key = 'sb-gymrez-test-auth-token';
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ access_token: token, refresh_token: 'synthetic-refresh', token_type: 'bearer', expires_at: expiry, expires_in: 86400, user: { id: userId, aud: 'authenticated', role: 'authenticated', email: 'synthetic@example.invalid', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' } }));
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => localStorage.getItem('synthetic-offline') !== 'true' });
  }, { token, expiry, userId });
  await context.route('https://gymrez-test.supabase.co/**', async route => {
    if (disconnected) { await route.abort('internetdisconnected'); return; }
    const request = route.request(), url = new URL(request.url());
    const path = url.pathname;
    const json = (body: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (path.includes('/storage/')) { await json({ message: 'No synthetic avatar', statusCode: '404', error: 'not_found' }, 404); return; }
    if (path.endsWith('/household_members')) { await json([{ household_id: householdId }]); return; }
    if (path.endsWith('/profiles')) {
      const profile = { id: profileId, household_id: householdId, display_name: 'hamrez95' };
      await json(request.headers().accept?.includes('vnd.pgrst.object') ? profile : [profile]); return;
    }
    if (path.endsWith('/programs')) {
      await json([{ archive_checksum: 'synthetic-program', status: 'active', archive_metadata: { title: 'برنامهٔ آزمایشی', filename: 'synthetic.pdf', training: { weeks: 4, guide: [], days: [day] } } }]); return;
    }
    if (path.endsWith('/body_measurements')) {
      if (request.method() === 'POST') {
        const body = request.postDataJSON() as Record<string, unknown>;
        const existing = readings.find(row => row.id === body.id);
        if (existing) { await json({ code: '23505', message: 'Duplicate' }, 409); return; }
        readings.push(body); await json([{ id: body.id }], 201); return;
      }
      const id = url.searchParams.get('id')?.slice(3);
      await json(id ? readings.find(row => row.id === id) ?? null : readings); return;
    }
    if (path.endsWith('/workout_sessions')) {
      if (request.method() === 'POST') {
        const body = request.postDataJSON() as Row;
        if ([...records.values()].some(row => row.status === 'active')) { await json({ code: '23505', message: 'Active session' }, 409); return; }
        records.set(body.id, { ...body, revision: 1, status: 'active' });
        await json(null, 201); return;
      }
      const id = url.searchParams.get('id')?.slice(3);
      if (id) { await json(records.get(id) ?? null); return; }
      await json([...records.values()]); return;
    }
    if (path.endsWith('/rpc/save_workout_snapshot')) {
      const body = request.postDataJSON() as { p_id: string; p_revision: number; p_snapshot: Workout };
      const row = records.get(body.p_id)!;
      if (JSON.stringify(row.plan_snapshot) === JSON.stringify(body.p_snapshot)) { await json(row.revision); return; }
      if (row.revision !== body.p_revision || row.status !== 'active') { await json({ code: 'P0001', message: 'Session conflict' }, 400); return; }
      row.revision += 1; row.plan_snapshot = body.p_snapshot; row.status = body.p_snapshot.finished ? 'completed' : 'active';
      await json(row.revision); return;
    }
    await json({ message: 'Unexpected synthetic endpoint: ' + path }, 500);
  });
  return async (page: Page, offline: boolean) => {
    disconnected = offline;
    await page.evaluate(value => { localStorage.setItem('synthetic-offline', String(value)); window.dispatchEvent(new Event(value ? 'offline' : 'online')); }, offline);
  };
}

test('two private devices recover API outage and reload, reject conflicts, then sync sets and measurements', async ({ page, browser }, testInfo) => {
  page.on('pageerror', error => console.log('Synthetic browser error:', error.message));
  page.on('console', message => { if (message.type() === 'error') console.log('Synthetic console error:', message.text()); });
  const records = new Map<string, Row>(), readings: Record<string, unknown>[] = [];
  const disconnect = await installDevice(page.context(), records, readings);
  const second = await browser.newContext({ baseURL: 'http://127.0.0.1:4173', viewport: { width: 412, height: 915 } });
  const peer = await second.newPage();
  await installDevice(second, records, readings);
  async function openWorkout(target: Page) {
    await target.goto('/');
    await expect(target.getByRole('button', { name: /خروج از حساب/ })).toBeVisible();
    await target.getByRole('button', { name: 'ورود به پروفایل hamrez95' }).click();
    await target.getByRole('link', { name: /^(شروع تمرین|ادامهٔ تمرین)$/ }).click();
  }
  async function log(target: Page, reps: string) {
    const counter = target.getByText(/^[۰-۹]+ از [۰-۹]+ ست و نوبت ثبت شده$/);
    const before = await counter.innerText();
    await target.getByRole('spinbutton', { name: 'تکرار', exact: true }).fill(reps);
    await target.getByRole('button', { name: 'ثبت ست', exact: true }).click();
    await expect(counter).not.toHaveText(before);
  }
  const status = page.getByRole('complementary', { name: 'همگام‌سازی' });
  await openWorkout(page);
  await page.getByRole('button', { name: 'شروع تمرین', exact: true }).click();
  await expect(status).toContainText('تغییر ارسال‌نشده‌ای');
  await expect.poll(() => records.size).toBe(1);
  await openWorkout(peer);
  await disconnect(page, true);
  await log(page, '9');
  await expect(status).toContainText('آفلاین');
  await page.reload();
  await expect(page.getByText('۱ از ۲ ست و نوبت ثبت شده', { exact: true })).toBeVisible();
  await log(peer, '12');
  await expect.poll(() => [...records.values()][0].revision).toBe(2);
  await disconnect(page, false);
  await page.getByRole('button', { name: 'همگام‌سازی', exact: true }).click();
  await expect(status).toContainText('تعارض با نسخهٔ سرور');
  await status.locator('details').first().locator('summary').click();
  await page.screenshot({ path: `docs/implementation/evidence/T17/conflict-${testInfo.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'انتخاب نسخهٔ سرور', exact: true }).click();
  await page.getByRole('button', { name: 'تأیید انتخاب نسخهٔ سرور' }).click();
  await expect(status).toContainText('تغییر ارسال‌نشده‌ای');
  await expect(page.getByRole('spinbutton', { name: 'تکرار', exact: true })).toHaveValue('12');
  await disconnect(page, true);
  await log(page, '8');
  await page.getByRole('button', { name: 'پایان و ذخیرهٔ جلسه' }).click();
  await expect(page.getByText(/ست‌ها و نوبت‌های ثبت‌شده در/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/ست‌ها و نوبت‌های ثبت‌شده در/)).toBeVisible();
  await page.screenshot({ path: `docs/implementation/evidence/T17/pending-${testInfo.project.name}.png`, fullPage: true });
  await disconnect(page, false);
  await page.getByRole('button', { name: 'همگام‌سازی', exact: true }).click();
  await expect(status).toContainText('تغییر ارسال‌نشده‌ای');
  expect([...records.values()][0].plan_snapshot.sets.map(row => row.amount)).toEqual([12, 8]);
  expect([...records.values()][0].status).toBe('completed');
  await peer.reload();
  await expect(peer.getByText(/ست‌ها و نوبت‌های ثبت‌شده در/)).toBeVisible();
  await page.getByRole('link', { name: 'پیشرفت', exact: true }).click();
  await page.getByRole('button', { name: 'ثبت اندازه‌گیری جدید' }).click();
  await disconnect(page, true);
  await page.getByRole('spinbutton', { name: 'وزن · کیلوگرم', exact: true }).fill('72');
  await page.getByRole('button', { name: 'ذخیرهٔ اندازه‌گیری' }).click();
  await expect(page.getByText('اندازه‌گیری روی دستگاه ذخیره شد؛ وضعیت ارسال به سرور در بخش همگام‌سازی است.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('img', { name: 'نمودار وزن' })).toBeVisible();
  await disconnect(page, false);
  await page.getByRole('button', { name: 'همگام‌سازی', exact: true }).click();
  await expect(status).toContainText('تغییر ارسال‌نشده‌ای');
  expect(readings).toHaveLength(1);
  await second.close();
});
