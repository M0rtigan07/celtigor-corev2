// src/js/main.js
import { initTerminal } from "./js/terminal.js";
import { initInput } from "./js/input.js";
import { initAvatar } from "./js/avatar.js";
import { enterNormalMode, setPrompt } from "./js/ui.js";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Cargamos buffers visuales estáticos y el rostro SVG de Visión
    initTerminal(); //
    initAvatar(); //

    // 2. Preparamos el sistema de seguridad inicial
    prepararAccesoOperador();
});

function prepararAccesoOperador() {
    const bootLines = document.getElementById("boot-lines"); //
    if (!bootLines) return;

    // Mensaje inicial estático que verá el usuario en frío nada más entrar a la web
    bootLines.textContent = "CELTIGOR SYSTEMS CORE v4.0.0)\n";
    bootLines.textContent += "[SISTEMA BLOQUEADO] - PRESIONE ENTER PARA INICIAR EL SISTEMA \n";

    // Escuchador para detectar la pulsación del operador
    const iniciarBootConAudio = (e) => {
        if (e.key === "Enter") {
            // Desenganchamos el evento para que no se pulse dos veces
            window.removeEventListener("keydown", iniciarBootConAudio);

            // Limpiamos el texto de aviso para empezar la carga limpia
            bootLines.textContent = "";

            // 🔥 ¡FUEGO! Disparamos tu secuencia de boot clásica con el audio ya desbloqueado
            runRetroBootSequence();
        }
    };

    window.addEventListener("keydown", iniciarBootConAudio);
}

function runRetroBootSequence() {
    const bootScreen = document.getElementById("boot-screen"); //
    const bootLines = document.getElementById("boot-lines"); //
    const ibmSound = document.getElementById("ibm360-sound"); //
    const printerSound = document.getElementById("printer-sound"); // El nuevo sonido de la impresora matricial

    if (!bootScreen || !bootLines) { //
        bootUpCeltigorCore(); //
        return; //
    }

    // Tu volcado de memoria de siempre convertido en un único texto
    const textoCompleto = [
        "CELTIGOR SYSTEM CORE v4.0.0 - INICIANDO SECUENCIA DE ARRANQUE DE SISTEMAS...",
        "INITIALIZING HARDWARE PROTOCOLS...",
        "LOADING SYNTHESIZED LOGIC PATTERNS...",
        "MAPPING COGNITIVE NEURAL VECTORS...",
        "ESTABLISHING SECURE QUANTUM ENVELOPE...",
        "AUTHORIZATION GRANTED: OPERATOR LEVEL 3",
        "ALL SUBSYSTEMS OPERATIONAL.",
        "",
        "LAUNCHING INTERFACE CONSOLE..."
    ].join("\n") + "\n";

    let posicionChar = 0;

    // 🔊 Mantenemos el zumbido eléctrico de fondo si quieres, pero bajito para oír los rodillos
    if (ibmSound) {
        ibmSound.currentTime = 0; //
        ibmSound.volume = 0.3; //
        ibmSound.play().catch(e => console.log("Error audio ambiente:", e)); //
    }

    function escribirEstiloImpresora() {
        if (posicionChar < textoCompleto.length) {
            const caracterActual = textoCompleto.charAt(posicionChar);

            // Pintamos el carácter en la pantalla verde
            bootLines.textContent += caracterActual;
            posicionChar++;

            // Variable para ajustar la velocidad física de la máquina
            let delay = 35;

            // 🔊 PROTOCOLO DE AUDIO DE IMPRESORA DETECTADO
            if (printerSound) {
                if (caracterActual === "\n") {
                    // Si es un salto de línea, simulamos el avance del rodillo de papel (Line Feed)
                    printerSound.currentTime = 0;
                    printerSound.volume = 0.6; // El salto de carro suena más fuerte
                    printerSound.play().catch(() => { });

                    delay = 500; // Pausa dramática de medio segundo mientras "pasa la hoja"
                } else if (caracterActual !== " ") {
                    // Si es una letra normal, disparamos el martillazo de la aguja contra la cinta
                    printerSound.currentTime = 0;
                    printerSound.volume = 0.25; // Ruidito sutil por letra
                    printerSound.play().catch(() => { });

                    // Pequeña variación de velocidad para que suene mecánica e imperfecta
                    delay = 25 + Math.random() * 20;
                }
            }

            // Llamada recursiva con el delay dinámico que hemos calculado
            setTimeout(escribirEstiloImpresora, delay);

        } else {
            // Al terminar la impresión, apagamos motores y desplegamos la UI
            if (ibmSound) {
                const fade = setInterval(() => { //
                    if (ibmSound.volume <= 0.05) {
                        clearInterval(fade); //
                        ibmSound.pause(); //
                        ibmSound.currentTime = 0; //
                    } else {
                        ibmSound.volume -= 0.05;
                    }
                }, 50); //
            }

            setTimeout(() => {
                bootScreen.style.display = "none"; //
                const uiWrapper = document.getElementById("ui-wrapper"); //
                if (uiWrapper) {
                    uiWrapper.style.display = "block"; //
                }
                bootUpCeltigorCore(); //
            }, 800);
        }
    }

    // ¡Arrancamos los cabezales de impresión!
    escribirEstiloImpresora();
}

function bootUpCeltigorCore() {
    console.log("=== Acceso de Operador Concedido: Desplegando Canales ==="); //
    initInput(); //
    enterNormalMode(); //
    setPrompt("Guest", "celtigor", "~"); //
}