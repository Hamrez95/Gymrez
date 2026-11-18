import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/useAuth';
import { useShellProfile } from '../../app/shellContext';
import { profileKey } from '../../data/queryKeys';
import { supabaseClient } from '../../data/supabase/client';
import { Button, Card, SegmentProgress, Skeleton, Tabs, TextInput, Toast } from '../../shared/design/components';
import {
  activateProgram,
  archiveProgram,
  getProgramDetail,
  listProgramWorkouts,
  listPrograms,
  saveProgramDraft,
  type DraftSessionInput,
  type ProgramSummary,
} from './programRepository';
import './programs.css';

const DAYS = [
  { weekday: 6, label: 'شنبه' },
  { weekday: 0, label: 'یکشنبه' },
  { weekday: 1, label: 'دوشنبه' },
  { weekday: 2, label: 'سه‌شنبه' },
  { weekday: 3, label: 'چهارشنبه' },
  { weekday: 4, label: 'پنجشنبه' },
  { weekday: 5, label: 'جمعه' },
];
const TABS = [
  { value: 'active', label: 'فعال' },
  { value: 'upcoming', label: 'آینده' },
  { value: 'archived', label: 'آرشیو' },
] as const;

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function monthRange(month: string): { startsOn: string; endsOn: string } {
  const [year, monthNumber] = month.split('-').map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return {
    startsOn: `${month}-01`,
    endsOn: `${month}-${String(daysInMonth).padStart(2, '0')}`,
  };
}

function daysInRange(start: string, end: string, selected: number[]): number {
  const from = new Date(start + 'T00:00:00Z');
  const until = new Date(end + 'T00:00:00Z');
  let total = 0;
  for (const date = new Date(from); date <= until; date.setUTCDate(date.getUTCDate() + 1)) {
    if (selected.includes(date.getUTCDay())) total += 1;
  }
  return total;
}

function formatDate(value: string | null): string {
  if (!value) return 'بدون تاریخ';
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'medium', timeZone: 'UTC' })
    .format(new Date(value + 'T00:00:00Z'));
}

