const CACHE_NAME = 'mergiy-game-v1';
const urlsToCache = [
  '/Mergiy/',
  '/Mergiy/index.html',
  '/Mergiy/style.css',
  '/Mergiy/script.js',
  '/Mergiy/howler.js',
  '/Mergiy/End.wav',
  '/Mergiy/Coin.wav',
  '/Mergiy/Birds.wav',
  '/Mergiy/Boost.wav',
  '/Mergiy/Background.jpeg',
  '/Mergiy/Supermushroom.png',
  '/Mergiy/icon-192x192.png',
  '/Mergiy/icon-512x512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});