// server.js
import express from 'express';
import { join } from 'path';
// Importamos tu endpoint de login tal cual lo creamos
import loginHandler from './api/usuarios/login.js';

const app = express();
const PORT = 3000;

// Permitimos que el servidor lea JSON del frontend
app.use(express.json());

// Servimos tus archivos estáticos del frontend (HTML, CSS, JS)
app.use(express.static(process.cwd()));

// 🟢 AQUÍ SOLDAMOS EL PUENTE INTERNO EN LOCAL
app.post('/api/usuarios/login', (req, res) => {
    // Simulamos el comportamiento de Vercel pasándole req y res
    loginHandler(req, res);
});

// Arrancamos el núcleo analógico
app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(` 🟢 KERNEL EN LÍNEA: http://localhost:${PORT}`);
    console.log(`    Conectado al archivo de datos 'celtigor.db'`);
    console.log(`==================================================\n`);
});