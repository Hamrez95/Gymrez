import { describe, expect, it } from 'vitest';
import { resolveDataMode } from '../../src/app/config';
import { profileKey } from '../../src/data/queryKeys';
import { demoProfileRepository } from '../../src/data/demo/profileRepository';

describe('data boundaries', () => {
  it('does not fall back to demo data when Supabase configuration is missing', () => {
    expect(resolveDataMode({ DEV: false }).mode).toBe('unavailable');
    expect(resolveDataMode({ VITE_SUPABASE_URL: 'https://utpoylgymefrvcsxkjeh.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example' }).mode).toBe('supabase');
  });

  it('requires all ownership scopes and separates profile queries', () => {
    expect(() => profileKey('', 'h', 'p')).toThrow();
    expect(profileKey('u', 'h', 'a')).not.toEqual(profileKey('u', 'h', 'b'));
    expect(profileKey('u1', 'h', 'a')).not.toEqual(profileKey('u2', 'h', 'a'));
  });

  it('does not leak mutable fixtures between repository reads', async () => {
    const first = await demoProfileRepository.listProfiles();
    first[0]!.displayName = 'changed';
    expect((await demoProfileRepository.listProfiles())[0]!.displayName).not.toBe('changed');
  });
});
