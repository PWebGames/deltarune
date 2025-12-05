const CACHE_NAME = "game-cache-v1";

// Patterns you want to cache (recursive)
const CACHE_EXTENSIONS = [
  ".html", ".js", ".json", ".wasm", ".data", ".svg", ".png", ".jpg", ".jpeg",
  ".mp3", ".ogg", ".wav"
];

// Try to cache a URL only if extension matches
function shouldCache(url) {
  return CACHE_EXTENSIONS.some(ext => url.endsWith(ext));
}

self.addEventListener("install", event => {
  // Skip waiting so updated SW activates instantly
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

// Cache-first strategy
self.addEventListener("fetch", event => {
  const url = event.request.url;

  if (!shouldCache(url)) {
    return; // don't cache unneeded files
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const cached = await cache.match(event.request);
      if (cached) return cached;

      try {
        const response = await fetch(event.request);
        cache.put(event.request, response.clone());
        return response;
      } catch (e) {
        return cached || Response.error();
      }
    })
  );
});
