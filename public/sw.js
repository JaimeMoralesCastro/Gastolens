const CACHE = 'gastolens-v5';
const PRECACHE = ['/', '/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Share Target: recibe archivo compartido desde otra app
self.addEventListener('fetch', e => {
  if (e.request.method === 'POST' && new URL(e.request.url).pathname === '/share-target') {
    e.respondWith((async () => {
      const fd = await e.request.formData();
      const file = fd.get('file');
      if (file) {
        const buf = await file.arrayBuffer();
        // Guardar en cache temporal para que la app lo lea
        const cache = await caches.open('gastolens-share');
        await cache.put('pending-file', new Response(buf, {
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
            'X-File-Name': file.name,
          }
        }));
      }
      return Response.redirect('/?import=1', 303);
    })());
    return;
  }
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Solo cachear recursos del propio dominio (nunca APIs externas como Supabase)
  if (url.origin !== self.location.origin) return;

  // HTML (navegación) → red primero para evitar versión desactualizada
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Assets estáticos con hash (JS, CSS, imágenes) → cache primero
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});
