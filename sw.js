/* QG Los Santos — service worker : le site marche hors connexion.
   La page est toujours rechargée depuis le réseau quand c'est possible,
   donc une mise à jour poussée sur GitHub arrive au prochain lancement. */
const CACHE = 'qg-ls-v2';
const ASSETS = ['./', 'index.html', 'data.js', 'app.js', 'bonus.json', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Page : réseau d'abord, copie en cache, sinon la dernière version connue
  if (req.mode === 'navigate'){
    e.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put('index.html', copy)); return res; })
        .catch(() => caches.match('index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  // Code du site et bonus : réseau d'abord (pour recevoir les mises à jour), cache si hors ligne
  if (url.origin === self.location.origin && /\/(app\.js|data\.js|bonus\.json)$/.test(url.pathname)){
    const key = url.pathname.split('/').pop();
    e.respondWith(
      fetch(req)
        .then(res => { if (res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); } return res; })
        .catch(() => caches.match(key))
    );
    return;
  }

  // Icônes, manifeste et polices : cache d'abord, rafraîchi en arrière-plan
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin === self.location.origin || fonts){
    e.respondWith(
      caches.match(req).then(hit => {
        const net = fetch(req).then(res => {
          if (res && (res.ok || res.type === 'opaque')){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    );
  }
});
