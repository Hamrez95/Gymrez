# Gymrez — راهنمای ادامه توسعه

## مرجع کار
- ابتدا docs/implementation/STATUS.md و docs/planning/PLAN.md را بخوان.
- tracker اصلی: https://github.com/Hamrez95/Gymrez/issues/1 ؛ ۲۴ task با شناسه T01–T24.
- docs/planning/ARCHITECTURE.md، DESIGN_SPEC.md و MOTION_SPEC.md و معیارهای Issue فعال الزام‌آورند.
- Current work: consolidate all previous branches into main and verify Pages, then finish T17 durable offline writes and T09 program editing. See STATUS.md and RELEASE_PROGRESS.md; do not rebuild the existing app.

## دستور صریح طراحی
کاربر **دقیقاً همان طراحی موکاپ‌های docs/mockups/pace/00 تا 07** را می‌خواهد؛ نه «مشابه» و نه بازطراحی سلیقه‌ای.
قبل از هر UI task تصویر مربوط را در اندازه اصلی مشاهده کن. layout، رنگ، typography، گرافیک، asset و اجزای اصلی باید مطابق مرجع باشند. قاب دستگاه/مرورگر و عنوان شیت ارائه جزو اپ نیست.
نقص متن/اعداد تولید تصویر را اصلاح و قسمت‌های خارج کادر/stateهای missing را با همان زبان طراحی تکمیل کن. اختلاف ضروری را در deviation log و PR گزارش بده.
تایمر استراحت پنل مستطیلی و progress سگمنتی شیت 02 است. موشن حرفه‌ای همه مسیرهای کلیدی را پوشش دهد؛ reduced-motion و سرعت تعامل حفظ شود.
UI completion نیازمند screenshot موبایل/دسکتاپ و مقایسه crop/overlay با اصل است؛ baseline جدید جای مرجع اصلی نیست.

## Sequencing confirmed by user
Finish structural, data, navigation, and functional work first. Defer generated/extracted imagery, custom logo/icon art, decorative graphics, and final motion polish until the final pass with sol6.1. Keep those items explicitly open; do not substitute placeholders and call them complete. T19 is the last visual-polish task before T21 screenshot comparison.

## فنی و داده
React/TypeScript strict/Vite، Tailwind، Motion، Supabase/PostgreSQL/RLS؛ Dexie برای دوام محلی و outbox، نه جایگزین Supabase. پیش‌نمایش بدون نشست فقط دادهٔ محلی دارد. نشست معتبر از لینک اختصاصی، پروفایل‌ها و داده‌های خصوصی Supabase را با RLS می‌خواند و می‌نویسد، حتی وقتی preview فعال است. RLS را عمومی نکن. حساب فنی مشترک و دو پروفایل با اجازهٔ صریح کاربر provision شده‌اند؛ credential و لینک ورود در Git نباشند.
کد feature-based و منطق محاسبه/timer/sync از JSX جدا. abstraction اضافی و چند backend نساز. dependencyها و lockfile ثبت شوند.
داده واقعی/اندازه/جلسه/credential یا service_role در ریپوی عمومی ممنوع. fixtures مصنوعی. دو حساب دعوتی و workspace خصوصی؛ انتخاب H/R امنیت ورود نیست.
project مستقلی برای Gymrez و فقط پس از بررسی پلن رایگان بساز؛ به LifeMate یا پروژه دیگر دست نزن و منبع پولی فعال نکن.

## روش اجرا
هر بار یک Issue قابل بررسی، dependencies مشخص و PR کوچک. done فقط بعد از معیار پذیرش و checks مناسب. build/typecheck/lint و تست‌های مرتبط؛ تست بی‌فایده منعکس‌کننده implementation نساز.
داده mock برای demo واضح باشد؛ ذخیره موفق جعلی، نمودار جعلی و play/QR بی‌عمل در محصول نهایی ممنوع.
برنامه منتشرشده/جلسه قدیمی immutable snapshot؛ عملیات ذخیره و import idempotent؛ تعارض چنددستگاهی overwrite خاموش نشود.
در پایان هر نوبت STATUS و tracker را به‌روز و نتیجه واقعی/محدودیت/اقدام بعدی را ثبت کن.
backend خصوصی فعال شده است؛ حالت بدون اتصال همچنان local preview است. وضعیت واقعی انتشار و قابلیت‌های باقی‌مانده در RELEASE_PROGRESS ثبت شود؛ کل roadmap را تکمیل‌شده اعلام نکن.
