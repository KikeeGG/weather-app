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

async function buscarCiudad(ciudad) {
    try {
        mostrarError("");

        const respuestaCiudad = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ciudad)}&count=1&language=es&format=json`
        );

        if (!respuestaCiudad.ok) {
            throw new Error("No se ha podido buscar la ciudad.");
        }

        const datosCiudad = await respuestaCiudad.json();

        if (!datosCiudad.results || datosCiudad.results.length === 0) {
            throw new Error("No se ha encontrado esa ciudad.");
        }

        const lugar = datosCiudad.results[0];

        const url =
            `https://api.open-meteo.com/v1/forecast?` +
            `latitude=${lugar.latitude}` +
            `&longitude=${lugar.longitude}` +
            `&current=` +
            `temperature_2m,` +
            `relative_humidity_2m,` +
            `apparent_temperature,` +
            `is_day,` +
            `precipitation,` +
            `weather_code,` +
            `cloud_cover,` +
            `pressure_msl,` +
            `wind_speed_10m,` +
            `wind_direction_10m,` +
            `wind_gusts_10m,` +
            `visibility` +
            `&hourly=` +
            `temperature_2m,` +
            `apparent_temperature,` +
            `precipitation_probability,` +
            `weather_code,` +
            `is_day` +
            `&daily=` +
            `weather_code,` +
            `temperature_2m_max,` +
            `temperature_2m_min,` +
            `precipitation_probability_max,` +
            `precipitation_sum,` +
            `precipitation_hours,` +
            `sunrise,` +
            `sunset` +
            `&timezone=auto` +
            `&forecast_days=7`;

        const respuestaTiempo = await fetch(url);

        if (!respuestaTiempo.ok) {
            throw new Error("No se ha podido obtener el tiempo.");
        }

        const datos = await respuestaTiempo.json();

        mostrarTiempo(lugar, datos);

    } catch (error) {
        mostrarError(error.message);
    }
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

    actualizarFecha();

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

            <span class="hora-icono">
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

            <span class="dia-icono">
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

function cambiarVideo(tipo) {
    const video =
        document.getElementById(
            "fondoVideo"
        );

    const nuevoVideo =
        videos[tipo];

    if (!nuevoVideo) {
        return;
    }

    if (videoActual === nuevoVideo) {
        return;
    }

    videoActual =
        nuevoVideo;

    video.pause();

    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute(
        "playsinline",
        ""
    );

    video.playbackRate =
        0.5;

    video.style.opacity =
        "0";

    video.src =
        nuevoVideo;

    video.load();
    video.playbackRate = 0.5;

    const mostrarVideo = () => {
        video.style.opacity =
            "0.72";

        video.playbackRate =
            0.5;
    };

    const reproducirVideo = () => {
        video.muted = true;
        video.defaultMuted = true;
        video.playbackRate = 0.5;

        const reproduccion =
            video.play();

        if (
            reproduccion &&
            typeof reproduccion.catch === "function"
        ) {
            reproduccion
                .then(() => {
                    mostrarVideo();
                })
                .catch(error => {
                    console.log(
                        "Autoplay bloqueado:",
                        error
                    );

                    if (
                        video.readyState >= 2
                    ) {
                        mostrarVideo();
                    }
                });
        }
    };

    video.onloadeddata =
        () => {
            mostrarVideo();
            reproducirVideo();
        };

    video.oncanplay =
        () => {
            mostrarVideo();
            reproducirVideo();
        };

    video.onplaying =
        () => {
            mostrarVideo();
        };

    video.onerror =
        () => {
            console.error(
                "No se ha podido cargar el vídeo:",
                nuevoVideo
            );
        };

    setTimeout(() => {
        if (
            video.readyState >= 2
        ) {
            mostrarVideo();
            reproducirVideo();
        }
    }, 500);
}

function activarVideo() {
    const video =
        document.getElementById(
            "fondoVideo"
        );

    if (!video) {
        return;
    }

    video.muted = true;
    video.defaultMuted = true;

    video.play()
        .then(() => {
            video.style.opacity =
                "0.72";

            video.playbackRate =
                0.5;
        })
        .catch(() => {
        });
}

document.addEventListener(
    "touchstart",
    activarVideo,
    {
        once: true,
        passive: true
    }
);

document.addEventListener(
    "pointerdown",
    activarVideo,
    {
        once: true,
        passive: true
    }
);

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

function actualizarFecha() {
    const ahora =
        new Date();

    document.getElementById("fecha")
        .textContent =
        ahora.toLocaleDateString(
            "es-ES",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        );
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

document.getElementById(
    "buscar"
).addEventListener(
    "click",
    () => {
        const ciudad =
            document.getElementById(
                "ciudad"
            ).value.trim();

        if (ciudad !== "") {
            buscarCiudad(ciudad);

            document.getElementById(
                "busqueda"
            ).classList.remove(
                "visible"
            );
        }
    }
);

document.getElementById(
    "ciudad"
).addEventListener(
    "keydown",
    event => {
        if (
            event.key === "Enter"
        ) {
            document.getElementById(
                "buscar"
            ).click();
        }
    }
);

document.getElementById(
    "abrirBusqueda"
).addEventListener(
    "click",
    () => {
        document.getElementById(
            "busqueda"
        ).classList.add(
            "visible"
        );

        document.getElementById(
            "ciudad"
        ).focus();
    }
);

document.getElementById(
    "cerrarBusqueda"
).addEventListener(
    "click",
    () => {
        document.getElementById(
            "busqueda"
        ).classList.remove(
            "visible"
        );
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

buscarCiudad(
    "Leganés, Madrid"
);