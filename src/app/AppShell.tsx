import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../shared/design/components';
import { useAuth } from '../features/auth/AuthProvider';
import { listAccessibleProfiles } from '../data/supabase/profileRepository';
import { runtimeConfig, supabaseClient } from '../data/supabase/client';
import type { Profile } from '../shared/contracts/profile';
import type { ShellContext } from './shellContext';

const selectionKey = (userId: string) => 'gymrez:active-profile:' + userId;

function readSelection(userId: string): string | null {
  try { return window.sessionStorage.getItem(selectionKey(userId)); } catch { return null; }
}
function writeSelection(userId: string, profileId: string): void {
  try { window.sessionStorage.setItem(selectionKey(userId), profileId); } catch { /* Private browsing may block session storage. */ }
}
function removeSelection(userId: string): void {
  try { window.sessionStorage.removeItem(selectionKey(userId)); } catch { /* Private browsing may block session storage. */ }
}

export function AppShell() {
  const { status, userId, email, signOut } = useAuth();
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [signOutError, setSignOutError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const userProfiles = useQuery({
    queryKey: ['gymrez', userId, 'profiles'],
    queryFn: () => listAccessibleProfiles(supabaseClient!, userId!),
    enabled: status === 'signedIn' && runtimeConfig.mode === 'supabase' && Boolean(userId),
  });
  const profiles = userProfiles.data ?? [];
  const routeProfileId = useMemo(() => {
    const match = location.pathname.match(/^\/dashboard\/([^/]+)$/);
    return match?.[1] ?? null;
  }, [location.pathname]);

  useEffect(() => {
    setActiveProfileId(null);
  }, [userId]);

  useEffect(() => {
    if (!userId || userProfiles.isPending || userProfiles.isError) return;
    const requested = routeProfileId ? profiles.find(profile => profile.id === routeProfileId) : undefined;
    const storedId = readSelection(userId);
    const stored = storedId ? profiles.find(profile => profile.id === storedId) : undefined;
    const selected = requested ?? stored ?? profiles[0] ?? null;
    setActiveProfileId(selected?.id ?? null);
    if (selected) writeSelection(userId, selected.id);
  }, [profiles, routeProfileId, userId, userProfiles.isError, userProfiles.isPending]);

  useEffect(() => {
    if (!userId) return;
    return () => removeSelection(userId);
  }, [userId]);

  const activeProfile = profiles.find(profile => profile.id === activeProfileId) ?? null;
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
    setActiveProfileId(profile.id);
    setSignOutError('');
    if (userId) writeSelection(userId, profile.id);
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
    profilesPending: status === 'signedIn' && userProfiles.isPending,
    profilesError: userProfiles.isError,
    activeProfile,
    setActiveProfile: changeProfile,
    userId,
  };

  return <div className="pace-app-shell" dir="rtl">
    <a className="skip" href="#main-content">رفتن به محتوا</a>
    <header className="pace-app-header">
      <NavLink className="pace-app-brand" to="/" aria-label="Gymrez — خانه" dir="ltr">// GYMREZ</NavLink>
      <div className="pace-app-header__actions">
        {!isEntry && activeProfile && <div className="pace-profile-switch" role="group" aria-label="انتخاب پروفایل">
          {profiles.map(profile => <Button key={profile.id} type="button" variant={profile.id === activeProfile.id ? 'primary' : 'secondary'} aria-label={'انتخاب پروفایل ' + profile.displayName} aria-pressed={profile.id === activeProfile.id} onClick={() => changeProfile(profile)}><bdi>{profile.initial}</bdi><span>{profile.displayName}</span></Button>)}
        </div>}
        {status === 'signedIn' && <Button type="button" variant="quiet" onClick={handleSignOut} aria-label={'خروج از حساب ' + (email ?? '')}>خروج</Button>}
        <Button type="button" variant="secondary" className="pace-theme-toggle" aria-label={theme === 'dark' ? 'روشن کردن تم' : 'تاریک کردن تم'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <span aria-hidden="true">{theme === 'dark' ? '☼' : '◐'}</span>
        </Button>
      </div>
    </header>
    {signOutError && <p role="alert">{signOutError}</p>}

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
