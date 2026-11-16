import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../shared/database.types';
import { resolveDataMode } from '../../app/config';

export const runtimeConfig = resolveDataMode(import.meta.env);

export const supabaseClient = runtimeConfig.mode === 'supabase'
  ? createClient<Database>(runtimeConfig.url, runtimeConfig.publishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        persistSession: true,
      },
    })
  : null;
