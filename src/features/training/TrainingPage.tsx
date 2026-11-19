import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button, SegmentProgress } from '../../shared/design/components';
import { archiveKey, cancelEmptyWorkout, readArchive, readWorkouts, startWorkout, updateWorkout, workoutKey } from '../programs/localProgramArchive';
import { MuscleMap } from './MuscleMap';
import { faDate, faNumber, trainingTasks, type Exercise, type Workout } from './trainingModel';
import './training.css';

const currentTimestamp = () => Date.now();
const number = (n: number) => faNumber.format(n);
const restLabel = (exercise: Exercise) => exercise.restTo ? `${number(exercise.rest)} تا ${number(exercise.restTo)} ثانیه` : exercise.rest ? `${number(exercise.rest)} ثانیه` : 'بدون استراحت';

export function TrainingPage({ profileId }: { profileId: string }) {
  const archive = useQuery({ queryKey: archiveKey(profileId), queryFn: () => readArchive(profileId) });
  const workouts = useQuery({ queryKey: workoutKey(profileId), queryFn: () => readWorkouts(profileId) });
  const queryClient = useQueryClient();
  const [day, setDay] = useState(0);
  const [focus, setFocus] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const current = archive.data?.documents.find(item => item.id === archive.data?.currentId);
  const plan = current?.training;
  const selected = plan?.days[day] ?? plan?.days[0];
  const exercise = selected?.exercises[focus] ?? selected?.exercises[0];
  const active = workouts.data?.active;
  const reduce = useReducedMotion();

  async function commit(action: () => Promise<unknown>) {
    setBusy(true);
    setError('');
    try {
      await action();
      await queryClient.invalidateQueries({ queryKey: workoutKey(profileId) });
    } catch (cause) {
      await queryClient.invalidateQueries({ queryKey: workoutKey(profileId) });
      setError(cause instanceof Error ? cause.message : 'ذخیرهٔ جلسه ممکن نبود.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="pace-training">
    <header className="pace-training-hero">
      <h1>تمرین من <span aria-hidden="true">//</span></h1>
      {current && <p>{current.title}{plan && <> · {number(plan.weeks)} هفته</>}</p>}
    </header>
    {error && <p role="alert">{error}</p>}
    {(archive.isError || workouts.isError) && <p role="alert">خواندن داده‌های این مرورگر ممکن نبود.</p>}
    {active ? <WorkoutPlayer key={active.id} workout={active} busy={busy} commit={commit} /> :
      selected && plan && current && exercise ? <>
        <div className="pace-workout-tabs" role="group" aria-label="انتخاب جلسه">
          {plan.days.map((option, i) => <Button key={option.title} variant={day === i ? 'primary' : 'secondary'} aria-pressed={day === i} onClick={() => { setDay(i); setFocus(0); }}>{option.title}</Button>)}
        </div>
        <div className="pace-training-grid">
          <div className="pace-training-panel">
            <details><summary>گرم‌کردن</summary><p>{selected.warmup}</p></details>
            <ol className="pace-exercise-list">
              {selected.exercises.map((item, i) => <li key={item.name}>
                <button aria-pressed={i === focus} onClick={() => setFocus(i)} type="button">
                  <strong>{item.name}</strong>
                  <small>{number(item.sets)} {item.unit === 'seconds' ? 'نوبت' : 'ست'} · {item.target}</small>
                  {item.group && <bdi className="pace-exercise-group">{item.group}</bdi>}
                </button>
              </li>)}
            </ol>
            <Button className="pace-wide" loading={busy} onClick={() => void commit(() => startWorkout(profileId, current.id, selected))}>شروع تمرین</Button>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div className="pace-training-panel pace-inspector" key={exercise.label} initial={reduce ? false : { opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: 0.16 }}>
              <ExerciseDetails exercise={exercise} />
            </motion.div>
          </AnimatePresence>
        </div>
        {plan.guide.length > 0 && <details className="pace-training-panel"><summary>روش اجرای برنامهٔ شش‌هفته‌ای</summary><ul>{plan.guide.map(step => <li key={step}>{step}</li>)}</ul></details>}
      </> : archive.isSuccess && workouts.isSuccess && <div className="pace-training-panel"><p>برای شروع، بستهٔ برنامه شامل جلسه‌ها و حرکت‌ها را وارد کن.</p><Link to="/programs">رفتن به برنامه‌ها</Link></div>}
    <section className="pace-training-panel" aria-labelledby="gymrez-training-history">
      <h2 id="gymrez-training-history">سابقهٔ تمرین</h2>
      {workouts.isSuccess && !workouts.data.history.length && <p>هنوز جلسه‌ای ثبت نشده است.</p>}
      {workouts.data?.history.length ? <WorkoutChart records={workouts.data.history} /> : null}
      {workouts.data?.history.map(record => <details key={record.id}>
        <summary>{record.day.title} · {faDate.format(record.started)} · {number(record.sets.length)} از {number(trainingTasks(record.day).length)} ست و نوبت</summary>
        <ul>{record.sets.map(log => {
          const task = trainingTasks(record.day)[log.task];
          return <li key={log.task}>{task.exercise.name} · {number(log.amount)} {task.exercise.unit === 'seconds' ? 'ثانیه' : 'تکرار'}{log.weight !== undefined && <> · {number(log.weight)} کیلوگرم</>}{log.rir !== undefined && <> · RIR {number(log.rir)}</>}</li>;
        })}</ul>
      </details>)}
    </section>
  </section>;
}

function WorkoutChart({ records }: { records: Workout[] }) {
  const reduced = useReducedMotion();
  const recent = records.slice(0, 8).reverse();
  const most = Math.max(1, ...recent.map(record => record.sets.length));
  return <figure className="pace-session-chart">
    <figcaption>ست‌ها و نوبت‌های ثبت‌شده در {number(recent.length)} جلسهٔ اخیر</figcaption>
    <ol>{recent.map(record => <li key={record.id} title={record.day.title}>
      <strong>{number(record.sets.length)}</strong>
      <div><motion.span initial={reduced ? false : { scaleY: 0 }} animate={{ scaleY: 1 }} style={{ height: record.sets.length / most * 100 + '%' }} /></div>
      <small>{faDate.format(record.started)}</small>
    </li>)}</ol>
  </figure>;
}

function ExerciseDetails({ exercise }: { exercise: Exercise }) {
  return <>
    <h2>{exercise.name}</h2>
    <p lang="en" dir="ltr" className="pace-exercise-en">{exercise.label}</p>
    <MuscleMap primary={exercise.muscles} assists={exercise.assists} />
    <p className="pace-exercise-prescription">{exercise.target} · {restLabel(exercise)}</p>
    {exercise.note && <p>{exercise.note}</p>}
  </>;
}

function WorkoutPlayer({ workout, busy, commit }: { workout: Workout; busy: boolean; commit: (action: () => Promise<unknown>) => Promise<void> }) {
  const tasks = trainingTasks(workout.day);
  const task = tasks[workout.sets.length];
  const [now, setNow] = useState(() => Date.now());
  const reduce = useReducedMotion();
  const restUntil = workout.restUntil;
  const rest = workout.restPaused ?? (restUntil ? Math.max(0, Math.ceil((restUntil - now) / 1000)) : 0);
  useEffect(() => {
    if (!restUntil || restUntil <= Date.now()) return;
    const id = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= restUntil) window.clearInterval(id);
    }, 250);
    return () => window.clearInterval(id);
  }, [restUntil]);

  function setRest(change: Pick<Workout, 'restUntil' | 'restPaused' | 'restDuration'>) {
    setNow(Date.now());
    void commit(() => updateWorkout(workout, change));
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!task) return;
    const data = new FormData(event.currentTarget);
    const amount = Number(data.get('amount'));
    const weight = data.get('weight');
    const rir = data.get('rir');
    const logged = { task: workout.sets.length, amount, ...(weight ? { weight: Number(weight) } : {}), ...(rir ? { rir: Number(rir) } : {}) };
    const timestamp = currentTimestamp();
    const nextRest = task.exercise.rest && workout.sets.length + 1 < tasks.length ? timestamp + task.exercise.rest * 1000 : undefined;
    setNow(timestamp);
    void commit(() => updateWorkout(workout, { sets: [...workout.sets, logged], restUntil: nextRest, restPaused: undefined, restDuration: task.exercise.rest }));
  }

  return <div className="pace-training-grid">
    <div className="pace-training-panel">
      <h2>{workout.day.title}</h2>
      <p>{number(workout.sets.length)} از {number(tasks.length)} ست و نوبت ثبت شده</p>
      <SegmentProgress label="پیشرفت جلسه" value={workout.sets.length} max={tasks.length} />
      {rest > 0 && <div className="pace-rest-panel"><p>استراحت</p>
        <motion.strong key={rest} initial={reduce ? false : { opacity: 0.7 }} animate={{ opacity: 1 }} role="timer">
          <bdi>{number(Math.floor(rest / 60)).padStart(2, '۰')}:{number(rest % 60).padStart(2, '۰')}</bdi>
        </motion.strong>
        <SegmentProgress label="زمان باقی‌ماندهٔ استراحت" value={Math.ceil(rest / (workout.restDuration || rest) * 12)} max={12} />
        <div className="pace-train-actions">
          <Button variant="secondary" disabled={busy} onClick={() => setRest(workout.restPaused !== undefined ? { restPaused: rest + 15, restDuration: (workout.restDuration ?? rest) + 15 } : { restUntil: (restUntil ?? Date.now()) + 15000, restDuration: (workout.restDuration ?? rest) + 15 })}>۱۵ ثانیه بیشتر</Button>
          <Button variant="secondary" disabled={busy} onClick={() => setRest(workout.restPaused !== undefined ? { restUntil: Date.now() + rest * 1000, restPaused: undefined } : { restUntil: undefined, restPaused: rest })}>{workout.restPaused !== undefined ? 'ادامهٔ تایمر' : 'مکث تایمر'}</Button>
          <Button variant="quiet" disabled={busy} onClick={() => setRest({ restUntil: undefined, restPaused: undefined })}>رد کردن استراحت</Button>
        </div>
      </div>}
      {task && <form className="pace-log-form" key={workout.sets.length} onSubmit={save}>
        <h3>ست {number(task.round)} · {task.exercise.name}</h3>
        <label>{task.exercise.unit === 'seconds' ? 'زمان (ثانیه)' : 'تکرار'}<input name="amount" type="number" min="1" max={task.exercise.unit === 'seconds' ? 7200 : 500} required inputMode="numeric" /></label>
        {task.exercise.unit === 'reps' && <>
          <label>وزنه (کیلوگرم)<input name="weight" type="number" min="0" max="1000" step="0.1" inputMode="decimal" /></label>
          <label>تکرار مانده (RIR)<input name="rir" type="number" min="0" max="10" inputMode="numeric" /></label>
        </>}
        <Button type="submit" disabled={rest > 0} loading={busy}>ثبت ست</Button>
      </form>}
      {workout.sets.length ? <Button variant={task ? 'secondary' : 'primary'} disabled={busy} onClick={() => void commit(() => updateWorkout(workout, { finished: Date.now(), restUntil: undefined, restPaused: undefined }))}>پایان و ذخیرهٔ جلسه</Button>
        : <Button variant="quiet" disabled={busy} onClick={() => void commit(() => cancelEmptyWorkout(workout))}>لغو جلسه</Button>}
    </div>
    {task && <div className="pace-training-panel"><ExerciseDetails exercise={task.exercise} /></div>}
  </div>;
}
