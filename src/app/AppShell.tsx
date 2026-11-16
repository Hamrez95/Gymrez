import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../shared/design/components';
import type { ShellContext } from './shellContext';

const destinations = [
  { to: '/dashboard/demo-a', label: 'خانه', short: 'خانه' },
  { to: '/programs', label: 'برنامه‌ها', short: 'برنامه' },
  { to: '/workout', label: 'تمرین', short: 'تمرین' },
  { to: '/progress', label: 'پیشرفت', short: 'پیشرفت' },
  { to: '/profile', label: 'پروفایل', short: 'پروفایل' },
] as const;

export function AppShell() {
  const [profileId, setProfileId] = useState('demo-a');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const location = useLocation();
  const navigate = useNavigate();
  const isEntry = location.pathname === '/' || location.pathname === '/login';
  const showSidebar = location.pathname === '/progress' || location.pathname === '/profile';
  const isDashboard = location.pathname.startsWith('/dashboard/');
  const changeProfile = (id: string) => {
    setProfileId(id);
    if (isDashboard) navigate(`/dashboard/${id}`, { replace: true });
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return <div className="pace-app-shell" dir="rtl">
    <a className="skip" href="#main-content">رفتن به محتوا</a>
    <header className="pace-app-header">
      <NavLink className="pace-app-brand" to="/" aria-label="Gymrez — خانه" dir="ltr">// GYMREZ</NavLink>
      <div className="pace-app-header__actions">
        {!isEntry && <div className="pace-profile-switch" role="group" aria-label="انتخاب پروفایل نمایشی">
          <Button type="button" variant={profileId === 'demo-a' ? 'primary' : 'secondary'} aria-pressed={profileId === 'demo-a'} onClick={() => changeProfile('demo-a')}><bdi>A</bdi><span>ورزشکار الف</span></Button>
          <Button type="button" variant={profileId === 'demo-b' ? 'primary' : 'secondary'} aria-pressed={profileId === 'demo-b'} onClick={() => changeProfile('demo-b')}><bdi>B</bdi><span>ورزشکار ب</span></Button>
        </div>}
        <Button type="button" variant="secondary" className="pace-theme-toggle" aria-label={theme === 'dark' ? 'روشن کردن تم' : 'تاریک کردن تم'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <span aria-hidden="true">{theme === 'dark' ? '☼' : '◐'}</span>
        </Button>
      </div>
    </header>

    {!isEntry && <nav className={`pace-desktop-nav${showSidebar ? ' pace-desktop-nav--sidebar' : ''}`} aria-label="ناوبری اصلی">
      {destinations.map(item => <NavLink key={item.label} end={item.label === 'خانه'} to={item.label === 'خانه' ? `/dashboard/${profileId}` : item.to}>{item.label}</NavLink>)}
    </nav>}

    <main id="main-content" className={`pace-page-content${showSidebar ? ' pace-page-content--sidebar' : ''}`}>
      <Outlet context={{ profileId, setProfileId } satisfies ShellContext} />
    </main>

    {!isEntry && <nav className="pace-mobile-nav" aria-label="ناوبری اصلی">
      {destinations.map(item => <NavLink key={item.label} end={item.label === 'خانه'} to={item.label === 'خانه' ? `/dashboard/${profileId}` : item.to}><span className="pace-mobile-nav__label">{item.short}</span></NavLink>)}
    </nav>}
  </div>;
}
