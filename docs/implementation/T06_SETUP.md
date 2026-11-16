# T06 — راه‌اندازی ورود دعوتی

این تنظیمات برای اتصال Gymrez به همان پروژه Supabase در نظر گرفته شده‌اند. حساب‌ها و عضویت workspace از مرورگر ساخته نمی‌شوند.

## ۱. تنظیم کلاینت

برای محیط build برنامه این متغیرها را تنظیم کن:

- `VITE_SUPABASE_URL`: نشانی API پروژه Gymrez.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: کلید publishable پروژه؛ کلید `service_role` یا `sb_secret` هرگز مناسب کلاینت نیست.
- `VITE_AUTH_REDIRECT_ORIGINS`: فهرست originهای دقیق و جداشده با ویرگول، مانند `https://gymrez.example,http://localhost:5173`.

نشانی‌های preview باید جداگانه و دقیق اضافه شوند. کد فقط originهای صریح را برای لینک بازیابی می‌پذیرد و مسیر بازگشت را به `/login?flow=recovery` محدود می‌کند. فایل نمونهٔ محیط فقط تنظیمات نمونه دارد.

## ۲. تنظیم Supabase Auth

در تنظیمات Auth پروژه:

1. ورود ایمیل/رمز را فعال نگه دار.
2. گزینه اجازهٔ ثبت‌نام کاربران جدید را خاموش کن؛ مسیر sign-up در کلاینت وجود ندارد.
3. Site URL را روی origin اصلی برنامه قرار بده.
4. URL بازگشت `/login?flow=recovery` را برای originهای production، previewهای انتخاب‌شده و localhost مجاز کن. از اضافه‌کردن همهٔ دامنه‌های ناشناس preview خودداری کن.

تنظیم dashboard از این ریپو قابل تغییر نیست و باید در پروژهٔ Supabase ثبت شود.

## ۳. دعوت امن و workspace

1. دو ایمیل موردنظر را از بخش کاربران Supabase به‌صورت دعوتی اضافه کن. ایمیل‌ها یا لینک دعوت را در ریپو یا Issue ننویس.
2. پس از ایجاد هر دو کاربر، با شناسه‌های Auth آن‌ها در SQL Editor یک household و دو membership بساز. جدول `household_members` از کلاینت فقط خواندنی است و هیچ policy درج عمومی ندارد.
3. در همان household دو ردیف `profiles` ایجاد کن. هر دو عضو household به هر دو پروفایل دسترسی خواهند داشت؛ RLS عضویت را برای تمام queryها بررسی می‌کند.

نمونهٔ ساختار SQL را در SQL Editor با UUIDهای واقعی پر کن؛ این مقادیر را داخل فایل‌های پروژه ذخیره نکن:

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
  ('<household_uuid>', '<profile_one_name>'),
  ('<household_uuid>', '<profile_two_name>');
```

## ۴. بررسی

- هر دو کاربر باید پس از ورود دقیقاً دو پروفایل household را ببینند.
- کاربر خارج از household باید در انتخاب پروفایل هیچ ردیفی نبیند؛ query مستقیم با UUID پروفایل دیگر هم باید به‌واسطهٔ RLS خالی بماند.
- لینک بازیابی را از هر origin مجاز امتحان کن و مطمئن شو callback به origin دیگری نمی‌رود.
- در کلاینت گزینهٔ ساخت حساب یا ورود پیامکی وجود ندارد.

تا وقتی URL/key در hosting تنظیم و Auth پروژه به شکل بالا پیکربندی نشود، صفحه ورود عمداً غیرفعال می‌ماند.
