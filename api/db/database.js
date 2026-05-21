// api/database.js
import { createClient } from "@libsql/client";

// 🔌 Conexión oficial directa con Turso usando tus variables de entorno
const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log("=== SISTEMA CONECTADO AL NÚCLEO DE TURSO DE FORMA DIRECTA ===");

// Ejecutamos la creación de la tabla en segundo plano al arrancar el servidor
(async () => {
    try {
        // 1. Creamos la tabla de usuarios si no existe en tu base de datos de Turso
        await db.execute(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT UNIQUE NOT NULL,       
                puntuacion INTEGER DEFAULT 0,       
                rol TEXT DEFAULT 'OPERADOR_LVL1',   
                ultimo_acceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. 👑 Inyectamos tu trono de Superusuario si la base de datos está virgen
        const resultado = await db.execute({
            sql: "SELECT * FROM usuarios WHERE nombre = ?",
            args: ["manu"]
        });
        
        if (resultado.rows.length === 0) {
            await db.execute({
                sql: "INSERT INTO usuarios (nombre, rol) VALUES (?, ?)",
                args: ["manu", "SUPER_USER"]
            });
            console.log("[TURSO] Superusuario 'manu' asegurado en la raíz de la nube.");
        }
    } catch (error) {
        console.error("[TURSO ALERTA] Fallo al inicializar tablas remotas:", error.message);
    }
})();

// Exportamos 'db' para que login.js siga funcionando sin tocar nada
export default db;