// api/usuarios/login.js
import db from '../db/database.js';
import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido.' });
    }

    try {
        const { nombre, llaveCliente } = req.body;
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'Identificador de operador vacío.' });
        }

        const nombreLimpio = nombre.trim().toLowerCase();

        // Buscamos al usuario en Turso
        const queryBuscar = await db.execute({
            sql: 'SELECT * FROM usuarios WHERE nombre = ?',
            args: [nombreLimpio]
        });
        
        let usuario = queryBuscar.rows[0];

        // 🛡️ CASO 1: El usuario ya existe en el búnker
        if (usuario) {
            // Validamos si la llave que manda el navegador coincide con la de Turso
            if (usuario.llave !== llaveCliente) {
                return res.status(401).json({ error: 'Firma digital inválida. Usurpación de identidad detectada.' });
            }
        } 
        // 🛡️ CASO 2: Es un usuario nuevo, le fabricamos su llave de acceso
        else {
            // Generamos un token aleatorio de 32 caracteres
            const nuevaLlave = crypto.randomBytes(16).toString('hex');

            await db.execute({
                sql: 'INSERT INTO usuarios (nombre, llave) VALUES (?, ?)',
                args: [nombreLimpio, nuevaLlave]
            });
            
            const reBuscar = await db.execute({
                sql: 'SELECT * FROM usuarios WHERE nombre = ?',
                args: [nombreLimpio]
            });
            usuario = reBuscar.rows[0];
        }

        // Actualizamos acceso
        await db.execute({
            sql: 'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = ?',
            args: [usuario.id]
        });

        // Devolvemos los datos y la llave (para que el front la guarde si es nuevo)
        return res.status(200).json({
            id: Number(usuario.id),
            nombre: usuario.nombre,
            rol: usuario.rol,
            llave: usuario.llave // Enviamos la llave de vuelta para almacenarla
        });

    } catch (error) {
        return res.status(500).json({ error: `Fallo en sector de memoria: ${error.message}` });
    }
}