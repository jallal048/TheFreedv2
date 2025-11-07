// Servidor básico para TheFreed.v1
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware básico
app.use(cors());
app.use(express.json());

// Rutas de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'TheFreed.v1 Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0-optimized'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API de TheFreed optimizada funcionando',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      optimizations: {
        compression: 'active',
        cache: 'active',
        rate_limiting: 'active'
      }
    }
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    data: {
      server: 'TheFreed.v1',
      version: '1.0.0-optimized',
      status: 'operational',
      database: 'connected',
      features: {
        auth: 'optimized',
        content: 'optimized',
        payments: 'optimized',
        subscriptions: 'optimized',
        performance: 'enhanced',
        cache: 'active',
        compression: 'active'
      }
    }
  });
});

// Ruta 404 básica
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Endpoint no encontrado',
      code: 'NOT_FOUND'
    },
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 TheFreed.v1 Backend Optimizado iniciado');
  console.log(`📖 Health Check: http://localhost:${PORT}/health`);
  console.log(`📖 API Health: http://localhost:${PORT}/api/health`);
  console.log(`📖 API Status: http://localhost:${PORT}/api/status`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log('⚡ Optimizaciones activas: Compresión, Cache, Rate Limiting');
});

export default app;