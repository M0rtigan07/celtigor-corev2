// api/db/database.js
import { createClient } from "@libsql/client";

// Configuración híbrida: prioriza Turso, si no, usa archivo local
const urlConfig = process.env.TURSO_DATABASE_URL || "file:local_celtigor.db";
const tokenConfig = process.env.TURSO_AUTH_TOKEN || "";

const db = createClient({
    url: urlConfig,
    authToken: tokenConfig
});

console.log(`=== [NÚCLEO] CONECTANDO A BASE DE DATOS: ${urlConfig} ===`);

// RUTA DE INICIALIZACIÓN FORZADA
(async () => {
    try {
        // 1. Forzamos la creación de la tabla. Esto obligará a crear el archivo 'local_celtigor.db' en tu raíz.
        await db.execute(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT UNIQUE NOT NULL,       
                llave TEXT NOT NULL,                
                puntuacion INTEGER DEFAULT 0,       
                rol TEXT DEFAULT 'OPERADOR_LVL1',   
                ultimo_acceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("[NÚCLEO] Estructura de tabla 'usuarios' verificada/creada.");

        // 2. Comprobamos si el administrador 'manu' ya está dentro de esta base de datos
        const checkRoot = await db.execute({
            sql: "SELECT * FROM usuarios WHERE nombre = ?",
            args: ["manu"]
        });
        
        // 3. Si no existe en esta base de datos local, lo inyectamos con tu clave maestra
        if (checkRoot.rows.length === 0) {
            await db.execute({
                sql: "INSERT INTO usuarios (nombre, rol, llave) VALUES (?, ?, ?)",
                args: ["manu", "SUPER_USER", "MI_LLAVE_SECRETA_ROOT_123"]
            });
            console.log("⚠️ [SEGURIDAD] Superusuario 'manu' creado con éxito en la base de datos local.");
        } else {
            console.log(`[SEGURIDAD] Superusuario 'manu' detectado en el sistema. Llave esperada: [${checkRoot.rows[0].llave}]`);
        }

    } catch (error) {
        console.error("[ERROR CRÍTICO] Fallo al inicializar los sectores de la base de datos:", error.message);
    }
})();

export default db;