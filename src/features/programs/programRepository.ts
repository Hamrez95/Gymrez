import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../shared/database.types';
import type { ProfileScope } from '../../data/supabase/profileDataRepository';

type GymrezClient = SupabaseClient<Database>;

export type ProgramSummary = {
  id: string;
  title: string;
  status: string;
  starts_on: string | null;
  ends_on: string | null;
  created_at: string;
  revision: number;
};

export type ProgramSessionSummary = {
  id: string;
  name: string;
  weekday: number | null;
  position: number;
  notes: string | null;
};

export type ProgramDetail = {
  versionId: string;
  versionNo: number;
  publishedAt: string | null;
  sessions: ProgramSessionSummary[];
};

export type ProgramWorkout = {
  program_id: string | null;
  status: string;
  started_at: string;
};

export type DraftSessionInput = {
  name: string;
  weekday: number;
  position: number;
  notes: string | null;
};

function assertScope(scope: ProfileScope): void {
  if (![scope.userId, scope.householdId, scope.profileId].every(value => value.trim().length > 0)) {
    throw new Error('A complete identity scope is required');
  }
}

export async function listPrograms(client: GymrezClient, scope: ProfileScope): Promise<ProgramSummary[]> {
  assertScope(scope);
  const { data, error } = await client
    .from('programs')
    .select('id, title, status, starts_on, ends_on, created_at, revision')
    .eq('household_id', scope.householdId)
    .eq('profile_id', scope.profileId)
    .order('created_at', { ascending: false });
  if (error) throw new Error('دریافت برنامه‌ها انجام نشد.');
  return data ?? [];
}

export async function getProgramDetail(
  client: GymrezClient,
  scope: ProfileScope,
  programId: string,
): Promise<ProgramDetail | null> {
  assertScope(scope);
  const { data: version, error: versionError } = await client
    .from('program_versions')
    .select('id, version_no, published_at')
    .eq('household_id', scope.householdId)
    .eq('profile_id', scope.profileId)
    .eq('program_id', programId)
    .order('version_no', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (versionError) throw new Error('دریافت نسخهٔ برنامه انجام نشد.');
  if (!version) return null;

  const { data: sessions, error: sessionsError } = await client
    .from('program_sessions')
    .select('id, name, weekday, position, notes')
    .eq('household_id', scope.householdId)
    .eq('profile_id', scope.profileId)
    .eq('program_id', programId)
    .eq('program_version_id', version.id)
    .order('position', { ascending: true });
  if (sessionsError) throw new Error('دریافت جلسه‌های برنامه انجام نشد.');

  return {
    versionId: version.id,
    versionNo: version.version_no,
    publishedAt: version.published_at,
    sessions: sessions ?? [],
  };
}

export async function listProgramWorkouts(client: GymrezClient, scope: ProfileScope): Promise<ProgramWorkout[]> {
  assertScope(scope);
  const { data, error } = await client
    .from('workout_sessions')
    .select('program_id, status, started_at')
    .eq('household_id', scope.householdId)
    .eq('profile_id', scope.profileId)
    .not('program_id', 'is', null)
    .order('started_at', { ascending: false })
    .limit(500);
  if (error) throw new Error('دریافت سابقهٔ تمرین‌ها انجام نشد.');
  return data ?? [];
}

export async function saveProgramDraft(
  client: GymrezClient,
  scope: ProfileScope,
  input: {
    programId?: string;
    expectedRevision?: number;
    title: string;
    startsOn: string | null;
    endsOn: string | null;
    sessions: DraftSessionInput[];
  },
): Promise<string> {
  assertScope(scope);
  const { data, error } = await client.rpc('save_program_draft', {
    p_household_id: scope.householdId,
    p_profile_id: scope.profileId,
    p_title: input.title,
    p_starts_on: input.startsOn,
    p_ends_on: input.endsOn,
    p_sessions: input.sessions,
    ...(input.programId ? { p_program_id: input.programId } : {}),
    ...(input.expectedRevision !== undefined ? { p_expected_revision: input.expectedRevision } : {}),
  });
  if (error) throw new Error(error.code === '40001' ? 'این برنامه هم‌زمان تغییر کرده؛ فهرست را تازه کن و دوباره ویرایش کن.' : 'ذخیرهٔ پیش‌نویس انجام نشد.');
  return data;
}

export async function activateProgram(client: GymrezClient, scope: ProfileScope, programId: string): Promise<void> {
  assertScope(scope);
  const { error } = await client.rpc('activate_program', {
    p_household_id: scope.householdId,
    p_profile_id: scope.profileId,
    p_program_id: programId,
  });
  if (error) throw new Error('فعال‌سازی انجام نشد. وضعیت برنامه را تازه کن و دوباره تلاش کن.');
}

export async function archiveProgram(
  client: GymrezClient,
  scope: ProfileScope,
  program: Pick<ProgramSummary, 'id' | 'revision'>,
): Promise<void> {
  assertScope(scope);
  const { data, error } = await client
    .from('programs')
    .update({ status: 'archived' })
    .eq('id', program.id)
    .eq('household_id', scope.householdId)
    .eq('profile_id', scope.profileId)
    .eq('revision', program.revision)
    .select('id')
    .maybeSingle();
  if (error) throw new Error('بایگانی برنامه انجام نشد.');
  if (!data) throw new Error('این برنامه هم‌زمان تغییر کرده؛ فهرست را تازه کن و دوباره تلاش کن.');
}
