// src/js/terminal/input.js
import { printLine } from "./terminal.js";
import { beepNormal } from "./sound.js";
import { executeCommand } from "./commandRouter.js";

export function initInput() {
    const input = document.getElementById("user-input");
    // Pasamos el contenedor dinámico exacto de tu nuevo index.html
    const linesContainer = document.getElementById("terminal-lines"); 

    if (!input || !linesContainer) return;

    input.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            const command = input.value.trim();
            input.value = "";

            if (command !== "") {
                beepNormal();
                // Eco del operador en pantalla usando tu clase CSS de usuario
                printLine(`> ${command}`, "terminal-user");
                
                // Despachamos al enrutador modular pasándole el contenedor de líneas
                await executeCommand(command, linesContainer);
            }
        }
    });
}