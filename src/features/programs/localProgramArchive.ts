import Dexie, { type EntityTable, type Table } from 'dexie';
import { z } from 'zod';
import { supabaseClient } from '../../data/supabase/client';
import { cloudScope, cloudReadArchive, cloudImportDocument, cloudSelectProgram, cloudSaveMeasurement } from '../../data/supabase/trainingRepository';
import { syncReadArchive, syncReadMeasurements, syncReadWorkouts, syncStartWorkout, syncUpdateWorkout, syncCancelWorkout, syncSaveMeasurement } from '../../data/sync/trainingSync';
import { measurementSchema, trainingSchema, type Measurement, type TrainingPlan, type Workout } from '../training/trainingModel';

export type ProgramDocument = {
  pdfPath?: string;
  profileId: string;
  id: string;
  title: string;
  filename: string;
  sourceDate?: string;
  pdf: Blob;
  training?: TrainingPlan;
};

class ArchiveDatabase extends Dexie {
  documents!: Table<ProgramDocument, [string, string]>;
  selections!: EntityTable<{ profileId: string; currentId: string }, 'profileId'>;

  measurements!: Table<Measurement & { profileId: string }, [string, string, string]>;
  workouts!: EntityTable<Workout, 'id'>;
  activeWorkouts!: EntityTable<{ profileId: string; id: string }, 'profileId'>;

  constructor() {
    super('gymrez-local-program-archive');
    this.version(1).stores({ documents: '[profileId+id], profileId', selections: 'profileId' });
    this.version(2).stores({ measurements: '[profileId+date+source], profileId', workouts: 'id, profileId', activeWorkouts: 'profileId' });
  }
}

const db = new ArchiveDatabase();
const maxImportBytes = 32 * 1024 * 1024;
const bundleSchema = z.object({
  format: z.literal('gymrez-program-archive'),
  version: z.literal(1),
  profile: z.string().trim().min(1).max(100).optional(),
  measurements: z.array(measurementSchema).max(500).default([]),
  currentIndex: z.number().int().nonnegative().optional(),
  programs: z.array(z.object({
    title: z.string().trim().min(1).max(200),
    filename: z.string().trim().min(1).max(250),
    sourceDate: z.iso.date().optional(),
    training: trainingSchema.optional(),
    pdfBase64: z.string().min(1),
  })).min(1).max(60),
});

export const archiveKey = (profileId: string | undefined) => ['local-program-archive', profileId];

export async function readArchive(profileId: string) {
  const scope = await cloudScope(profileId);
  if (scope) return syncReadArchive(scope);
  return db.transaction('r', db.documents, db.selections, async () => {
    const [documents, selection] = await Promise.all([
      db.documents.where('profileId').equals(profileId).toArray(),
      db.selections.get(profileId),
    ]);
    return {
      documents: documents.sort((a, b) => (b.sourceDate ?? '').localeCompare(a.sourceDate ?? '') || a.title.localeCompare(b.title, 'fa')),
      currentId: selection?.currentId,
    };
  });
}

export async function importArchive(file: File, profileId: string, profileName: string) {
  if (file.size > maxImportBytes) throw new Error('حجم فایل باید کمتر از ۳۲ مگابایت باشد.');
  let bundle: z.infer<typeof bundleSchema>;
  try {
    bundle = bundleSchema.parse(JSON.parse(await file.text()));
  } catch {
    throw new Error('فایل بایگانی Gymrez خوانده نشد.');
  }
  if (bundle.profile && bundle.profile !== profileName) throw new Error('این بایگانی برای پروفایل دیگری آماده شده است.');
  if (bundle.currentIndex !== undefined && bundle.currentIndex >= bundle.programs.length) {
    throw new Error('برنامهٔ فعلی در فایل بایگانی مشخص نیست.');
  }
  const documents = await Promise.all(bundle.programs.map(async ({ pdfBase64, ...entry }) => {
    let bytes: Uint8Array<ArrayBuffer>;
    try {
      bytes = Uint8Array.from(atob(pdfBase64), character => character.charCodeAt(0));
    } catch {
      throw new Error('یکی از فایل‌های PDF بایگانی معتبر نیست.');
    }
    if (new TextDecoder().decode(bytes.subarray(0, 5)) !== '%PDF-') {
      throw new Error('یکی از فایل‌های PDF بایگانی معتبر نیست.');
    }
    const id = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), byte => byte.toString(16).padStart(2, '0')).join('');
    return { ...entry, profileId, id, pdf: new Blob([bytes], { type: 'application/pdf' }) };
  }));
  const scope = await cloudScope(profileId);
  if (scope) {
    let programs = 0;
    for (const document of documents) if (await cloudImportDocument(scope, document)) programs++;
    let measurements = 0;
    for (const measurement of bundle.measurements) if (await cloudSaveMeasurement(scope, measurement, true)) measurements++;
    const current = await cloudReadArchive(scope);
    if (!current.currentId && bundle.currentIndex !== undefined) await cloudSelectProgram(scope, documents[bundle.currentIndex].id);
    return { programs, measurements };
  }
  return db.transaction('rw', [db.documents, db.selections, db.measurements], async () => {
    let count = 0;
    const preferred = bundle.currentIndex === undefined ? undefined : documents[bundle.currentIndex];
    let preferredAdded = false;
    for (const document of documents) {
      const existing = await db.documents.get([profileId, document.id]);
      if (existing) {
        if (document.training && !existing.training) {
          await db.documents.put({ ...existing, training: document.training });
          count += 1;
          preferredAdded ||= document.id === preferred?.id;
        }
        continue;
      }
      await db.documents.add(document);
      count += 1;
      preferredAdded ||= document.id === preferred?.id;
    }
    if (preferred && (preferredAdded || !await db.selections.get(profileId))) {
      await db.selections.put({ profileId, currentId: preferred.id });
    }
    let measurements = 0;
    for (const entry of bundle.measurements) {
      if (await db.measurements.get([profileId, entry.date, entry.source])) continue;
      await db.measurements.add({ ...entry, profileId });
      measurements += 1;
    }
    return { programs: count, measurements };
  });
}

