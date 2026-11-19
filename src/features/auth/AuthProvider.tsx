import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import { buildPasswordRecoveryRedirectUrl } from '../../app/config';
import { runtimeConfig, supabaseClient } from '../../data/supabase/client';
import { connectDevice } from './deviceConnection';
import { AuthContext, type AuthContextValue, type AuthSnapshot } from './authContext';

export function AuthProvider({ queryClient, children }: { queryClient: QueryClient; children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<AuthSnapshot>(() => ({
    status: runtimeConfig.mode === 'supabase' ? 'loading' : 'unavailable',
    session: null,
    recoveryRequired: false,
  }));
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!supabaseClient) return;
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
      const nextUserId = session?.user.id ?? null;
      if (event === 'SIGNED_OUT' || (previousUserId.current !== null && previousUserId.current !== nextUserId)) {
        queryClient.clear();
      }
      previousUserId.current = nextUserId;
      setSnapshot(current => ({
        status: session ? 'signedIn' : 'signedOut',
        session,
        recoveryRequired: event === 'PASSWORD_RECOVERY'
          ? true
          : event === 'SIGNED_OUT' ? false : current.recoveryRequired,
      }));
    });
    void connectDevice(supabaseClient).catch(error => setSnapshot(current => ({ ...current, connectionError: error.message })));
    return () => subscription.unsubscribe();
  }, [queryClient]);

  const requireClient = () => {
    if (!supabaseClient) throw new Error(runtimeConfig.mode === 'unavailable' ? runtimeConfig.reason : 'اتصال Supabase در دسترس نیست.');
    return supabaseClient;
  };

  const value: AuthContextValue = {
    ...snapshot,
    userId: snapshot.session?.user.id ?? null,
    email: snapshot.session?.user.email ?? null,
    async signIn(email, password) {
      const { error } = await requireClient().auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw new Error('ورود انجام نشد. ایمیل و رمز عبور را بررسی کن.');
    },
    async requestPasswordReset(email) {
      const redirectTo = buildPasswordRecoveryRedirectUrl(window.location.origin, runtimeConfig, import.meta.env.BASE_URL);
      if (!redirectTo) throw new Error('بازیابی رمز برای این نشانی فعال نشده است. نشانی محیط را در فهرست مجاز Supabase ثبت کن.');
      const { error } = await requireClient().auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (error) throw new Error('درخواست بازیابی ارسال نشد. کمی بعد دوباره تلاش کن.');
    },
    async updatePassword(password) {
      const { error } = await requireClient().auth.updateUser({ password });
      if (error) throw new Error('تغییر رمز انجام نشد. لینک بازیابی را دوباره باز کن.');
    },
    finishPasswordRecovery() {
      setSnapshot(current => ({ ...current, recoveryRequired: false }));
    },
    async signOut() {
      queryClient.clear();
      const { error } = await requireClient().auth.signOut({ scope: 'local' });
      if (error) throw new Error('خروج کامل نشد. دوباره تلاش کن.');
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
