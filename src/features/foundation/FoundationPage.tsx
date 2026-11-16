import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import { useShellProfile } from '../../app/shellContext';
import { listMeasurements, listPrograms, listWorkoutSessions } from '../../data/supabase/profileDataRepository';
import { profileKey } from '../../data/queryKeys';
import { supabaseClient } from '../../data/supabase/client';
import { Card } from '../../shared/design/components';

function formatStatus(value: string): string {
  if (value === 'active') return 'فعال';
  if (value === 'completed') return 'تکمیل‌شده';
  if (value === 'abandoned') return 'متوقف‌شده';
  if (value === 'draft') return 'پیش‌نویس';
  if (value === 'archived') return 'بایگانی';
  return value;
}

export function FoundationPage({ section = 'در حال ساخت' }: { section?: string }) {
  const { userId } = useAuth();
  const { activeProfile } = useShellProfile();
  const scope = activeProfile && userId ? { userId, householdId: activeProfile.householdId, profileId: activeProfile.id } : null;
  const baseKey = scope ? profileKey(scope.userId, scope.householdId, scope.profileId) : ['gymrez', 'no-profile'];
  const enabled = Boolean(scope && supabaseClient);
  const programs = useQuery({ queryKey: [...baseKey, 'programs'], queryFn: () => listPrograms(supabaseClient!, scope!), enabled: enabled && section === 'برنامه‌ها' });
  const workouts = useQuery({ queryKey: [...baseKey, 'workout-sessions'], queryFn: () => listWorkoutSessions(supabaseClient!, scope!), enabled: enabled && section === 'تمرین' });
  const measurements = useQuery({ queryKey: [...baseKey, 'measurements'], queryFn: () => listMeasurements(supabaseClient!, scope!), enabled: enabled && section === 'پیشرفت و سابقه' });

  return <section className="foundation-content" aria-labelledby="title">
    <p className="eyebrow">GYMREZ / PACE</p>
    <h1 id="title">{section}<span aria-hidden="true"> //</span></h1>
    <p role="status">اطلاعات فقط برای پروفایل «{activeProfile?.displayName}» از workspace مجاز خوانده می‌شود.</p>
    {section === 'برنامه‌ها' && <>
      {programs.isPending && <p role="status">در حال دریافت برنامه‌ها…</p>}
      {programs.isError && <p role="alert">دریافت برنامه‌ها انجام نشد.</p>}
      {!programs.isPending && !programs.isError && programs.data?.length === 0 && <p>برای این پروفایل برنامه‌ای ثبت نشده است.</p>}
      {programs.data?.map(program => <Card key={program.id} title={program.title}><p>{formatStatus(program.status)}</p><p>{program.starts_on ?? 'بدون تاریخ شروع'} تا {program.ends_on ?? 'بدون تاریخ پایان'}</p></Card>)}
    </>}
    {section === 'تمرین' && <>
      {workouts.isPending && <p role="status">در حال دریافت جلسه‌ها…</p>}
      {workouts.isError && <p role="alert">دریافت جلسه‌های تمرین انجام نشد.</p>}
      {!workouts.isPending && !workouts.isError && workouts.data?.length === 0 && <p>برای این پروفایل جلسه‌ای ثبت نشده است.</p>}
      {workouts.data?.map(workout => <Card key={workout.id} title={workout.title_snapshot}><p>{formatStatus(workout.status)} · {workout.started_at}</p><p>زمان ثبت‌شده: {workout.elapsed_seconds} ثانیه</p></Card>)}
    </>}
    {section === 'پیشرفت و سابقه' && <>
      {measurements.isPending && <p role="status">در حال دریافت اندازه‌ها…</p>}
      {measurements.isError && <p role="alert">دریافت اندازه‌های بدن انجام نشد.</p>}
      {!measurements.isPending && !measurements.isError && measurements.data?.length === 0 && <p>اندازه‌ای برای این پروفایل ثبت نشده است.</p>}
      {measurements.data?.map(measurement => <Card key={measurement.id} title={measurement.measurement_date}>
        <p>وزن: {measurement.weight_kg == null ? 'ثبت نشده' : measurement.weight_kg + ' کیلوگرم'}</p>
        <p>قد: {measurement.height_cm == null ? 'ثبت نشده' : measurement.height_cm + ' سانتی‌متر'}</p>
        <p>دور کمر: {measurement.waist_cm == null ? 'ثبت نشده' : measurement.waist_cm + ' سانتی‌متر'}</p>
      </Card>)}
    </>}
    {section === 'پروفایل' && <Card title={activeProfile?.displayName ?? 'پروفایل'}>
      <p>شناسه این پروفایل در workspace با RLS بررسی می‌شود.</p>
      <p className="pace-demo-note">فرم ویرایش در مرحلهٔ پروفایل بدن اضافه می‌شود؛ این صفحه هنوز هیچ تغییری ذخیره نمی‌کند.</p>
    </Card>}
  </section>;
}
