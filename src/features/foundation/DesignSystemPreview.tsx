import { useState } from 'react';
import { Button, Card, SegmentProgress, Sheet, Skeleton, Tabs, TextInput, Toast } from '../../shared/design/components';

const tabs = [{ value: 'week', label: 'هفتگی' }, { value: 'month', label: 'ماهانه' }];

export function DesignSystemPreview() {
  const [activeTab, setActiveTab] = useState('week');
  const [sheetOpen, setSheetOpen] = useState(false);
  return <main className="design-preview" dir="rtl">
    <header className="foundation-header"><span className="brand" dir="ltr">// GYMREZ</span><span>PACE / COMPONENTS</span></header>
    <div><p className="eyebrow">T03 · نمونه اجزای پایه</p><h1>سامانه طراحی PACE</h1><p>صفحه داخلی توسعه برای بررسی رنگ و رفتار کنترل‌ها؛ این صفحه محصول نهایی نیست.</p></div>
    <div className="design-preview__grid">
      <Card title="دکمه‌ها"><div className="design-preview__row"><Button>ثبت ست</Button><Button variant="secondary">تغییر حرکت</Button><Button variant="quiet">بازگشت</Button><Button disabled>غیرفعال</Button><Button loading aria-label="در حال بارگذاری">در حال آماده‌سازی</Button></div></Card>
      <Card title="ورودی و خطا"><div className="design-preview__stack"><TextInput label="وزن" id="sample-weight" inputMode="decimal" placeholder="مثلاً ۲۰ کیلوگرم" /><TextInput label="تعداد تکرار" id="sample-reps" value="۰" readOnly error="تعداد باید بیشتر از صفر باشد." /></div></Card>
      <Card title="بازه و پیشرفت"><div className="design-preview__stack"><Tabs label="دوره نمایش" items={tabs} value={activeTab} onChange={setActiveTab} /><SegmentProgress value={3} max={6} label="سه بخش از شش بخش»" /></div></Card>
      <Card title="وضعیت‌ها"><div className="design-preview__stack"><Toast message="پیش‌نمایش رابط آماده است." /><Toast kind="error" message="این فقط پیام نمونهٔ خطاست." /><Skeleton label="محتوای نمونه در حال بارگذاری" /></div></Card>
    </div>
    <Card title="پنجرهٔ پایه"><p>کادر محاوره‌ای بومی مرورگر با پشتیبانی از Escape و تمرکز خودکار.</p><Button type="button" onClick={() => setSheetOpen(true)}>باز کردن پنجره</Button></Card>
    <Sheet open={sheetOpen} title="جزئیات نمونه" onOpenChange={setSheetOpen}><p>این پیش‌نمایش هیچ داده‌ای را ذخیره نمی‌کند.</p><Button type="button" variant="secondary" onClick={() => setSheetOpen(false)}>بستن</Button></Sheet>
  </main>;
}
