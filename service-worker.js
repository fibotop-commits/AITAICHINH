// Service worker tối giản — đủ để app cài được (installable) + load nhanh lần sau.
// KHÔNG cache API giá/tin tức (luôn lấy dữ liệu mới nhất).
const CACHE = "marketai-v1";
const SHELL = ["./index.html", "./manifest.json", "./icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // Dữ liệu động (API, Worker, fonts) -> luôn lấy từ mạng, không cache
  const isDynamic = /binance|coingecko|gold-api|googleapis|workers\.dev/.test(url.host);
  if (isDynamic) {
    e.respondWith(fetch(e.request).catch(() => new Response("{}", { headers: { "Content-Type": "application/json" } })));
    return;
  }
  // App shell -> cache-first
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
