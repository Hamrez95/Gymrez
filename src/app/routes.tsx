import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './AppShell';
import { DashboardPreview } from '../features/foundation/DashboardPreview';
import { DesignSystemPreview } from '../features/foundation/DesignSystemPreview';
import { FoundationPage } from '../features/foundation/FoundationPage';
import { ProgramsPage } from '../features/programs/ProgramsPage';
import { ProfileChooser } from '../features/foundation/ProfileChooser';
import { RequireProfile } from '../features/auth/RequireAuth';

function NotFoundPage() {
  return <section className="foundation-content"><h1>صفحه پیدا نشد<span aria-hidden="true"> //</span></h1></section>;
}

export function AppRoutes() {
  return <Routes><Route element={<AppShell />}>
    <Route path="login" element={<Navigate to="/" replace />} />
    <Route index element={<ProfileChooser />} />
    <Route element={<RequireProfile />}>
      <Route path="dashboard/:profileId" element={<DashboardPreview />} />
      <Route path="programs" element={<ProgramsPage />} />
      <Route path="workout" element={<FoundationPage section="تمرین" />} />
      <Route path="progress" element={<FoundationPage section="پیشرفت و سابقه" />} />
      <Route path="profile" element={<FoundationPage section="پروفایل" />} />
    </Route>
    {import.meta.env.DEV && <Route path="__design-system" element={<DesignSystemPreview />} />}
    <Route path="*" element={<NotFoundPage />} />
  </Route></Routes>;
}
