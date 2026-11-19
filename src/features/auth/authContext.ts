import { createContext } from 'react';
import type { Session } from '@supabase/supabase-js';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn' | 'unavailable';
export type AuthSnapshot = { status: AuthStatus; session: Session | null; recoveryRequired: boolean; connectionError?: string };
export type AuthContextValue = AuthSnapshot & {
  userId: string | null;
  email: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  finishPasswordRecovery: () => void;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
