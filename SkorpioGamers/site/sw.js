const CACHE_NAME = "skorpio-cache-v1";
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/assets/style.css",
  "/deals.json"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});
