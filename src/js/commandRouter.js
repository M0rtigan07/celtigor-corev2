// src/js/terminal/commandRouter.js
const { invoke } = window.__TAURI__.core; // Inyector nativo de Tauri
import { printLine } from "./terminal.js";
import { beepError, beepDouble } from "./sound.js";

export async function executeCommand(cmd, linesContainer) {
    const parts = cmd.trim().split(" ");
    const base = parts[0].toLowerCase();
    const arg = cmd.slice(base.length).trim();

    switch (base) {
        // ==========================================
        // COMANDOS DE CONTROL DE INTERFAZ LOCAL
        // ==========================================
        case "clear":
        case "clean":
            // 🔥 LA MAGIA AQUÍ: Limpia el historial dinámico.
            // Tu cabecera fija (#terminal-header) se queda intacta en el DOM.
            linesContainer.innerHTML = ""; 
            break;

        case "help":
            beepDouble();
            printLine([
                "Servicios indexados en el sistema operativo Celtigor:",
                "  help               - Despliega este menú de diagnóstico analógico.",
                "  clear / clean      - Purga las líneas del monitor conservando el kernel.",
                "  status             - Testea el estado lógico del sintetizador.",
                "  version            - Muestra la compilación actual del Core.",
                "  time               - Devuelve la estampa horaria local del sistema.",
                "  about              - Manifiesto del sistema de terminal retro.",
                "  ia <pregunta>      - Abre ráfaga de datos segura con Celtigor."
            ].join("\n"), "terminal-system");
            break;

        case "status":
            beepDouble();
            printLine("NÚCLEO: RUST TAURI INTERFACE\nESTADO: OPERATIVO (ACTIVE)\nMONITOR: ESTABLE", "terminal-system");
            break;

        case "version":
            beepDouble();
            printLine("Celtigor OS Λ v4.0.0-Tauri (Rust Native Architecture)", "terminal-system");
            break;

        case "time":
            beepDouble();
            printLine(`HORA LOCAL DEL ENTORNO: ${new Date().toLocaleTimeString()}`, "terminal-system");
            break;

        case "about":
            beepDouble();
            printLine("Celtigor: Entorno modular retro-futurista con procesamiento lógico integrado.", "terminal-system");
            break;

        // ==========================================
        // COMANDO DE INTEGRACIÓN DE IA (CONEXIÓN RUST)
        // ==========================================
        case "celtigor":
        case "ia":
            if (!arg) {
                beepError();
                printLine("Sintaxis incorrecta. Uso: ia <pregunta>", "terminal-error");
                break;
            }

            printLine("Codificando paquete de datos para el modelo...", "terminal-system");

            try {
                // Viaje nativo instantáneo al backend de Rust sin pasar por WebSockets
                const respuestaRust = await invoke("procesar_comando_ia", { prompt: arg });
                beepDouble();
                printLine(respuestaRust, "celtigor-output"); // Respeta tu color especial para Celtigor
            } catch (err) {
                beepError();
                printLine(`[FALLO CRÍTICO DE ENLACE NATIVO]: ${err}`, "terminal-error");
            }
            break;

        // ==========================================
        // COMANDO DESCONOCIDO
        // ==========================================
        default:
            beepError();
            printLine(`Servicio lógico '${base}' no reconocido por el Core. Teclee 'help'.`, "terminal-error");
            break;
    }
}