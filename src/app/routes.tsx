import { Navigate, Outlet, Route, Routes, useOutletContext } from 'react-router-dom';
import { AppShell } from './AppShell';
import { DashboardPreview } from '../features/foundation/DashboardPreview';
import { DesignSystemPreview } from '../features/foundation/DesignSystemPreview';
import { FoundationPage } from '../features/foundation/FoundationPage';
import { LoginPage } from '../features/foundation/LoginPage';
import { ProfileChooser } from '../features/foundation/ProfileChooser';
import { RequireAuth, RequireProfile } from '../features/auth/RequireAuth';
import { BodyProgress } from '../features/training/BodyProgress';
import { TrainingPage } from '../features/training/TrainingPage';
import { LocalProgramsPage } from '../features/programs/LocalProgramsPage';
import { runtimeConfig } from '../data/supabase/client';
import type { ShellContext } from './shellContext';

function ShellContextOutlet() {
  const shellContext = useOutletContext<ShellContext>();
  return <Outlet context={shellContext} />;
}

function ProgramsRoute() {
  const { activeProfile } = useOutletContext<ShellContext>();
  if (runtimeConfig.guestMode && activeProfile) {
    return <LocalProgramsPage key={activeProfile.id} profileId={activeProfile.id} profileName={activeProfile.displayName} />;
  }
  return <FoundationPage section="برنامه‌ها" />;
}

function TrainingRoute({ kind }: { kind: 'workout' | 'body' }) {
  const { activeProfile } = useOutletContext<ShellContext>();
  if (runtimeConfig.guestMode && activeProfile) {
    return kind === 'workout'
      ? <TrainingPage key={activeProfile.id} profileId={activeProfile.id} />
      : <BodyProgress key={activeProfile.id} profileId={activeProfile.id} />;
  }
  return <FoundationPage section={kind === 'workout' ? 'تمرین' : 'پیشرفت و سابقه'} />;
}

function NotFoundPage() {
  return <section className="foundation-content"><h1>صفحه پیدا نشد<span aria-hidden="true"> //</span></h1></section>;
}

export function AppRoutes() {
  return <Routes><Route element={<AppShell />}>
    <Route path="login" element={runtimeConfig.guestMode ? <Navigate to="/" replace /> : <LoginPage />} />
    <Route element={runtimeConfig.guestMode ? <ShellContextOutlet /> : <RequireAuth />}>
      <Route index element={<ProfileChooser />} />
      <Route element={<RequireProfile />}>
        <Route path="dashboard/:profileId" element={<DashboardPreview />} />
        <Route path="programs" element={<ProgramsRoute />} />
        <Route path="workout" element={<TrainingRoute kind="workout" />} />
        <Route path="progress" element={<TrainingRoute kind="body" />} />
        <Route path="profile" element={<FoundationPage section="پروفایل" />} />
      </Route>
    </Route>
    {import.meta.env.DEV && <Route path="__design-system" element={<DesignSystemPreview />} />}
    <Route path="*" element={<NotFoundPage />} />
  </Route></Routes>;
}
