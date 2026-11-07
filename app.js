const clima = {
    0: ["Despejado", "☀", "soleado"],
    1: ["Principalmente despejado", "◐", "soleado"],
    2: ["Parcialmente nublado", "◐", "nublado"],
    3: ["Nublado", "☁", "nublado"],
    45: ["Niebla", "≋", "nublado"],
    48: ["Niebla", "≋", "nublado"],
    51: ["Llovizna ligera", "☂", "lluvia"],
    53: ["Llovizna", "☂", "lluvia"],
    55: ["Llovizna intensa", "☂", "lluvia"],
    56: ["Llovizna helada", "❄", "nieve"],
    57: ["Llovizna helada intensa", "❄", "nieve"],
    61: ["Lluvia ligera", "☂", "lluvia"],
    63: ["Lluvia", "☂", "lluvia"],
    65: ["Lluvia intensa", "☂", "lluvia"],
    66: ["Lluvia helada", "❄", "nieve"],
    67: ["Lluvia helada intensa", "❄", "nieve"],
    71: ["Nieve ligera", "❄", "nieve"],
    73: ["Nieve", "❄", "nieve"],
    75: ["Nieve intensa", "❄", "nieve"],
    77: ["Granos de nieve", "❄", "nieve"],
    80: ["Chubascos ligeros", "☂", "lluvia"],
    81: ["Chubascos", "☂", "lluvia"],
    82: ["Chubascos intensos", "☂", "tormenta"],
    85: ["Chubascos de nieve", "❄", "nieve"],
    86: ["Chubascos de nieve intensos", "❄", "nieve"],
    95: ["Tormenta", "ϟ", "tormenta"],
    96: ["Tormenta con granizo", "ϟ", "tormenta"],
    99: ["Tormenta fuerte", "ϟ", "tormenta"]
};

const videos = {
    soleado: "videos/soleado.mp4",
    nublado: "videos/nublado.mp4",
    lluvia: "videos/lluvia.mp4",
    tormenta: "videos/tormenta.mp4",
    nieve: "videos/nieve.mp4",
    noche: "videos/noche.mp4"
};

const frasesAmor = [
    "Carolina te como la cara.",
    "Mas guapa y te meten en un museo <3.",
    "Alerta meteorológica: muchas ganas de verte.",
    "Da igual el tiempo que haga, siempre estas radiante.",
    "Tengo una cajita de besos para tí.",
    "Recuerda darle un kiss a tu noviecito.",
    "Hoy hace un dia perfecto pa ver Crepusculo, ¿no?.",
    "Hoy me gustas más, mañana más todavía y, ¿pasado?, MáS.",
    "Kike te echa de menos <3.",
    "Que tengas un hermoso día churri <3.",
    "Avisos para el resto del día, Kike te ama.",
    "Cuidado si hace calor que te derrites, bombom.",
    "Procura no opacar al Lorenzo cuando salgas a la calle.",
    "All the times in the wedour o algo asi dice la Clove.",
    "Tiempo perfecto para un café con el amor de mi vidita.",
    "Te deseo lo mejor del mundo.",
    "Te quiero mas que la trucha al trucho, trucha mía.",
    "Parte meteorológico: la carol esta tope buena.",
    "El cielo es bonito hoy, la Carol más todavía.",
    "Si lees esto, me debes un beso.",
    "Café y mirarte todo el día.",
    "Predicción de lluvia de besos.",
    "Alerta medusil.",
    "Que bien tienes el maquillaje hoy.",
    "Tu sonrisa es hermosa.",
    "Pronóstico para hoy: Carol guapísima, como de costumbre.",
    "Kike está loquito por ti <3.",
    "¿Sabes qué queda mejor que un atardecer? Tú."
];

let videoActual = "";

let indiceFrase = Math.floor(
    Math.random() * frasesAmor.length
);

function poner(id, texto) {
    document.getElementById(id).textContent = texto;
}

// La API puede devolver null en algunos campos: se muestra un guion
// en lugar de "NaN", "null%" o un 0 inventado.
function formatearNumero(valor, sufijo = "", vacio = null) {
    if (typeof valor === "number" && Number.isFinite(valor)) {
        return `${Math.round(valor)}${sufijo}`;
    }

    return vacio !== null ? vacio : `--${sufijo}`;
}

