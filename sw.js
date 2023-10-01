self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    return event.respondWith(
        caches.open('cache').then(cache => {
            return fetch(event.request, { cache: 'no-cache' }).then(response => {
                if (event.request.url.startsWith('https')) {
                    cache.put(event.request, response.clone());
                }

                return response;
            }).catch(() => {
                return caches.match(event.request).then(response => {
                    return response || new Response('No internet connection', { status: 503, statusText: 'Service Unavailable' });
                });
            });
        })
    );
});
