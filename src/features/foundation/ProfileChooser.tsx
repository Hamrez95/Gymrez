import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { demoProfileRepository } from '../../data/demo/profileRepository';
import { Button, Card, Skeleton } from '../../shared/design/components';
import { useShellProfile } from '../../app/shellContext';

export function ProfileChooser() {
  const navigate = useNavigate();
  const { setProfileId } = useShellProfile();
  const { data, isPending, isError } = useQuery({ queryKey: ['demo', 'profile-chooser'], queryFn: () => demoProfileRepository.listProfiles() });

  return <section className="pace-entry" aria-labelledby="entry-title">
    <div className="pace-entry__intro"><p className="eyebrow">GYMREZ / PACE</p><h1 id="entry-title">امروز کی تمرین می‌کنه؟</h1><p>برای دیدن پیش‌نمایش، یک پروفایل نمونه را انتخاب کن.</p></div>
    <div className="pace-entry__profiles" aria-label="پروفایل‌های نمونه">
      {isPending && <Skeleton label="در حال بارگذاری پروفایل‌های نمونه" />}
      {isError && <p role="alert">پروفایل‌های نمونه بارگذاری نشدند. دوباره صفحه را بارگیری کن.</p>}
      {data?.map(profile => <Card key={profile.id} className="pace-profile-card">
        <span className="pace-profile-card__initial" aria-hidden="true">{profile.initial}</span>
        <span className="pace-profile-card__name">{profile.displayName}</span>
        <Button type="button" aria-label={`ورود به پیش‌نمایش ${profile.displayName}`} onClick={() => { setProfileId(profile.id); navigate(`/dashboard/${profile.id}`); }}>←</Button>
      </Card>)}
    </div>
    <p className="pace-demo-note" role="note">این‌ها پروفایل‌های مصنوعی‌اند. ورود و اطلاعات واقعی بعد از راه‌اندازی Supabase فعال می‌شود.</p>
    <Link className="pace-entry__login" to="/login">ورود به حساب کاربری</Link>
  </section>;
}
