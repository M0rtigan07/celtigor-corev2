// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
// Importamos tu endpoint de login tal cual lo creamos
import loginHandler from './api/usuarios/login.js';
import 'dotenv/config';

const app = express();

// 1. Configuración necesaria para obtener la ruta actual en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const PORT = 3000;

// Permitimos que el servidor lea JSON del frontend
app.use(express.json());

// 2. 🎯 LA LÍNEA CLAVE: Servir archivos estáticos
// Si tus archivos index.html, CSS y JS están en una carpeta llamada 'public':
app.use(express.static(path.join(__dirname, 'public')));

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