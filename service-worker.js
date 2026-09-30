const CACHE_NAME = "mi-tiempo-v6";

const ARCHIVOS = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];

self.addEventListener(
    "install",
    event => {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then(cache => {
                    return cache.addAll(
                        ARCHIVOS
                    );
                })
        );

        self.skipWaiting();
    }
);

self.addEventListener(
    "activate",
    event => {
        event.waitUntil(
            caches.keys()
                .then(cacheNames => {
                    return Promise.all(
                        cacheNames
                            .filter(
                                cacheName =>
                                    cacheName !==
                                    CACHE_NAME
                            )
                            .map(
                                cacheName =>
                                    caches.delete(
                                        cacheName
                                    )
                            )
                    );
                })
                .then(() => {
                    return self.clients.claim();
                })
        );
    }
);

self.addEventListener(
    "fetch",
    event => {
        if (
            event.request.method !==
            "GET"
        ) {
            return;
        }

        const url =
            new URL(
                event.request.url
            );

        if (
            url.origin !==
            self.location.origin
        ) {
            return;
        }

        event.respondWith(
            fetch(event.request)
                .then(response => {

                    if (
                        response &&
                        response.status === 200
                    ) {
                        const copia =
                            response.clone();

                        caches.open(
                            CACHE_NAME
                        ).then(cache => {
                            cache.put(
                                event.request,
                                copia
                            );
                        });
                    }

                    return response;

                })
                .catch(() => {
                    return caches.match(
                        event.request
                    );
                })
        );
    }
);