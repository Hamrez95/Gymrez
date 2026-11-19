import { motion, useReducedMotion } from 'motion/react';
import { Icon, type IconName } from '../shared/design/Icon';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../shared/design/components';
import { useAuth } from '../features/auth/useAuth';
import { listAccessibleProfiles } from '../data/supabase/profileRepository';
import { runtimeConfig, supabaseClient } from '../data/supabase/client';
import type { Profile } from '../shared/contracts/profile';
import type { ShellContext } from './shellContext';

import { InstallApp } from './InstallApp';
import { ProfileAvatar } from '../shared/design/ProfileAvatar';

const EMPTY_PROFILES: readonly Profile[] = [];
const GUEST_PROFILES: readonly Profile[] = [
  { id: '00000000-0000-4000-8000-000000000001', householdId: '00000000-0000-4000-8000-000000000000', displayName: 'hamrez95', initial: 'H' },
  { id: '00000000-0000-4000-8000-000000000002', householdId: '00000000-0000-4000-8000-000000000000', displayName: 'Ryxy', initial: 'R' },
];

export function AppShell() {
  const reduced = useReducedMotion();
  const { status, userId, email, signOut, connectionError } = useAuth();
  const guestMode = runtimeConfig.guestMode && status !== 'signedIn';
  const [selection, setSelection] = useState<{ userId: string; profileId: string } | null>(() => {
    try { return JSON.parse(window.localStorage.getItem('gymrez-selected-profile') ?? 'null'); }
    catch { return null; }
  });
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

  const destinations: { to: string; label: string; short: string; icon: IconName }[] = [
    { to: activeProfile ? '/dashboard/' + activeProfile.id : '/', label: 'خانه', short: 'خانه', icon: 'home' },
    { to: '/programs', label: 'برنامه‌ها', short: 'برنامه', icon: 'calendar' },
    { to: '/workout', label: 'تمرین', short: 'تمرین', icon: 'dumbbell' },
    { to: '/progress', label: 'پیشرفت', short: 'پیشرفت', icon: 'chart' },
    { to: '/profile', label: 'پروفایل', short: 'پروفایل', icon: 'user' },
  ];
  const [theme, setTheme] = useState<'dark' | 'light'>(() => window.localStorage.getItem('gymrez-theme') === 'light' ? 'light' : 'dark');
  const changeProfile = (profile: Profile) => {
    if (profileIdentity) { const next = { userId: profileIdentity, profileId: profile.id }; setSelection(next); window.localStorage.setItem('gymrez-selected-profile', JSON.stringify(next)); }
    setSignOutError('');
    if (isDashboard) navigate('/dashboard/' + profile.id, { replace: true });
  };

  useEffect(() => { document.documentElement.dataset.theme = theme; window.localStorage.setItem('gymrez-theme', theme); }, [theme]);

  const handleSignOut = async () => {
    setSignOutError('');
    try { await signOut(); navigate('/login', { replace: true }); }
    catch { setSignOutError('خروج کامل نشد. اتصال را بررسی کن و دوباره تلاش کن.'); }
  };

  const context: ShellContext = {
    profiles,
    profilesPending: status === 'loading' || (!guestMode && status === 'signedIn' && userProfiles.isPending),
    profilesError: !guestMode && userProfiles.isError,
    activeProfile,
    setActiveProfile: changeProfile,
    userId: guestMode ? null : userId,
  };

  return <div className="pace-app-shell" dir="rtl">
    <a className="skip" href="#main-content">رفتن به محتوا</a>
    <header className="pace-app-header">
      <NavLink className="pace-app-brand" to="/" aria-label="Gymrez — خانه" dir="ltr">GYMREZ</NavLink>
      <div className="pace-app-header__actions">
        {!isEntry && activeProfile && <div className="pace-profile-switch" role="group" aria-label="انتخاب پروفایل">
          {profiles.map(profile => <Button key={profile.id} type="button" variant={profile.id === activeProfile.id ? 'primary' : 'secondary'} aria-label={'انتخاب پروفایل ' + profile.displayName} aria-pressed={profile.id === activeProfile.id} onClick={() => changeProfile(profile)}><ProfileAvatar profile={profile} /><span>{profile.displayName}</span></Button>)}
        </div>}
        {!guestMode && status === 'signedIn' && <Button type="button" variant="quiet" onClick={handleSignOut} aria-label={'خروج از حساب ' + (email ?? '')}>خروج</Button>}
        <Button type="button" variant="secondary" className="pace-theme-toggle" aria-label={theme === 'dark' ? 'روشن کردن تم' : 'تاریک کردن تم'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <span aria-hidden="true">{theme === 'dark' ? '☼' : '◐'}</span>
        </Button>
      </div>
    </header>
    {connectionError && <p role="alert">{connectionError}</p>}
    <InstallApp />
    {signOutError && <p role="alert">{signOutError}</p>}
    {guestMode && !isEntry && <div className="pace-guest-banner" role="status">پیش‌نمایش بدون ورود · داده‌های این حالت فقط روی همین دستگاه هستند. برای داده‌های مشترک، لینک اختصاصی را باز کن.</div>}

    {!guestMode && !isEntry && <div className="pace-cloud-status" role="status">متصل به فضای خصوصی · ذخیره‌سازی مشترک</div>}

    {!isEntry && activeProfile && <nav className={'pace-desktop-nav' + (showSidebar ? ' pace-desktop-nav--sidebar' : '')} aria-label="ناوبری اصلی">
      {destinations.map(item => <NavLink key={item.label} end={item.label === 'خانه'} to={item.to}>{({ isActive }) => <><Icon name={item.icon} /><span>{item.label}</span>{isActive && <motion.span className="pace-nav-indicator" layoutId="desktop-nav" transition={{ duration: reduced ? 0 : .18 }} />}</>}</NavLink>)}
    </nav>}

    <main id="main-content" className={'pace-page-content' + (showSidebar ? ' pace-page-content--sidebar' : '')}>
      <motion.div className="pace-route-view" key={location.pathname + (activeProfile?.id ?? '')} initial={reduced ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .2 }}><Outlet context={context} /></motion.div>
    </main>

    {!isEntry && activeProfile && <nav className="pace-mobile-nav" aria-label="ناوبری اصلی">
      {destinations.map(item => <NavLink key={item.label} aria-label={item.label} end={item.label === 'خانه'} to={item.to}>{({ isActive }) => <><Icon name={item.icon} /><span className="pace-mobile-nav__label">{item.short}</span>{isActive && <motion.span className="pace-nav-indicator" layoutId="mobile-nav" transition={{ duration: reduced ? 0 : .18 }} />}</>}</NavLink>)}
    </nav>}
  </div>;
}
