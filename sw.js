// LinguaAgent Service Worker — offline + cache statyków (PWA).
// index.html: network-first (świeża wersja gdy online, cache gdy offline).
// CDN/fonty: cache-first z odświeżeniem w tle.
// API (OpenAI/Gemini/ElevenLabs/Drive/YouTube/worker): NIE dotykamy — zawsze sieć.
const VERSION = "v2-2026-07-07";
const PRECACHE = "lingua-precache-" + VERSION;
const RUNTIME = "lingua-runtime-" + VERSION;
const PRECACHE_URLS = ["./", "./index.html", "./transkryptor.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-180.png"];
const API_HOSTS = [
  "api.openai.com", "api.elevenlabs.io", "api.anthropic.com",
  "generativelanguage.googleapis.com", "www.googleapis.com",
  "accounts.google.com", "oauth2.googleapis.com",
  "www.youtube.com", "youtube.com"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(PRECACHE).then((c) => c.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== PRECACHE && k !== RUNTIME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (API_HOSTS.includes(url.host) || url.host.endsWith(".workers.dev")) return;

  if (url.origin === location.origin) {
    // Network-first: aktualizacje z GitHub Pages wchodzą od razu, offline działa z cache
    e.respondWith(
      fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(PRECACHE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() =>
        caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match("./index.html"))
      )
    );
    return;
  }

  // CDN (pdf.js, heic2any, Google Fonts): cache-first, odświeżenie w tle
  e.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(RUNTIME).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
