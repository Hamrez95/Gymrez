export type RuntimeEnvironment = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  VITE_AUTH_REDIRECT_ORIGINS?: string;
  DEV?: boolean;
};

export type DataMode =
  | {
      mode: 'supabase';
      url: string;
      publishableKey: string;
      authRedirectOrigins: readonly string[];
    }
  | { mode: 'unavailable'; reason: string };

const DEVELOPMENT_REDIRECT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

function safeSupabaseUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const isLocal = url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if ((!isLocal && url.protocol !== 'https:') || url.pathname !== '/' || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

function isPublishableOrAnonKey(value: string): boolean {
  if (value.startsWith('sb_publishable_')) return true;
  const parts = value.split('.');
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(atob(parts[1]!.replace(/-/g, '+').replace(/_/g, '/'))) as { role?: unknown };
    return payload.role === 'anon';
  } catch {
    return false;
  }
}

function parseRedirectOrigins(value: string | undefined, isDevelopment: boolean): string[] {
  const candidates = value
    ? value.split(',').map(item => item.trim()).filter(Boolean)
    : isDevelopment ? DEVELOPMENT_REDIRECT_ORIGINS : [];
  const origins = new Set<string>();
  for (const candidate of candidates) {
    try {
      const url = new URL(candidate);
      const isLocal = url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
      if ((url.protocol !== 'https:' && !isLocal) || url.pathname !== '/' || url.search || url.hash) continue;
      origins.add(url.origin);
    } catch {
      continue;
    }
  }
  return [...origins];
}

export function resolveDataMode(env: RuntimeEnvironment = import.meta.env): DataMode {
  const urlValue = env.VITE_SUPABASE_URL?.trim() ?? '';
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';
  if (!urlValue || !key) {
    return { mode: 'unavailable', reason: 'برای فعال شدن ورود، نشانی Supabase و کلید publishable باید در تنظیمات محیط برنامه قرار بگیرند.' };
  }
  const url = safeSupabaseUrl(urlValue);
  if (!url || !isPublishableOrAnonKey(key)) {
    return { mode: 'unavailable', reason: 'تنظیمات Supabase معتبر نیست. فقط URL پروژه و کلید publishable یا anon مجاز است.' };
  }
  return {
    mode: 'supabase',
    url,
    publishableKey: key,
    authRedirectOrigins: parseRedirectOrigins(env.VITE_AUTH_REDIRECT_ORIGINS, env.DEV === true),
  };
}

export function buildPasswordRecoveryRedirectUrl(origin: string, mode: DataMode): string | null {
  if (mode.mode !== 'supabase') return null;
  try {
    const parsed = new URL(origin);
    if (parsed.origin !== origin || !mode.authRedirectOrigins.includes(parsed.origin)) return null;
    const recoveryUrl = new URL('/login?flow=recovery', parsed.origin);
    return recoveryUrl.toString();
  } catch {
    return null;
  }
}
