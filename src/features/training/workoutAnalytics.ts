import { trainingTasks, type Muscle, type Workout } from './trainingModel';
export function workoutAnalytics(workouts: readonly Workout[]) {
  const finished = workouts.filter(w => w.finished !== undefined);
  let volume = 0, minutes = 0, sets = 0;
  const muscles: Partial<Record<Muscle, number>> = {};
  const records = new Map<string, { name: string; weight: number; amount: number; date: number }>();
  for (const workout of finished) {
    minutes += Math.max(0, (workout.finished! - workout.started) / 60_000);
    const tasks = trainingTasks(workout.day);
    for (const log of workout.sets) {
      const exercise = tasks[log.task]?.exercise;
      if (!exercise) continue;
      sets++;
      for (const muscle of exercise.muscles) muscles[muscle] = (muscles[muscle] ?? 0) + 1;
      if (exercise.unit === 'seconds' || log.weight === undefined) continue;
      volume += log.weight * log.amount;
      const best = records.get(exercise.label);
      if (!best || log.weight > best.weight || (log.weight === best.weight && log.amount > best.amount)) {
        records.set(exercise.label, { name: exercise.name, weight: log.weight, amount: log.amount, date: workout.started });
      }
    }
  }
  return { sessions: finished.length, sets, volume, minutes: Math.round(minutes), muscles, records: [...records.values()].sort((a, b) => b.date - a.date) };
}
export function previousPerformance(workouts: readonly Workout[], exerciseLabel: string) {
  for (const workout of workouts) {
    const tasks = trainingTasks(workout.day);
    const matches = workout.sets.filter(log => tasks[log.task]?.exercise.label === exerciseLabel);
    if (matches.length) return matches.at(-1);
  }
  return undefined;
}
