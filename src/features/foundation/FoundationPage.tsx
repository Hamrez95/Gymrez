import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import { demoProfileRepository } from '../../data/demo/profileRepository';
import { resolveDataMode } from '../../app/config';
const links = [['/', 'خانه'], ['/programs', 'برنامه‌ها'], ['/workout', 'تمرین'], ['/progress', 'پیشرفت'], ['/profile', 'پروفایل']] as const;
export function FoundationPage({ section = 'پایه توسعه' }: { section?: string }) {
  const configuration = resolveDataMode(import.meta.env.VITE_DATA_MODE);
  const { data, isPending, isError } = useQuery({ queryKey: ['foundation', 'synthetic-profiles'], queryFn: () => demoProfileRepository.listProfiles(), enabled: configuration.mode === 'demo' });
  return <main className="foundation"><a className="skip" href="#content">رفتن به محتوا</a><header><span className="brand" dir="ltr">// GYMREZ</span><span>PACE / FOUNDATION</span></header><nav aria-label="ناوبری اصلی">{links.map(([to, label]) => <NavLink key={to} end to={to}>{label}</NavLink>)}</nav><section id="content" aria-labelledby="title"><p className="eyebrow">نسخه توسعه · T02</p><h1 id="title">{section}<span aria-hidden="true"> //</span></h1><p role="status">این صفحه فقط اسکلت فنی است؛ طراحی نهایی موکاپ هنوز پیاده نشده است.</p>{configuration.mode === 'unavailable' ? <p role="alert">{configuration.reason}</p> : <><p>حالت نمایشی؛ اتصال به Supabase و ذخیره اطلاعات فعال نیست.</p>{isPending ? <p>در حال دریافت داده نمونه…</p> : isError ? <p role="alert">دریافت نمونه ناموفق بود.</p> : <ul aria-label="پروفایل‌های مصنوعی">{data?.map(profile => <li key={profile.id}>{profile.displayName}</li>)}</ul>}</>}<p>مرحله بعد: استخراج دارایی‌ها و ساخت کامپوننت‌های دقیق PACE.</p></section></main>;
}
