import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../shared/database.types';
import { resolveDataMode } from '../../app/config';

export const runtimeConfig = resolveDataMode(import.meta.env);

export const supabaseClient = runtimeConfig.mode === 'supabase'
  ? createClient<Database>(runtimeConfig.url, runtimeConfig.publishableKey, {
      global: { fetch: (input, init) => fetch(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(20_000) }) },
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        persistSession: true,
      },
    })
  : null;
