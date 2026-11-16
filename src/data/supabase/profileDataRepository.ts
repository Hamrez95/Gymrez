import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../shared/database.types';

type GymrezClient = SupabaseClient<Database>;
export type ProfileScope = { userId: string; householdId: string; profileId: string };

function assertScope(scope: ProfileScope): void {
  if (![scope.userId, scope.householdId, scope.profileId].every(value => value.trim().length > 0)) {
    throw new Error('A complete identity scope is required');
  }
}

export async function listPrograms(client: GymrezClient, scope: ProfileScope) {
  assertScope(scope);
  const { data, error } = await client
    .from('programs')
    .select('id, title, status, starts_on, ends_on, created_at')
    .eq('household_id', scope.householdId)
    .eq('profile_id', scope.profileId)
    .order('created_at', { ascending: false });
  if (error) throw new Error('دریافت برنامه‌ها انجام نشد.');
  return data ?? [];
}

export async function listWorkoutSessions(client: GymrezClient, scope: ProfileScope) {
  assertScope(scope);
  const { data, error } = await client
    .from('workout_sessions')
    .select('id, title_snapshot, status, started_at, ended_at, elapsed_seconds')
    .eq('household_id', scope.householdId)
    .eq('profile_id', scope.profileId)
    .order('started_at', { ascending: false })
    .limit(20);
  if (error) throw new Error('دریافت جلسه‌های تمرین انجام نشد.');
  return data ?? [];
}

export async function listMeasurements(client: GymrezClient, scope: ProfileScope) {
  assertScope(scope);
  const { data, error } = await client
    .from('body_measurements')
    .select('id, measurement_date, weight_kg, height_cm, waist_cm, chest_cm, hip_cm')
    .eq('household_id', scope.householdId)
    .eq('profile_id', scope.profileId)
    .order('measurement_date', { ascending: false })
    .limit(20);
  if (error) throw new Error('دریافت اندازه‌های بدن انجام نشد.');
  return data ?? [];
}
