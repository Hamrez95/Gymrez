import { cloudScope, cloudReadArchive, cloudReadMeasurements, cloudReadWorkouts, cloudStartWorkout, cloudUpdateWorkout, cloudCancelWorkout, cloudSaveMeasurement } from '../supabase/trainingRepository';
import { CloudError, scopeKey, syncDb, type Identity, type Operation } from './database';
import { measurementSchema, type Measurement, type Workout } from '../../features/training/trainingModel';

type Scope = NonNullable<Awaited<ReturnType<typeof cloudScope>>>;
type Workouts = Awaited<ReturnType<typeof cloudReadWorkouts>>;
const cacheKey = (identity: Identity, kind: string) => scopeKey(identity) + ':' + kind;
const offline = () => typeof navigator !== 'undefined' && !navigator.onLine;
const notify = () => window.dispatchEvent(new Event('gymrez-sync'));
const clone = <T>(value: T): T => structuredClone(value);
const operations = (scope: Scope) => syncDb.operations.where('scope').equals(scopeKey(scope)).sortBy('created');

async function cachedRead<T>(scope: Scope, kind: string, read: () => Promise<T>, merge: (remote: T) => Promise<T> = async value => value): Promise<T> {
  const key = cacheKey(scope, kind);
  const before = (await operations(scope)).map(op => op.id).join();
  try {
    if (offline()) throw new CloudError('اتصال اینترنت قطع است.', 'transient');
    const value = await read();
    // Queue merging and cache replacement must share the write transaction.
    return await syncDb.transaction('rw', syncDb.cache, syncDb.operations, async () => {
      const after = (await operations(scope)).map(op => op.id).join();
      if (before !== after) {
        const current = await syncDb.cache.get(key);
        if (current) return current.value as T;
      }
      const combined = await merge(value);
      await syncDb.cache.put({ key, scope: scopeKey(scope), value: combined });
      return combined;
    });
  } catch (error) {
    if (error instanceof CloudError && error.kind === 'transient') {
      const cached = await syncDb.cache.get(key);
      if (cached) return cached.value as T;
    }
    throw error;
  }
}

export const syncReadArchive = (scope: Scope) => cachedRead(scope, 'archive', () => cloudReadArchive(scope));
export const syncReadMeasurements = (scope: Scope) => cachedRead(scope, 'measurements', () => cloudReadMeasurements(scope), async remote => {
  const entries = [...remote];
  for (const op of await operations(scope)) if (op.kind === 'measurement' && !entries.some(entry => entry.date === op.measurement.date && entry.source === op.measurement.source)) entries.push(op.measurement);
  return entries.sort((a, b) => a.date.localeCompare(b.date));
});
export const syncReadWorkouts = (scope: Scope) => cachedRead(scope, 'workouts', () => cloudReadWorkouts(scope), async remote => {
  const cached = (await syncDb.cache.get(cacheKey(scope, 'workouts')))?.value as Workouts | undefined;
  const records = new Map([...remote.history, ...(remote.active ? [remote.active] : [])].map(w => [w.id, w]));
  for (const op of await operations(scope)) {
    if (op.kind === 'measurement') continue;
    const local = [cached?.active, ...(cached?.history ?? [])].find(w => w?.id === op.workout.id);
    if (op.kind === 'cancel') records.delete(op.workout.id);
    else if (local) records.set(local.id, local);
  }
  const all = [...records.values()].sort((a, b) => b.started - a.started);
  return { active: all.find(w => w.finished === undefined), history: all.filter(w => w.finished !== undefined) };
});

