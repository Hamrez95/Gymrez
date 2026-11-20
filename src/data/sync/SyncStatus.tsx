import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../shared/design/components';
import { cloudScope } from '../supabase/trainingRepository';
import { acceptServerVersion, drainQueue, pendingOperations } from './trainingSync';
import type { Identity, Operation } from './database';
import { archiveKey, measurementKey, workoutKey } from '../../features/programs/localProgramArchive';
import './sync.css';

export function SyncStatus({ userId, householdId, profileId }: Identity) {
  const client = useQueryClient();
  const [offline, setOffline] = useState(() => !navigator.onLine);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState<string>();
  const identity = { userId, householdId, profileId };
  const queryKey = ['sync-status', userId, householdId, profileId];
  const pending = useQuery({ queryKey, queryFn: () => pendingOperations(identity), refetchInterval: 3000 });
  const all = pending.data ?? [];
  const failures = all.filter(op => op.state !== 'pending');

  useEffect(() => {
    let stopped = false;
    let running = false;
    const refresh = () => {
      void client.invalidateQueries({ queryKey: ['sync-status', userId, householdId, profileId] });
      for (const key of [workoutKey(profileId), measurementKey(profileId)]) void client.invalidateQueries({ queryKey: key });
    };
    const sync = async () => {
      setOffline(!navigator.onLine);
      if (!navigator.onLine || stopped || running) return;
      running = true;
      try {
        const scope = await cloudScope(profileId);
        if (scope?.userId === userId && scope.householdId === householdId) await drainQueue(scope);
        if (!stopped) refresh();
      } catch { /* Persistent queue status is the source of truth. */ }
      finally { running = false; }
    };
    const onVisibility = () => { if (document.visibilityState === 'visible') void sync(); };
    window.addEventListener('gymrez-sync', refresh);
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    document.addEventListener('visibilitychange', onVisibility);
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void sync(); }, 15000);
    void sync();
    return () => {
      stopped = true;
      clearInterval(timer);
      window.removeEventListener('gymrez-sync', refresh);
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [client, userId, householdId, profileId]);

  async function retry() {
    setBusy(true); setError('');
    try {
      const scope = await cloudScope(profileId);
      if (!scope || scope.userId !== userId) throw new Error('ابتدا اتصال حساب خصوصی را برقرار کن.');
      await drainQueue(scope, true);
      await client.invalidateQueries({ queryKey });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'ارسال انجام نشد.'); }
    finally { setBusy(false); }
  }
  async function resolve(entity: string) {
    setBusy(true); setError('');
    try {
      await acceptServerVersion(identity, entity);
      setConfirmation(undefined);
      for (const key of [queryKey, workoutKey(profileId), measurementKey(profileId), archiveKey(profileId)]) await client.invalidateQueries({ queryKey: key });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'دریافت نسخهٔ سرور انجام نشد.'); }
    finally { setBusy(false); }
  }
  function exportLocal(op: Operation) {
    const copies = all.filter(item => item.entity === op.entity);
    const url = URL.createObjectURL(new Blob([JSON.stringify({ format: 'gymrez-sync-recovery', version: 1, operations: copies }, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'gymrez-pending-recovery.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  const summary = pending.isPending ? 'در حال بررسی تغییرات دستگاه…' : pending.isError ? 'وضعیت ذخیره‌سازی دستگاه در دسترس نیست'
    : offline ? 'آفلاین · تغییرات روی این دستگاه می‌مانند'
    : all.length ? `${all.length.toLocaleString('fa-IR')} تغییر روی دستگاه · در انتظار ثبت در سرور`
    : 'فضای خصوصی · تغییر ارسال‌نشده‌ای روی این دستگاه نیست';
  return <aside className="pace-sync" aria-label="همگام‌سازی">
    <div className="pace-sync__summary"><p role="status">{summary}</p><Button variant="quiet" loading={busy} disabled={offline} onClick={() => void retry()}>همگام‌سازی</Button></div>
    {pending.isError && <p role="alert">خواندن صف دستگاه ممکن نبود؛ ذخیره‌سازی مرورگر را بررسی کن.</p>}
    {error && <p role="alert">{error}</p>}
    {all.length > 0 && <p>تا تأیید سرور، داده‌ها در همین مرورگر نگهداری می‌شوند. برای حفظ آن‌ها حافظهٔ مرورگر را پاک نکن.</p>}
    {[...new Map(failures.map(op => [op.entity, op])).values()].map(op => <details key={op.id}>
      <summary>{op.state === 'conflict' ? 'تعارض با نسخهٔ سرور' : 'ارسال نیاز به بررسی دارد'} · {op.kind === 'measurement' ? 'اندازه‌گیری ' + op.measurement.date : op.workout.day.title}</summary>
      <p>{op.message}</p>
      <p>نسخهٔ دستگاه حفظ شده است. می‌توانی یک کپی بگیری و سپس نسخهٔ سرور را دریافت کنی؛ تغییرات ارسال‌نشدهٔ این مورد با انتخاب نسخهٔ سرور کنار گذاشته می‌شوند.</p>
      <Button variant="secondary" onClick={() => exportLocal(op)}>دریافت کپی تغییرات دستگاه</Button>
      <Button variant="quiet" disabled={busy || offline} onClick={() => setConfirmation(op.entity)}>انتخاب نسخهٔ سرور</Button>
      {confirmation === op.entity && <div><p>تغییرات محلی این مورد از صف حذف شوند و نسخهٔ سرور جایگزین شود؟</p><Button disabled={busy || offline} onClick={() => void resolve(op.entity)}>تأیید انتخاب نسخهٔ سرور</Button><Button variant="quiet" onClick={() => setConfirmation(undefined)}>انصراف</Button></div>}
    </details>)}
  </aside>;
}
