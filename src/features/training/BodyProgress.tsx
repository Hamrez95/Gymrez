import { useState, type FormEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '../../shared/design/components';
import { measurementKey, readMeasurements, saveMeasurement } from '../programs/localProgramArchive';
import { faDate, faNumber, tehranDate, type Measurement } from './trainingModel';
import { TrainingInsights } from './TrainingInsights';
import { useShellProfile } from '../../app/shellContext';
import { ProfileAvatar } from '../../shared/design/ProfileAvatar';
import { useAuth } from '../auth/useAuth';
import './training.css';

const metrics = {
  weight: ['وزن', 'کیلوگرم'], fat: ['چربی بدن', '٪'], muscle: ['تودهٔ عضله', 'کیلوگرم'],
  skeletalMuscle: ['عضلهٔ اسکلتی', 'کیلوگرم'], bmi: ['BMI', ''], waist: ['دور کمر', 'سانتی‌متر'],
  water: ['آب بدن', '٪'], height: ['قد', 'سانتی‌متر'], score: ['امتیاز ترازو', ''], visceral: ['چربی احشایی', ''],
  bmr: ['متابولیسم پایهٔ ترازو', 'کیلوکالری'], heartRate: ['ضربان قلب', 'در دقیقه'], fatMass: ['تودهٔ چربی', 'کیلوگرم'],
  waterMass: ['جرم آب بدن', 'کیلوگرم'], boneMass: ['تودهٔ مواد معدنی استخوان', 'کیلوگرم'], bonePercent: ['درصد مواد معدنی استخوان', '٪'],
  proteinMass: ['تودهٔ پروتئین', 'کیلوگرم'], proteinPercent: ['پروتئین', '٪'], musclePercent: ['درصد عضله', '٪'],
  leanMass: ['وزن بدون چربی', 'کیلوگرم'], bodyAge: ['سن بدن طبق ترازو', 'سال'], waistHip: ['نسبت تخمینی کمر به باسن', ''],
} as const;
type Metric = keyof typeof metrics;
const chartMetrics: Metric[] = ['weight', 'fat', 'muscle', 'bmi', 'waist'];
const formMetrics = ['weight', 'height', 'fat', 'muscle', 'waist'] as const;

function metricValue(entry: Measurement, key: Metric) {
  if (key === 'bmi') return entry.bmi ?? (entry.height ? entry.weight / (entry.height / 100) ** 2 : undefined);
  return entry[key];
}
function metricText(value: number, key: Metric) {
  return [faNumber.format(value), metrics[key][1]].filter(Boolean).join(' ');
}

export function BodyProgress({ profileId }: { profileId: string }) {
  const { userId } = useAuth();
  const { activeProfile } = useShellProfile();
  const queryClient = useQueryClient();
  const key = measurementKey(profileId);
  const query = useQuery({ queryKey: key, queryFn: () => readMeasurements(profileId) });
  const readings = query.data ?? [];
  const latest = readings.at(-1);
  const [metric, setMetric] = useState<Metric>('weight');
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const points = readings.flatMap(entry => {
    const value = metricValue(entry, metric);
    return value === undefined ? [] : [{ value, date: entry.date, source: entry.source }];
  });

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const data = new FormData(event.currentTarget);
    const date = String(data.get('date'));
    const values = Object.fromEntries(formMetrics.flatMap(field => {
      const value = data.get(field);
      return value ? [[field, Number(value)]] : [];
    }));
    const previous = readings.find(entry => entry.date === date && entry.source === 'ثبت دستی');
    if (previous) {
      setError('برای این تاریخ یک اندازه‌گیری دستی ثبت شده است. تاریخ دیگری انتخاب کن.');
      setBusy(false);
      return;
    }
    try {
      await saveMeasurement(profileId, { ...values, date, source: 'ثبت دستی', weight: Number(data.get('weight')) });
      await queryClient.invalidateQueries({ queryKey: key });
      setFormOpen(false);
      setError('');
      setNotice(userId ? 'اندازه‌گیری در دیتابیس ذخیره شد.' : 'اندازه‌گیری در همین مرورگر ذخیره شد.');
    } catch {
      setError('مقادیر واردشده را بررسی کن. اندازه‌گیری ذخیره نشد.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="pace-training">
    <header className="pace-training-hero pace-training-hero--personal"><div><h1>بدن من، مسیر من</h1>{latest && <p>آخرین اندازه‌گیری · {faDate.format(new Date(latest.date))} · {latest.source}</p>}</div>{activeProfile && <ProfileAvatar profile={activeProfile} hero />}</header>
    <TrainingInsights profileId={profileId} />
    {query.isError && <p role="alert">دریافت اندازه‌ها انجام نشد. اتصال را بررسی کن.</p>}
    {latest && <div className="pace-body-stats">{(['weight', 'bmi', 'fat', 'muscle'] as const).map(field => {
      const value = metricValue(latest, field);
      return value === undefined ? null : <div key={field}><span>{metrics[field][0]}</span><strong>{metricText(value, field)}</strong></div>;
    })}</div>}
    <div className="pace-training-grid">
      <div className="pace-training-panel">
        <h2>روند اندازه‌گیری</h2>
        <div className="pace-workout-tabs" aria-label="شاخص نمودار" role="group">
          {chartMetrics.map(field => <Button type="button" key={field} variant={metric === field ? 'primary' : 'secondary'} aria-pressed={metric === field} onClick={() => { setMetric(field); setSelectedDate(''); }}>{metrics[field][0]}</Button>)}
        </div>
        <TrendChart points={points} metric={metric} selectedDate={selectedDate} onSelect={setSelectedDate} />
      </div>
      <div className="pace-training-panel">
        <h2>اندازه‌گیری‌های من</h2>
        <Button onClick={() => { setFormOpen(!formOpen); setError(''); setNotice(''); }} aria-expanded={formOpen}>{formOpen ? 'بستن فرم' : 'ثبت اندازه‌گیری جدید'}</Button>
        {notice && <p role="status">{notice}</p>}
        {error && <p role="alert">{error}</p>}
        {formOpen && <form className="pace-log-form pace-measure-form" onSubmit={save}>
          <label>تاریخ<input type="date" name="date" defaultValue={tehranDate()} max={tehranDate()} required /></label>
          {formMetrics.map(field => <label key={field}>{metrics[field].filter(Boolean).join(' · ')}
            <input type="number" name={field} required={field === 'weight'} min={field === 'weight' ? 10 : 0} step="0.1" inputMode="decimal" />
          </label>)}
          <Button type="submit" loading={busy}>ذخیرهٔ اندازه‌گیری</Button>
        </form>}
        {query.isSuccess && !latest && <p>هنوز اندازه‌ای ثبت نشده. اگر بستهٔ آنالیز داری، از <Link to="/programs">برنامه‌ها</Link> واردش کن.</p>}
        {[...readings].reverse().map(entry => <details key={entry.date + entry.source}>
          <summary>{faDate.format(new Date(entry.date))} · {entry.source}</summary>
          {entry.sourceDateLabel && <p>تاریخ و ساعت روی گزارش <bdi>{entry.sourceDateLabel}</bdi></p>}
          <dl className="pace-measure-values">{(Object.keys(metrics) as Metric[]).map(field => {
            const value = metricValue(entry, field);
            return value === undefined ? null : <div key={field}><dt>{metrics[field][0]}</dt><dd>{metricText(value, field)}</dd></div>;
          })}</dl>
        </details>)}
      </div>
    </div>
  </section>;
}

function TrendChart({ points, metric, selectedDate, onSelect }: {
  points: { date: string; value: number; source: string }[]; metric: Metric; selectedDate: string; onSelect: (date: string) => void;
}) {
  const reduce = useReducedMotion();
  if (!points.length) return <p>هنوز داده‌ای برای این شاخص ثبت نشده است.</p>;
  const values = points.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max((max - min) * 0.15, 0.5);
  const first = Date.parse(points[0].date), last = Date.parse(points.at(-1)!.date);
  const coords = points.map(p => ({
    ...p, x: first === last ? 180 : 24 + (Date.parse(p.date) - first) / (last - first) * 312,
    y: 130 - (p.value - min + pad) / (max - min + 2 * pad) * 110,
  }));
  const line = coords.map(({ x, y }) => x + ',' + y).join(' ');
  const selected = coords.find(p => p.date + p.source === selectedDate) ?? coords.at(-1)!;
  return <div className="pace-body-chart">
    <div className="pace-chart-reading"><strong>{metricText(selected.value, metric)}</strong><span>{faDate.format(new Date(selected.date))}</span></div>
    <svg viewBox="0 0 360 150" role="img" aria-label={'نمودار ' + metrics[metric][0]}>
      {[27, 55, 83, 111, 138].map(y => <line key={y} x1="16" x2="343" y1={y} y2={y} className="pace-chart-gridline" />)}
      {points.length > 1 && <motion.polyline key={metric} points={line} fill="none" className="pace-chart-line" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />}
      {coords.map(p => <circle key={p.date + p.source} cx={p.x} cy={p.y} r={p === selected ? 6 : 3.5} className="pace-chart-point" />)}
    </svg>
    <div className="pace-chart-dates">
      {coords.map(p => <button key={p.date + p.source} aria-pressed={p === selected} onClick={() => onSelect(p.date + p.source)}>{faDate.format(new Date(p.date))} · {p.source}</button>)}
    </div>
    {points.length === 1 && <p>برای دیدن روند، یک اندازه‌گیری دیگر ثبت کن.</p>}
  </div>;
}
