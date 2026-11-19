import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../shared/design/components';
import { useShellProfile } from '../../app/shellContext';
import { ProfileAvatar } from '../../shared/design/ProfileAvatar';
import { useAuth } from '../auth/useAuth';
import { runtimeConfig } from '../../data/supabase/client';

export function ProfileChooser() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { profiles, profilesPending, profilesError, setActiveProfile } = useShellProfile();

  return <section className="pace-entry" aria-labelledby="entry-title">
    <div className="pace-entry__intro"><h1 id="entry-title">امروز کی تمرین می‌کنه؟</h1><p>برای ادامه، پروفایل خودت را انتخاب کن.</p>{runtimeConfig.guestMode && !userId && <p className="pace-guest-note">پیش‌نمایش بدون ورود · بایگانی برنامه‌ها در همین مرورگر ذخیره می‌شود.</p>}</div>
    <div className="pace-entry__profiles" aria-label="پروفایل‌های workspace">
      {profilesPending && <p role="status">در حال دریافت پروفایل‌های مجاز…</p>}
      {profilesError && <p role="alert">پروفایل‌های مجاز بارگذاری نشدند. دوباره تلاش کن.</p>}
      {!profilesPending && !profilesError && profiles.length === 0 && <Card>
        <p>برای این حساب workspace فعالی پیدا نشد.</p>
        <p className="pace-demo-note">عضویت فقط از مسیر دعوت و راه‌اندازی امن انجام می‌شود؛ از این صفحه نمی‌توان حساب یا workspace ساخت.</p>
      </Card>}
      {profiles.map(profile => <Card key={profile.id} className="pace-profile-card">
        <ProfileAvatar profile={profile} hero />
        <span className="pace-profile-card__name">{profile.displayName}</span>
        <Button type="button" aria-label={'ورود به پروفایل ' + profile.displayName} onClick={() => { setActiveProfile(profile); navigate('/dashboard/' + profile.id); }}>←</Button>
      </Card>)}
    </div>
  </section>;
}