function formatearKilometros(metros) {
    if (typeof metros === "number" && Number.isFinite(metros)) {
        return `${(metros / 1000).toFixed(1)} km`;
    }

    return "-- km";
}

const CIUDAD_POR_DEFECTO = "Leganés, Madrid";
const CLAVE_CIUDAD = "tiempo.ciudad";
const CLAVE_ULTIMO = "tiempo.ultimo";

const TIEMPO_MAXIMO_MS = 10000;
const REFRESCO_PERIODICO_MS = 30 * 60 * 1000;
const REFRESCO_AL_VOLVER_MS = 10 * 60 * 1000;
const COMPROBACION_MS = 5 * 60 * 1000;

// Errores con un mensaje ya pensado para mostrar a la persona.
class ErrorAplicacion extends Error {}

let lugarActual = null;
let datosDeCache = false;
let ultimaActualizacion = 0;
let controladorActual = null;

function leerGuardado(clave) {
    try {
        return localStorage.getItem(clave);
    } catch (error) {
        return null;
    }
}

function escribirGuardado(clave, valor) {
    try {
        localStorage.setItem(clave, valor);
    } catch (error) {
        // Modo privado o sin espacio: la app funciona igual, sin recordar.
    }
}

function leerJSONGuardado(clave) {
    try {
        const texto = leerGuardado(clave);

        return texto ? JSON.parse(texto) : null;
    } catch (error) {
        return null;
    }
}

function normalizar(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim();
}

function describirAntiguedad(instante) {
    const minutos = Math.max(
        0,
        Math.round((Date.now() - instante) / 60000)
    );

    if (minutos < 60) {
        return `hace ${Math.max(1, minutos)} min`;
    }

    const horas = Math.round(minutos / 60);

    if (horas < 24) {
        return `hace ${horas} h`;
    }

    return `hace ${Math.round(horas / 24)} d`;
}

async function pedirJSON(url, signal, mensajeFallo) {
    let respuesta;

    try {
        respuesta = await fetch(url, { signal });
    } catch (error) {
        if (error.name === "AbortError") {
            throw error;
        }

        throw new ErrorAplicacion("Sin conexión a internet.");
    }

    if (!respuesta.ok) {
        throw new ErrorAplicacion(mensajeFallo);
    }

    return respuesta.json();
}

// "Leganés, Madrid": la API busca por nombre, así que lo que va después de la
// coma se usa para elegir entre ciudades con el mismo nombre.
function elegirLugar(resultados, calificador) {
    if (calificador) {
        const coincidencia = resultados.find(lugar =>
            normalizar(
                [
                    lugar.admin1,
                    lugar.admin2,
                    lugar.admin3,
                    lugar.country,
                    lugar.country_code
                ]
                    .filter(Boolean)
                    .join(" ")
            ).includes(calificador)
        );

        if (coincidencia) {
            return coincidencia;
        }
    }

    return resultados[0];
}

