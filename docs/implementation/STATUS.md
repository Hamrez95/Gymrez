# Gymrez — وضعیت اجرا
آخرین به‌روزرسانی: 2026-11-16

## این نوبت
- T01/#2: ممیزی ۸ PNG در ابعاد اصلی، ۲۵ پنل مرجع، manifest مختصات/hash/رنگ‌های اندازه‌گیری‌شده و گزارش منابع و نقص‌ها تکمیل شد. [گزارش](T01_REFERENCE_AUDIT.md).
- T02/#3: اسکلت React/TypeScript/Vite، Router، Tailwind، Query provider، Motion reduced-motion، repository خواندنی نمایشی، env بدون secret، lockfile و CI آماده شد.
- build، TypeScript strict، lint، ۳ unit test و ۲ E2E (موبایل/دسکتاپ با Chrome نصب‌شده) پاس شدند. gzip JS پایه حدود 115KB؛ این ارزیابی LCP/CLS نیست.
- [شواهد T02](evidence/T02/VERIFICATION.md) و راه اجرای پروژه در README.

## محدودیت صادقانه
صفحه موجود **workbench فنی** است، نه پیاده‌سازی نهایی موکاپ. T03/T04 و بقیه بازند؛ Supabase، login، ثبت تمرین، sync، نصب PWA و deployment هنوز پیاده نشده‌اند. نام دقیق فونت و assetهای پاک در T01 به‌عنوان unresolved ثبت و به T03 واگذار شده‌اند.
دانلود Chromium تست با خطای زنجیره گواهی در این سیستم مواجه شد؛ TLS غیرفعال نشد. تست محلی با مسیر Chrome نصب‌شده اجرا شد؛ CI از Chromium رسمی استفاده می‌کند. workflow Quality روی GitHub نیز موفق شد: نصب از رجیستری عمومی، typecheck، lint، unit، build و E2E هر دو viewport پاس شدند. [CI موفق](https://github.com/Hamrez95/Gymrez/actions/runs/43818645997)؛ [PR #26 ادغام‌شده](https://github.com/Hamrez95/Gymrez/pull/26).

## اقدام بعدی

T03 implementation started: semantic dark/light reference tokens and accessible base components are in progress; image, motion, and graphic polish remain deliberately deferred to the final sol6.1 pass. See [T03 progress](T03_PROGRESS.md). The task remains open pending licensed font/assets and mobile/desktop visual comparison.
T03 foundation components are in [PR #27](https://github.com/Hamrez95/Gymrez/pull/27); dark/light tokens, accessible base components, and CI browser checks are complete. Final font/assets and visual comparison remain open for T19/T21. See [T03 progress](T03_PROGRESS.md).

T04/#5 shell is in progress: responsive navigation, sample profile chooser, theme control, disabled login preview, and unknown route are implemented. Synthetic only, with no Supabase auth or workout saving. See [T04 progress](T04_PROGRESS.md). T03 CI passed on mobile/desktop: https://github.com/Hamrez95/Gymrez/actions/runs/43856423593.

## ردیابی
| مرحله | وضعیت |
| --- | --- |
| M0 | تکمیل؛ T01/#2 و T02/#3 بسته شدند، PR #26 در main ادغام شد |
| M1 | T03 foundation merged; T04 shell in progress; final visual work remains open |
| M2–M6 | شروع نشده |

اصل ۸ موکاپ بدون تغییر مانده است. Supabase مرجع نهایی داده، Vercel میزبان پیشنهادی، Cloudflare fallback. هیچ پروژه موجود یا زیرساخت پولی دستکاری نشده است.
