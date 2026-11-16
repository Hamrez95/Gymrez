import type { Profile } from '../shared/contracts/profile';
// A read-only foundation contract. Server writes and auth belong to T05/T06.
export interface ProfileRepository { readonly mode: 'demo' | 'supabase'; listProfiles(): Promise<readonly Profile[]> }
