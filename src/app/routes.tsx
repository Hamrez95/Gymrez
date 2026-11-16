import { Route, Routes } from 'react-router-dom';
import { AppShell } from './AppShell';
import { DashboardPreview } from '../features/foundation/DashboardPreview';
import { DesignSystemPreview } from '../features/foundation/DesignSystemPreview';
import { FoundationPage } from '../features/foundation/FoundationPage';
import { LoginPage } from '../features/foundation/LoginPage';
import { ProfileChooser } from '../features/foundation/ProfileChooser';

export function AppRoutes() {
  return <Routes><Route element={<AppShell />}>
    <Route index element={<ProfileChooser />} />
    <Route path="login" element={<LoginPage />} />
    <Route path="dashboard/:profileId" element={<DashboardPreview />} />
    <Route path="programs" element={<FoundationPage section="برنامه‌ها" />} />
    <Route path="workout" element={<FoundationPage section="تمرین" />} />
    <Route path="progress" element={<FoundationPage section="پیشرفت و سابقه" />} />
    <Route path="profile" element={<FoundationPage section="پروفایل" />} />
    {import.meta.env.DEV && <Route path="__design-system" element={<DesignSystemPreview />} />}
    <Route path="*" element={<FoundationPage section="صفحه پیدا نشد" />} />
  </Route></Routes>;
}
