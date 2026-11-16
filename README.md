# Gymrez
PWA شخصی تمرین حمیدرضا و ریحانه، با طراحی Gymrez PACE.

**وضعیت فعلی: موکاپ و برنامه‌ریزی؛ اپ هنوز پیاده‌سازی یا منتشر نشده است.**

## شروع و پیگیری
- [نقشه راه و tracker مادر #1](https://github.com/Hamrez95/Gymrez/issues/1)
- [پلن اجرایی و وابستگی ۲۴ تسک](docs/planning/PLAN.md)
- [وضعیت اجرا و قدم بعدی](docs/implementation/STATUS.md)
- [قرارداد بازسازی دقیق موکاپ‌ها](docs/planning/DESIGN_SPEC.md)
- [معماری و ذخیره‌سازی Supabase](docs/planning/ARCHITECTURE.md)
- [موشن و تعامل](docs/planning/MOTION_SPEC.md)
- [مشاهده ۸ تصویر اصلی](docs/mockups/pace/README.md)
- [رفتار امکانات](docs/mockups/pace/FEATURES.md)

## تصمیم محصول
React + TypeScript + Vite PWA؛ Supabase برای حساب/داده، حفظ محلی تمرین هنگام قطع موقت اینترنت، دریافت برنامه جدید از قالب استاندارد ChatGPT/GitHub با preview و تأیید. میزبانی اصلی پیشنهادی Vercel Hobby و مسیر جایگزین Cloudflare Static Assets.

**هدف رابط دقیقاً همان موکاپ‌های PACE است؛ نه طراحی مشابه.** بخش‌های ناقص با همان زبان بصری تکمیل می‌شوند. داده‌ها و متن‌های داخل موکاپ نمونه‌اند؛ اطلاعات واقعی کاربران در ریپوی عمومی ذخیره نمی‌شود.
