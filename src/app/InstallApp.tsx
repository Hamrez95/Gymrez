import { useEffect, useState } from 'react';
import { Button } from '../shared/design/components';
type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [online, setOnline] = useState(() => navigator.onLine);
  const [update, setUpdate] = useState<ServiceWorker | null>(null);
  useEffect(() => {
    const show = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const connected = () => setOnline(navigator.onLine);
    window.addEventListener('beforeinstallprompt', show);
    window.addEventListener('online', connected);
    window.addEventListener('offline', connected);
    let disposed = false;
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      void navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js', { scope: import.meta.env.BASE_URL }).then(registration => {
        if (disposed) return;
        if (registration.waiting && navigator.serviceWorker.controller) setUpdate(registration.waiting);
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          worker?.addEventListener('statechange', () => { if (!disposed && worker.state === 'installed' && navigator.serviceWorker.controller) setUpdate(worker); });
        });
      }).catch(() => { /* Normal web use remains available when installation is unsupported. */ });
    }
    return () => { disposed = true; window.removeEventListener('beforeinstallprompt', show); window.removeEventListener('online', connected); window.removeEventListener('offline', connected); };
  }, []);
  async function install() {
    if (!prompt) return;
    await prompt.prompt(); await prompt.userChoice; setPrompt(null);
  }
  return <>
    {!online && <div className="pace-connection-banner" role="status">اینترنت قطع است. ذخیره‌های محلی روی دستگاه می‌مانند؛ ارسال به سرور به اتصال نیاز دارد.</div>}
    {prompt && <div className="pace-install-bar"><span>Gymrez همیشه دم دستت</span><Button type="button" variant="secondary" onClick={() => void install()}>نصب روی گوشی</Button></div>}
    {update && <div className="pace-install-bar"><span>نسخهٔ تازه آماده است. پس از ذخیرهٔ تمرین به‌روز کن.</span><Button type="button" onClick={() => { navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true }); update.postMessage('SKIP_WAITING'); }}>به‌روزرسانی</Button></div>}
  </>;
}
