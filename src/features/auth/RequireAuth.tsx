import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { ShellContext } from '../../app/shellContext';

export function RequireAuth() {
  const shellContext = useOutletContext<ShellContext>();
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <p role="status">در حال بررسی نشست کاربری…</p>;
  if (status !== 'signedIn') return <Navigate to="/login" replace state={{ next: location.pathname + location.search }} />;
  return <Outlet context={shellContext} />;
}

export function RequireProfile() {
  const shellContext = useOutletContext<ShellContext>();
  const { profiles, profilesPending, profilesError, activeProfile } = shellContext;
  if (profilesPending) return <p role="status">در حال بارگذاری پروفایل‌های workspace…</p>;
  if (profilesError) return <p role="alert">پروفایل‌های مجاز دریافت نشدند. اتصال را بررسی و صفحه را دوباره بارگیری کن.</p>;
  if (profiles.length === 0) return <Navigate to="/" replace />;
  if (!activeProfile) return <p role="status">در حال انتخاب پروفایل مجاز…</p>;
  return <Outlet context={shellContext} />;
}
