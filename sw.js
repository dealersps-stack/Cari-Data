var CACHE = 'cari-lead-v1';
var SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

// Jaringan dulu supaya versi baru langsung terpakai; cache hanya cadangan saat offline.
// Panggilan ke Apps Script (domain lain) tidak pernah disimpan.
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(r).then(function (res) {
      var salinan = res.clone();
      caches.open(CACHE).then(function (c) { c.put(r, salinan); });
      return res;
    }).catch(function () { return caches.match(r); })
  );
});
