import { describe, expect, it } from 'vitest';
import { exerciseMedia } from '../../src/features/training/exerciseMedia';

describe('anatomical media identity', () => {
  it('normalizes an exact supported machine variant without substituting other curls', () => {
    expect(exerciseMedia('  Seated   Machine Biceps Curl  ')?.video).toMatch(/\.mp4/);
    for (const label of ['Dumbbell curl', 'Barbell curl', 'Hammer curl', 'Machine preacher curl', 'Leg curl', 'Unknown']) {
      expect(exerciseMedia(label)).toBeUndefined();
    }
  });
});
