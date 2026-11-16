import { describe, expect, it } from 'vitest';
import { resolveDataMode } from '../../src/app/config';
import { profileKey } from '../../src/data/queryKeys';
import { demoProfileRepository } from '../../src/data/demo/profileRepository';
describe('data boundaries', () => {
  it('never silently falls back to demo for a requested real backend', () => { expect(resolveDataMode('supabase').mode).toBe('unavailable'); expect(resolveDataMode('invalid').mode).toBe('unavailable'); });
  it('requires all ownership scopes and separates profiles', () => { expect(() => profileKey('', 'h', 'p')).toThrow(); expect(profileKey('u','h','a')).not.toEqual(profileKey('u','h','b')); });
  it('does not leak mutable fixtures between repository reads', async () => { const first = await demoProfileRepository.listProfiles(); first[0]!.displayName = 'changed'; expect((await demoProfileRepository.listProfiles())[0]!.displayName).not.toBe('changed'); });
});
