# Gymrez — برنامه اجرایی نسخه 1.0
تاریخ تصمیم: 2026-11-16 / ۲۵ آبان ۱۴۰۵  
مرجع پیگیری: [Issue #1](https://github.com/Hamrez95/Gymrez/issues/1)

## نتیجه مورد انتظار
یک PWA خصوصی برای تمرین حمیدرضا و ریحانه؛ نصب روی گوشی، استفاده در وب/دسکتاپ، دریافت برنامه جدید هر ۱–۲ ماه، ثبت ست و سابقه، اندازه‌های بدن و شاخص‌ها. رابط باید **دقیقاً همان موکاپ‌های PACE** باشد، نه طرح مشابه. حرفه‌ای، گرافیکی و دارای موشن، ولی ساده و سریع در استفاده روزمره.

## تصمیم‌های قطعی و مرز کار
- Supabase مرجع اصلی Auth/PostgreSQL؛ ذخیره محلی صرفاً برای ادامه تمرین و صف قطع موقت شبکه. GitHub دیتابیس سابقه/بدن نیست.
- React + TypeScript + Vite SPA؛ Tailwind و کامپوننت‌های اختصاصی بر اساس PACE؛ Motion برای موشن؛ Recharts فقط lazy برای نمودار.
- React Router، TanStack Query، React Hook Form + Zod، Dexie/IndexedDB و vite-plugin-pwa. state محلی React کافی است؛ Redux و سرویس مستقل .NET نیاز فعلی نیست.
- Vercel Hobby میزبان اصلی پیشنهادی برای این اپ شخصی؛ Cloudflare Workers Static Assets مسیر جایگزین همان build. هم‌زمان چند backend/hosting runtime نساز.
- کد و منابع طراحی در ریپوی عمومی فعلی؛ اطلاعات واقعی، اندازه‌ها، جلسات، اطلاعات ورود و برنامه خصوصی در Supabase و دستگاه مجاز بماند.
- دو حساب دعوتی و دو پروفایل در workspace خصوصی مشترک؛ اعضای دعوت‌شده به پروفایل‌های همان workspace دسترسی دارند. H/R انتخاب پروفایل است، نه امنیت ورود. دعوت/عضویت قابل جعل از client نباشد.
- هوش مصنوعی پولی داخل اپ، SMS OTP، اشتراک، فروشگاه، شبکه اجتماعی و اپ native در دامنه 1.0 نیست.
- در این مرحله فقط اسناد و Issueها ایجاد می‌شوند؛ ایجاد پروژه Supabase، deployment و توسعه در تسک‌های بعدی‌اند.

## مرجع طراحی و رفتار
1. تصاویر اصلی [PACE](../mockups/pace/README.md) مرجع قطعی چیدمان، تصاویر، رنگ و hierarchy.
2. [DESIGN_SPEC](DESIGN_SPEC.md) قرارداد اجرای دقیق و تکمیل حالت‌های ناقص است.
3. [FEATURES](../mockups/pace/FEATURES.md) مرجع رفتارهای موجود؛ تصمیم معماری نامشخص آن سند با این پلن تعیین می‌شود.
4. متن ناخوانا، اعداد نمونه، خطای فرمول و تناقض ناوبری تصویر نباید کورکورانه به محصول منتقل شود؛ اصلاح کاربردی ثبت شود و زبان بصری حفظ شود.
5. معیار پذیرش «شبیه است» نیست: screenshot واقعی + crop مرجع + overlay و فهرست اختلاف‌ها لازم است. یک تصویر تخت تمام‌صفحه به‌جای UI قابل استفاده قبول نیست.

## مراحل و خروجی قابل بررسی
| مرحله | خروجی | شرط عبور |
| --- | --- | --- |
| M0 — آماده‌سازی | نقشه دقیق مرجع و اسکلت قابل build | T01–T02؛ اسناد استخراج و CI پایه |
| M1 — پایه بصری | پوسته و کامپوننت‌ها در موبایل/دسکتاپ | T03–T04؛ اولین مقایسه تصویری |
| M2 — داده و امنیت | Supabase، RLS و ورود دعوتی واقعی | T05–T06؛ تست دسترسی غیرمجاز |
| M3 — برنامه | برنامه‌ها، بانک حرکت، editor، دریافت از ChatGPT و داشبورد | T07–T11؛ برنامه واقعی قابل فعال‌سازی |
| M4 — استفاده در باشگاه | player، تایمر، سابقه و اندازه‌ها | T12–T15؛ اولین مسیر کامل قابل استفاده |
| M5 — تکمیل قابلیت‌ها | پیشرفت، offline/sync، نصب، تنظیمات و PDF | T16–T18 و T20؛ قابلیت‌های تمام شیت‌ها |
| M6 — پولیش و تحویل | موشن/گرافیک نهایی، تطبیق تصویری، E2E، انتشار و پایلوت | T19 و T21–T24؛ بدون باگ مسدودکننده |

T19 is deliberately held until functional work is complete and runs immediately before T21 full-screen visual comparison. The user asked to use sol6.1 for final motion, generated/extracted images, and graphic polish. In M1 we still provide an early structural preview and in M4 a working exercise path; برای دیدن نتیجه تا پایان کل پروژه صبر نمی‌کنیم. این‌ها تحویل‌های میانی‌اند و جای نسخه کامل 1.0 را نمی‌گیرند.

## ترتیب اجرا و کنترل سرعت
- ابتدا T01 → T02 → T03 → T04؛ سپس T05 → T06. در صورت اجرای توسط یک توسعه‌دهنده همین ترتیب روشن بماند.
- T07 → T08 → T09 → T10 → T11 → T12 → T13 → T14 → T15 → T16 → T17 → T18 → T20 → T19 → T21 → T22 → T23 → T24.
- وابستگی دقیق هر Issue ملاک است؛ تسک‌ها ذاتاً قابلیت اجرای مستقل دارند، اما افزایش نفرات یا delegation شرط اجرا نیست.
- یک Issue فعال در هر جریان کاری، PR کوچک و قابل مرور؛ refactor فقط برای نیاز واقعی. mock برای پیش‌نمایش اولیه مجاز، ولی حالت production نباید آمار یا موفقیت ذخیره ساختگی نشان دهد.
- پیچیدگی بالا: T05/T09/T12/T17/T21/T22. ابتدا در هرکدام مسیر اصلی را بساز، سپس edge caseهای همان Issue را کامل کن؛ تسک با edge case باز done نیست.
- برآورد زمانی قطعی قبل از T01/T02 قابل اتکا نیست. پس از اولین build و ممیزی دارایی‌ها، برآورد کمینه/محتمل و ریسک در STATUS ثبت شود؛ به‌خصوص بازسازی دقیق تصاویر و sync چنددستگاهی زمان‌برند.

## فهرست اجرایی و وابستگی‌ها
| شناسه | مرحله | کار | پیش‌نیاز |
| --- | --- | --- | --- |
| [T01](https://github.com/Hamrez95/Gymrez/issues/2) | M0 | ممیزی تصویری PACE و مشخصات دقیق صفحات و حالت‌های ناقص | — |
| [T02](https://github.com/Hamrez95/Gymrez/issues/3) | M0 | راه‌اندازی React/TypeScript/Vite و ساختار تمیز پروژه و CI | [T01](https://github.com/Hamrez95/Gymrez/issues/2) |
| [T03](https://github.com/Hamrez95/Gymrez/issues/4) | M1 | توکن‌ها، دارایی‌های گرافیکی و کامپوننت‌های پایه دقیق PACE | [T01](https://github.com/Hamrez95/Gymrez/issues/2)، [T02](https://github.com/Hamrez95/Gymrez/issues/3) |
| [T04](https://github.com/Hamrez95/Gymrez/issues/5) | M1 | پوسته واکنش‌گرا، ورود بصری و ناوبری موبایل/دسکتاپ | [T03](https://github.com/Hamrez95/Gymrez/issues/4) |
| [T05](https://github.com/Hamrez95/Gymrez/issues/6) | M2 | پروژه مستقل Supabase Free، مدل داده نسخه‌دار و RLS | [T02](https://github.com/Hamrez95/Gymrez/issues/3) |
| [T06](https://github.com/Hamrez95/Gymrez/issues/7) | M2 | ورود امن دو نفر، workspace خصوصی و اتصال داده واقعی | [T04](https://github.com/Hamrez95/Gymrez/issues/5)، [T05](https://github.com/Hamrez95/Gymrez/issues/6) |
| [T07](https://github.com/Hamrez95/Gymrez/issues/8) | M3 | برنامه‌های هر پروفایل، جزئیات، نسخه‌ها و آرشیو | [T06](https://github.com/Hamrez95/Gymrez/issues/7) |
| [T08](https://github.com/Hamrez95/Gymrez/issues/9) | M3 | بانک حرکات با تصویر، جست‌وجو و جایگزینی | [T03](https://github.com/Hamrez95/Gymrez/issues/4)، [T05](https://github.com/Hamrez95/Gymrez/issues/6)، [T06](https://github.com/Hamrez95/Gymrez/issues/7) |
| [T09](https://github.com/Hamrez95/Gymrez/issues/10) | M3 | ویرایشگر برنامه با ست، تکرار، استراحت، تمپو و سوپرست | [T07](https://github.com/Hamrez95/Gymrez/issues/8)، [T08](https://github.com/Hamrez95/Gymrez/issues/9) |
| [T10](https://github.com/Hamrez95/Gymrez/issues/11) | M3 | افزودن برنامه ChatGPT از GitHub و ورود JSON با پیش‌نمایش | [T07](https://github.com/Hamrez95/Gymrez/issues/8)، [T08](https://github.com/Hamrez95/Gymrez/issues/9)، [T09](https://github.com/Hamrez95/Gymrez/issues/10) |
| [T11](https://github.com/Hamrez95/Gymrez/issues/12) | M3 | داشبورد شخصی و تقویم شمسی دقیق موکاپ | [T04](https://github.com/Hamrez95/Gymrez/issues/5)، [T06](https://github.com/Hamrez95/Gymrez/issues/7)، [T07](https://github.com/Hamrez95/Gymrez/issues/8) |
| [T12](https://github.com/Hamrez95/Gymrez/issues/13) | M4 | اجرای تمرین، ثبت ست و ادامه جلسه بدون از دست رفتن داده | [T08](https://github.com/Hamrez95/Gymrez/issues/9)، [T09](https://github.com/Hamrez95/Gymrez/issues/10)، [T11](https://github.com/Hamrez95/Gymrez/issues/12) |
| [T13](https://github.com/Hamrez95/Gymrez/issues/14) | M4 | تایمر استراحت دقیق، اجرای سوپرست و موشن تمرین | [T12](https://github.com/Hamrez95/Gymrez/issues/13) |
| [T14](https://github.com/Hamrez95/Gymrez/issues/15) | M4 | پایان و ذخیره جلسه، تاریخچه، فیلتر و جزئیات | [T12](https://github.com/Hamrez95/Gymrez/issues/13)، [T13](https://github.com/Hamrez95/Gymrez/issues/14) |
| [T15](https://github.com/Hamrez95/Gymrez/issues/16) | M4 | پروفایل بدن، تاریخچه اندازه‌ها و محاسبه خودکار شاخص‌ها | [T06](https://github.com/Hamrez95/Gymrez/issues/7) |
| [T16](https://github.com/Hamrez95/Gymrez/issues/17) | M5 | داشبورد پیشرفت، استمرار و رکوردها با نمودارهای واقعی | [T14](https://github.com/Hamrez95/Gymrez/issues/15)، [T15](https://github.com/Hamrez95/Gymrez/issues/16) |
| [T17](https://github.com/Hamrez95/Gymrez/issues/18) | M5 | صف همگام‌سازی آفلاین با Supabase و مدیریت تعارض دستگاه‌ها | [T06](https://github.com/Hamrez95/Gymrez/issues/7)، [T07](https://github.com/Hamrez95/Gymrez/issues/8)، [T12](https://github.com/Hamrez95/Gymrez/issues/13)، [T14](https://github.com/Hamrez95/Gymrez/issues/15)، [T15](https://github.com/Hamrez95/Gymrez/issues/16) |
| [T18](https://github.com/Hamrez95/Gymrez/issues/19) | M5 | نصب PWA، کش آفلاین، نسخه جدید و راهنمای نصب | [T03](https://github.com/Hamrez95/Gymrez/issues/4)، [T04](https://github.com/Hamrez95/Gymrez/issues/5)، [T17](https://github.com/Hamrez95/Gymrez/issues/18) |
| [T19](https://github.com/Hamrez95/Gymrez/issues/20) | M6 — آخرین پولیش بصری | پولیش حرفه‌ای موشن و گرافیک در تمام صفحات PACE | [T03](https://github.com/Hamrez95/Gymrez/issues/4)، [T11](https://github.com/Hamrez95/Gymrez/issues/12)، [T13](https://github.com/Hamrez95/Gymrez/issues/14)، [T14](https://github.com/Hamrez95/Gymrez/issues/15)، [T15](https://github.com/Hamrez95/Gymrez/issues/16)، [T16](https://github.com/Hamrez95/Gymrez/issues/17) |
| [T20](https://github.com/Hamrez95/Gymrez/issues/21) | M5 | تنظیمات، خروجی PDF مطابق موکاپ و پشتیبان‌گیری | [T07](https://github.com/Hamrez95/Gymrez/issues/8)، [T14](https://github.com/Hamrez95/Gymrez/issues/15)، [T15](https://github.com/Hamrez95/Gymrez/issues/16)، [T18](https://github.com/Hamrez95/Gymrez/issues/19) |
| [T21](https://github.com/Hamrez95/Gymrez/issues/22) | M6 | بازبینی تطبیق تصویری تمام ۸ مرجع و رفع اختلاف‌ها | [T04](https://github.com/Hamrez95/Gymrez/issues/5)، [T07](https://github.com/Hamrez95/Gymrez/issues/8)، [T08](https://github.com/Hamrez95/Gymrez/issues/9)، [T09](https://github.com/Hamrez95/Gymrez/issues/10)، [T11](https://github.com/Hamrez95/Gymrez/issues/12)، [T14](https://github.com/Hamrez95/Gymrez/issues/15)، [T15](https://github.com/Hamrez95/Gymrez/issues/16)، [T16](https://github.com/Hamrez95/Gymrez/issues/17)، [T19](https://github.com/Hamrez95/Gymrez/issues/20)، [T20](https://github.com/Hamrez95/Gymrez/issues/21) |
| [T22](https://github.com/Hamrez95/Gymrez/issues/23) | M6 | تست سرتاسری، امنیت RLS، دسترس‌پذیری و کارایی | [T05](https://github.com/Hamrez95/Gymrez/issues/6)، [T06](https://github.com/Hamrez95/Gymrez/issues/7)، [T10](https://github.com/Hamrez95/Gymrez/issues/11)، [T14](https://github.com/Hamrez95/Gymrez/issues/15)، [T15](https://github.com/Hamrez95/Gymrez/issues/16)، [T17](https://github.com/Hamrez95/Gymrez/issues/18)، [T18](https://github.com/Hamrez95/Gymrez/issues/19)، [T20](https://github.com/Hamrez95/Gymrez/issues/21) |
| [T23](https://github.com/Hamrez95/Gymrez/issues/24) | M6 | انتشار رایگان Vercel، مسیر جایگزین Cloudflare و راهنمای بازیابی | [T18](https://github.com/Hamrez95/Gymrez/issues/19)، [T21](https://github.com/Hamrez95/Gymrez/issues/22)، [T22](https://github.com/Hamrez95/Gymrez/issues/23) |
| [T24](https://github.com/Hamrez95/Gymrez/issues/25) | M6 | پایلوت حمیدرضا و ریحانه و تحویل نسخه 1.0 قابل نصب | [T10](https://github.com/Hamrez95/Gymrez/issues/11)، [T21](https://github.com/Hamrez95/Gymrez/issues/22)، [T22](https://github.com/Hamrez95/Gymrez/issues/23)، [T23](https://github.com/Hamrez95/Gymrez/issues/24) |

## دریافت برنامه جدید بدون هزینه API
ChatGPT/Codex خروجی مطابق schema و exercise IDهای اپ تولید می‌کند. برنامه عمومی و مصنوعی می‌تواند از PR به content/programs و manifest نسخه‌دار اضافه شود. اپ با «بررسی برنامه جدید» آن را می‌گیرد، اعتبارسنجی و preview می‌کند و با انتخاب پروفایل و تأیید، به Supabase وارد می‌کند. فعال‌سازی جداست؛ برنامه خصوصی از paste/file مستقیم وارد Supabase می‌شود و به ریپوی عمومی نمی‌رود. import نسخه تکراری idempotent و آرشیو قدیمی محفوظ باشد. افزودن برنامه با deployment/به‌روزرسانی SW اپ یکی نیست.

## معیار اتمام نسخه
- تمام پنل‌های هشت مرجع بازسازی و stateهای ناقص تکمیل شده‌اند؛ اختلاف عمده بصری باز نیست.
- مسیر برنامه→شروع→ثبت ست→استراحت→پایان→سابقه→پیشرفت روی دو پروفایل و دو دستگاه کار می‌کند.
- آفلاین موقت، reload و retry داده را از بین نمی‌برد؛ همگام‌سازی پس از بازگشت اتصال و بازبودن اپ روشن است.
- RLS و مجوزها روی API واقعی تست شده؛ هیچ داده/کلید خصوصی در ریپوی عمومی و شواهد QA نیست.
- برنامه جدید بدون تغییر کد وارد و فعال می‌شود؛ PDF و backup واقعی‌اند.
- build/typecheck/lint، unitهای ضروری، E2E اصلی، screenshot QA و نصب واقعی ثبت شده‌اند.
- راهنمای نصب، محدودیت‌ها، بازیابی پروژه paused و URL واقعی تحویل وجود دارد.

## هزینه و ریسک‌ها
هزینه هدف صفر در محدوده پلن‌های رایگان فعلی است، نه ضمانت همیشگی. قبل از provision پلن سازمان و سهمیه بررسی شود؛ منبع پولی یا پروژه در سازمان پولی بدون بررسی ساخته نشود. به پروژه‌های دیگر کاربر دست زده نشود. Supabase Free ممکن است پس از کم‌فعالیتی حدود یک هفته pause شود؛ cache اپ راه‌حل تضمین always-on نیست. restore runbook و حفظ outbox لازم است؛ keep-alive صوری برای دورزدن پلن نساز. Vercel Hobby فقط استفاده شخصی غیرتجاری دارد؛ دسترسی واقعی اینترنت ایران قبل از تحویل تست شود. عوض‌شدن origin حافظه محلی PWA را منتقل نمی‌کند.

## منابع فنی بررسی‌شده
- [Supabase Free / billing](https://supabase.com/docs/guides/platform/billing-on-supabase)
- [Supabase project pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
- [Vercel Hobby](https://vercel.com/docs/plans/hobby)
- [Cloudflare Static Assets](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Vite PWA](https://vite-pwa-org.netlify.app/guide/)
- [PWA installation](https://web.dev/learn/pwa/installation)

ادامه اجرا از [STATUS](../implementation/STATUS.md) و Issue #5 شروع شود.
