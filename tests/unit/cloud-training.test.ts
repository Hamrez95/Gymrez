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
    const filters: unknown[][] = [];
    const chain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn((...args: unknown[]) => { filters.push(args); return chain; }),
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    mocks.from.mockReturnValue(chain);
    const client = { from: mocks.from } as unknown as NonNullable<Awaited<ReturnType<typeof cloudScope>>>['client'];
    const workout: Workout = { id: 'synthetic-session', profileId: 'synthetic-profile', documentId: 'test', started: 1000, day: { title: 'Test', warmup: '', exercises: [] }, sets: [], revision: 7 };
    await expect(cloudUpdateWorkout({ client, householdId: 'synthetic-workspace', profileId: workout.profileId }, workout, { finished: 2000 })).rejects.toThrow();
    expect(filters).toContainEqual(['revision', 7]);
    expect(filters).toContainEqual(['profile_id', workout.profileId]);
  });
});
