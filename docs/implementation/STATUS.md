# Gymrez — وضعیت اجرا
آخرین به‌روزرسانی: 2026-11-16

## پیشرفت
- T01/#2 و T02/#3 تکمیل شدند؛ اسکلت React/TypeScript/Vite و CI در main است.
- T03/#4: پایهٔ component و semantic tokens در [PR #27](https://github.com/Hamrez95/Gymrez/pull/27) ادغام شد. تطبیق دقیق تصاویر، فونت و assetهای نهایی هنوز باز است و در T19/T21 پیگیری می‌شود.
- T04/#5: پوستهٔ responsive، مسیرهای نمایشی، انتخاب پروفایل synthetic، تم و حالت ورود نمایشی در [PR #28](https://github.com/Hamrez95/Gymrez/pull/28) ادغام شد. CI سبز: typecheck، lint، unit، build و E2E موبایل/دسکتاپ. [شواهد CI](https://github.com/Hamrez95/Gymrez/actions/runs/43859115714)؛ screenshot artifact تا 2026-11-23.
- T05/#6: [PR #29](https://github.com/Hamrez95/Gymrez/pull/29) draft است و schema/versioning/RLS و pgTAP draft را اضافه می‌کند. migration و تست دیتابیس هنوز اجرا نشده‌اند؛ generated types، advisor و بررسی نهایی RLS/storage باقی است.

## محدودیت‌ها
هیچ پروژهٔ Supabase برای Gymrez ساخته نشده، هیچ کلید یا دادهٔ واقعی در ریپو نیست، و ورود/ذخیرهٔ تمرین هنوز فعال نشده است. برای provisioning باید سازمان مقصد تعیین شود؛ فقط پلن رایگان مجاز است و نباید به پروژه‌های دیگر دست زد. محیط محلی Docker دارد ولی Supabase CLI/psql نصب نیست؛ migration تا آماده‌شدن محیط مناسب validate نشده است.
تصویرسازی سفارشی، فونت نهایی و motion بنا بر درخواست کاربر به مرحلهٔ آخر با sol6.1 موکول شده‌اند. فعلاً layoutها ساختاری و mock هستند؛ این‌ها نسخهٔ نهایی موکاپ PACE نیستند.

## ردیابی
| مرحله | وضعیت |
| --- | --- |
| M0 | T01/#2 و T02/#3 تکمیل |
| M1 | T03/#4 و T04/#5 foundation ادغام؛ تطبیق بصری باز |
| M2 | T05/#6 schema draft؛ T06/#7 شروع نشده |
| M3–M6 | شروع نشده؛ motion و گرافیک نهایی طبق برنامه در T19 |

اقدام بعدی: بازبینی و اجرای migration/RLS روی محیط آزمایشی بی‌هزینه؛ بعد generated types و اتصال امن Auth در T06.
