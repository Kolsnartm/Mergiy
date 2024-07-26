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
  '/Mergiy/icon-512x512.png',
  // Файли з папки elements:
  '/Mergiy/elements/O4.PNG',
  '/Mergiy/elements/O3.PNG',
  '/Mergiy/elements/O2.PNG',
  '/Mergiy/elements/M8.PNG',
  '/Mergiy/elements/O1.PNG',
  '/Mergiy/elements/E5.PNG',
  '/Mergiy/elements/E4.PNG',
  '/Mergiy/elements/E6.PNG',
  '/Mergiy/elements/E3.PNG',
  '/Mergiy/elements/E2.PNG',
  '/Mergiy/elements/E1.PNG',
  '/Mergiy/elements/S1.PNG',
  '/Mergiy/elements/Ui2.PNG',
  '/Mergiy/elements/S2.PNG',
  '/Mergiy/elements/Ui1.PNG',
  '/Mergiy/elements/M4.PNG',
  '/Mergiy/elements/M5.PNG',
  '/Mergiy/elements/M7.PNG',
  '/Mergiy/elements/M6.PNG',
  '/Mergiy/elements/M2.PNG',
  '/Mergiy/elements/M3.PNG',
  '/Mergiy/elements/charWizard.PNG',
  '/Mergiy/elements/M1.PNG',
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