async function geocodificar(texto, signal) {
    const [nombre, ...resto] = texto.split(",");
    const buscado = nombre.trim();
    const calificador = normalizar(resto.join(" "));

    if (buscado === "") {
        throw new ErrorAplicacion("No se ha encontrado esa ciudad.");
    }

    const datos = await pedirJSON(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(buscado)}&count=10&language=es&format=json`,
        signal,
        "No se ha podido buscar la ciudad."
    );

    if (!datos.results || datos.results.length === 0) {
        throw new ErrorAplicacion("No se ha encontrado esa ciudad.");
    }

    return elegirLugar(datos.results, calificador);
}

async function cargarTiempo(lugar, signal) {
    const url =
        `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${lugar.latitude}` +
        `&longitude=${lugar.longitude}` +
        `&current=` +
        `temperature_2m,` +
        `relative_humidity_2m,` +
        `apparent_temperature,` +
        `is_day,` +
        `weather_code,` +
        `pressure_msl,` +
        `wind_speed_10m,` +
        `wind_direction_10m,` +
        `wind_gusts_10m,` +
        `visibility` +
        `&hourly=` +
        `temperature_2m,` +
        `precipitation_probability,` +
        `weather_code,` +
        `is_day` +
        `&daily=` +
        `weather_code,` +
        `temperature_2m_max,` +
        `temperature_2m_min,` +
        `precipitation_probability_max,` +
        `sunrise,` +
        `sunset` +
        `&timezone=auto` +
        `&forecast_days=7`;

    const datos = await pedirJSON(
        url,
        signal,
        "No se ha podido obtener el tiempo."
    );

    mostrarTiempo(lugar, datos);

    lugarActual = {
        name: lugar.name,
        latitude: lugar.latitude,
        longitude: lugar.longitude
    };

    datosDeCache = false;
    ultimaActualizacion = Date.now();

    mostrarError("");

    // Copia para arrancar al instante y para cuando no haya conexión.
    escribirGuardado(
        CLAVE_ULTIMO,
        JSON.stringify({
            lugar: lugarActual,
            datos,
            guardadoEn: ultimaActualizacion
        })
    );
}

function pintarGuardado(guardado) {
    try {
        mostrarTiempo(guardado.lugar, guardado.datos);
    } catch (error) {
        console.error("Los datos guardados no son válidos:", error);
        return false;
    }

    lugarActual = guardado.lugar;
    datosDeCache = true;
    ultimaActualizacion = Number(guardado.guardadoEn) || 0;

    return true;
}

function tratarError(error, agotado, silenciosa) {
    if (silenciosa) {
        console.log("No se ha podido actualizar:", error);
        return;
    }

    let mensaje;

    if (agotado) {
        mensaje = "La conexión va muy lenta. Inténtalo de nuevo.";
    } else if (error instanceof ErrorAplicacion) {
        mensaje = error.message;
    } else {
        console.error(error);
        mensaje = "Algo ha fallado al mostrar el tiempo.";
    }

    if (datosDeCache) {
        mensaje += ` Mostrando datos de ${describirAntiguedad(ultimaActualizacion)}.`;
    }

    mostrarError(mensaje);
}

// Ejecuta una tarea de red cancelando la anterior (para que una respuesta
// lenta no pise a una búsqueda más reciente) y con un tiempo máximo.
async function conControl(tarea, { silenciosa = false } = {}) {
    if (controladorActual) {
        controladorActual.abort();
    }

    const controlador = new AbortController();

    controladorActual = controlador;

    let agotado = false;

    const temporizador = setTimeout(() => {
        agotado = true;
        controlador.abort();
    }, TIEMPO_MAXIMO_MS);

    try {
        if (!silenciosa) {
            mostrarError("");
        }

        await tarea(controlador.signal);
    } catch (error) {
        // Cancelada por otra búsqueda más nueva: no hay nada que contar.
        if (error.name === "AbortError" && !agotado) {
            return;
        }

        tratarError(error, agotado, silenciosa);
    } finally {
        clearTimeout(temporizador);

        if (controladorActual === controlador) {
            controladorActual = null;
        }
    }
}

function buscarCiudad(ciudad) {
    return conControl(async signal => {
        const lugar = await geocodificar(ciudad, signal);

        await cargarTiempo(lugar, signal);

        escribirGuardado(CLAVE_CIUDAD, ciudad);
    });
}

function refrescarSiHaceFalta(minimoMs) {
    if (!lugarActual || controladorActual) {
        return;
    }

    if (Date.now() - ultimaActualizacion < minimoMs) {
        return;
    }

    conControl(
        signal => cargarTiempo(lugarActual, signal),
        { silenciosa: true }
    );
}

function mostrarTiempo(lugar, datos) {
    const actual = datos.current;
    const diario = datos.daily;
    const horario = datos.hourly;

    const informacion = obtenerInformacionClima(
        actual.weather_code,
        actual.is_day
    );

    poner("nombreCiudad", lugar.name);
    poner("temperatura", formatearNumero(actual.temperature_2m, "°"));
    poner("descripcion", informacion[0]);
    poner("sensacion", formatearNumero(actual.apparent_temperature, "°"));
    poner("humedad", formatearNumero(actual.relative_humidity_2m, "%"));
    poner("viento", formatearNumero(actual.wind_speed_10m, " km/h"));
    poner("direccionViento", obtenerDireccionViento(actual.wind_direction_10m));
    poner("rachas", formatearNumero(actual.wind_gusts_10m, " km/h"));
    poner("visibilidad", formatearKilometros(actual.visibility));
    poner("presion", formatearNumero(actual.pressure_msl, " hPa"));
    poner("maxima", formatearNumero(diario.temperature_2m_max[0], "°"));
    poner("minima", formatearNumero(diario.temperature_2m_min[0], "°"));
    poner("amanecer", formatearHora(diario.sunrise[0]));
    poner("atardecer", formatearHora(diario.sunset[0]));

    actualizarFecha(datos.timezone);

    cambiarAmbiente(
        informacion[2],
        actual.is_day
    );

    mostrarHoras(horario, actual);

    mostrarPrevision(diario);
}

function obtenerInformacionClima(codigo, esDeDia) {
    const informacion =
        clima[codigo] ||
        ["Desconocido", "•", "nublado"];

    if (!esDeDia) {
        if (codigo === 0) {
            return ["Despejado", "☾", "noche"];
        }

        if (codigo === 1) {
            return ["Principalmente despejado", "☾", "noche"];
        }

        if (codigo === 2) {
            return ["Parcialmente nublado", "☾", "noche"];
        }

        if (codigo === 3) {
            return ["Nublado", "☁", "noche"];
        }
    }

    return informacion;
}

function mostrarHoras(horario, actual) {
    const contenedor = document.getElementById("horas");

    contenedor.innerHTML = "";

    // La API da la hora actual con minutos (09:15) y las franjas en punto
    // (09:00). Se redondea hacia abajo para que "Ahora" sea la franja en curso
    // y no la siguiente.
    const horaEnPunto = actual.time.slice(0, 13) + ":00";

    let indiceActual = horario.time.findIndex(
        hora => hora >= horaEnPunto
    );

    if (indiceActual === -1) {
        indiceActual = 0;
    }

    const limite = Math.min(
        indiceActual + 12,
        horario.time.length
    );

    for (let i = indiceActual; i < limite; i++) {
        const esAhora = i === indiceActual;

        // Para "Ahora" se usan los valores reales del momento, que coinciden
        // con el dato grande de arriba.
        const informacion = obtenerInformacionClima(
            esAhora ? actual.weather_code : horario.weather_code[i],
            esAhora ? actual.is_day : horario.is_day[i]
        );

        const temperatura = esAhora
            ? actual.temperature_2m
            : horario.temperature_2m[i];

        const div = document.createElement("div");

        div.className = "hora";

        if (esAhora) {
            div.classList.add("actual");
        }

        div.innerHTML = `
            <span class="hora-nombre">
                ${esAhora ? "Ahora" : horario.time[i].slice(11, 16)}
            </span>

            <span class="hora-icono" role="img" aria-label="${informacion[0]}">
                ${informacion[1]}
            </span>

            <span class="hora-temperatura">
                ${formatearNumero(temperatura, "°")}
            </span>

            <span class="hora-lluvia">
                ${formatearNumero(horario.precipitation_probability[i], "%", "–")}
            </span>
        `;

        contenedor.appendChild(div);
    }

    poner("horaActual", actual.time.slice(11, 16));
}

function mostrarPrevision(diario) {
    const contenedor = document.getElementById("prevision");

    contenedor.innerHTML = "";

    for (let i = 0; i < diario.time.length; i++) {
        const informacion =
            clima[diario.weather_code[i]] ||
            ["Desconocido", "•", "nublado"];

        const fecha = new Date(diario.time[i] + "T12:00:00");

        const nombre =
            i === 0
                ? "Hoy"
                : fecha.toLocaleDateString("es-ES", { weekday: "short" });

        const div = document.createElement("div");

        div.className = "dia";

        div.innerHTML = `
            <span class="dia-nombre">
                ${nombre}
            </span>

            <span class="dia-icono" role="img" aria-label="${informacion[0]}">
                ${informacion[1]}
            </span>

            <div class="dia-temperaturas">
                <span class="dia-max">
                    ${formatearNumero(diario.temperature_2m_max[i], "°")}
                </span>

                <span class="dia-min">
                    ${formatearNumero(diario.temperature_2m_min[i], "°")}
                </span>
            </div>

            <span class="dia-lluvia">
                ${formatearNumero(diario.precipitation_probability_max[i], "%", "–")}
                lluvia
            </span>
        `;

        contenedor.appendChild(div);
    }
}

function cambiarAmbiente(tipo, esDeDia) {
    const body =
        document.body;

    body.classList.remove(
        "soleado",
        "nublado",
        "lluvia",
        "tormenta",
        "nieve",
        "noche"
    );

    const ambiente =
        esDeDia
            ? tipo
            : "noche";

    body.classList.add(
        ambiente
    );

    cambiarVideo(
        ambiente
    );
}

const OPACIDAD_VIDEO = "0.72";
const VELOCIDAD_VIDEO = 0.5;

function obtenerVideo() {
    return document.getElementById("fondoVideo");
}

function movimientoReducido() {
    return (
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
}

// Atributos que antes se repetían en cada cambio de vídeo: basta con una vez.
function prepararVideo() {
    const video = obtenerVideo();

    if (!video) {
        return;
    }

    video.muted = true;
    video.defaultMuted = true;
    // El arranque lo decide reproducirVideo(): el atributo autoplay del HTML
    // ignoraría "reducir movimiento" y la app en segundo plano.
    video.autoplay = false;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");

    // load() restablece la velocidad a la "por defecto", así que se fija ahí.
    video.defaultPlaybackRate = VELOCIDAD_VIDEO;
    video.playbackRate = VELOCIDAD_VIDEO;
}

// Con la app en segundo plano o con "reducir movimiento" el vídeo no corre:
// ahorra batería y respeta la preferencia (se queda en su primer fotograma).
function reproducirVideo() {
    const video = obtenerVideo();

    if (
        !video ||
        document.visibilityState === "hidden" ||
        movimientoReducido()
    ) {
        return;
    }

    video.muted = true;

    const reproduccion = video.play();

    if (reproduccion && typeof reproduccion.catch === "function") {
        // Autoplay bloqueado (p. ej. ahorro de batería en iOS): se reintenta
        // con el primer toque, ver activarVideo().
        reproduccion.catch(() => {});
    }
}

function pausarVideo() {
    const video = obtenerVideo();

    if (video) {
        video.pause();
    }
}

function cambiarVideo(tipo) {
    const video = obtenerVideo();
    const nuevoVideo = videos[tipo];

    if (!video || !nuevoVideo || videoActual === nuevoVideo) {
        return;
    }

    videoActual = nuevoVideo;

    video.style.opacity = "0";

    video.onloadeddata = () => {
        video.style.opacity = OPACIDAD_VIDEO;
        reproducirVideo();
    };

    video.onerror = () => {
        console.error("No se ha podido cargar el vídeo:", nuevoVideo);
    };

    video.src = nuevoVideo;
    video.load();
}

function activarVideo() {
    reproducirVideo();
}

document.addEventListener(
    "pointerdown",
    activarVideo,
    {
        once: true,
        passive: true
    }
);

prepararVideo();

function obtenerDireccionViento(grados) {
    if (typeof grados !== "number" || !Number.isFinite(grados)) {
        return "--";
    }

    const direcciones = [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SO",
        "O",
        "NO"
    ];

    const indice = Math.round(grados / 45) % 8;

    return `${direcciones[indice]} · ${Math.round(grados)}°`;
}

function formatearHora(fecha) {
    return typeof fecha === "string" ? fecha.slice(11, 16) : "--:--";
}

function actualizarFecha(zona) {
    const opciones = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    const ahora = new Date();

    let texto;

    try {
        // Fecha en la zona horaria de la ciudad, no la del dispositivo.
        texto = ahora.toLocaleDateString(
            "es-ES",
            zona ? { ...opciones, timeZone: zona } : opciones
        );
    } catch (error) {
        texto = ahora.toLocaleDateString("es-ES", opciones);
    }

    poner("fecha", texto);
}

function mostrarError(mensaje) {
    document.getElementById(
        "error"
    ).textContent =
        mensaje;
}

function mostrarFraseAmor() {
    const elemento =
        document.getElementById(
            "mensajeAmor"
        );

    elemento.classList.remove(
        "animando"
    );

    void elemento.offsetWidth;

    elemento.textContent =
        frasesAmor[indiceFrase];

    elemento.classList.add(
        "animando"
    );
}

function siguienteFrase() {
    const elemento =
        document.getElementById(
            "mensajeAmor"
        );

    elemento.style.opacity =
        "0";

    elemento.style.transform =
        "translateX(-10px)";

    setTimeout(() => {

        indiceFrase =
            (indiceFrase + 1) %
            frasesAmor.length;

        elemento.textContent =
            frasesAmor[indiceFrase];

        elemento.classList.remove(
            "animando"
        );

        void elemento.offsetWidth;

        elemento.classList.add(
            "animando"
        );

    }, 450);
}

const botonAbrirBusqueda = document.getElementById("abrirBusqueda");
const panelBusqueda = document.getElementById("busqueda");
const campoCiudad = document.getElementById("ciudad");

function abrirBusqueda() {
    panelBusqueda.classList.add("visible");
    botonAbrirBusqueda.setAttribute("aria-expanded", "true");
    campoCiudad.focus();
}

function cerrarBusqueda() {
    panelBusqueda.classList.remove("visible");
    botonAbrirBusqueda.setAttribute("aria-expanded", "false");

    // El foco vuelve al botón que abrió el panel (si no, se pierde al ocultarlo).
    botonAbrirBusqueda.focus();
}

botonAbrirBusqueda.addEventListener("click", abrirBusqueda);

document.getElementById("cerrarBusqueda").addEventListener("click", cerrarBusqueda);

document.getElementById("buscar").addEventListener(
    "click",
    () => {
        const ciudad = campoCiudad.value.trim();

        if (ciudad !== "") {
            buscarCiudad(ciudad);
            cerrarBusqueda();
        }
    }
);

campoCiudad.addEventListener(
    "keydown",
    event => {
        if (event.key === "Enter") {
            document.getElementById("buscar").click();
        }
    }
);

document.addEventListener(
    "keydown",
    event => {
        if (
            event.key === "Escape" &&
            panelBusqueda.classList.contains("visible")
        ) {
            cerrarBusqueda();
        }
    }
);

if ("serviceWorker" in navigator) {
    window.addEventListener(
        "load",
        () => {
            navigator.serviceWorker
                .register(
                    "./service-worker.js"
                )
                .then(() => {
                    console.log(
                        "Service Worker registrado"
                    );
                })
                .catch(error => {
                    console.error(
                        "Error Service Worker:",
                        error
                    );
                });
        }
    );
}

mostrarFraseAmor();

setInterval(
    siguienteFrase,
    7000
);

const ciudadGuardada = leerGuardado(CLAVE_CIUDAD);

if (ciudadGuardada) {
    document.getElementById("ciudad").value = ciudadGuardada;
}

const ultimoGuardado = leerJSONGuardado(CLAVE_ULTIMO);

if (
    ultimoGuardado &&
    ultimoGuardado.lugar &&
    ultimoGuardado.datos &&
    pintarGuardado(ultimoGuardado)
) {
    // Primer pintado inmediato con lo último que se vio; después, datos frescos.
    conControl(
        signal => cargarTiempo(ultimoGuardado.lugar, signal)
    );
} else {
    buscarCiudad(ciudadGuardada || CIUDAD_POR_DEFECTO);
}

document.addEventListener(
    "visibilitychange",
    () => {
        if (document.visibilityState === "visible") {
            reproducirVideo();
            refrescarSiHaceFalta(REFRESCO_AL_VOLVER_MS);
        } else {
            pausarVideo();
        }
    }
);

window.addEventListener(
    "online",
    () => refrescarSiHaceFalta(0)
);

setInterval(
    () => {
        if (document.visibilityState === "visible") {
            refrescarSiHaceFalta(REFRESCO_PERIODICO_MS);
        }
    },
    COMPROBACION_MS
);