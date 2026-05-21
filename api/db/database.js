// api/database.js
import { createClient } from '@libsql/client';

// 🔌 CONFIGURACIÓN DE ENLACE HÍBRIDO
// Si existe la variable de entorno de Turso (en Vercel), la usa. Si no, usa el archivo local.
const urlConfig = process.env.TURSO_DATABASE_URL || "file:celtigor.db";
const authTokenConfig = process.env.TURSO_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzkzNzgxNTcsImlkIjoiMDE5ZTRiMzMtZjUwMS03MGUyLTg5MjctZDA2YmYxN2MxNzZmIiwicmlkIjoiZjE1YmZjMjYtNTkxNC00YjIyLTkzYzItYTI4YTU4OWZmYjY2In0.C7eGkOqDoPARb3SB5oz_mhRimc0-VMOnJwbFqtJtNxeW1LUW-tCjrf4UpbiN0Ix8AVbW8sEseTq76eGNJKF0DQ";

const db = createClient({
    url: urlConfig,
    authToken: authTokenConfig
});

console.log(`=== MONITOR DE DATOS CONECTADO A: ${urlConfig} ===`);

// Inicializamos la tabla usando el método correcto de libSQL (.execute)
// Ponemos un await simulado dentro de un bloque autoejecutable por compatibilidad
(async () => {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT UNIQUE NOT NULL,       
                puntuacion INTEGER DEFAULT 0,       
                rol TEXT DEFAULT 'OPERADOR_LVL1',   
                ultimo_acceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Comprobamos si el creador está en el trono
        const resultado = await db.execute({
            sql: "SELECT * FROM usuarios WHERE nombre = ?",
            args: ["manu"]
        });
        
        if (resultado.rows.length === 0) {
            await db.execute({
                sql: "INSERT INTO usuarios (nombre, rol) VALUES (?, ?)",
                args: ["manu", "SUPER_USER"]
            });
            console.log("[SISTEMA] Superusuario 'manu' inyectado en el núcleo.");
        }
    } catch (error) {
        console.error("[ALERTA] Error inicializando base de datos:", error.message);
    }
})();

export default db;