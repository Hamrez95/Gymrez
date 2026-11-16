import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';
import { buildPasswordRecoveryRedirectUrl } from '../../app/config';
import { runtimeConfig, supabaseClient } from '../../data/supabase/client';

type AuthStatus = 'loading' | 'signedOut' | 'signedIn' | 'unavailable';
type AuthSnapshot = { status: AuthStatus; session: Session | null; recoveryRequired: boolean };
type AuthContextValue = AuthSnapshot & {
  userId: string | null;
  email: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  finishPasswordRecovery: () => void;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

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
      const redirectTo = buildPasswordRecoveryRedirectUrl(window.location.origin, runtimeConfig);
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

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