export async function selectCurrentProgram(profileId: string, id: string) {
  const scope = await cloudScope(profileId);
  if (scope) return cloudSelectProgram(scope, id);
  return db.transaction('rw', db.documents, db.selections, async () => {
    if (!await db.documents.get([profileId, id])) throw new Error('این برنامه پیدا نشد.');
    await db.selections.put({ profileId, currentId: id });
  });
}

export async function downloadProgram(document: ProgramDocument) {
  let pdf = document.pdf;
  if (document.pdfPath) {
    if (!supabaseClient) throw new Error('اتصال در دسترس نیست.');
    const result = await supabaseClient.storage.from('program-pdfs').download(document.pdfPath);
    if (result.error) throw new Error('دریافت PDF انجام نشد.');
    pdf = result.data;
  }
  if (!pdf.size) throw new Error('فایل PDF هنوز منتقل نشده است.');
  const href = URL.createObjectURL(pdf);
  const link = window.document.createElement('a');
  link.href = href;
  link.download = document.filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(href), 60_000);
}

export const measurementKey = (id: string) => ['local-measurements', id];
export const workoutKey = (id: string) => ['local-workout', id];

export async function readMeasurements(profileId: string) {
  const scope = await cloudScope(profileId);
  if (scope) return syncReadMeasurements(scope);
  return db.measurements.where('profileId').equals(profileId).sortBy('date');
}

export async function saveMeasurement(profileId: string, entry: Measurement) {
  const scope = await cloudScope(profileId);
  if (scope) return syncSaveMeasurement(scope, entry);
  return db.measurements.add({ ...measurementSchema.parse(entry), profileId });
}

export async function readWorkouts(profileId: string) {
  const scope = await cloudScope(profileId);
  if (scope) return syncReadWorkouts(scope);
  const [records, selection] = await Promise.all([
    db.workouts.where('profileId').equals(profileId).toArray(),
    db.activeWorkouts.get(profileId),
  ]);
  return {
    active: records.find(record => record.id === selection?.id),
    history: records.filter(record => record.finished !== undefined).sort((a, b) => b.started - a.started),
  };
}

export async function startWorkout(profileId: string, documentId: string, day: TrainingPlan['days'][number]) {
  const scope = await cloudScope(profileId);
  if (scope) return syncStartWorkout(scope, documentId, day);
  return db.transaction('rw', db.workouts, db.activeWorkouts, async () => {
    if (await db.activeWorkouts.get(profileId)) return;
    const workout: Workout = { id: crypto.randomUUID(), profileId, documentId, day, started: Date.now(), sets: [] };
    await db.workouts.add(workout);
    await db.activeWorkouts.add({ profileId, id: workout.id });
  });
}

export async function updateWorkout(expected: Workout, change: Partial<Pick<Workout, 'sets' | 'restUntil' | 'restPaused' | 'restDuration' | 'finished'>>) {
  const scope = await cloudScope(expected.profileId);
  if (scope) return syncUpdateWorkout(scope, expected, change);
  return db.transaction('rw', db.workouts, db.activeWorkouts, async () => {
    const current = await db.workouts.get(expected.id);
    if (!current || current.finished !== undefined || current.sets.length !== expected.sets.length || current.restUntil !== expected.restUntil || current.restPaused !== expected.restPaused) {
      throw new Error('جلسه در پنجرهٔ دیگری تغییر کرده است.');
    }
    await db.workouts.put({ ...current, ...change });
    if (change.finished !== undefined) await db.activeWorkouts.delete(current.profileId);
  });
}

export async function cancelEmptyWorkout(workout: Workout) {
  const scope = await cloudScope(workout.profileId);
  if (scope) return syncCancelWorkout(scope, workout);
  return db.transaction('rw', db.workouts, db.activeWorkouts, async () => {
    const current = await db.workouts.get(workout.id);
    if (!current || current.sets.length || current.finished !== undefined) throw new Error('جلسه تغییر کرده است.');
    await db.workouts.delete(workout.id);
    await db.activeWorkouts.delete(workout.profileId);
  });
}
