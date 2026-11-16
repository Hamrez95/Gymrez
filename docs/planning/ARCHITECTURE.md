# Gymrez — معماری نسخه 1.0
وضعیت: تصمیم طراحی، هنوز کدی پیاده نشده است. [پلن](PLAN.md) و [Issue #1](https://github.com/Hamrez95/Gymrez/issues/1) مرجع دامنه‌اند.

## اجزا
| لایه | انتخاب | مسئولیت |
| --- | --- | --- |
| UI | React/TypeScript/Vite/Tailwind/Motion | RTL، تطبیق دقیق PACE، navigation و تعامل |
| داده سرور | Supabase Auth/PostgreSQL + RLS | هویت، عضویت، مالکیت و داده ماندگار |
| state سرور | TanStack Query | fetch/cache/invalidation با key شامل user/household/profile |
| فرم و قرارداد | React Hook Form + Zod | اعتبارسنجی مشترک فرم، import و payload |
| محلی | Dexie/IndexedDB | cache برنامه/رسانه منتخب و outbox آفلاین |
| PWA | vite-plugin-pwa | app shell آفلاین، نصب و update کنترل‌شده |
| نمودار/چاپ | Recharts lazy / CSS print | پیشرفت و خروجی A4 |
| میزبان | Vercel Hobby؛ Cloudflare Static Assets جایگزین | HTTPS و فایل‌های build یکسان |

منطق کسب‌وکار در ماژول‌های domain/testable و data access در repository functions باشد؛ JSX به query SQL یا مدیریت صف آلوده نشود. برای یک اپ دونفره microservice، realtime دائمی، ORM سرور، API پولی AI و abstractionهای عمومی غیرضروری نساز.

## ساختار پیشنهادی
- src/app: router/providers/app shell
- src/features/auth، profiles، programs، exercises، workout، history، body، progress، settings
- src/shared/ui، design، lib، contracts
- src/data/supabase، local، sync
- supabase/migrations و تست‌های سیاست‌ها، seed مصنوعی
- content/programs: schema، template prompt، برنامه‌های قابل انتشار عمومی و manifest نسخه‌دار
- tests/unit و tests/e2e، docs/implementation/evidence

نسخه dependency در lockfile ثبت؛ env.example بی‌کلید؛ config و types تولیدشده بررسی شوند. به‌ویژه secret/service_role هرگز در VITE_* قرار نگیرد. فقط URL و publishable key با RLS کامل در client مجازند.

## مدل داده
| موجودیت | فیلد/قاعده کلیدی |
| --- | --- |
| households / household_members | workspace خصوصی؛ auth user و نقش؛ عضویت فقط trusted provisioning |
| profiles | household_id، display name، قد/هدف؛ هر profile متعلق به workspace معتبر |
| exercises / exercise_media | شناسه پایدار، نام فارسی/انگلیسی، عضله/تجهیزات، قرارداد وزن، رسانه و مجوز |
| programs / program_versions | profile_id، عنوان/بازه، draft/published/archived، نسخه immutable و یک active |
| program_sessions / planned_exercises | روز هفتگی/ترتیب/گروه، sets/reps/rest/tempo/notes؛ زمان/مسافت نیز پشتیبانی |
| workout_sessions | profile_id، version_id، snapshot، started/ended، active/rest/elapsed، status، revision |
| performed_sets | session_id، snapshot حرکت، actual reps/load/time/distance، done، client UUID |
| body_measurements | profile_id، measurement_date، captured height، weight و دورهای اختیاری، revision |
| program_imports / sync_operations | source ID/version/hash و operation UUID برای idempotency |

FKها باید مالکیت را در روابط parent/child نیز تضمین کنند؛ فقط وجود profile_id روی رکورد کافی نیست. partial unique index برای active برنامه و کلید عملیات لازم است. تمام داده‌های mutable UUID/created_at/updated_at/revision داشته باشند؛ delete سازگار با sync با tombstone و policy روشن باشد.

## هویت و امنیت
دو حساب مستقل ایمیل/رمز، ورود دعوتی، بدون SMS/ثبت‌نام عمومی. دو عضو workspace به پروفایل‌های همان workspace دسترسی دارند؛ کاربر خارج workspace هیچ دسترسی ندارد. H/R صرفاً context UI است. membership از client قابل ساخت/گسترش نباشد. bootstrap اعضا با مسیر trusted و بدون افشای email/credential در ریپو انجام شود.

RLS برای همه جداول، bucketهای خصوصی و queryهای مستقیم برقرار؛ authenticated به‌تنهایی مجوز مالکیت نیست. UPDATE نیازمند USING و WITH CHECK است. client هرگز service_role ندارد. توابع invoker پیش‌فرض؛ view/function جدید از نظر bypass-RLS بررسی شود. foreign profile ID، session ID و household ID با API مستقیم تست شوند. لاگ و شواهد از داده واقعی خالی باشند.

query/local/cache keyها به هویت، workspace و پروفایل محدود. logout با outbox ناتمام تصمیم روشن بخواهد، داده را بی‌صدا دور نریزد و آن را برای حساب بعدی ارسال نکند. cache خصوصی اپ مشترک بین حساب‌ها باقی نماند.

## نسخه برنامه و محاسبات
draft قابل تغییر؛ published immutable. ویرایش، نسخه جدید می‌سازد. session در شروع snapshot مستقل می‌گیرد و پس از تغییر برنامه/نام حرکت سابقه عوض نمی‌شود. کپی ماه بعد سابقه جلسات را کپی نمی‌کند. تغییر فعال برنامه تراکنشی است.

تاریخ ثبت اندازه به‌صورت date-only و زمان رخداد UTC ذخیره؛ نمایش شمسی با timezone دستگاه و پیش‌فرض Asia/Tehran. baseline قد در هر measurement ذخیره شود. BMI و نسبت‌ها فقط از داده همان ثبت، با precision کامل و rounding در نمایش؛ ورودی ناقص شاخص ناقص، نه صفر/NaN.

وزنه دمبل، unilateral، bodyweight و assisted machine قرارداد جدا دارند. تناژ فقط روی ست‌های انجام‌شده معتبر و با برچسب روش؛ مقایسه دستگاه‌های متفاوت/کمک دستگاه گمراه‌کننده نباشد. timer از start/deadline/pause timestamps و elapsed محاسبه شود، نه شمارش tick.

## offline و همگام‌سازی
Supabase منبع داده مشترک؛ IndexedDB لایه دوام محلی است. flow هر write: validate → atomic local record+outbox → pending UI → ارسال foreground → تأیید server → synced/invalidate. موفقیت server با ثبت صرفاً محلی یکی نیست.

هر عمل operation_id ثابت دارد و retry همان کلید را می‌فرستد؛ parent قبل از child. optimistic concurrency با revision؛ تعارض ویرایش روی دو دستگاه به‌صورت conflict/انتخاب نسخه قابل حل، نه last-write-wins خاموش. رکورد جلسات جدا و عملیات ریز کم‌تعارض باشند؛ کل تاریخچه را با یک JSON بزرگ overwrite نکن.

retry با backoff و محدودیت؛ auth expired، paused backend، قطع شبکه، rate limit و server error متمایز. resume/online/manual retry مسیر اصلی؛ اجرای background sync تضمین نیست. session و اندازه‌ها پس از reload باقی بمانند. cache و outbox جای backup ابری/دستگاه نیستند.

## دریافت برنامه ChatGPT
schema version، program source_id/version/checksum، exercise IDs و units ثابت. public manifest از GitHub برای برنامه‌های عمومی و فاقد داده شخصی؛ fetch→validate→preview→confirm profile→idempotent import draft→activate. فایل/paste JSON راه مکمل و برنامه خصوصی مستقیماً در Supabase. اجرای code از JSON و لینک‌های نامعتبر مجاز نباشد. token خصوصی GitHub برای استفاده عادی اپ لازم نیست.

## hosting و preview
Vercel Hobby برای استفاده شخصی، بدون function یا دامنه خریدنی در نسخه اول. dist خروجی ثابت و SPA fallback صحیح. HTML/SW/manifest revalidate و assets hashed immutable؛ stale SW وسط تمرین refresh اجباری نکند.

Cloudflare Workers Static Assets فقط recipe fallback همان dist است؛ Pages برای پروژه جدید انتخاب پیش‌فرض نیست. تغییر دامنه origin مستقل، cache/IndexedDB جدا دارد؛ pending data پیش از مهاجرت همگام یا پشتیبان شود. Supabase redirect/allowed origins با origin جدید هماهنگ شود.

Sites برای پیش‌نمایش/انتشار اختیاری در صورت نیاز قابل استفاده است، ولی پروژه موازی با source متفاوت، D1/R2 به‌جای Supabase یا gate ورود ChatGPT به‌صورت ناخواسته نساز. در این مرحله هیچ Site یا deployment ساخته نمی‌شود؛ مسیر اصلی source همان Hamrez95/Gymrez است. از پنج سرویس tagged نباید پنج زیرساخت اجباری بسازیم.

Preview از fixture مصنوعی یا محیط ایزوله استفاده کند؛ اگر پروژه رایگان دوم موجود نیست، صرفاً برای preview پروژه دیگری را pause/حذف نکن. preview PR نامطمئن به production credential یا داده واقعی وصل نشود.

## بازیابی و هزینه
قبل از provisioning، پلن سازمان/سهمیه بررسی؛ پروژه مستقل Gymrez، بدون تغییر پروژه‌های موجود. Supabase Free محدودیت و pause دارد؛ ادعای همیشه‌فعال یا رایگان همیشگی نکن. runbook: تشخیص paused، Resume توسط مالک، حفظ صف، retry و smoke داده. backup/export دوره‌ای با restore آزمایش‌شده؛ کلید یا dump خصوصی به GitHub عمومی نرود. هیچ keep-alive صوری یا سرویس پولی خودکار اضافه نشود.

## کیفیت متناسب
unit: شاخص‌ها، normalization ارقام، timer/pause، version/import و sync conflict/idempotency.
integration: RLS/FK/activation و snapshot.
E2E: login→program import→workout→offline/reload→sync→history→measurements→desktop→PDF.
visual: تمام پنل‌های هشت مرجع + گوشی/دسکتاپ، reduced-motion و RTL.
بودجه اولیه: JS gzip≤300KB بدون بخش‌های lazy/رسانه؛ LCP≤2.5s و CLS≤0.1 در سناریوی مستند. این‌ها هدف سنجش‌اند، نتیجه تست انجام‌شده نیستند.
