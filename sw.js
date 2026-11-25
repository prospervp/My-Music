/* Service worker: makes the app installable and lets it open without a connection.
 * App files: network first (so updates arrive), falling back to the saved copy when offline.
 * Editing engine (large): saved the first time it's used, then served from the saved copy. */
const VERSION = 'v2';
const SHELL_CACHE = 'mmp-shell-' + VERSION;
const ENGINE_CACHE = 'mmp-engine-1';
const SHELL = [
  './', 'index.html', 'styles.css', 'app.js', 'drive.js', 'editor.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon.png',
  'vendor/ffmpeg/ffmpeg.js', 'vendor/ffmpeg/814.ffmpeg.js',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key !== SHELL_CACHE && key !== ENGINE_CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Google sign-in / Drive requests go straight to the network
  if (url.pathname.includes('/vendor/ffmpeg/ffmpeg-core')) {
    event.respondWith(cacheFirst(req, ENGINE_CACHE));
    return;
  }
  event.respondWith(networkFirst(req));
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req, { ignoreSearch: true });
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

async function networkFirst(req) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const res = await Promise.race([
      fetch(req),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ]);
    if (res.ok && res.type === 'basic') cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') {
      const index = await cache.match('index.html');
      if (index) return index;
    }
    throw err;
  }
}
