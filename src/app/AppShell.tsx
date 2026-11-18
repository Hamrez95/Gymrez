import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../shared/design/components';
import { useAuth } from '../features/auth/useAuth';
import { listAccessibleProfiles } from '../data/supabase/profileRepository';
import { runtimeConfig, supabaseClient } from '../data/supabase/client';
import type { Profile } from '../shared/contracts/profile';
import type { ShellContext } from './shellContext';

const EMPTY_PROFILES: readonly Profile[] = [];
const GUEST_PROFILES: readonly Profile[] = [
  { id: '00000000-0000-4000-8000-000000000001', householdId: '00000000-0000-4000-8000-000000000000', displayName: 'hamrez95', initial: 'H' },
  { id: '00000000-0000-4000-8000-000000000002', householdId: '00000000-0000-4000-8000-000000000000', displayName: 'Ryxy', initial: 'R' },
];

export function AppShell() {
  const { status, userId, email, signOut } = useAuth();
  const guestMode = runtimeConfig.guestMode;
  const [selection, setSelection] = useState<{ userId: string; profileId: string } | null>(null);
  const [signOutError, setSignOutError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const userProfiles = useQuery({
    queryKey: ['gymrez', userId, 'profiles'],
    queryFn: () => listAccessibleProfiles(supabaseClient!, userId!),
    enabled: !guestMode && status === 'signedIn' && runtimeConfig.mode === 'supabase' && Boolean(userId),
  });
  const profiles = guestMode ? GUEST_PROFILES : userProfiles.data ?? EMPTY_PROFILES;
  const profileIdentity = guestMode ? 'guest' : userId;
  const routeProfileId = location.pathname.match(/^\/dashboard\/([^/]+)$/)?.[1] ?? null;
  const selectedProfileId = selection?.userId === profileIdentity ? selection.profileId : null;
  const activeProfile = profiles.find(profile => profile.id === routeProfileId)
    ?? profiles.find(profile => profile.id === selectedProfileId)
    ?? profiles[0]
    ?? null;

  const isEntry = location.pathname === '/' || location.pathname === '/login';
  const showSidebar = location.pathname === '/progress' || location.pathname === '/profile';
  const isDashboard = location.pathname.startsWith('/dashboard/');
  useEffect(() => {
    if (isDashboard && activeProfile && routeProfileId !== activeProfile.id) {
      navigate('/dashboard/' + activeProfile.id, { replace: true });
    }
  }, [activeProfile, isDashboard, navigate, routeProfileId]);

  const destinations = [
    { to: activeProfile ? '/dashboard/' + activeProfile.id : '/', label: 'خانه', short: 'خانه' },
    { to: '/programs', label: 'برنامه‌ها', short: 'برنامه' },
    { to: '/workout', label: 'تمرین', short: 'تمرین' },
    { to: '/progress', label: 'پیشرفت', short: 'پیشرفت' },
    { to: '/profile', label: 'پروفایل', short: 'پروفایل' },
  ];
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const changeProfile = (profile: Profile) => {
    if (profileIdentity) setSelection({ userId: profileIdentity, profileId: profile.id });
    setSignOutError('');
    if (isDashboard) navigate('/dashboard/' + profile.id, { replace: true });
  };

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  const handleSignOut = async () => {
    setSignOutError('');
    try { await signOut(); navigate('/login', { replace: true }); }
    catch { setSignOutError('خروج کامل نشد. اتصال را بررسی کن و دوباره تلاش کن.'); }
  };

  const context: ShellContext = {
    profiles,
    profilesPending: !guestMode && status === 'signedIn' && userProfiles.isPending,
    profilesError: !guestMode && userProfiles.isError,
    activeProfile,
    setActiveProfile: changeProfile,
    userId: guestMode ? null : userId,
  };

  return <div className="pace-app-shell" dir="rtl">
    <a className="skip" href="#main-content">رفتن به محتوا</a>
    <header className="pace-app-header">
      <NavLink className="pace-app-brand" to="/" aria-label="Gymrez — خانه" dir="ltr">// GYMREZ</NavLink>
      <div className="pace-app-header__actions">
        {!isEntry && activeProfile && <div className="pace-profile-switch" role="group" aria-label="انتخاب پروفایل">
          {profiles.map(profile => <Button key={profile.id} type="button" variant={profile.id === activeProfile.id ? 'primary' : 'secondary'} aria-label={'انتخاب پروفایل ' + profile.displayName} aria-pressed={profile.id === activeProfile.id} onClick={() => changeProfile(profile)}><bdi>{profile.initial}</bdi><span>{profile.displayName}</span></Button>)}
        </div>}
        {!guestMode && status === 'signedIn' && <Button type="button" variant="quiet" onClick={handleSignOut} aria-label={'خروج از حساب ' + (email ?? '')}>خروج</Button>}
        <Button type="button" variant="secondary" className="pace-theme-toggle" aria-label={theme === 'dark' ? 'روشن کردن تم' : 'تاریک کردن تم'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <span aria-hidden="true">{theme === 'dark' ? '☼' : '◐'}</span>
        </Button>
      </div>
    </header>
    {signOutError && <p role="alert">{signOutError}</p>}
    {guestMode && !isEntry && <div className="pace-guest-banner" role="status">پیش‌نمایش بدون ورود · اطلاعات Supabase در این حالت خوانده یا ذخیره نمی‌شوند.</div>}

    {!isEntry && activeProfile && <nav className={'pace-desktop-nav' + (showSidebar ? ' pace-desktop-nav--sidebar' : '')} aria-label="ناوبری اصلی">
      {destinations.map(item => <NavLink key={item.label} end={item.label === 'خانه'} to={item.to}>{item.label}</NavLink>)}
    </nav>}

    <main id="main-content" className={'pace-page-content' + (showSidebar ? ' pace-page-content--sidebar' : '')}>
      <Outlet context={context} />
    </main>

    {!isEntry && activeProfile && <nav className="pace-mobile-nav" aria-label="ناوبری اصلی">
      {destinations.map(item => <NavLink key={item.label} aria-label={item.label} end={item.label === 'خانه'} to={item.to}><span className="pace-mobile-nav__label">{item.short}</span></NavLink>)}
    </nav>}
  </div>;
}
