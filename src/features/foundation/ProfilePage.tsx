import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useShellProfile } from '../../app/shellContext';
import { ProfileAvatar } from '../../shared/design/ProfileAvatar';
import { measurementKey, readMeasurements } from '../programs/localProgramArchive';
import { faNumber } from '../training/trainingModel';
export function ProfilePage() {
  const { activeProfile: profile, userId } = useShellProfile();
  const measurements = useQuery({ queryKey: measurementKey(profile?.id ?? ''), queryFn: () => readMeasurements(profile!.id), enabled: Boolean(profile) });
  if (!profile) return null;
  const latest = measurements.data?.at(-1);
  return <section className="pace-personal-profile">
    <ProfileAvatar profile={profile} hero />
    <div><p className="eyebrow">GYMREZ · YOUR PACE</p><h1>{profile.displayName}</h1>
      <p>{userId ? 'پروفایل خصوصی؛ برنامه‌ها و اندازه‌ها در فضای مشترک شما نگهداری می‌شوند.' : 'حالت محلی؛ برای دیدن اطلاعات مشترک، لینک اختصاصی را باز کن.'}</p>
      {latest && <p>آخرین وزن ثبت‌شده: <strong>{faNumber.format(latest.weight)} کیلوگرم</strong></p>}
      <div className="pace-profile-links"><Link to="/programs">برنامه‌های من</Link><Link to="/progress">اندازه‌ها و نمودار بدن</Link><Link to="/workout">تمرین و سابقه</Link></div>
    </div>
  </section>;
}
