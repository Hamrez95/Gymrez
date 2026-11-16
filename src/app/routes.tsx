import { Route, Routes } from 'react-router-dom';
import { FoundationPage } from '../features/foundation/FoundationPage';
export function AppRoutes() {
  return <Routes><Route path="/" element={<FoundationPage />} /><Route path="/programs" element={<FoundationPage section="برنامه‌ها" />} /><Route path="/workout" element={<FoundationPage section="اجرای تمرین" />} /><Route path="/progress" element={<FoundationPage section="پیشرفت و سابقه" />} /><Route path="/profile" element={<FoundationPage section="پروفایل" />} /><Route path="*" element={<FoundationPage section="صفحه پیدا نشد" />} /></Routes>;
}
