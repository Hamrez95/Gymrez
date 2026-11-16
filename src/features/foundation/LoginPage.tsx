import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { runtimeConfig } from '../../data/supabase/client';
import { Button, Card, TextInput } from '../../shared/design/components';

type LoginLocationState = { next?: unknown };

export function LoginPage() {
  const { status, recoveryRequired, signIn, requestPasswordReset, updatePassword, finishPasswordRecovery } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const loginCompleted = useRef(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [view, setView] = useState<'login' | 'reset'>('login');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const configured = runtimeConfig.mode === 'supabase';
  const isRecovery = recoveryRequired || searchParams.get('flow') === 'recovery';
  const next = (location.state as LoginLocationState | null)?.next;
  const nextPath = typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') && next !== '/login' ? next : '/';

  useEffect(() => {
    if (status === 'signedIn' && !isRecovery && !loginCompleted.current) navigate('/', { replace: true });
  }, [isRecovery, navigate, status]);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true); setError(''); setMessage('');
    try {
      await signIn(email, password);
      loginCompleted.current = true;
      navigate(nextPath, { replace: true });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'ورود انجام نشد.'); }
    finally { setBusy(false); }
  };

  const handleResetRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true); setError(''); setMessage('');
    try {
      await requestPasswordReset(email);
      setMessage('اگر این ایمیل حساب فعالی داشته باشد، راهنمای بازیابی برای آن ارسال می‌شود.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'درخواست بازیابی انجام نشد.'); }
    finally { setBusy(false); }
  };

  const handlePasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true); setError(''); setMessage('');
    try {
      await updatePassword(newPassword);
      finishPasswordRecovery();
      navigate('/', { replace: true });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'تغییر رمز انجام نشد.'); }
    finally { setBusy(false); }
  };

  return <section className="pace-login" aria-labelledby="login-title">
    <Card className="pace-login__card">
      <p className="eyebrow">GYMREZ / ACCOUNT</p>
      <h1 id="login-title">{isRecovery ? 'ساخت رمز جدید' : view === 'reset' ? 'بازیابی رمز عبور' : 'ورود به حساب'}</h1>
      <p>حساب‌ها فقط با دعوت ساخته می‌شوند؛ ثبت‌نام عمومی و ورود پیامکی در دسترس نیست.</p>
      {!configured && <p className="pace-demo-note" role="status">{runtimeConfig.mode === 'unavailable' ? runtimeConfig.reason : 'اتصال Supabase در دسترس نیست.'}</p>}

      {isRecovery ? <form className="pace-login__form" onSubmit={handlePasswordUpdate}>
        <TextInput label="رمز عبور جدید" name="new-password" type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={event => setNewPassword(event.target.value)} disabled={!configured || busy} />
        <Button type="submit" loading={busy} disabled={!configured}>ذخیره رمز جدید</Button>
      </form> : view === 'reset' ? <form className="pace-login__form" onSubmit={handleResetRequest}>
        <TextInput label="ایمیل" name="email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} disabled={!configured || busy} />
        <Button type="submit" loading={busy} disabled={!configured}>ارسال راهنمای بازیابی</Button>
        <Button type="button" variant="quiet" onClick={() => { setView('login'); setError(''); setMessage(''); }}>بازگشت به ورود</Button>
      </form> : <form className="pace-login__form" onSubmit={handleSignIn}>
        <TextInput label="ایمیل" name="email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} disabled={!configured || busy} />
        <TextInput label="رمز عبور" name="password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} disabled={!configured || busy} />
        <Button type="submit" loading={busy} disabled={!configured}>ورود</Button>
        <Button type="button" variant="quiet" onClick={() => { setView('reset'); setError(''); setMessage(''); }} disabled={!configured}>رمز عبور را فراموش کرده‌ام</Button>
      </form>}

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
    </Card>
  </section>;
}
