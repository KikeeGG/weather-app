// Iconos del tiempo en SVG, dibujados a mano (sin dependencias).
// Los degradados (gSol, gLuna, gNube...) están definidos una sola vez en
// index.html, dentro de <svg class="defs-iconos">.

const FORMAS_ICONO = {
    sol: `
        <g stroke="#ffc83d" stroke-width="3.6" stroke-linecap="round">
            <line x1="32" y1="5" x2="32" y2="11"/>
            <line x1="32" y1="53" x2="32" y2="59"/>
            <line x1="5" y1="32" x2="11" y2="32"/>
            <line x1="53" y1="32" x2="59" y2="32"/>
            <line x1="32" y1="5" x2="32" y2="11" transform="rotate(45 32 32)"/>
            <line x1="32" y1="5" x2="32" y2="11" transform="rotate(135 32 32)"/>
            <line x1="32" y1="5" x2="32" y2="11" transform="rotate(225 32 32)"/>
            <line x1="32" y1="5" x2="32" y2="11" transform="rotate(315 32 32)"/>
        </g>
        <circle cx="32" cy="32" r="14" fill="url(#gSol)"/>
    `,

    luna: `
        <path d="M38 8 A24 24 0 1 0 56 40 A19 19 0 0 1 38 8 Z" fill="url(#gLuna)"/>
        <circle cx="50" cy="14" r="1.8" fill="#ffffff" opacity="0.9"/>
        <circle cx="56" cy="24" r="1.2" fill="#ffffff" opacity="0.7"/>
    `
};

const FORMA_NUBE =
    "M20 50 C12 50 8 44.5 8 39 C8 33 12.5 28.5 18.5 28.5 " +
    "C19.5 21 25.5 16 33 16 C40.5 16 46.5 21 47.5 28 " +
    "C53 28.5 56 33 56 39 C56 45 52 50 46 50 Z";

function nube(relleno, transformacion = "") {
    return `<path d="${FORMA_NUBE}" fill="url(#${relleno})" transform="${transformacion}"/>`;
}

function tipoIcono(codigo) {
    if (codigo === 0) {
        return "despejado";
    }

    if (codigo === 1 || codigo === 2) {
        return "parcial";
    }

    if (codigo === 45 || codigo === 48) {
        return "niebla";
    }

    if ([95, 96, 99].includes(codigo)) {
        return "tormenta";
    }

    if ([56, 57, 66, 67, 71, 73, 75, 77, 85, 86].includes(codigo)) {
        return "nieve";
    }

    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(codigo)) {
        return "lluvia";
    }

    return "nublado";
}

function dibujoIcono(tipo, esDia) {
    const astro = esDia ? FORMAS_ICONO.sol : FORMAS_ICONO.luna;

    switch (tipo) {
        case "despejado":
            return astro;

        case "parcial":
            return `
                <g transform="translate(2 1) scale(0.66)">${astro}</g>
                ${nube("gNube", "translate(6 8) scale(0.82)")}
            `;

        case "niebla":
            return `
                ${nube("gNubeGris", "translate(0 -6)")}
                <g stroke="#ffffff" stroke-width="3.4" stroke-linecap="round" opacity="0.9">
                    <line x1="14" y1="50" x2="50" y2="50"/>
                    <line x1="20" y1="57" x2="56" y2="57"/>
                </g>
            `;

        case "lluvia":
            return `
                ${nube("gNubeGris", "translate(0 -7)")}
                <g stroke="#5ac8fa" stroke-width="3.4" stroke-linecap="round">
                    <line x1="21" y1="48" x2="18" y2="56"/>
                    <line x1="32" y1="48" x2="29" y2="58"/>
                    <line x1="43" y1="48" x2="40" y2="56"/>
                </g>
            `;

        case "nieve":
            return `
                ${nube("gNubeGris", "translate(0 -7)")}
                <g fill="#ffffff">
                    <circle cx="21" cy="51" r="2.6"/>
                    <circle cx="32" cy="56" r="2.6"/>
                    <circle cx="43" cy="51" r="2.6"/>
                </g>
            `;

        case "tormenta":
            return `
                ${nube("gNubeOscura", "translate(0 -8)")}
                <polygon points="35,38 25,53 32,53 28,63 41,46 34,46 38,38" fill="url(#gRayo)"/>
            `;

        default:
            return nube("gNube", "translate(0 2)");
    }
}

// Devuelve el SVG como texto, listo para meter en innerHTML.
function iconoClima(codigo, esDia) {
    const dibujo = dibujoIcono(tipoIcono(codigo), Boolean(esDia));

    return (
        `<svg class="icono-tiempo" viewBox="0 0 64 64" ` +
        `aria-hidden="true" focusable="false">${dibujo}</svg>`
    );
}

// ---------------------------------------------------------------------------
// Gráficos de las tarjetas (brújula, medidor de presión, arco del sol).
// Devuelven SVG como texto; son decorativos (aria-hidden): el dato también
// está escrito en la tarjeta.
// ---------------------------------------------------------------------------

