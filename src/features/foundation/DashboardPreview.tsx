import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Card, SegmentProgress } from '../../shared/design/components';
import { useShellProfile } from '../../app/shellContext';

export function DashboardPreview() {
  const { profileId = 'demo-a' } = useParams();
  const { profileId: activeProfileId, setProfileId } = useShellProfile();
  useEffect(() => { if (profileId !== activeProfileId) setProfileId(profileId); }, [activeProfileId, profileId, setProfileId]);
  const title = profileId === 'demo-b' ? 'سلام، ورزشکار ب' : 'سلام، ورزشکار الف';

  return <section className="pace-dashboard" aria-labelledby="dashboard-title">
    <div className="pace-dashboard__intro"><p className="eyebrow">پیش‌نمایش نمایشی</p><h1 id="dashboard-title">{title}<span aria-hidden="true"> //</span></h1><p>نمونهٔ برنامه و سابقه — داده‌ای ثبت یا ذخیره نمی‌شود.</p></div>
    <Card className="pace-dashboard__progress" title="پیشرفت ماهانه"><p>۸ از ۱۲ جلسهٔ برنامه‌ریزی‌شده</p><SegmentProgress value={8} max={12} label="پیشرفت نمونهٔ ماهانه" /></Card>
    <Card className="pace-dashboard__workout" title="تمرین امروز"><div className="pace-media-placeholder" role="img" aria-label="جای تصویر حرکت؛ دارایی نهایی در مرحلهٔ گرافیک اضافه می‌شود." /><h2>پایین‌تنه</h2><p>۳ حرکت · حدود ۷۵ دقیقه</p><Button type="button" disabled>شروع تمرین</Button><p className="pace-demo-note">ثبت تمرین در مرحله‌های بعد فعال می‌شود.</p></Card>
    <div className="pace-dashboard__links"><Card title="برنامهٔ این هفته"><p>برنامهٔ نمونه · ۳ جلسه</p><Link to="/programs">دیدن برنامه‌ها</Link></Card><Card title="ادامهٔ مسیر"><p>صفحه‌های تمرین، سابقه و پروفایل مرحله‌به‌مرحله تکمیل می‌شوند.</p><Link to="/progress">دیدن پیشرفت</Link></Card></div>
  </section>;
}
