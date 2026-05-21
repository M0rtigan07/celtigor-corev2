// Crea un beep retro usando Web Audio API
function createBeep(frequency, duration, volume = 0.1, type = "square") {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume;

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();

    setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
    }, duration);
}

// 🔊 Beep normal (ejecutar comando)
export function beepNormal() {
    createBeep(880, 100, 0.12);
}

// 🔴 Beep de error
export function beepError() {
    createBeep(220, 200, 0.15);
}

// 🟡 Beep doble (comandos del sistema)
export function beepDouble() {
    createBeep(660, 80, 0.12);
    setTimeout(() => createBeep(880, 80, 0.12), 120);
}

// ⚠️ Beep largo (alerta)
export function beepLong() {
    createBeep(440, 500, 0.2, "sawtooth");
}

// ⌨️ Sonido de tecla al escribir
export function beepKey() {
    createBeep(1200, 20, 0.05);
}
