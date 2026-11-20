import { cachedProfiles, rememberProfiles, cloudError } from '../sync/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../shared/database.types';
import type { Profile } from '../../shared/contracts/profile';

type GymrezClient = SupabaseClient<Database>;

export async function listAccessibleProfiles(client: GymrezClient, userId: string): Promise<readonly Profile[]> {
  if (!navigator.onLine) {
    const cached = await cachedProfiles(userId);
    if (cached) return cached;
    throw new Error('برای دریافت اولیهٔ پروفایل‌ها به اینترنت وصل شو.');
  }
  const { data: memberships, error: membershipError } = await client
    .from('household_members')
    .select('household_id')
    .eq('user_id', userId);
  if (membershipError) {
    const error = cloudError(membershipError, 'دریافت workspaceهای مجاز انجام نشد.');
    const cached = error.kind === 'transient' ? await cachedProfiles(userId) : undefined;
    if (cached) return cached;
    throw error;
  }

  const householdIds = [...new Set((memberships ?? []).map(row => row.household_id))];
  if (householdIds.length === 0) return [];

  const { data, error } = await client
    .from('profiles')
    .select('id, household_id, display_name')
    .in('household_id', householdIds)
    .order('display_name', { ascending: true });
  if (error) {
    const failure = cloudError(error, 'دریافت پروفایل‌های مجاز انجام نشد.');
    const cached = failure.kind === 'transient' ? await cachedProfiles(userId) : undefined;
    if (cached) return cached;
    throw failure;
  }

  const profiles = (data ?? []).map(row => ({
    id: row.id,
    householdId: row.household_id,
    displayName: row.display_name,
    initial: Array.from(row.display_name.trim())[0] ?? '•',
  }));
  await rememberProfiles(userId, profiles);
  return profiles;
}
