import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ session: vi.fn(), from: vi.fn() }));
vi.mock('../../src/data/supabase/client', () => ({ supabaseClient: { auth: { getSession: mocks.session }, from: mocks.from } }));
import { cloudScope, cloudUpdateWorkout } from '../../src/data/supabase/trainingRepository';
import type { Workout } from '../../src/features/training/trainingModel';

describe('cloud training boundaries', () => {
  beforeEach(() => vi.clearAllMocks());
  it('does not silently use local data if checking an existing session fails', async () => {
    mocks.session.mockResolvedValue({ data: { session: null }, error: new Error('network') });
    await expect(cloudScope('synthetic-profile')).rejects.toThrow();
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it('uses local preview only when there is no authenticated session', async () => {
    mocks.session.mockResolvedValue({ data: { session: null }, error: null });
    expect(await cloudScope('synthetic-profile')).toBeNull();
  });
  it('rejects stale writes instead of silently reporting success', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { code: '40001' } });
    const client = { rpc } as unknown as NonNullable<Awaited<ReturnType<typeof cloudScope>>>['client'];
    const workout: Workout = { id: 'synthetic-session', profileId: 'synthetic-profile', documentId: 'test', started: 1000, day: { title: 'Test', warmup: '', exercises: [] }, sets: [], revision: 7 };
    await expect(cloudUpdateWorkout({ client, userId: 'synthetic-user', householdId: 'synthetic-workspace', profileId: workout.profileId }, workout, { finished: 2000 })).rejects.toThrow();
    expect(rpc).toHaveBeenCalledWith('save_workout_snapshot', expect.objectContaining({ p_revision: 7, p_profile: workout.profileId }));
  });
});
