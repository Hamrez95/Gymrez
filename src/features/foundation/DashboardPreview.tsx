import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useShellProfile } from '../../app/shellContext';
import { archiveKey, measurementKey, readArchive, readMeasurements, readWorkouts, workoutKey } from '../programs/localProgramArchive';
import { Card } from '../../shared/design/components';
import { ProfileAvatar } from '../../shared/design/ProfileAvatar';
import { faDate, faNumber } from '../training/trainingModel';
export function DashboardPreview() {
  const { activeProfile: profile } = useShellProfile();
  const enabled = Boolean(profile);
  const archive = useQuery({ queryKey: archiveKey(profile?.id), queryFn: () => readArchive(profile!.id), enabled });
  const measurements = useQuery({ queryKey: measurementKey(profile?.id ?? ''), queryFn: () => readMeasurements(profile!.id), enabled });
  const workouts = useQuery({ queryKey: workoutKey(profile?.id ?? ''), queryFn: () => readWorkouts(profile!.id), enabled });
  const current = archive.data?.documents.find(p => p.id === archive.data.currentId);
  const latest = measurements.data?.at(-1);
  const recent = workouts.data?.history[0];
  return <section className="pace-dashboard" aria-labelledby="dashboard-title">
    <div className="pace-dashboard__intro"><div><p className="eyebrow">GYMREZ · YOUR PACE</p><h1 id="dashboard-title">سلام، {profile?.displayName}</h1><p>امروز یک قدم قوی‌تر</p></div>{profile && <ProfileAvatar profile={profile} hero />}</div>
    {[archive, measurements, workouts].some(q => q.isError) && <p role="alert">دریافت بخشی از اطلاعات انجام نشد. اتصال را بررسی کن.</p>}
    <Card className="pace-dashboard__progress" title="برنامه فعال"><p>{current?.title ?? (archive.isPending ? 'در حال دریافت برنامه…' : 'هنوز برنامهٔ فعالی انتخاب نشده است.')}</p><Link to="/programs">دیدن برنامه‌ها</Link></Card>
    <Card className="pace-dashboard__workout" title={workouts.data?.active ? 'جلسهٔ در حال اجرا' : 'تمرین امروز'}>
      <p>{workouts.data?.active?.day.title ?? current?.training?.days[0]?.title ?? 'از برنامه‌ها، جلسهٔ خودت را انتخاب کن.'}</p>
      {(current?.training || workouts.data?.active) && <Link className="pace-button pace-button--primary" to="/workout">{workouts.data?.active ? 'ادامهٔ تمرین' : 'شروع تمرین'}</Link>}
    </Card>
    <div className="pace-dashboard__links">
      <Card title="آخرین اندازه بدن"><p>{latest ? faNumber.format(latest.weight) + ' کیلوگرم' : 'هنوز اندازه‌ای ثبت نشده است.'}</p>{latest && <small>{faDate.format(new Date(latest.date))}</small>}<Link to="/progress">دیدن روند و اندازه‌ها</Link></Card>
      <Card title="آخرین جلسه"><p>{recent?.day.title ?? 'هنوز جلسه‌ای ثبت نشده است.'}</p><Link to="/workout">تاریخچه جلسه‌ها</Link></Card>
    </div>
  </section>;
}
