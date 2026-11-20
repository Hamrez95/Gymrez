import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), tailwindcss(), {
    name: 'gymrez-private-shell-cache',
    generateBundle(_options, bundle) {
      const base = process.env.VITE_BASE_PATH || '/';
      const assets = [...Object.keys(bundle).filter(path => !path.endsWith('.map')).map(path => base + path), ...['icon.svg', 'icon-192.png', 'icon-512.png', 'manifest.webmanifest'].map(path => base + path)];
      const version = Object.keys(bundle).find(path => path.startsWith('assets/index-') && path.endsWith('.js')) || 'shell';
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: `
const CACHE = 'gymrez-shell-v2-${version}';
const BASE = ${JSON.stringify(base)};
const ASSETS = ${JSON.stringify(assets)};
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll([...ASSETS,BASE]))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('gymrez-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('message', event => { if(event.data === 'SKIP_WAITING') self.skipWaiting(); });
const cachedShell = () => caches.open(CACHE).then(cache => cache.match(BASE, {ignoreVary:true})).then(response => response || new Response('برای دریافت اولیهٔ اپ به اینترنت وصل شو.', {status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}}));
self.addEventListener('fetch', event => {
 if(event.request.method !== 'GET') return;
 const url = new URL(event.request.url);
 if(url.origin !== self.location.origin) return;
 if(event.request.mode === 'navigate') {
  event.respondWith(fetch(event.request).then(response => response.ok ? response : cachedShell()).catch(cachedShell));
 } else if(ASSETS.includes(url.pathname)) {
  // Only immutable public shell assets are eligible; API/auth/media requests never enter this cache.
  // CORS Vary: Origin can differ between precache fetches and module/style requests.
  event.respondWith(caches.open(CACHE).then(cache => cache.match(event.request, {ignoreVary:true})).then(cached => cached || fetch(event.request)));
 }
});
` });
    },
  }],
  test: { environment: 'node', include: ['tests/unit/**/*.test.ts'] },
});
