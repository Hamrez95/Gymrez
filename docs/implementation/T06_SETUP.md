# T06 — راه‌اندازی ورود دعوتی

این تنظیمات برای اتصال Gymrez به پروژهٔ Supabase است. ساخت حساب و عضویت workspace از مرورگر انجام نمی‌شود.

## ۱. کلاینت و میزبانی

برنامه با GitHub Pages رایگان منتشر شده است:

- نشانی فعال: `https://hamrez95.github.io/Gymrez/`
- workflow انتشار: `.github/workflows/deploy-pages.yml`
- آخرین اجرای Pages، build و deploy را با موفقیت انجام داد.
- Vite، BrowserRouter، مسیرهای SPA و بازیابی رمز برای زیرمسیر `/Gymrez/` تنظیم شده‌اند.
- Source مخزن روی GitHub Actions است و Environment `github-pages` انتشار از شاخه‌های `main` و `feat/t06-invite-auth` را می‌پذیرد.

پروژهٔ Cloudflare Pages هم قبلاً ساخته شده، اما هنوز deployment ندارد و صرفاً گزینهٔ جایگزین است.

## ۲. تنظیم Supabase Auth

پس از اولین انتشار، در تنظیمات Auth پروژه:

1. ورود ایمیل/رمز را فعال نگه دار.
2. اجازهٔ ثبت‌نام کاربران جدید را خاموش کن؛ مسیر sign-up در کلاینت وجود ندارد.
3. Site URL را روی `https://hamrez95.github.io/Gymrez/` قرار بده.
4. الگوی `https://hamrez95.github.io/Gymrez/login?flow=recovery**` را در redirect allowlist ثبت کن. callback مربوط به PKCE می‌تواند پارامترهای query داشته باشد.

تنظیمات Auth dashboard از این ریپو قابل تغییر نیست. تا این تنظیم انجام نشود، بازیابی رمز ممکن است کار نکند.

## ۳. حساب‌ها و workspace

- ورود فعلی Supabase با ایمیل و رمز انجام می‌شود؛ `hamrez95` و `Ryxy` نام‌های نمایشی پروفایل هستند، نه ایمیل یا رمز ورود.
- هنوز هیچ ایمیل دعوتی ارسال نشده و هیچ حساب واقعی ساخته نشده است.
- پس از ایجاد دو حساب Auth از مسیر مورد اعتماد، شناسه‌های Auth آن‌ها را در SQL Editor برای household و membership استفاده کن. جدول `household_members` از کلاینت فقط خواندنی است و policy درج عمومی ندارد.
- در همان household دو پروفایل بساز. هر دو عضو به هر دو پروفایل دسترسی دارند و RLS عضویت را برای queryها بررسی می‌کند.

نمونه را در SQL Editor با UUIDهای Auth پر کن؛ UUIDها یا ایمیل‌ها را در ریپو و Issue ننویس:

```sql
insert into public.households (name)
values ('Gymrez workspace')
returning id;

insert into public.household_members (household_id, user_id, role)
values
  ('<household_uuid>', '<first_auth_user_uuid>', 'owner'),
  ('<household_uuid>', '<second_auth_user_uuid>', 'member');

insert into public.profiles (household_id, display_name)
values
  ('<household_uuid>', 'hamrez95'),
  ('<household_uuid>', 'Ryxy');
```

## ۴. بررسی

- هر دو کاربر پس از ورود دقیقاً دو پروفایل household را ببینند.
- کاربر خارج از household در انتخاب پروفایل هیچ ردیفی نبیند؛ query مستقیم با UUID پروفایل دیگر هم باید به‌واسطهٔ RLS خالی بماند.
- لینک بازیابی را از نشانی Pages امتحان کن و مطمئن شو callback به مسیر `/Gymrez/login` برمی‌گردد.
- در کلاینت گزینهٔ ساخت حساب یا ورود پیامکی وجود ندارد.

Pages منتشر شده است؛ تنظیم Site URL/redirect allowlist در Supabase و آزمون Auth واقعی باقی می‌مانند.
