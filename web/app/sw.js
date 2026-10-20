// 開いた瞬間に表示できるよう、キャッシュを先に返し、裏で最新版に差し替える
const CACHE = 'just-start-app-v1';
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  '../icon-192.png',
  '../icon-512.png',
  '../apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

// 古い版のキャッシュを消す。komkpl.github.io は同じアカウントのほかのサイトとも共有なので、
// このアプリのもの（just-start-）だけを対象にする
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('just-start-') && k !== CACHE).map((k) => caches.delete(k)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    const hit = await cache.match(e.request, { ignoreSearch: true });
    const fresh = fetch(e.request)
      .then((res) => {
        if (res.ok) cache.put(e.request, res.clone());
        return res;
      })
      .catch(() => hit);
    if (!hit) return fresh;
    e.waitUntil(fresh);
    return hit;
  }));
});
