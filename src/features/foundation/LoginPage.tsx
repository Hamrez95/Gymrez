import { Link } from 'react-router-dom';
import { Button, Card, TextInput } from '../../shared/design/components';

export function LoginPage() {
  return <section className="pace-login" aria-labelledby="login-title">
    <Card className="pace-login__card">
      <p className="eyebrow">GYMREZ / ACCOUNT</p>
      <h1 id="login-title">ورود به حساب</h1>
      <p>ورود امن پس از اتصال Supabase فعال می‌شود.</p>
      <form className="pace-login__form">
        <TextInput label="ایمیل" name="email" type="email" autoComplete="email" disabled />
        <TextInput label="رمز عبور" name="password" type="password" autoComplete="current-password" disabled />
        <Button type="button" disabled aria-describedby="login-status">ورود</Button>
      </form>
      <p id="login-status" className="pace-demo-note" role="status">این صفحه فعلاً پیش‌نمایش رابط است؛ هنوز حسابی ساخته نمی‌شود و اطلاعاتی ارسال نمی‌شود.</p>
      <Link to="/">بازگشت به انتخاب پروفایل</Link>
    </Card>
  </section>;
}
