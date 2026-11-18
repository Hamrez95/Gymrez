# Gymrez
PWA شخصی تمرین حمیدرضا و ریحانه، با طراحی Gymrez PACE.

**وضعیت فعلی: پیش‌نمایش مستقیم Gymrez روی GitHub Pages؛ انتخاب پروفایل بدون ورود فعال است. داده‌های اصلی هنوز به این پیش‌نمایش متصل نیستند.**

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

## اجرای پایه توسعه
نیازمند Node 24 و npm.

```sh
npm ci
npm run dev
```

بررسی‌ها: `npm run typecheck`، `npm run lint`، `npm test` و `npm run build`. برای مرورگر: `npm run browser:install` سپس `npm run test:e2e`. اگر Chrome موجود دارید، متغیر `PLAYWRIGHT_EXECUTABLE_PATH` را به مسیر اجرایی آن بدهید. `scripts/test-local-browser.mjs` مسیر Chrome این سیستم ویندوزی را استفاده می‌کند.

`npm run audit:design` تمام ۸ مرجع را اندازه‌گیری و ۲۵ crop را تولید می‌کند؛ PNGهای تکراری در git نرفته‌اند. [ممیزی T01](docs/implementation/T01_REFERENCE_AUDIT.md) و [نتایج T02](docs/implementation/evidence/T02/VERIFICATION.md).

حالت پیش‌فرض `VITE_GUEST_MODE=true` است: برنامه مستقیم باز می‌شود، پروفایل‌های نمایشی `hamrez95` و `Ryxy` را نشان می‌دهد و هیچ داده‌ای از Supabase نمی‌خواند یا ذخیره نمی‌کند. RLS تغییری نکرده است. برای بازگرداندن ورود دعوتی، `VITE_GUEST_MODE=false` را تنظیم کنید.


## Current preview
The root route opens the profile chooser. Select either profile to reach its dashboard; the header lets you switch profiles. `/login` redirects home while guest preview is enabled. These demo profiles do not authenticate or save training data. T04 stays open pending exact-reference screenshot review. See [T04 progress](docs/implementation/T04_PROGRESS.md) and [STATUS](docs/implementation/STATUS.md).
