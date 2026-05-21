// api/database.js
import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'celtigor.db');
const db = new Database(dbPath, { verbose: console.log });

console.log(`=== MONITOR DE DATOS ASIGNADO EN: ${dbPath} ===`);

// 1. Esculpimos la tabla de operadores
db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE NOT NULL,       
        puntuacion INTEGER DEFAULT 0,       
        rol TEXT DEFAULT 'OPERADOR_LVL1',   
        ultimo_acceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`);

// 2. 👑 PROTOCOLO CORONA: Inyección automática del Creador (Superusuario)
try {
    // Buscamos si ya estás fichado en el sistema
    const creador = db.prepare("SELECT * FROM usuarios WHERE nombre = 'Mortigan'").get();
    
    if (!creador) {
        // Si la base de datos está virgen, te otorgamos los poderes absolutos
        const stmt = db.prepare("INSERT INTO usuarios (nombre, rol) VALUES (?, ?)");
        stmt.run('Mortigan', 'SUPER_USER');
        console.log("[SISTEMA] Crypt_Core inicializado. Superusuario 'Mortigan' dado de alta en la Raíz.");
    }
} catch (error) {
    console.error("[ALERTA] Error en el protocolo Corona:", error.message);
}

export default db;