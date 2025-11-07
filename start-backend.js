#!/usr/bin/env node

// Script simple para iniciar el backend
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando TheFreed.v1 Backend...');

// Iniciar el servidor
const backend = spawn('node', ['src/server/minimal.js'], {
  cwd: __dirname,
  env: { ...process.env, PORT: '3001' },
  stdio: 'pipe'
});

backend.stdout.on('data', (data) => {
  console.log(`[BACKEND] ${data.toString().trim()}`);
});

backend.stderr.on('data', (data) => {
  console.error(`[BACKEND ERROR] ${data.toString().trim()}`);
});

backend.on('close', (code) => {
  console.log(`[BACKEND] Proceso finalizado con código ${code}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo backend...');
  backend.kill('SIGINT');
  process.exit(0);
});

console.log('✅ Backend iniciando en http://localhost:3001');
console.log('🔍 Endpoints disponibles:');
console.log('  - GET  /health');
console.log('  - GET  /api/health');
console.log('  - GET  /api/status');
console.log('  - GET  /api/test');
console.log('  - GET  /api/users/profile');
console.log('  - POST /api/auth/login');
console.log('  - POST /api/auth/refresh-token');
console.log('  - GET  /api/recommendations');
console.log('  - GET  /api/discover/trending');
console.log('  - GET  /api/discover');
console.log('  - POST /api/analytics/session');
console.log('  - POST /api/analytics/behavior');