function valido(valor) {
    return typeof valor === "number" && Number.isFinite(valor);
}

// La aguja apunta hacia donde SOPLA el viento (la dirección meteorológica
// indica de dónde viene, por eso se gira 180°).
function brujulaViento(grados) {
    const letras = [["N", 32, 11], ["E", 54, 35], ["S", 32, 60], ["O", 10, 35]]
        .map(([texto, x, y]) =>
            `<text x="${x}" y="${y}" text-anchor="middle" font-size="8" ` +
            `font-weight="600" fill="#ffffff" opacity="0.75">${texto}</text>`
        )
        .join("");

    const aguja = valido(grados)
        ? `<g transform="rotate(${Math.round((grados + 180) % 360)} 32 32)">` +
          `<polygon points="32,15 36.5,34 32,31 27.5,34" fill="#ffffff"/>` +
          `<line x1="32" y1="31" x2="32" y2="46" stroke="#ffffff" ` +
          `stroke-width="2.4" stroke-linecap="round" opacity="0.55"/></g>` +
          `<circle cx="32" cy="32" r="2.6" fill="#1c2430" stroke="#ffffff" ` +
          `stroke-width="1.4"/>`
        : "";

    return (
        `<svg viewBox="0 0 64 64" width="52" height="52" aria-hidden="true" focusable="false">` +
        `<circle cx="32" cy="32" r="29" fill="rgba(255,255,255,0.08)" ` +
        `stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>` +
        `${letras}${aguja}</svg>`
    );
}

// Semicírculo de 970 a 1050 hPa con un punto en la presión actual.
function medidorPresion(hpa) {
    const MINIMA = 970;
    const MAXIMA = 1050;

    const arco =
        `<path d="M6 34 A26 26 0 0 1 58 34" fill="none" ` +
        `stroke="rgba(255,255,255,0.28)" stroke-width="5" stroke-linecap="round"/>`;

    let punto = "";

    if (valido(hpa)) {
        const fraccion = Math.min(Math.max((hpa - MINIMA) / (MAXIMA - MINIMA), 0), 1);
        const angulo = Math.PI * (1 - fraccion);

        punto =
            `<circle cx="${(32 + 26 * Math.cos(angulo)).toFixed(1)}" ` +
            `cy="${(34 - 26 * Math.sin(angulo)).toFixed(1)}" r="5" fill="#ffffff" ` +
            `stroke="rgba(20,28,40,0.6)" stroke-width="2"/>`;
    }

    return (
        `<svg viewBox="0 0 64 40" width="56" height="35" aria-hidden="true" focusable="false">` +
        `${arco}${punto}</svg>`
    );
}

function minutosDelDia(texto) {
    const coincidencia = /T(\d{2}):(\d{2})/.exec(String(texto || ""));

    return coincidencia
        ? Number(coincidencia[1]) * 60 + Number(coincidencia[2])
        : null;
}

// Recorrido del sol entre el amanecer y el atardecer. De noche, la marca se
// queda en el horizonte (a la izquierda antes del amanecer, a la derecha
// después del atardecer) con aspecto de luna.
function arcoSol(horaActual, amanecer, atardecer) {
    const ahora = minutosDelDia(horaActual);
    const sale = minutosDelDia(amanecer);
    const pone = minutosDelDia(atardecer);

    const camino = "M14 44 A86 38 0 0 1 186 44";

    let dibujo =
        `<line x1="4" y1="44" x2="196" y2="44" stroke="rgba(255,255,255,0.35)" stroke-width="1.2"/>` +
        `<path d="${camino}" pathLength="100" fill="none" stroke="rgba(255,255,255,0.3)" ` +
        `stroke-width="2" stroke-dasharray="1.2 1.8"/>`;

    if (ahora !== null && sale !== null && pone !== null && pone > sale) {
        const fraccion = (ahora - sale) / (pone - sale);
        const dentro = fraccion >= 0 && fraccion <= 1;
        const f = Math.min(Math.max(fraccion, 0), 1);
        const angulo = Math.PI * (1 - f);

        const x = 100 + 86 * Math.cos(angulo);
        const y = 44 - 38 * Math.sin(angulo);

        dibujo +=
            `<path d="${camino}" pathLength="100" fill="none" stroke="#ffc83d" ` +
            `stroke-width="2.8" stroke-dasharray="${(f * 100).toFixed(1)} 100"/>`;

        dibujo += dentro
            ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" fill="#ffc83d" opacity="0.22"/>` +
              `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6.5" fill="url(#gSol)" ` +
              `stroke="rgba(255,255,255,0.8)" stroke-width="1.4"/>`
            : `<circle cx="${x.toFixed(1)}" cy="44" r="6" fill="url(#gLuna)" opacity="0.9"/>`;
    }

    return (
        `<svg viewBox="0 0 200 54" aria-hidden="true" focusable="false">${dibujo}</svg>`
    );
}