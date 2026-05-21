// src/js/main.js
import { initTerminal } from "./src/js/terminal.js";
import { initInput } from "./src/js/input.js";
import { initAvatar } from "./src/js/avatar.js";
import { enterNormalMode, setPrompt } from "./src/js/ui.js";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Cargamos buffers visuales estáticos y el rostro SVG de Visión
    initTerminal();
    initAvatar();

    // 2. Ejecutamos la secuencia de arranque fosforita
    runRetroBootSequence();
});

function runRetroBootSequence() {
    // Seleccionamos los IDs exactos de tu HTML y las clases de tu nuevo CSS
    const bootScreen = document.getElementById("boot-screen");
    const bootLines = document.getElementById("boot-lines");
    const ibmSound = document.getElementById("ibm360-sound");

    if (!bootScreen || !bootLines) {
        bootUpCeltigorCore();
        return;
    }

    // El volcado de memoria simulado estilo terminal analógica
    const sequence = [
        "CELTIGOR SYSTEM CORE v4.0.0 (TAURI_RUST_EDITION)",
        "INITIALIZING HARDWARE PROTOCOLS...",
        "LOADING SYNTHESIZED LOGIC PATTERNS...",
        "MAPPING COGNITIVE NEURAL VECTORS...",
        "ESTABLISHING SECURE QUANTUM ENVELOPE...",
        "AUTHORIZATION GRANTED: OPERATOR LEVEL 3",
        "ALL SUBSYSTEMS OPERATIONAL.",
        "",
        "LAUNCHING INTERFACE CONSOLE..."
    ];

    let index = 0;

    // 🔊 Encendemos el zumbido de fondo del mainframe IBM
    if (ibmSound) {
        ibmSound.currentTime = 0;
        ibmSound.volume = 1;
        // Lanzamos el audio (Tauri al ser app de escritorio no bloquea el autoplay)
        ibmSound.play().catch(e => console.log("Espera de interacción de audio:", e));
    }

    function printNextBootLine() {
        if (index < sequence.length) {
            // Añadimos la línea actual más un salto de carro
            bootLines.textContent += sequence[index] + "\n";
            index++;

            // Retardo asíncrono con el "ruido de terminal vieja" que genera tu delay aleatorio
            setTimeout(printNextBootLine, 300 + Math.random() * 200);
        } else {
            // 🔊 Fade-out del motor de audio al completarse la carga
            if (ibmSound) {
                const fade = setInterval(() => {
                    ibmSound.volume -= 0.05;
                    if (ibmSound.volume <= 0) {
                        clearInterval(fade);
                        ibmSound.pause();
                        ibmSound.currentTime = 0;
                    }
                }, 50);
            }

            // Ocultamos el div de carga usando display none para que deje paso a la UI
            bootScreen.style.display = "none";

            // Desplegamos todo el envoltorio de la interfaz retro
            const uiWrapper = document.getElementById("ui-wrapper");
            if (uiWrapper) {
                uiWrapper.style.display = "block"; // Rompe el style="display:none;" nativo del HTML
            }

            // 🔥 Inicializamos los mandos y controles del sistema operativo operativo
            bootUpCeltigorCore();
        }
    }

    // Pequeño retardo atmosférico de 500ms antes de empezar a escribir en el monitor fósforo
    setTimeout(printNextBootLine, 500);
}

function bootUpCeltigorCore() {
    console.log("=== Acceso de Operador Concedido: Desplegando Canales ===");

    // 1. Encendemos el capturador del teclado mapeado a la función executeCommand
    initInput();

    // 2. Colocamos la interfaz en modo activo y seteamos los prompts fijos de la shell
    enterNormalMode();
    setPrompt("manu", "celtigor", "~");
}