import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Workout } from '../../src/features/training/trainingModel';
const transport = vi.hoisted(() => ({ scope: vi.fn(), archive: vi.fn(), measurements: vi.fn(), workouts: vi.fn(), start: vi.fn(), update: vi.fn(), cancel: vi.fn(), save: vi.fn() }));
vi.mock('../../src/data/supabase/trainingRepository', () => ({
  cloudScope: transport.scope, cloudReadArchive: transport.archive, cloudReadMeasurements: transport.measurements,
  cloudReadWorkouts: transport.workouts, cloudStartWorkout: transport.start, cloudUpdateWorkout: transport.update,
  cloudCancelWorkout: transport.cancel, cloudSaveMeasurement: transport.save,
}));
import { syncDb, scopeKey, CloudError, clearPrivateCache, hasPendingWrites } from '../../src/data/sync/database';
import { acceptServerVersion, drainQueue, pendingOperations, syncReadMeasurements, syncReadWorkouts, syncStartWorkout, syncUpdateWorkout, syncSaveMeasurement, syncCancelWorkout } from '../../src/data/sync/trainingSync';

const day = { title: 'Synthetic session', warmup: '', exercises: [{ name: 'Synthetic press', label: 'Press', sets: 3, target: '10', rest: 0, unit: 'reps' as const, muscles: ['chest' as const], assists: [] }] };
let online = false;
let currentUser = 'user-a';
const scope = { userId: 'user-a', householdId: 'house-a', profileId: 'profile-a', client: { auth: { getSession: async () => ({ data: { session: { user: { id: currentUser } } }, error: null }) } } } as unknown as NonNullable<Awaited<ReturnType<typeof import('../../src/data/supabase/trainingRepository').cloudScope>>>;
let records: Workout[] = [];
let lock: Promise<unknown> = Promise.resolve();

beforeEach(async () => {
  vi.clearAllMocks(); online = false; currentUser = 'user-a'; records = []; lock = Promise.resolve();
  vi.stubGlobal('window', new EventTarget());
  vi.stubGlobal('navigator', { get onLine() { return online; }, locks: { request: (_name: string, fn: () => Promise<unknown>) => { const next = lock.then(fn); lock = next.catch(() => undefined); return next; } } });
  await syncDb.delete(); await syncDb.open();
  transport.scope.mockResolvedValue(scope);
  transport.workouts.mockImplementation(async () => ({ active: structuredClone(records.find(w => w.finished === undefined)), history: structuredClone(records.filter(w => w.finished !== undefined)) }));
  transport.measurements.mockResolvedValue([]);
  transport.start.mockImplementation(async (_scope, _id, _day, workout: Workout) => {
    if (!records.some(w => w.id === workout.id)) records.push(structuredClone(workout));
  });
  transport.update.mockImplementation(async (_scope, expected: Workout, snapshot: Workout) => {
    const index = records.findIndex(w => w.id === expected.id);
    const server = records[index];
    if (!server || (server.revision ?? 1) !== expected.revision) throw new CloudError('Conflict', 'conflict');
    records[index] = { ...structuredClone(snapshot), revision: expected.revision! + 1 };
  });
  transport.save.mockResolvedValue(true);
});
afterEach(async () => { await lock; syncDb.close(); vi.unstubAllGlobals(); });

async function downloadBaseline() {
  online = true;
  await syncReadWorkouts(scope); await syncReadMeasurements(scope);
  online = false;
}
async function active() { return (await syncReadWorkouts(scope)).active!; }

