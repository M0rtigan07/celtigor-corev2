// src/js/terminal/commandRouter.js
import { printLine } from "./terminal.js";
import { beepError, beepDouble } from "./sound.js";

// 🟢 REGISTRO LOCAL DE SESIÓN (Empieza como invitado)
export let usuarioActual = { nombre: "guest", rol: "INVITADO" };

export async function executeCommand(cmd, linesContainer) {
    const parts = cmd.trim().split(" ");
    const base = parts[0].toLowerCase();
    const arg = cmd.slice(base.length).trim();

    switch (base) {

        // ==========================================
        // NUEVO COMANDO DE ACCESO DE OPERADORES
        // ==========================================
        case "login":
            if (!arg) {
                beepError();
                printLine("[ERROR] Sintaxis incorrecta. Uso: login <nombre_operador>", "terminal-error");
                break;
            }

            beepDouble();
            printLine(`[SISTEMA] Solicitando autorización para el operador '${arg}'...`, "terminal-system");

            try {
                // Llamamos a nuestra Serverless Function en Node.js
                const respuesta = await fetch('/api/usuarios/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre: arg })
                });

                const datos = await respuesta.json();

                if (respuesta.ok) {
                    // Guardamos al operador en la sesión activa de la terminal
                    usuarioActual = { nombre: datos.nombre, rol: datos.rol };
                    beepDouble();

                    printLine(`[OK] ACCESO CONCEDIDO. Bienvenido de nuevo, ${datos.nombre}.`, "terminal-system");

                    // 👑 Si eres tú, el sistema rinde honores
                    if (datos.rol === 'SUPER_USER') {
                        printLine("⚠️ [ALERTA] PRIVILEGIOS DE RAÍZ (ROOT) DETECTADOS. MODO CREADOR ACTIVO.", "terminal-system");
                    }

                    // 🟢 Cambiar el prompt visual de la pantalla
                    actualizarPromptVisual();

                } else {
                    beepError();
                    printLine(`[ACCESO DENEGADO]: ${datos.error}`, "terminal-error");
                }
            } catch (err) {
                beepError();
                printLine(`[FALLO CRÍTICO DE ENLACE CORESUDO]: No se pudo contactar con SQLite.`, "terminal-error");
            }
            break;


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


// Función auxiliar para re-escribir el prompt en pantalla
function actualizarPromptVisual() {
    // 🎯 Apuntamos directamente al ID del span que está antes del input
    const promptElemento = document.getElementById('prompt'); 
    
    if (promptElemento) {
        // Si tu rol de SQLite es SUPER_USER te ponemos 'root', si no, tu nombre
        const prefijo = usuarioActual.rol === 'SUPER_USER' ? 'root' : usuarioActual.nombre;
        
        // Modificamos el contenido del span manteniendo tu estética retro
        promptElemento.textContent = `${prefijo}@celtigor:~$`;
        console.log(`[DOM] Etiqueta del prompt cambiada a: ${prefijo}`);
    } else {
        console.warn("[ALERTA DOM] No se encontró el span con id='prompt'.");
    }
}