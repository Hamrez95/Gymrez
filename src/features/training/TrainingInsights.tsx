import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'motion/react';
import { readWorkouts, workoutKey } from '../programs/localProgramArchive';
import { muscleLabels, faDate, faNumber, type Muscle } from './trainingModel';
import { workoutAnalytics } from './workoutAnalytics';
import { Icon } from '../../shared/design/Icon';
const dayMs = 86400000;
const jalali = new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', timeZone: 'UTC' });
const persianDay = new Intl.DateTimeFormat('fa-IR', { day: 'numeric', timeZone: 'UTC' });
const dayKey = (time: number) => new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Tehran' }).format(time);
export function TrainingInsights({ profileId }: { profileId: string }) {
  const query = useQuery({ queryKey: workoutKey(profileId), queryFn: () => readWorkouts(profileId) });
  const [today] = useState(() => dayKey(Date.now()));
  const [monthAnchor, setMonthAnchor] = useState(() => Date.parse(dayKey(Date.now()) + 'T12:00:00Z'));
  const reduce = useReducedMotion();
  const history = query.data?.history ?? [];
  const stats = workoutAnalytics(history);
  const month = jalali.format(monthAnchor);
  const dates = Array.from({ length: 91 }, (_, i) => monthAnchor + (i - 45) * dayMs).filter(time => jalali.format(time) === month);
  const first = dates[0];
  const last = dates.at(-1)!;
  const offset = (new Date(first).getUTCDay() + 1) % 7;
  const completed = new Set(history.map(w => dayKey(w.started)));
  const distribution = Object.entries(stats.muscles).sort((a, b) => b[1] - a[1]) as [Muscle, number][];
  const largest = Math.max(1, ...distribution.map(([,count]) => count));
  return <section className="pace-insights" aria-labelledby="insights-title">
    <header className="pace-section-title"><h2 id="insights-title">مسیر قدرت تو</h2><Icon name="chart" /></header>
    {query.isError && <p role="alert">دریافت آمار تمرین انجام نشد.</p>}
    <div className="pace-insight-metrics">{[
      ['جلسهٔ تکمیل‌شده', stats.sessions, ''], ['ست ثبت‌شده', stats.sets, ''], ['حجم وزنهٔ ثبت‌شده', stats.volume, 'کیلوگرم'], ['زمان جلسه‌ها', stats.minutes, 'دقیقه'],
    ].map(([label,value,unit]) => <div key={label}><span>{label}</span><strong>{faNumber.format(Number(value))}</strong><small>{unit}</small></div>)}</div>
    <div className="pace-training-grid">
      <div className="pace-training-panel pace-calendar">
        <header><button type="button" aria-label="ماه قبل" onClick={() => setMonthAnchor(first - dayMs)}>‹</button><h3>{month}</h3><button type="button" aria-label="ماه بعد" onClick={() => setMonthAnchor(last + dayMs)}>›</button></header>
        <div className="pace-calendar-grid" aria-label="تقویم جلسات ثبت‌شده">
          {['ش','ی','د','س','چ','پ','ج'].map((d,i) => <small key={i}>{d}</small>)}
          {Array.from({ length: offset },(_,i) => <span key={'empty'+i} />)}
          {dates.map(time => <span key={dayKey(time)} data-completed={completed.has(dayKey(time))} data-today={dayKey(time)===today} title={faDate.format(time) + (completed.has(dayKey(time)) ? ' · تمرین ثبت‌شده' : '')}>{persianDay.format(time)}</span>)}
        </div>
        <small><i className="pace-dot" /> روزهای دارای جلسهٔ ثبت‌شده</small>
      </div>
      <div className="pace-training-panel"><h3>توزیع ست‌ها بین عضلات</h3>
        {!distribution.length && <p>پس از اولین جلسه، عضلات تمرین‌داده‌شده اینجا نمایش داده می‌شوند.</p>}
        <ul className="pace-muscle-distribution">{distribution.map(([muscle,count]) => <li key={muscle}><div><span>{muscleLabels[muscle]}</span><b>{faNumber.format(count)} ست</b></div><div className="pace-distribution-track"><motion.span initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: .3 }} style={{ width: count / largest * 100+'%' }} /></div></li>)}</ul>
        {distribution.length > 0 && <small>بر اساس عضلات اصلی هر ست؛ یک ست می‌تواند چند عضلهٔ اصلی داشته باشد.</small>}
      </div>
    </div>
    {stats.records.length > 0 && <div className="pace-training-panel"><h3><Icon name="trophy" /> بهترین وزنه‌های ثبت‌شده</h3><div className="pace-records">{stats.records.slice(0,6).map(record => <div key={record.name}><span>{record.name}</span><strong>{faNumber.format(record.weight)} <small>کیلوگرم × {faNumber.format(record.amount)}</small></strong><small>{faDate.format(record.date)}</small></div>)}</div></div>}
    {query.isSuccess && !stats.sessions && <p className="pace-empty-copy">با پایان اولین تمرین، آمار و تقویم تو شروع می‌شود.</p>}
  </section>;
}
