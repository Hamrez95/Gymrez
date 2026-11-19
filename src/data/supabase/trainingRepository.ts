import { z } from 'zod';
import { supabaseClient } from './client';
import type { Json } from '../../shared/database.types';
import type { ProgramDocument } from '../../features/programs/localProgramArchive';
import { measurementSchema, trainingSchema, type Measurement, type Workout } from '../../features/training/trainingModel';
const metadataSchema = z.object({ title: z.string(), filename: z.string(), sourceDate: z.string().optional(), training: trainingSchema.optional(), pdfPath: z.string().optional() });
const json = (value: unknown): Json => JSON.parse(JSON.stringify(value)) as Json;
export async function cloudScope(profileId: string) {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) throw new Error('بررسی اتصال حساب انجام نشد.');
  if (!data.session) return null;
  const { data: profile, error: profileError } = await supabaseClient.from('profiles').select('household_id').eq('id', profileId).single();
  if (profileError) throw new Error('این پروفایل در دسترس حساب نیست.');
  return { client: supabaseClient, householdId: profile.household_id, profileId };
}
type Scope = NonNullable<Awaited<ReturnType<typeof cloudScope>>>;
export async function cloudReadArchive(scope: Scope) {
  const { data, error } = await scope.client.from('programs').select('archive_checksum,archive_metadata,status').eq('profile_id', scope.profileId).order('created_at', { ascending: false });
  if (error) throw new Error('دریافت برنامه‌ها از سرور انجام نشد.');
  const documents: ProgramDocument[] = [];
  let currentId: string | undefined;
  for (const row of data ?? []) {
    if (!row.archive_checksum || !row.archive_metadata) continue;
    const metadata = metadataSchema.parse(row.archive_metadata);
    documents.push({ ...metadata, profileId: scope.profileId, id: row.archive_checksum, pdf: new Blob([], { type: 'application/pdf' }) });
    if (row.status === 'active') currentId = row.archive_checksum;
  }
  return { documents, currentId };
}
export async function cloudImportDocument(scope: Scope, document: ProgramDocument) {
  const path = `${scope.householdId}/${scope.profileId}/${document.id}.pdf`;
  const { data: existing, error: lookupError } = await scope.client.from('programs').select('id').eq('profile_id', scope.profileId).eq('archive_checksum', document.id).maybeSingle();
  if (lookupError) throw new Error('بررسی بایگانی سرور انجام نشد.');
  if (existing) return false;
  const upload = await scope.client.storage.from('program-pdfs').upload(path, document.pdf, { contentType: 'application/pdf', upsert: false });
  if (upload.error && upload.error.message !== 'The resource already exists') throw new Error('بارگذاری PDF انجام نشد.');
  const { title, filename, sourceDate, training } = document;
  const { error } = await scope.client.rpc('import_archive_program', { p_profile: scope.profileId, p_checksum: document.id, p_metadata: json({ title, filename, sourceDate, training, pdfPath: path }) });
  if (error) throw new Error('ثبت برنامه در دیتابیس انجام نشد.');
  return true;
}
export async function cloudSelectProgram(scope: Scope, checksum: string) {
  const { error } = await scope.client.rpc('activate_archive_program', { p_profile: scope.profileId, p_checksum: checksum });
  if (error) throw new Error('فعال‌سازی برنامه انجام نشد.');
}
export async function cloudReadMeasurements(scope: Scope) {
  const { data, error } = await scope.client.from('body_measurements').select('*').eq('profile_id', scope.profileId).order('measurement_date');
  if (error) throw new Error('دریافت اندازه‌های بدن انجام نشد.');
  return (data ?? []).map(row => measurementSchema.parse(row.metrics ?? { date: row.measurement_date, source: row.source, weight: row.weight_kg, height: row.height_cm ?? undefined, waist: row.waist_cm ?? undefined }));
}
export async function cloudSaveMeasurement(scope: Scope, value: Measurement, ignoreDuplicate = false) {
  const entry = measurementSchema.parse(value);
  const record = { household_id: scope.householdId, profile_id: scope.profileId, measurement_date: entry.date, source: entry.source, height_cm: entry.height, weight_kg: entry.weight, waist_cm: entry.waist, metrics: json(entry) };
  const { error } = ignoreDuplicate ? await scope.client.from('body_measurements').upsert(record, { onConflict: 'profile_id,measurement_date,source', ignoreDuplicates: true }) : await scope.client.from('body_measurements').insert(record);
  if (error) throw new Error('ثبت اندازه‌گیری در دیتابیس انجام نشد.');
}
export async function cloudReadWorkouts(scope: Scope) {
  const { data, error } = await scope.client.from('workout_sessions').select('plan_snapshot,revision,status').eq('profile_id', scope.profileId).order('started_at', { ascending: false });
  if (error) throw new Error('دریافت سابقهٔ تمرین انجام نشد.');
  const records = (data ?? []).filter(row => row.status !== 'abandoned').map(row => ({ ...(row.plan_snapshot as unknown as Workout), revision: row.revision }));
  return { active: records.find(row => row.finished === undefined), history: records.filter(row => row.finished !== undefined) };
}
export async function cloudStartWorkout(scope: Scope, documentId: string, day: Workout['day']) {
  const workout: Workout = { id: crypto.randomUUID(), profileId: scope.profileId, documentId, day, started: Date.now(), sets: [] };
  const { error } = await scope.client.from('workout_sessions').insert({ id: workout.id, household_id: scope.householdId, profile_id: scope.profileId, title_snapshot: day.title, plan_snapshot: json(workout), started_at: new Date(workout.started).toISOString() });
  if (error) throw new Error('شروع جلسه ثبت نشد؛ شاید جلسهٔ دیگری فعال باشد.');
}
export async function cloudUpdateWorkout(scope: Scope, expected: Workout, change: Partial<Workout>) {
  const next = { ...expected, ...change };
  const { error } = await scope.client.rpc('save_workout_snapshot', { p_id: expected.id, p_profile: scope.profileId, p_revision: expected.revision ?? 1, p_snapshot: json(next) });
  if (error) throw new Error('ذخیره نشد؛ جلسه در دستگاه دیگری تغییر کرده یا اتصال قطع است.');
}
export async function cloudCancelWorkout(scope: Scope, workout: Workout) {
  if (workout.sets.length || workout.finished) throw new Error('جلسه قابل حذف نیست.');
  const { data, error } = await scope.client.from('workout_sessions').delete().eq('id', workout.id).eq('profile_id', scope.profileId).eq('revision', workout.revision ?? 1).eq('status', 'active').select('id');
  if (error || !data?.length) throw new Error('جلسه تغییر کرده است. دوباره دریافت کن.');
}
