// 以前はトップにアプリがあり、このService Workerがトップ全体をキャッシュしていた。
// アプリは app/ に移したので、古い版を入れていた端末ではここで後片付けをする：
// 古いキャッシュを消し、自分の登録を外し、開いているページを読み込み直す（トップは紹介ページになる）
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    await caches.delete('just-start-v1');
    await self.registration.unregister();
    const pages = await self.clients.matchAll({ type: 'window' });
    for (const page of pages) page.navigate(page.url);
  })());
});