function monthAfter(value: string | null): string {
  const now = new Date();
  const [year, month] = value
    ? value.slice(0, 7).split('-').map(Number)
    : [now.getFullYear(), now.getMonth() + 1];
  const next = new Date(Date.UTC(year, month, 1));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}`;
}

function statusLabel(status: string): string {
  if (status === 'active') return 'فعال';
  if (status === 'archived') return 'آرشیو';
  return 'پیش‌نویس';
}

function shortWeekday(weekday: number | null): string {
  return DAYS.find(day => day.weekday === weekday)?.label ?? 'روز نامشخص';
}

export function ProgramsPage() {
  const { userId } = useAuth();
  const { activeProfile } = useShellProfile();
  const queryClient = useQueryClient();
  const scope = activeProfile && userId
    ? { userId, householdId: activeProfile.householdId, profileId: activeProfile.id }
    : null;
  const baseKey = scope
    ? profileKey(scope.userId, scope.householdId, scope.profileId)
    : ['gymrez', 'no-profile'];
  const programsKey = [...baseKey, 'programs'];
  const canQuery = Boolean(supabaseClient && scope);
  const programs = useQuery({
    queryKey: programsKey,
    queryFn: () => listPrograms(supabaseClient!, scope!),
    enabled: canQuery,
  });
  const workouts = useQuery({
    queryKey: [...baseKey, 'program-workouts'],
    queryFn: () => listProgramWorkouts(supabaseClient!, scope!),
    enabled: canQuery,
  });
  const [filter, setFilter] = useState<string>('active');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [title, setTitle] = useState('');
  const [month, setMonth] = useState(currentMonth);
  const [selectedDays, setSelectedDays] = useState<number[]>([6, 1, 3]);
  const [notice, setNotice] = useState<{ message: string; error: boolean } | null>(null);

  const selectedProgram = programs.data?.find(program => program.id === selectedId) ?? null;
  const detail = useQuery({
    queryKey: [...baseKey, 'program-detail', selectedId],
    queryFn: () => getProgramDetail(supabaseClient!, scope!, selectedId!),
    enabled: Boolean(canQuery && selectedId),
  });

  useEffect(() => {
    if (!selectedId && programs.data?.length) {
      setSelectedId(programs.data.find(program => program.status === 'active')?.id ?? programs.data[0].id);
    }
  }, [programs.data, selectedId]);

  const visiblePrograms = useMemo(() => {
    const all = programs.data ?? [];
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (filter === 'upcoming') {
      return all.filter(program => program.status === 'draft' && program.starts_on && program.starts_on > today);
    }
    if (filter === 'archived') return all.filter(program => program.status === 'archived');
    return all.filter(program => program.status === 'active' || (program.status === 'draft' && (!program.starts_on || program.starts_on <= today)));
  }, [filter, programs.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!scope || !supabaseClient) throw new Error('ورود لازم است.');
      if (selectedDays.length < 1) throw new Error('حداقل یک روز تمرین انتخاب کن.');
      const range = monthRange(month);
      const previousSessions = formMode === 'edit' ? detail.data?.sessions ?? [] : [];
      const sessions: DraftSessionInput[] = [...selectedDays]
        .sort((a, b) => DAYS.findIndex(day => day.weekday === a) - DAYS.findIndex(day => day.weekday === b))
        .map((weekday, position) => {
          const old = previousSessions.find(session => session.weekday === weekday);
          return { name: old?.name ?? `جلسه ${position + 1}`, weekday, position, notes: old?.notes ?? null };
        });
      return saveProgramDraft(supabaseClient, scope, {
        ...(formMode === 'edit' && selectedProgram
          ? { programId: selectedProgram.id, expectedRevision: selectedProgram.revision }
          : {}),
        title,
        startsOn: range.startsOn,
        endsOn: range.endsOn,
        sessions,
      });
    },
    onSuccess: async programId => {
      await queryClient.invalidateQueries({ queryKey: programsKey });
      await queryClient.invalidateQueries({ queryKey: [...baseKey, 'program-detail', programId] });
      setSelectedId(programId);
      setFormMode('create');
      setTitle('');
      setMonth(currentMonth());
      setSelectedDays([6, 1, 3]);
      setNotice({ message: 'پیش‌نویس در Supabase ذخیره شد.', error: false });
    },
    onError: error => setNotice({ message: error instanceof Error ? error.message : 'ذخیره انجام نشد.', error: true }),
  });

  const activateMutation = useMutation({
    mutationFn: async (programId: string) => {
      if (!scope || !supabaseClient) throw new Error('ورود لازم است.');
      return activateProgram(supabaseClient, scope, programId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: programsKey });
      await queryClient.invalidateQueries({ queryKey: [...baseKey, 'program-detail'] });
      setNotice({ message: 'برنامه فعال شد.', error: false });
    },
    onError: error => setNotice({ message: error instanceof Error ? error.message : 'فعال‌سازی انجام نشد.', error: true }),
  });

  const archiveMutation = useMutation({
    mutationFn: async (program: ProgramSummary) => {
      if (!scope || !supabaseClient) throw new Error('ورود لازم است.');
      return archiveProgram(supabaseClient, scope, program);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: programsKey });
      setNotice({ message: 'برنامه به آرشیو منتقل شد؛ سابقهٔ تمرین‌ها باقی می‌ماند.', error: false });
    },
    onError: error => setNotice({ message: error instanceof Error ? error.message : 'بایگانی انجام نشد.', error: true }),
  });

  const startNew = () => {
    setFormMode('create');
    setTitle('');
    setMonth(currentMonth());
    setSelectedDays([6, 1, 3]);
  };

  const startEdit = () => {
    if (!selectedProgram || !detail.data) return;
    setFormMode('edit');
    setTitle(selectedProgram.title);
    setMonth(selectedProgram.starts_on?.slice(0, 7) ?? currentMonth());
    setSelectedDays(detail.data.sessions.flatMap(session => session.weekday === null ? [] : [session.weekday]));
  };

  const makeCopy = () => {
    if (!selectedProgram || !detail.data) return;
    setFormMode('create');
    setTitle(selectedProgram.title + ' — ماه بعد');
    setMonth(monthAfter(selectedProgram.starts_on));
    setSelectedDays(detail.data.sessions.flatMap(session => session.weekday === null ? [] : [session.weekday]));
    setNotice({ message: 'نسخهٔ ماه بعد آمادهٔ ذخیره است؛ جلسات ثبت‌شده به برنامهٔ جدید منتقل نمی‌شوند.', error: false });
  };

  const toggleDay = (weekday: number) => {
    setSelectedDays(current => current.includes(weekday)
      ? current.filter(day => day !== weekday)
      : [...current, weekday]);
  };

  const programWorkouts = workouts.data ?? [];
  const statusFilter = TABS.find(tab => tab.value === filter)?.label ?? 'فعال';

  return <section className="pace-programs" aria-labelledby="programs-title">
    <header className="pace-programs__header">
      <div>
        <p className="eyebrow">GYMREZ / PACE · برنامه‌های {activeProfile?.displayName}</p>
        <h1 id="programs-title">برنامه‌های من<span aria-hidden="true"> //</span></h1>
        <p>مدیریت، ساخت و آرشیو برنامه‌های تمرینی این پروفایل</p>
      </div>
      <Button type="button" variant="secondary" onClick={startNew}>＋ <span>برنامهٔ جدید</span></Button>
    </header>

    {notice && <Toast message={notice.message} kind={notice.error ? 'error' : 'success'} onDismiss={() => setNotice(null)} />}

    <div className="pace-programs__grid">
      <aside className="pace-programs__details" aria-label="جزئیات برنامه">
        {detail.isPending && selectedId && <Card title="جزئیات برنامه"><Skeleton label="در حال دریافت جزئیات برنامه" /></Card>}
        {detail.isError && <Card title="جزئیات برنامه"><p role="alert">جزئیات دریافت نشد. اتصال را بررسی کن.</p><Button type="button" variant="secondary" onClick={() => void detail.refetch()}>تلاش دوباره</Button></Card>}
        {!selectedId && <Card title="جزئیات برنامه"><p>برای دیدن جلسه‌ها، یک برنامه را انتخاب کن.</p></Card>}
        {selectedProgram && detail.data && <Card className="pace-program-detail">
          <div className="pace-program-detail__heading">
            <div><p className="eyebrow">جزئیات برنامه<span aria-hidden="true"> //</span></p><h2>{selectedProgram.title}</h2></div>
            <span className={'pace-program-pill pace-program-pill--' + selectedProgram.status}>{statusLabel(selectedProgram.status)}</span>
          </div>
          <p className="pace-program-detail__meta">نسخهٔ v{detail.data.versionNo} · مالک: {activeProfile?.displayName}</p>
          <p className="pace-program-detail__dates">{formatDate(selectedProgram.starts_on)} تا {formatDate(selectedProgram.ends_on)}</p>
          <Tabs label="نمایش برنامه" value="sessions" items={[{ value: 'sessions', label: 'جلسه‌ها' }]} onChange={() => undefined} />
          <ol className="pace-program-sessions">
            {detail.data.sessions.map((session, index) => <li key={session.id}>
              <span className="pace-program-sessions__index">{String(index + 1).padStart(2, '0')}</span>
              <span><b>{session.name}</b><small>{shortWeekday(session.weekday)} · هفتگی</small></span>
              <span aria-hidden="true">›</span>
            </li>)}
          </ol>
          {detail.data.sessions.length === 0 && <p className="pace-demo-note">برای این نسخه هنوز جلسه‌ای تعریف نشده است.</p>}
          <p className="pace-demo-note">انتخاب حرکات، ست و تکرار در ویرایشگر مرحلهٔ بعد اضافه می‌شود.</p>
          <div className="pace-program-detail__actions">
            {selectedProgram.status !== 'active' && <Button type="button" onClick={() => activateMutation.mutate(selectedProgram.id)} loading={activateMutation.isPending}>فعال‌سازی</Button>}
            <Button type="button" variant="secondary" onClick={() => void startEdit()} disabled={selectedProgram.status === 'archived' || detail.isPending}>ویرایش</Button>
            <Button type="button" variant="secondary" onClick={makeCopy} disabled={detail.isPending}>کپی برای ماه بعد</Button>
            {selectedProgram.status !== 'archived' && <Button type="button" variant="quiet" onClick={() => archiveMutation.mutate(selectedProgram)} loading={archiveMutation.isPending}>آرشیو</Button>}
          </div>
        </Card>}
      </aside>

      <main className="pace-programs__list" aria-label={`فهرست برنامه‌های ${statusFilter}`}>
        <div className="pace-programs__tabs">
          <Tabs label="فیلتر برنامه‌ها" value={filter} items={[...TABS]} onChange={setFilter} />
        </div>
        {programs.isPending && <div className="pace-programs__loading"><Skeleton label="در حال دریافت برنامه‌ها" /><Skeleton label="در حال دریافت برنامه‌ها" /></div>}
        {programs.isError && <Card title="دریافت برنامه‌ها ناموفق بود"><p role="alert">برنامه‌ها از workspace دریافت نشدند.</p><Button type="button" variant="secondary" onClick={() => void programs.refetch()}>تلاش دوباره</Button></Card>}
        {!programs.isPending && !programs.isError && visiblePrograms.length === 0 && <Card className="pace-program-empty">
          <span className="pace-program-empty__mark" aria-hidden="true">＋</span>
          <h2>{filter === 'active' ? 'هنوز برنامهٔ فعالی نداری' : filter === 'upcoming' ? 'برنامهٔ آینده‌ای نیست' : 'آرشیو خالی است'}</h2>
          <p>{filter === 'active' ? 'یک پیش‌نویس بساز و پس از بازبینی آن را فعال کن.' : 'برنامه‌های این بخش پس از ثبت یا آرشیو نمایش داده می‌شوند.'}</p>
          {filter === 'active' && <Button type="button" onClick={startNew}>ساخت برنامهٔ جدید</Button>}
        </Card>}
        <div className="pace-program-cards">
          {visiblePrograms.map(program => {
            const detailForSelected = selectedId === program.id ? detail.data : undefined;
            const weekdays = detailForSelected?.sessions.flatMap(session => session.weekday === null ? [] : [session.weekday]) ?? [];
            const range = program.starts_on && program.ends_on ? { startsOn: program.starts_on, endsOn: program.ends_on } : null;
            const expected = range ? daysInRange(range.startsOn, range.endsOn, weekdays) : 0;
            const completed = programWorkouts.filter(workout =>
              workout.program_id === program.id && workout.status === 'completed'
              && (!program.starts_on || workout.started_at.slice(0, 10) >= program.starts_on)
              && (!program.ends_on || workout.started_at.slice(0, 10) <= program.ends_on),
            ).length;
            const progress = expected ? Math.min(100, Math.round(completed / expected * 100)) : 0;
            return <button
              key={program.id}
              type="button"
              className={'pace-program-card' + (selectedId === program.id ? ' is-selected' : '')}
              onClick={() => setSelectedId(program.id)}
              aria-pressed={selectedId === program.id}
            >
              <span className="pace-program-card__top">
                <span className={'pace-program-pill pace-program-pill--' + program.status}>{statusLabel(program.status)}</span>
                <span className="pace-program-card__period">{program.starts_on ? formatDate(program.starts_on) : 'بدون تاریخ'} · {program.title}</span>
                <span aria-hidden="true">▣</span>
              </span>
              <span className="pace-program-card__owner">مالک برنامه: {activeProfile?.displayName}</span>
              <span className="pace-program-card__progress">
                <span>{completed} از {expected || '—'} جلسه</span>
                <SegmentProgress value={progress ? Math.round(progress / 10) : 0} max={10} label={`پیشرفت ${program.title}`} />
              </span>
              {detailForSelected && <span className="pace-program-card__sessions">{detailForSelected.sessions.map(session => shortWeekday(session.weekday)).join(' · ')}</span>}
            </button>;
          })}
        </div>
      </main>

      <aside className="pace-programs__builder" aria-label="ساخت برنامهٔ جدید">
        <Card className="pace-program-builder">
          <p className="eyebrow">{formMode === 'edit' ? 'ویرایش پیش‌نویس' : 'برنامهٔ جدید'}<span aria-hidden="true"> //</span></p>
          <h2>{formMode === 'edit' ? 'ویرایش برنامه' : 'یک برنامهٔ تمرینی جدید بساز'}</h2>
          <p className="pace-demo-note">جلسه‌های هفتگی در تمام هفته‌های ماه تکرار می‌شوند.</p>
          <form onSubmit={event => { event.preventDefault(); saveMutation.mutate(); }}>
            <TextInput label="عنوان برنامه" name="program-title" value={title} onChange={event => setTitle(event.target.value)} required maxLength={120} placeholder="مثلاً برنامهٔ قدرت پایه" />
            <div className="pace-field">
              <label htmlFor="program-month">ماه برنامه</label>
              <input id="program-month" className="pace-input" type="month" value={month} onChange={event => setMonth(event.target.value)} required />
            </div>
            <fieldset className="pace-program-days">
              <legend>روزهای تمرین در هفته</legend>
              <div>{DAYS.map(day => <label key={day.weekday} className="pace-program-day">
                <input type="checkbox" checked={selectedDays.includes(day.weekday)} onChange={() => toggleDay(day.weekday)} />
                <span>{day.label}</span>
              </label>)}</div>
              {selectedDays.length === 0 && <small role="alert">یک روز تمرین انتخاب کن.</small>}
            </fieldset>
            <div className="pace-program-builder__summary">
              <span>تعداد جلسه در هفته</span><strong>{selectedDays.length} جلسه</strong>
            </div>
            <div className="pace-program-builder__actions">
              <Button type="submit" loading={saveMutation.isPending} disabled={selectedDays.length === 0 || !title.trim() || !month}>
                {formMode === 'edit' ? 'ذخیرهٔ نسخهٔ جدید' : 'ذخیره به‌صورت پیش‌نویس'}
              </Button>
              {formMode === 'edit' && <Button type="button" variant="quiet" onClick={startNew}>انصراف از ویرایش</Button>}
            </div>
          </form>
        </Card>
      </aside>
    </div>
  </section>;
}
