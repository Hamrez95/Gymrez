import { z } from 'zod';

export const muscleLabels = {
  chest: 'سینه', shoulder: 'سرشانه جلو و کنار', rearDelt: 'پشت سرشانه',
  upperBack: 'پشت میانی و بالایی', lats: 'زیر بغل', biceps: 'جلو بازو',
  triceps: 'پشت بازو', forearm: 'ساعد و گریپ', abs: 'شکم', obliques: 'پهلو و عمق شکم',
  glutes: 'باسن', quads: 'جلوی ران', hamstrings: 'پشت ران', calves: 'ساق پا',
};

export type Muscle = keyof typeof muscleLabels;
const exerciseSchema = z.object({
  name: z.string().min(1).max(140), label: z.string().min(1).max(100),
  sets: z.number().int().min(1).max(10), target: z.string().min(1).max(100),
  rest: z.number().int().min(0).max(600), restTo: z.number().int().min(0).max(600).optional(),
  unit: z.enum(['reps', 'seconds']).default('reps'),
  muscles: z.array(z.enum(muscleLabelsAsKeys())).max(6),
  assists: z.array(z.enum(muscleLabelsAsKeys())).max(6).default([]),
  note: z.string().max(500).optional(),
  group: z.string().regex(/^[A-Z][12]$/).optional(),
});

function muscleLabelsAsKeys() {
  return Object.keys(muscleLabels) as Muscle[];
}

export const trainingSchema = z.object({
  weeks: z.number().int().min(1).max(52),
  guide: z.array(z.string().max(500)).max(18).default([]),
  days: z.array(z.object({
    title: z.string().min(1).max(120), warmup: z.string().max(500),
    exercises: z.array(exerciseSchema).min(1).max(30),
  })).min(1).max(7),
});
export type TrainingPlan = z.infer<typeof trainingSchema>;
export type Exercise = z.infer<typeof exerciseSchema>;
export type TrainingDay = TrainingPlan['days'][number];

const optionalNumber = (min: number, max: number) => z.number().min(min).max(max).optional();
export const measurementSchema = z.object({
  date: z.iso.date(), source: z.string().min(1).max(100), sourceDateLabel: z.string().max(100).optional(),
  weight: z.number().min(10).max(500), height: optionalNumber(50, 250),
  bmi: optionalNumber(1, 150), fat: optionalNumber(0, 100), muscle: optionalNumber(0, 500),
  skeletalMuscle: optionalNumber(0, 500), water: optionalNumber(0, 100),
  waist: optionalNumber(10, 300), score: optionalNumber(0, 100), visceral: optionalNumber(0, 100),
  bmr: optionalNumber(0, 10000), heartRate: optionalNumber(10, 300),
  fatMass: optionalNumber(0, 500), waterMass: optionalNumber(0, 500),
  boneMass: optionalNumber(0, 100), bonePercent: optionalNumber(0, 100),
  proteinMass: optionalNumber(0, 100), proteinPercent: optionalNumber(0, 100),
  musclePercent: optionalNumber(0, 100), leanMass: optionalNumber(0, 500),
  bodyAge: optionalNumber(0, 150), waistHip: optionalNumber(0, 5),
});
export type Measurement = z.infer<typeof measurementSchema>;
export type LoggedSet = { task: number; amount: number; weight?: number; rir?: number };
export type Workout = {
  revision?: number;
  id: string; profileId: string; documentId: string; day: TrainingDay;
  started: number; finished?: number; sets: LoggedSet[]; restUntil?: number; restPaused?: number; restDuration?: number;
};

export function trainingTasks(day: TrainingDay) {
  const tasks: { exercise: Exercise; round: number }[] = [];
  for (let i = 0; i < day.exercises.length; i += 1) {
    const exercise = day.exercises[i];
    const next = day.exercises[i + 1];
    const paired = exercise.group?.endsWith('1') && next?.group === exercise.group[0] + '2';
    const rounds = paired ? Math.max(exercise.sets, next.sets) : exercise.sets;
    for (let round = 1; round <= rounds; round += 1) {
      if (round <= exercise.sets) tasks.push({ exercise, round });
      if (paired && round <= next.sets) tasks.push({ exercise: next, round });
    }
    if (paired) i += 1;
  }
  return tasks;
}

export const faNumber = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 });
export const faDate = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeZone: 'Asia/Tehran' });
export function tehranDate() {
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Tehran' }).format(new Date());
}