describe('private durable training outbox', () => {
  it('survives database close/reopen and synchronizes parent, sets and completion in order', async () => {
    await downloadBaseline();
    await syncStartWorkout(scope, 'synthetic-document', day);
    await syncUpdateWorkout(scope, await active(), { sets: [{ task: 0, amount: 10, weight: 20 }] });
    await syncUpdateWorkout(scope, await active(), { finished: Date.now() });
    const queued = await pendingOperations(scope);
    expect(queued.map(op => op.kind)).toEqual(['start', 'update', 'update']);
    expect(new Set(queued.map(op => op.id)).size).toBe(3);
    syncDb.close(); await syncDb.open();
    expect((await syncReadWorkouts(scope)).history[0].sets).toHaveLength(1);
    expect(await hasPendingWrites(scope.userId)).toBe(true);
    await expect(clearPrivateCache(scope.userId)).rejects.toThrow();
    online = true; await drainQueue(scope, true);
    expect(await pendingOperations(scope)).toHaveLength(0);
    expect(records).toHaveLength(1);
    expect(records[0].revision).toBe(3);
    expect(records[0].finished).toBeDefined();
    expect(records[0].sets).toEqual([{ task: 0, amount: 10, weight: 20 }]);
  });

  it('keeps stable operation and session IDs after an ambiguous insert response', async () => {
    await downloadBaseline(); await syncStartWorkout(scope, 'document', day);
    const original = (await pendingOperations(scope))[0];
    const push = transport.start.getMockImplementation()!;
    transport.start.mockImplementationOnce(async (...args) => { await push(...args); throw new CloudError('Lost response', 'transient'); });
    online = true; await drainQueue(scope, true);
    expect(records).toHaveLength(1);
    expect((await pendingOperations(scope))[0].id).toBe(original.id);
    await drainQueue(scope, true);
    expect(records).toHaveLength(1);
    expect(await pendingOperations(scope)).toHaveLength(0);
    expect(transport.start.mock.calls[0][3].id).toBe(transport.start.mock.calls[1][3].id);
  });

  it('blocks a conflicting entity and preserves descendants until an explicit server choice', async () => {
    await downloadBaseline(); await syncStartWorkout(scope, 'document', day);
    online = true; await drainQueue(scope); online = false;
    const base = await active();
    await syncUpdateWorkout(scope, base, { sets: [{ task: 0, amount: 10 }] });
    await syncUpdateWorkout(scope, await active(), { finished: Date.now() });
    await syncSaveMeasurement(scope, { date: '2026-01-01', source: 'Synthetic', weight: 70 });
    records[0] = { ...records[0], revision: 2, restPaused: 25 };
    online = true; await drainQueue(scope, true);
    expect(transport.update).toHaveBeenCalledTimes(1);
    expect(transport.save).toHaveBeenCalledTimes(1);
    expect((await pendingOperations(scope)).map(op => op.state)).toEqual(['conflict', 'pending']);
    online = false;
    expect((await syncReadWorkouts(scope)).history[0].sets).toHaveLength(1);
    await expect(acceptServerVersion(scope, base.id)).rejects.toThrow();
    expect(await pendingOperations(scope)).toHaveLength(2);
    online = true; await acceptServerVersion(scope, base.id);
    expect(await pendingOperations(scope)).toHaveLength(0);
    expect((await syncReadWorkouts(scope)).active?.restPaused).toBe(25);
    expect(records[0].sets).toHaveLength(0);
  });

  it('rejects stale local writes and never sends the previous account queue as another user', async () => {
    await downloadBaseline(); await syncStartWorkout(scope, 'document', day);
    const base = await active();
    await syncUpdateWorkout(scope, base, { restPaused: 30 });
    await expect(syncUpdateWorkout(scope, base, { restPaused: 50 })).rejects.toThrow();
    currentUser = 'user-b'; online = true; await drainQueue(scope, true);
    expect(transport.start).not.toHaveBeenCalled();
    expect(await pendingOperations(scope)).toHaveLength(2);
    online = false;
    await expect(syncReadWorkouts({ ...scope, userId: 'user-b' })).rejects.toThrow();
    expect(scopeKey(scope)).not.toBe(scopeKey({ ...scope, userId: 'user-b' }));
  });

  it('retains cancellation tombstones and stable measurement UUIDs across retry', async () => {
    await downloadBaseline(); await syncStartWorkout(scope, 'document', day);
    await syncCancelWorkout(scope, await active());
    await syncSaveMeasurement(scope, { date: '2026-01-02', source: 'Synthetic', weight: 71 });
    expect((await syncReadWorkouts(scope)).active).toBeUndefined();
    expect(await syncReadMeasurements(scope)).toHaveLength(1);
    transport.save.mockRejectedValueOnce(new CloudError('Paused', 'transient'));
    online = true; await drainQueue(scope, true); await drainQueue(scope, true);
    expect(transport.cancel).toHaveBeenCalledTimes(1);
    expect(transport.save.mock.calls[0][3]).toBe(transport.save.mock.calls[1][3]);
    expect(await pendingOperations(scope)).toHaveLength(0);
  });

  it('does not replace a local write with a response that started before that write', async () => {
    await downloadBaseline();
    let resolve!: (value: { active: undefined; history: Workout[] }) => void;
    transport.workouts.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
    online = true; const reading = syncReadWorkouts(scope);
    await vi.waitFor(() => expect(resolve).toBeDefined());
    online = false; await syncStartWorkout(scope, 'document', day);
    resolve({ active: undefined, history: [] });
    expect((await reading).active?.documentId).toBe('document');
    expect((await active()).documentId).toBe('document');
  });
});
