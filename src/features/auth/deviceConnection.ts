import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../shared/database.types';
const connectionSchema = z.object({ email: z.email(), password: z.string().min(32).max(256) });
let connection: Promise<void> | undefined;
export function connectDevice(client: SupabaseClient<Database>): Promise<void> {
  if (connection) return connection;
  const parameters = new URLSearchParams(window.location.hash.slice(1));
  const encoded = parameters.get('connect');
  if (!encoded) return Promise.resolve();
  // Remove the credential before any network request or navigation.
  window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
  connection = (async () => {
    let credentials: z.infer<typeof connectionSchema>;
    try { credentials = connectionSchema.parse(JSON.parse(atob(encoded.replace(/-/g, '+').replace(/_/g, '/')))); }
    catch { throw new Error('لینک اتصال معتبر نیست.'); }
    const { error } = await client.auth.signInWithPassword(credentials);
    if (error) throw new Error('اتصال دستگاه انجام نشد. لینک یا اینترنت را بررسی کن.');
  })();
  return connection;
}
