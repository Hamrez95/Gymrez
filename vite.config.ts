import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), tailwindcss(), {
    name: 'gymrez-private-shell-cache',
    generateBundle(_options, bundle) {
      const base = process.env.VITE_BASE_PATH || '/';
      const assets = Object.keys(bundle).filter(path => !path.endsWith('.map')).map(path => base + path);
      const version = Object.keys(bundle).find(path => path.startsWith('assets/index-') && path.endsWith('.js')) || 'shell';
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: `
const CACHE = 'gymrez-shell-${version}';
const BASE = ${JSON.stringify(base)};
const ASSETS = ${JSON.stringify(assets)};
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll([...ASSETS,BASE,BASE+'icon-192.png',BASE+'icon-512.png',BASE+'manifest.webmanifest']))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('gymrez-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('message', event => { if(event.data === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', event => {
 if(event.request.method !== 'GET') return;
 const url = new URL(event.request.url);
 if(url.origin !== self.location.origin) return;
 if(event.request.mode === 'navigate') {
  event.respondWith(fetch(event.request).catch(() => caches.open(CACHE).then(cache => cache.match(BASE))));
 } else if(ASSETS.includes(url.pathname)) {
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
 }
});
` });
    },
  }],
  test: { environment: 'node', include: ['tests/unit/**/*.test.ts'] },
});
