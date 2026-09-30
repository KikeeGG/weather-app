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
    77: ["Granizo", "❄", "nieve"],
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
    "Última hora: hay un 100% de posibilidades de que me acuerde de ti.",
    "El pronóstico de hoy indica que eres mi parte favorita del día.",
    "Alerta meteorológica: demasiadas ganas de verte.",
    "Se esperan abrazos durante todo el día.",
    "Última hora: sigues siendo mi persona favorita.",
    "La previsión anuncia un día perfecto para estar contigo.",
    "Temperaturas agradables y un 100% de posibilidades de quererte.",
    "Aviso importante: no hay nube capaz de tapar lo mucho que me gustas.",
    "El tiempo puede cambiar, pero mis ganas de estar contigo no.",
    "Previsión para hoy: tú, yo y un día bonito.",
    "Se esperan cielos despejados y pensamientos sobre ti.",
    "Última hora: eres oficialmente mi lugar favorito.",
    "Hay probabilidades muy altas de que te eche de menos hoy.",
    "El pronóstico no lo dice, pero tú haces que cualquier día sea mejor.",
    "Se aproxima una ola de cariño. No se esperan precipitaciones.",
    "Hoy el tiempo acompaña, pero tú sigues siendo lo mejor.",
    "Máxima de cariño y mínima de ganas de separarme de ti.",
    "Parte meteorológico: te quiero. Sin cambios previstos.",
    "El cielo está bonito, pero no tanto como tú.",
    "Última hora: mi previsión sigue siendo quererte todos los días."
];

let videoActual = "";

let indiceFrase = Math.floor(
    Math.random() * frasesAmor.length
);

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

    const codigo = actual.weather_code;

    const informacion = obtenerInformacionClima(
        codigo,
        actual.is_day
    );

    document.getElementById("nombreCiudad").textContent =
        lugar.name;

    document.getElementById("temperatura").textContent =
        `${Math.round(actual.temperature_2m)}°`;

    document.getElementById("descripcion").textContent =
        informacion[0];

    document.getElementById("sensacion").textContent =
        `${Math.round(actual.apparent_temperature)}°`;

    document.getElementById("humedad").textContent =
        `${actual.relative_humidity_2m}%`;

    document.getElementById("viento").textContent =
        `${Math.round(actual.wind_speed_10m)} km/h`;

    document.getElementById("direccionViento").textContent =
        obtenerDireccionViento(actual.wind_direction_10m);

    document.getElementById("rachas").textContent =
        `${Math.round(actual.wind_gusts_10m)} km/h`;

    document.getElementById("visibilidad").textContent =
        `${(actual.visibility / 1000).toFixed(1)} km`;

    document.getElementById("presion").textContent =
        `${Math.round(actual.pressure_msl)} hPa`;

    document.getElementById("maxima").textContent =
        `${Math.round(diario.temperature_2m_max[0])}°`;

    document.getElementById("minima").textContent =
        `${Math.round(diario.temperature_2m_min[0])}°`;

    document.getElementById("amanecer").textContent =
        formatearHora(diario.sunrise[0]);

    document.getElementById("atardecer").textContent =
        formatearHora(diario.sunset[0]);

    actualizarFecha();

    cambiarAmbiente(
        informacion[2],
        actual.is_day
    );

    mostrarHoras(
        horario,
        actual.time
    );

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

function mostrarHoras(horario, horaActual) {
    const contenedor =
        document.getElementById("horas");

    contenedor.innerHTML = "";

    let indiceActual =
        horario.time.findIndex(
            hora => hora >= horaActual
        );

    if (indiceActual === -1) {
        indiceActual = 0;
    }

    const limite =
        Math.min(
            indiceActual + 12,
            horario.time.length
        );

    for (
        let i = indiceActual;
        i < limite;
        i++
    ) {
        const codigo =
            horario.weather_code[i];

        const esDeDia =
            horario.is_day[i];

        const informacion =
            obtenerInformacionClima(
                codigo,
                esDeDia
            );

        const hora =
            horario.time[i].slice(11, 16);

        const probabilidad =
            horario.precipitation_probability[i];

        const div =
            document.createElement("div");

        div.className =
            "hora";

        if (i === indiceActual) {
            div.classList.add("actual");
        }

        div.innerHTML = `
            <span class="hora-nombre">
                ${i === indiceActual ? "Ahora" : hora}
            </span>

            <span class="hora-icono">
                ${informacion[1]}
            </span>

            <span class="hora-temperatura">
                ${Math.round(horario.temperature_2m[i])}°
            </span>

            <span class="hora-lluvia">
                ${probabilidad}%
            </span>
        `;

        contenedor.appendChild(div);
    }

    document.getElementById("horaActual").textContent =
        horario.time[indiceActual].slice(11, 16);
}

function mostrarPrevision(diario) {
    const contenedor =
        document.getElementById("prevision");

    contenedor.innerHTML = "";

    for (
        let i = 0;
        i < diario.time.length;
        i++
    ) {
        const codigo =
            diario.weather_code[i];

        const informacion =
            clima[codigo] ||
            ["Desconocido", "•", "nublado"];

        const fecha =
            new Date(
                diario.time[i] + "T12:00:00"
            );

        const nombre =
            i === 0
                ? "Hoy"
                : fecha.toLocaleDateString(
                    "es-ES",
                    {
                        weekday: "short"
                    }
                );

        const div =
            document.createElement("div");

        div.className =
            "dia";

        div.innerHTML = `
            <span class="dia-nombre">
                ${nombre}
            </span>

            <span class="dia-icono">
                ${informacion[1]}
            </span>

            <div class="dia-temperaturas">
                <span class="dia-max">
                    ${Math.round(
                        diario.temperature_2m_max[i]
                    )}°
                </span>

                <span class="dia-min">
                    ${Math.round(
                        diario.temperature_2m_min[i]
                    )}°
                </span>
            </div>

            <span class="dia-lluvia">
                ${diario.precipitation_probability_max[i]}%
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

    video.style.opacity =
        "0";

    video.src =
        nuevoVideo;

    video.load();
    video.playbackRate = 0.5;

    video.play()
        .then(() => {
            video.style.opacity =
                "0.72";
        })
        .catch(() => {
            video.style.opacity =
                "0";
        });
}

function obtenerDireccionViento(grados) {
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

    const indice =
        Math.round(
            grados / 45
        ) % 8;

    return `${direcciones[indice]} · ${Math.round(grados)}°`;
}

function formatearHora(fecha) {
    return fecha.slice(11, 16);
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