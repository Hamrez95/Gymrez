import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useShellProfile } from '../../app/shellContext';
import { listMeasurements, listPrograms, listWorkoutSessions } from '../../data/supabase/profileDataRepository';
import { profileKey } from '../../data/queryKeys';
import { supabaseClient } from '../../data/supabase/client';
import { archiveKey, measurementKey, readArchive, readMeasurements, readWorkouts, workoutKey } from '../programs/localProgramArchive';
import { Button, Card } from '../../shared/design/components';

export function DashboardPreview() {
  const { userId, activeProfile } = useShellProfile();
  const scope = activeProfile && userId ? { userId, householdId: activeProfile.householdId, profileId: activeProfile.id } : null;
  const baseKey = scope ? profileKey(scope.userId, scope.householdId, scope.profileId) : ['gymrez', 'no-profile'];
  const enabled = Boolean(scope && supabaseClient);
  const programs = useQuery({ queryKey: [...baseKey, 'programs'], queryFn: () => listPrograms(supabaseClient!, scope!), enabled });
  const workouts = useQuery({ queryKey: [...baseKey, 'workout-sessions'], queryFn: () => listWorkoutSessions(supabaseClient!, scope!), enabled });
  const measurements = useQuery({ queryKey: [...baseKey, 'measurements'], queryFn: () => listMeasurements(supabaseClient!, scope!), enabled });
  const localArchive = useQuery({
    queryKey: archiveKey(activeProfile?.id),
    queryFn: () => readArchive(activeProfile!.id),
    enabled: !userId && Boolean(activeProfile),
  });
  const localCurrent = localArchive.data?.documents.find(item => item.id === localArchive.data?.currentId);
  const localMeasurements = useQuery({
    queryKey: measurementKey(activeProfile?.id ?? ''),
    queryFn: () => readMeasurements(activeProfile!.id),
    enabled: !userId && Boolean(activeProfile),
  });
  const localWorkouts = useQuery({
    queryKey: workoutKey(activeProfile?.id ?? ''),
    queryFn: () => readWorkouts(activeProfile!.id),
    enabled: !userId && Boolean(activeProfile),
  });
  const localMeasurement = localMeasurements.data?.at(-1);
  const localSession = localWorkouts.data?.history[0];
  const activeProgram = programs.data?.find(item => item.status === 'active');
  const recentWorkout = workouts.data?.[0];
  const recentMeasurement = measurements.data?.[0];
  const guestPreview = !userId;

  return <section className="pace-dashboard" aria-labelledby="dashboard-title">
    <div className="pace-dashboard__intro"><p className="eyebrow">GYMREZ / PACE</p><h1 id="dashboard-title">سلام، {activeProfile?.displayName}<span aria-hidden="true"> //</span></h1><p>{guestPreview ? 'برنامه‌ها، تمرین‌ها و اندازه‌ها در همین مرورگر ثبت می‌شوند.' : 'اطلاعات این صفحه از workspace مجاز همین پروفایل خوانده می‌شود.'}</p></div>
    {guestPreview && <p className="pace-demo-note" role="status">پروفایل «{activeProfile?.displayName}» فعال است.</p>}
    {!guestPreview && [programs, workouts, measurements].some(query => query.isPending) && <p role="status">در حال دریافت اطلاعات پروفایل…</p>}
    {!guestPreview && [programs, workouts, measurements].some(query => query.isError) && <p role="alert">بخشی از اطلاعات این پروفایل بارگذاری نشد.</p>}
    <Card className="pace-dashboard__progress" title="برنامه فعال">
      {guestPreview ? <p>{localCurrent?.title ?? (localArchive.isPending ? 'در حال خواندن برنامه…' : localArchive.isError ? 'خواندن بایگانی ممکن نبود.' : 'برنامهٔ فعلی در این مرورگر ثبت نشده است.')}</p> : activeProgram ? <><p>{activeProgram.title}</p><p>{activeProgram.starts_on ?? 'بدون تاریخ شروع'} تا {activeProgram.ends_on ?? 'بدون تاریخ پایان'}</p></> : <p>برای این پروفایل برنامه فعالی ثبت نشده است.</p>}
      <Link to="/programs">دیدن برنامه‌ها</Link>
    </Card>
    <Card className="pace-dashboard__workout" title="آخرین جلسه">
      {guestPreview ? <p>{localSession?.day.title ?? 'هنوز جلسه‌ای در این مرورگر ثبت نشده است.'}</p> : recentWorkout ? <><h2>{recentWorkout.title_snapshot}</h2><p>{recentWorkout.started_at} · {recentWorkout.status}</p></> : <p>برای این پروفایل جلسه تمرینی ثبت نشده است.</p>}
      {guestPreview && (localCurrent?.training || localWorkouts.data?.active)
        ? <Link className="pace-button pace-button--primary" to="/workout">{localWorkouts.data?.active ? 'ادامهٔ تمرین' : 'شروع تمرین'}</Link>
        : <Button type="button" disabled>شروع تمرین</Button>}
      <Link to="/workout">تاریخچه جلسه‌ها</Link>
    </Card>
    <div className="pace-dashboard__links">
      <Card title="آخرین اندازه بدن"><p>{guestPreview ? localMeasurement ? localMeasurement.weight.toLocaleString('fa-IR') + ' کیلوگرم' : 'اندازه‌ای در این مرورگر ثبت نشده است.' : recentMeasurement?.weight_kg == null ? 'اندازه‌ای ثبت نشده است.' : recentMeasurement.weight_kg + ' کیلوگرم'}</p><Link to="/progress">دیدن سابقه</Link></Card>
      <Card title="پروفایل فعال"><p>{activeProfile?.displayName}</p><Link to="/profile">دیدن پروفایل</Link></Card>
    </div>
  </section>;
}
