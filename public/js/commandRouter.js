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

            const nombreLogin = arg.trim().toLowerCase();
            beepDouble();
            printLine(`[SISTEMA] Solicitando autorización y verificando firmas para '${nombreLogin}'...`, "terminal-system");

            // 🔍 Buscamos si este navegador tiene guardada una llave para este usuario concreto
            const llaveGuardada = localStorage.getItem(`celtigor_key_${nombreLogin}`) || "";

            try {
                const respuesta = await fetch('/api/usuarios/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombre: nombreLogin,
                        llaveCliente: llaveGuardada // Mandamos la firma oculta
                    })
                });

                const datos = await respuesta.json();

                if (respuesta.ok) {
                    usuarioActual = { nombre: datos.nombre, rol: datos.rol };

                    // 💾 Guardamos la llave que nos da el servidor para que nadie más la use desde otra máquina
                    localStorage.setItem(`celtigor_key_${datos.nombre}`, datos.llave);

                    beepDouble();
                    printLine(`[OK] ACCESO CONCEDIDO. Bienvenido al núcleo, ${datos.nombre}.`, "terminal-system");

                    if (datos.rol === 'SUPER_USER') {
                        printLine("⚠️ [ALERTA] PRIVILEGIOS DE RAÍZ (ROOT) DETECTADOS. MODO CREADOR ACTIVO.", "terminal-error");
                    }

                    actualizarPromptVisual();
                } else {
                    beepError();
                    printLine(`[ACCESO DENEGADO]: ${datos.error}`, "terminal-error");
                }
            } catch (err) {
                beepError();
                printLine(`[FALLO CRÍTICO DE ENLACE]: No se pudo contactar con el servidor remotos.`, "terminal-error");
            }
            break;

        // ==========================================
        // COMANDO: BACKUP (EXPORTAR IDENTIDAD)
        // ==========================================
        case "backup":
            if (usuarioActual.nombre === "guest") {
                beepError();
                printLine("[ERROR] Imposible exportar sesión. Actualmente opera como 'guest'. Primero inicie sesión.", "terminal-error");
                break;
            }

            printLine("[SISTEMA] Compilando matriz de identidad y empaquetando credenciales...", "terminal-system");

            try {
                // 1. Recuperamos la llave real que Turso asignó a este usuario
                const llaveSecreta = localStorage.getItem(`celtigor_key_${usuarioActual.nombre}`);

                if (!llaveSecreta) {
                    throw new Error("No se encontró la firma digital en los sectores locales.");
                }

                // 2. Estructuramos el objeto de datos que queremos salvar
                const datosSesion = {
                    nombre: usuarioActual.nombre,
                    llave: llaveSecreta
                };

                // 3. Ofuscamos/Ciframos los datos en Base64 para que no sea texto plano legible
                const cadenaTexto = JSON.stringify(datosSesion);
                const datosCifrados = btoa(encodeURIComponent(cadenaTexto)); // Cifrado básico de transporte

                // 4. Creamos un archivo virtual en la memoria del navegador y forzamos la descarga
                const blob = new Blob([datosCifrados], { type: "application/octet-stream" });
                const urlDescarga = URL.createObjectURL(blob);

                const elementoAncla = document.createElement("a");
                elementoAncla.href = urlDescarga;
                elementoAncla.download = `${usuarioActual.nombre}_celtigor.key`; // Nombre del archivo guardado
                document.body.appendChild(elementoAncla);
                elementoAncla.click();

                // Limpieza de memoria
                document.body.removeChild(elementoAncla);
                URL.revokeObjectURL(urlDescarga);

                beepDouble();
                printLine(`[OK] ARCHIVO DE IDENTIDAD GENERADO: '${usuarioActual.nombre}_celtigor.key'. Guarde este archivo en un lugar seguro.`, "terminal-system");
            } catch (err) {
                beepError();
                printLine(`[FALLO CRÍTICO EN EXPORTACIÓN]: ${err.message}`, "terminal-error");
            }
            break;

        // ==========================================
        // COMANDO: IMPORT (LEER ARCHIVO DE IDENTIDAD)
        // ==========================================
        case "import":
            printLine("[SISTEMA] Inicializando lector óptico. Por favor, seleccione su archivo '.key' de identidad...", "terminal-system");

            try {
                // 1. Creamos dinámicamente un selector de archivos HTML en segundo plano
                const inputArchivo = document.createElement("input");
                inputArchivo.type = "file";
                inputArchivo.accept = ".key"; // Solo permitimos extensiones .key

                inputArchivo.onchange = async (evento) => {
                    const archivo = evento.target.files[0];
                    if (!archivo) return;

                    printLine(`[SISTEMA] Leyendo sectores del archivo: ${archivo.name}...`, "terminal-system");

                    const lector = new FileReader();

                    lector.onload = async (e) => {
                        try {
                            const contenidoCifrado = e.target.result;

                            // 2. Deshacemos el cifrado/ofuscación Base64
                            const cadenaDescifrada = decodeURIComponent(atob(contenidoCifrado));
                            const datosRestaurados = JSON.parse(cadenaDescifrada);

                            if (!datosRestaurados.nombre || !datosRestaurados.llave) {
                                throw new Error("Estructura de matriz corrupta o ilegible.");
                            }

                            // 3. Inyectamos los datos restaurados en el LocalStorage de este nuevo navegador
                            localStorage.setItem(`celtigor_key_${datosRestaurados.nombre}`, datosRestaurados.llave);

                            beepDouble();
                            printLine(`[OK] Llave criptográfica inyectada con éxito para el operador: '${datosRestaurados.nombre}'.`, "terminal-system");
                            printLine(`[SISTEMA] Ejecute el comando 'login ${datosRestaurados.nombre}' para sincronizar con Turso.`, "terminal-system");

                        } catch (errorDeLectura) {
                            beepError();
                            printLine("[ERROR] El archivo de llave está corrupto, alterado o no pertenece al protocolo Celtigor OS.", "terminal-error");
                        }
                    };

                    lector.readAsText(archivo);
                };

                // Disparamos la ventana nativa del sistema operativo para elegir el archivo
                inputArchivo.click();

            } catch (err) {
                beepError();
                printLine(`[FALLO CRÍTICO EN LECTURA]: ${err.message}`, "terminal-error");
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
                "  login <nombre>     - Identifica al operador en el núcleo de datos.",
                "  backup             - Exporta un archivo cifrado '.key' con tu identidad.",
                "  import             - Lee un archivo '.key' para restaurar tu sesión en esta máquina.",
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