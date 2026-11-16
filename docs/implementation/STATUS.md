# Gymrez — وضعیت اجرا
آخرین به‌روزرسانی: 2026-11-17

## پیشرفت
- T01/#2 و T02/#3 تکمیل شدند؛ اسکلت React/TypeScript/Vite و CI در main است.
- T03/#4: پایهٔ component و semantic tokens در [PR #27](https://github.com/Hamrez95/Gymrez/pull/27) ادغام شد. تطبیق دقیق تصاویر، فونت و assetهای نهایی هنوز باز است و در T19/T21 پیگیری می‌شود.
- T04/#5: پوستهٔ responsive، مسیرهای نمایشی، انتخاب پروفایل synthetic، تم و حالت ورود نمایشی در [PR #28](https://github.com/Hamrez95/Gymrez/pull/28) ادغام شد. CI سبز: typecheck، lint، unit، build و E2E موبایل/دسکتاپ. [شواهد CI](https://github.com/Hamrez95/Gymrez/actions/runs/43859115714)؛ screenshot artifact تا 2026-11-23.
- T05/#6: پروژهٔ مستقل Gymrez در سازمان Free متصل است. ۹ migration ثبت‌شده/اعمال‌شده، ۱۴ جدول با RLS، bucket خصوصی \`profile-media\`، ۸ حرکت seed، generated types و ۱۴ assertion موفق pgTAP. [Quality CI سبز](https://github.com/Hamrez95/Gymrez/actions/runs/43878723290). [PR #29](https://github.com/Hamrez95/Gymrez/pull/29) draft می‌ماند تا screenshotهای تطبیق موکاپ در پاس نهایی ثبت شوند.
- advisor امنیت و سلامت بدون lint است؛ advisor عملکرد FK بدون ایندکس ندارد و در حال حاضر ۱۸ ایندکس استفاده‌نشدهٔ INFO گزارش می‌کند.
- T06/#7 در شاخهٔ [feat/t06-invite-auth](https://github.com/Hamrez95/Gymrez/tree/feat/t06-invite-auth) پیاده‌سازی اولیه دارد: Auth دعوتی، بازیابی رمز با redirect allowlist، queryهای scopeشده و پاک‌سازی cache.
- راهنمای تنظیم Auth و ساخت workspace در [T06_SETUP.md](T06_SETUP.md) و وضعیت/محدودیت‌ها در [T06_PROGRESS.md](T06_PROGRESS.md) ثبت شده است.

## محدودیت‌ها
تست pgTAP با داده‌های مصنوعی در تراکنش اجرا و rollback شد؛ کاربر، پروفایل، اندازه یا تمرین واقعی ثبت نشده و افزونهٔ pgTAP پس از تست نصب نمانده است. پروژه فعلاً Auth user، household و profile ندارد. تنظیم Auth dashboard و متغیرهای hosting نیازمند تنظیم پروژه‌اند؛ تا آن زمان ورود در UI غیرفعال می‌ماند. آزمون واقعی invite/recovery و آزمون دو کاربر باقی است.
تصویرسازی سفارشی، فونت نهایی و motion بنا بر درخواست کاربر به مرحلهٔ آخر با sol6.1 موکول شده‌اند. صفحه‌ها همچنان به تطبیق دقیق موکاپ PACE نیاز دارند.

## ردیابی
| مرحله | وضعیت |
| --- | --- |
| M0 | T01/#2 و T02/#3 تکمیل |
| M1 | T03/#4 و T04/#5 foundation ادغام؛ تطبیق بصری باز |
| M2 | T05/#6 backend و RLS اجرا و تست شد؛ screenshot تطبیق مرجع باقی؛ T06/#7 کدنویسی در جریان، اتصال production و آزمون حساب واقعی باقی |
| M3–M6 | شروع نشده؛ motion و گرافیک نهایی طبق برنامه در T19 |

اقدام بعدی: اجرای CI شاخهٔ T06، سپس تنظیم hosting/Auth و provision امن دو حساب؛ بعد از آن مرور نهایی تصاویر طبق ترتیب قبلی.
