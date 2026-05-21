// api/usuarios/login.js
import db from '../db/database.js';

export default async function handler(req, res) {
    // 1. Validamos que la petición sea un POST (enviar datos)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido. Use protocolo POST.' });
    }

    try {
        const { nombre } = req.body;

        // Limpieza básica del texto introducido por seguridad analógica
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'Identificador de operador vacío.' });
        }

        const nombreLimpio = nombre.trim().toLowerCase();

        // 2. Interrogamos a SQLite: ¿Ya existe este operador en el búnker?
        const queryBuscar = db.prepare('SELECT * FROM usuarios WHERE nombre = ?');
        let usuario = queryBuscar.get(nombreLimpio);

        // 3. Si NO existe, lo damos de alta automáticamente como usuario raso
        if (!usuario) {
            const queryInsertar = db.prepare('INSERT INTO usuarios (nombre) VALUES (?)');
            queryInsertar.run(nombreLimpio);
            
            // Lo volvemos a buscar para recuperar el objeto recién creado con su ID y Rol por defecto
            usuario = queryBuscar.get(nombreLimpio);
            console.log(`[BÚNKER] Nuevo operador registrado en el núcleo: ${nombreLimpio}`);
        } else {
            console.log(`[BÚNKER] Acceso concedido a operador existente: ${nombreLimpio} (${usuario.rol})`);
        }

        // 4. Actualizamos su fecha de último acceso para tener los logs al día
        const queryUpdate = db.prepare('UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = ?');
        queryUpdate.run(usuario.id);

        // 5. Devolvemos los datos del usuario al frontend (commandRouter.js)
        return res.status(200).json({
            id: usuario.id,
            nombre: usuario.nombre,
            rol: usuario.rol
        });

    } catch (error) {
        console.error('[CRÍTICO] Fallo en el endpoint de login:', error.message);
        return res.status(500).json({ error: 'Fallo crítico en el sector de memoria de SQLite.' });
    }
}