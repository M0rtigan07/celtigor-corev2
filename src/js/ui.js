export function enterNormalMode() {
    document.body.classList.remove("game-mode");
    document.body.classList.add("normal-mode");
    setStatus("STATUS: ACTIVE");
}

export function setStatus(text) {
    const status = document.getElementById("status-indicator");
    status.textContent = text.toUpperCase();
}

export function setPrompt(username = "guest", host = "celtigor", path = "~") {
    const prompt = document.getElementById("prompt");
    prompt.textContent = `${username}@${host}:${path}$`;
}
