const PREFIJO_CACHE = "mi-tiempo-";
const CACHE_NAME = `${PREFIJO_CACHE}v10`;

const ARCHIVOS = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./iconos.js",
    "./manifest.json",
    "./icon-180.png",
    "./icon-192.png",
    "./icon-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ARCHIVOS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(nombres => Promise.all(
                nombres
                    // Solo versiones antiguas de ESTA app; nunca la actual.
                    .filter(nombre =>
                        nombre.startsWith(PREFIJO_CACHE) &&
                        nombre !== CACHE_NAME
                    )
                    .map(nombre => caches.delete(nombre))
            ))
            .then(() => self.clients.claim())
    );
});

function guardar(peticion, respuesta) {
    if (!respuesta || !respuesta.ok) {
        return Promise.resolve();
    }

    return caches.open(CACHE_NAME)
        .then(cache => cache.put(peticion, respuesta))
        .catch(() => {});
}

function esVideo(peticion, url) {
    return (
        peticion.destination === "video" ||
        peticion.headers.has("range") ||
        url.pathname.endsWith(".mp4")
    );
}

self.addEventListener("fetch", event => {
    const peticion = event.request;

    if (peticion.method !== "GET") {
        return;
    }

    const url = new URL(peticion.url);

    // La API del tiempo y cualquier otro origen: sin interceptar.
    if (url.origin !== self.location.origin) {
        return;
    }

    // Vídeos: los gestiona el navegador (peticiones Range, ficheros grandes).
    if (esVideo(peticion, url)) {
        return;
    }

    // Páginas: red primero; sin conexión, la copia guardada.
    if (peticion.mode === "navigate") {
        event.respondWith(
            fetch(peticion)
                .then(respuesta => {
                    event.waitUntil(guardar(peticion, respuesta.clone()));
                    return respuesta;
                })
                .catch(() =>
                    caches.match(peticion, { ignoreSearch: true })
                        .then(enCache =>
                            enCache || caches.match("./index.html")
                        )
                )
        );
        return;
    }

    // Resto (css, js, iconos…): copia guardada al instante y se actualiza detrás.
    event.respondWith(
        caches.match(peticion).then(enCache => {
            const red = fetch(peticion).then(respuesta => {
                event.waitUntil(guardar(peticion, respuesta.clone()));
                return respuesta;
            });

            if (enCache) {
                event.waitUntil(red.catch(() => {}));
                return enCache;
            }

            return red;
        })
    );
});