// src/js/terminal/terminal.js

export function initTerminal() {
    // Inicializador del buffer limpio, listo para recibir líneas
    console.log("Buffer visual listo.");
}

export function printLine(text, cssClass = "terminal-system") {
    const output = document.getElementById("terminal-lines");
    if (!output) return;

    const line = document.createElement("div");
    line.classList.add(cssClass, "crt-line"); // Aplica tus estilos y animación CRT de estilo.css
    line.innerHTML = text;

    output.appendChild(line);
    
    // Auto-scroll automático hacia la última orden ejecutada
    const terminalParent = document.getElementById("terminal-output");
    if (terminalParent) {
        terminalParent.scrollTop = terminalParent.scrollHeight;
    }
}