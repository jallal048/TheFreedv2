// Servidor ultra-simple sin patrones de ruta problemáticos
import express from 'express';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.API_PORT || 5174;

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware CORS para desarrollo
app.use((req, res, next) => {
  const corsOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.header('Access-Control-Allow-Origin', corsOrigin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Rutas básicas - sin patrones de wildcard problemáticos
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0-ultra-simple'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0-ultra-simple'
    }
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    data: {
      server: {
        uptime: process.uptime(),
        port: PORT,
        version: '1.0.0-ultra-simple'
      },
      timestamp: new Date().toISOString()
    }
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'TheFreed.v1 API funcionando correctamente',
    timestamp: new Date().toISOString(),
    data: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }
  });
});

app.get('/api/users/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      id: '1',
      username: 'demo_user',
      email: 'demo@thefreed.com',
      role: 'user',
      createdAt: new Date().toISOString()
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Email y contraseña requeridos',
        code: 'VALIDATION_ERROR'
      }
    });
  }
  
  // Mock de login exitoso
  res.json({
    success: true,
    data: {
      token: 'mock-jwt-token-12345',
      refreshToken: 'mock-refresh-token-12345',
      user: {
        id: '1',
        username: 'demo_user',
        email: email
      }
    },
    message: 'Login exitoso'
  });
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'TheFreed.v1 Ultra Simple Server',
    endpoints: [
      '/health',
      '/api/health',
      '/api/status',
      '/api/test',
      '/api/auth/login',
      '/api/users/profile'
    ]
  });
});

// Ruta catch-all simple (sin patterns problemáticos)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Ruta no encontrada: ${req.originalUrl}`,
      code: 'NOT_FOUND',
      availableRoutes: [
        '/',
        '/health',
        '/api/health',
        '/api/status',
        '/api/test',
        '/api/auth/login',
        '/api/users/profile'
      ]
    },
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Servidor TheFreed.v1 Ultra Simple iniciado');
  console.log(`🌐 Puerto: ${PORT}`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 API Status: http://localhost:${PORT}/api/status`);
  console.log('✅ Servidor listo para desarrollo frontend');
  console.log('-------------------------------------------------');
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

export default app;