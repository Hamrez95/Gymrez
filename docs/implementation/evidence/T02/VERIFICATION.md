# T02 — نتیجه بررسی پایه
تاریخ 2026-11-16، Windows، Node 25.9.0؛ CI هدف Node 24.

| بررسی | نتیجه |
| --- | --- |
| npm run typecheck | پاس |
| npm run lint | پاس |
| npm test | ۳ تست پاس؛ fail-closed backend mode، scope cache و isolation fixture |
| npm run build | پاس؛ Vite 8.3.8، JS gzip حدود 115.11KB |
| E2E موبایل و دسکتاپ | ۲ تست پاس با Chrome موجود، navigation و برچسب صریح demo |
| npm run audit:design | ۸ تصویر، ۲۵ crop؛ hash و bounds معتبر |

اسکرین‌شات‌های desktop.png و mobile.png فقط workbench و fixture مصنوعی را نشان می‌دهند. این‌ها baseline طراحی نهایی PACE نیستند؛ هنوز overlay UI نهایی معنی ندارد.

دریافت Playwright Chromium به SELF_SIGNED_CERT_IN_CHAIN خورد؛ اعتبارسنجی TLS دستکاری نشد. برای اجرای روی این سیستم از scripts/test-local-browser.mjs استفاده شد. روی سیستم دیگر PLAYWRIGHT_EXECUTABLE_PATH را تنظیم کنید یا npm run browser:install و npm run test:e2e اجرا کنید. CI browser cache path یکسان دارد.

Supabase adapter و auth در این مرحله پیاده نشده‌اند؛ انتخاب VITE_DATA_MODE=supabase به پیام unavailable منتهی می‌شود و مخفیانه demo یا ذخیره موفق نشان نمی‌دهد.
