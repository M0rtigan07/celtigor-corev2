// api/usuarios/login.js
import db from '../db/database.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido.' });
    }

    try {
        const { nombre } = req.body;
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'Identificador de operador vacío.' });
        }

        const nombreLimpio = nombre.trim().toLowerCase();

        // 🔍 Interrogamos con la nueva sintaxis de Turso/libSQL
        const queryBuscar = await db.execute({
            sql: 'SELECT * FROM usuarios WHERE nombre = ?',
            args: [nombreLimpio]
        });
        
        let usuario = queryBuscar.rows[0];

        // 📝 Si no existe, lo registramos
        if (!usuario) {
            await db.execute({
                sql: 'INSERT INTO usuarios (nombre) VALUES (?)',
                args: [nombreLimpio]
            });
            
            // Re-buscamos para traer sus datos
            const reBuscar = await db.execute({
                sql: 'SELECT * FROM usuarios WHERE nombre = ?',
                args: [nombreLimpio]
            });
            usuario = reBuscar.rows[0];
        }

        // 🔄 Actualizamos la estampa de tiempo
        await db.execute({
            sql: 'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = ?',
            args: [usuario.id]
        });

        return res.status(200).json({
            id: Number(usuario.id),
            nombre: usuario.nombre,
            rol: usuario.rol
        });

    } catch (error) {
        console.error('[CRÍTICO] Fallo en login:', error.message);
        return res.status(500).json({ error: `Error en sector de memoria: ${error.message}` });
    }
}