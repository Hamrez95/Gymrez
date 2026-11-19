import { describe, it, expect } from 'vitest';
import { workoutAnalytics, previousPerformance } from '../../src/features/training/workoutAnalytics';
import type { Workout } from '../../src/features/training/trainingModel';
const workout: Workout = { id: 'synthetic', profileId: 'profile', documentId: 'doc', started: 1000, finished: 121000,
  day: { title: 'Synthetic session', warmup: '', exercises: [
    { name: 'Curl', label: 'curl', sets: 2, target: '8', rest: 60, unit: 'reps', muscles: ['biceps'], assists: [] },
    { name: 'Plank', label: 'plank', sets: 1, target: '30', rest: 0, unit: 'seconds', muscles: ['abs'], assists: [] },
  ] }, sets: [{ task: 0, amount: 8, weight: 10 }, { task: 1, amount: 6, weight: 12 }, { task: 2, amount: 30, weight: 50 }] };
describe('workout analytics', () => {
  it('excludes timed exercises from lifting volume and excludes unfinished sessions', () => {
    const stats = workoutAnalytics([workout, { ...workout, id: 'active', finished: undefined }]);
    expect(stats.volume).toBe(152);
    expect(stats.sessions).toBe(1);
    expect(stats.minutes).toBe(2);
    expect(stats.muscles).toEqual({ biceps: 2, abs: 1 });
    expect(stats.records).toHaveLength(1);
    expect(stats.records[0].weight).toBe(12);
  });
  it('looks up performance by exercise identity, not task position', () => {
    expect(previousPerformance([workout], 'curl')?.weight).toBe(12);
    expect(previousPerformance([workout], 'unlogged')).toBeUndefined();
  });
});
