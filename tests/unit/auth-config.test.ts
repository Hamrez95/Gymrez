import { describe, expect, it } from 'vitest';
import { buildPasswordRecoveryRedirectUrl, resolveDataMode } from '../../src/app/config';

describe('Supabase client configuration', () => {
  it('rejects service-role credentials in browser configuration', () => {
    const serviceRoleJwt = 'eyJhbGciOiJub25lIn0.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.signature';
    expect(resolveDataMode({
      VITE_SUPABASE_URL: 'https://utpoylgymefrvcsxkjeh.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: serviceRoleJwt,
    }).mode).toBe('unavailable');
    expect(resolveDataMode({
      VITE_SUPABASE_URL: 'https://utpoylgymefrvcsxkjeh.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_example',
    }).mode).toBe('unavailable');
  });

  it('accepts only configured exact recovery origins', () => {
    const config = resolveDataMode({
      VITE_SUPABASE_URL: 'https://utpoylgymefrvcsxkjeh.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
      VITE_AUTH_REDIRECT_ORIGINS: 'https://gymrez.example,https://preview-gymrez.example',
    });
    expect(buildPasswordRecoveryRedirectUrl('https://gymrez.example', config)).toBe('https://gymrez.example/login?flow=recovery');
    expect(buildPasswordRecoveryRedirectUrl('https://preview-gymrez.example', config)).toBe('https://preview-gymrez.example/login?flow=recovery');
    expect(buildPasswordRecoveryRedirectUrl('https://gymrez.example.evil', config)).toBeNull();
    expect(buildPasswordRecoveryRedirectUrl('http://gymrez.example', config)).toBeNull();
  });

  it('does not use a broad preview wildcard for password recovery', () => {
    const config = resolveDataMode({
      VITE_SUPABASE_URL: 'https://utpoylgymefrvcsxkjeh.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
      VITE_AUTH_REDIRECT_ORIGINS: 'https://gymrez.example',
    });
    expect(buildPasswordRecoveryRedirectUrl('https://feature--gymrez.example', config)).toBeNull();
  });
});