async function newOperation(scope: Scope, entity: string) {
  const last = (await operations(scope)).at(-1)?.created ?? 0;
  return { id: crypto.randomUUID(), scope: scopeKey(scope), entity, created: Math.max(Date.now(), last + 1), attempts: 0, nextAttempt: 0, state: 'pending' as const };
}
async function writeWorkout(scope: Scope, expected: Workout | undefined, next: Workout, kind: 'start' | 'update' | 'cancel') {
  await syncDb.transaction('rw', syncDb.cache, syncDb.operations, async () => {
    const key = cacheKey(scope, 'workouts');
    const row = await syncDb.cache.get(key);
    if (!row) throw new Error('ابتدا سابقهٔ تمرین را با اتصال اینترنت دریافت کن.');
    const current = row.value as Workouts;
    if ((await operations(scope)).some(op => op.entity === next.id && op.state !== 'pending')) throw new Error('ابتدا خطا یا تعارض این جلسه را از بخش همگام‌سازی بررسی کن.');
    if (expected && (!current.active || current.active.id !== expected.id || (current.active.revision ?? 1) !== (expected.revision ?? 1))) throw new Error('جلسه در پنجرهٔ دیگری تغییر کرده است؛ دوباره دریافت کن.');
    if (kind === 'start' && current.active) throw new Error('یک جلسهٔ ناتمام داری. ابتدا آن را پایان بده.');
    const revision = expected?.revision ?? 1;
    const local = { ...next, revision: kind === 'start' ? 1 : revision + 1 };
    const updated: Workouts = kind === 'cancel' ? { ...current, active: undefined }
      : local.finished !== undefined ? { active: undefined, history: [local, ...current.history] }
      : { ...current, active: local };
    await syncDb.cache.put({ ...row, value: updated });
    await syncDb.operations.add({ ...await newOperation(scope, next.id), kind, workout: clone(next), expectedRevision: revision });
  });
  notify();
  void drainQueue(scope).catch(() => undefined);
}
export async function syncStartWorkout(scope: Scope, documentId: string, day: Workout['day']) {
  await writeWorkout(scope, undefined, { id: crypto.randomUUID(), profileId: scope.profileId, documentId, day, started: Date.now(), sets: [], revision: 1 }, 'start');
}
export async function syncUpdateWorkout(scope: Scope, expected: Workout, change: Partial<Pick<Workout, 'sets' | 'restUntil' | 'restPaused' | 'restDuration' | 'finished'>>) {
  if (expected.finished !== undefined) throw new Error('جلسه پایان یافته است.');
  await writeWorkout(scope, expected, { ...expected, ...change }, 'update');
}
export async function syncCancelWorkout(scope: Scope, expected: Workout) {
  if (expected.sets.length || expected.finished !== undefined) throw new Error('فقط جلسهٔ خالی را می‌توان لغو کرد.');
  await writeWorkout(scope, expected, expected, 'cancel');
}
export async function syncSaveMeasurement(scope: Scope, input: Measurement) {
  const entry = measurementSchema.parse(input);
  await syncDb.transaction('rw', syncDb.cache, syncDb.operations, async () => {
    const key = cacheKey(scope, 'measurements');
    const row = await syncDb.cache.get(key);
    if (!row) throw new Error('ابتدا اندازه‌ها را با اتصال اینترنت دریافت کن.');
    const measurements = row.value as Measurement[];
    if (measurements.some(item => item.date === entry.date && item.source === entry.source)) throw new Error('برای این تاریخ و منبع قبلاً اندازه ثبت شده است.');
    await syncDb.cache.put({ ...row, value: [...measurements, entry].sort((a, b) => a.date.localeCompare(b.date)) });
    const id = crypto.randomUUID();
    await syncDb.operations.add({ ...await newOperation(scope, id), kind: 'measurement', measurement: entry, measurementId: id });
  });
  notify();
  void drainQueue(scope).catch(() => undefined);
}

async function push(scope: Scope, op: Operation) {
  if (op.kind === 'measurement') return cloudSaveMeasurement(scope, op.measurement, false, op.measurementId);
  const expected = { ...op.workout, revision: op.expectedRevision };
  if (op.kind === 'start') return cloudStartWorkout(scope, expected.documentId, expected.day, expected);
  if (op.kind === 'cancel') return cloudCancelWorkout(scope, expected);
  return cloudUpdateWorkout(scope, expected, op.workout);
}

