import { useQuery } from '@tanstack/react-query';
import { demoProfileRepository } from '../../data/demo/profileRepository';
import { resolveDataMode } from '../../app/config';

export function FoundationPage({ section = 'در حال ساخت' }: { section?: string }) {
  const configuration = resolveDataMode(import.meta.env.VITE_DATA_MODE);
  const { data, isPending, isError } = useQuery({ queryKey: ['foundation', 'synthetic-profiles'], queryFn: () => demoProfileRepository.listProfiles(), enabled: configuration.mode === 'demo' });
  return <section className="foundation-content" aria-labelledby="title">
    <p className="eyebrow">نمونه توسعه · T04</p>
    <h1 id="title">{section}<span aria-hidden="true"> //</span></h1>
    <p role="status">این صفحه هنوز در برنامهٔ توسعه است؛ محتوای نهایی و رفتار ثبت‌شده‌ای ندارد.</p>
    {configuration.mode === 'unavailable' ? <p role="alert">{configuration.reason}</p> : <>
      <p>زیرساخت نمونه است و به حساب یا دادهٔ Supabase وصل نیست.</p>
      {isPending ? <p>در حال بارگذاری نمونه...</p> : isError ? <p role="alert">خواندن نمونه ناموفق بود.</p> : <ul aria-label="پروفایل‌های نمونه">{data?.map(profile => <li key={profile.id}>{profile.displayName}</li>)}</ul>}
    </>}
  </section>;
}
