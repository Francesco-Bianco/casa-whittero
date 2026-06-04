// Cambia questo numero ogni volta che aggiorni i file
const CACHE_VERSION = 'v3';
const CACHE_NAME = 'casa-whittero-' + CACHE_VERSION;

const ASSETS = [
  '/casa-whittero/index.html',
  '/casa-whittero/manifest.json',
  '/casa-whittero/icon-192.png',
  '/casa-whittero/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting(); // forza attivazione immediata
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // prende controllo di tutte le tab aperte subito
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('firebase') || e.request.url.includes('googleapis') || e.request.url.includes('gstatic')) {
    return;
  }
  e.respondWith(
    // Network first: prova sempre la rete, usa cache solo se offline
    fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