export async function drainQueue(scope: Scope, force = false) {
  if (offline()) return;
  // Web Locks serialize foreground sync across tabs; the queue survives reloads.
  if (!navigator.locks) return;
  await navigator.locks.request('gymrez-sync:' + scopeKey(scope), async () => {
    const blocked = new Set<string>();
    for (const op of await operations(scope)) {
      if (blocked.has(op.entity)) continue;
      if (op.state === 'conflict' || (!force && (op.state === 'error' || op.nextAttempt > Date.now()))) { blocked.add(op.entity); continue; }
      // Recheck identity before EACH network write, including after account switches.
      const identity = await scope.client.auth.getSession();
      if (identity.error || identity.data.session?.user.id !== scope.userId) break;
      try {
        await push(scope, op);
        await syncDb.operations.delete(op.id);
        notify();
      } catch (cause) {
        const error = cause instanceof CloudError ? cause : new CloudError('ارسال به سرور انجام نشد؛ دوباره تلاش کن.', 'transient');
        await syncDb.operations.update(op.id, {
          state: error.kind === 'conflict' ? 'conflict' : error.kind === 'transient' ? 'pending' : 'error',
          attempts: op.attempts + 1, nextAttempt: Date.now() + Math.min(60_000, 1000 * 2 ** Math.min(op.attempts, 6)),
          message: error.message,
        });
        blocked.add(op.entity);
        notify();
        if (error.kind === 'auth' || error.kind === 'transient') break;
      }
    }
  });
}

export async function pendingOperations(identity: Identity) {
  return syncDb.operations.where('scope').equals(scopeKey(identity)).sortBy('created');
}
export async function acceptServerVersion(identity: Identity, entity: string) {
  if (offline()) throw new Error('برای انتخاب نسخهٔ سرور به اینترنت وصل شو.');
  const scope = await cloudScope(identity.profileId);
  if (!scope || scope.userId !== identity.userId || scope.householdId !== identity.householdId) throw new Error('اتصال حساب خصوصی را بررسی کن.');
  await navigator.locks.request('gymrez-sync:' + scopeKey(identity), async () => {
    const pending = await syncDb.operations.where('[scope+entity]').equals([scopeKey(identity), entity]).toArray();
    if (!pending.some(op => op.state === 'conflict' || op.state === 'error')) throw new Error('این مورد دیگر نیاز به حل تعارض ندارد.');
    const first = pending[0];
    const kind = first.kind === 'measurement' ? 'measurements' : 'workouts';
    // Fetch first: failed network/auth must never discard the local recovery copy.
    const remote = first.kind === 'measurement' ? await cloudReadMeasurements(scope) : await cloudReadWorkouts(scope);
    await syncDb.transaction('rw', syncDb.cache, syncDb.operations, async () => {
      const key = cacheKey(identity, kind);
      const row = await syncDb.cache.get(key);
      let value: unknown = remote;
      if (first.kind === 'measurement') {
        const current = (row?.value ?? []) as Measurement[];
        value = [...current.filter(item => item.date !== first.measurement.date || item.source !== first.measurement.source),
          ...(remote as Measurement[]).filter(item => item.date === first.measurement.date && item.source === first.measurement.source)].sort((a,b) => a.date.localeCompare(b.date));
      } else if (row) {
        const current = row.value as Workouts;
        const server = remote as Workouts;
        const records = [...current.history, ...(current.active ? [current.active] : [])].filter(w => w.id !== entity);
        const selected = [...server.history, ...(server.active ? [server.active] : [])].filter(w => w.id === entity || (first.kind === 'start' && w.finished === undefined));
        const all = [...new Map([...records, ...selected].map(w => [w.id, w])).values()].sort((a,b) => b.started-a.started);
        value = { active: all.find(w => w.finished === undefined), history: all.filter(w => w.finished !== undefined) };
      }
      await syncDb.cache.put({ key, scope: scopeKey(identity), value });
      await syncDb.operations.bulkDelete(pending.map(op => op.id));
    });
  });
  notify();
}
