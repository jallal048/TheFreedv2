// Servidor simplificado de TheFreed.v1 - VERSIÓN ULTRA ESTABLE
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import LRU from 'lru-cache';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 5174;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configuración de cache en memoria - LRU Cache
const cacheOptions = {
  max: 1000, // Máximo 1000 elementos
  ttl: 5 * 60 * 1000, // 5 minutos TTL
  allowStale: false,
  updateAgeOnGet: true,
  updateAgeOnHas: true,
};

const responseCache = new LRU<string, any>(cacheOptions);

// Configuración de Rate Limiting
const rateLimiter = new RateLimiterMemory({
  points: 100, // Número de requests
  duration: 60, // Por 60 segundos
});

// Middleware de seguridad optimizado según entorno
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  } : false,
  crossOriginEmbedderPolicy: false
}));

// CORS optimizado para desarrollo
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Logger optimizado según entorno
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Compresión gzip para respuestas
app.use(compression());

// Parser optimizado
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Middleware de rate limiting global
app.use((req: Request, res: Response, next: NextFunction) => {
  rateLimiter.consume(req.ip)
    .then(() => {
      // Añadir headers útiles para debugging
      res.set({
        'X-RateLimit-Remaining': '99',
        'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString(),
      });
      next();
    })
    .catch(() => {
      res.status(429).json({
        success: false,
        error: {
          message: 'Demasiadas solicitudes, intenta de nuevo en 1 minuto',
          code: 'RATE_LIMIT_EXCEEDED'
        }
      });
    });
});

// Cache middleware para endpoints GET
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET' && !req.url.includes('/api/admin/')) {
    const cacheKey = `${req.method}:${req.url}`;
    const cached = responseCache.get(cacheKey);
    
    if (cached) {
      res.set({
        'X-Cache': 'HIT',
        'Cache-Control': 'private, max-age=300',
        'ETag': `"${Date.now()}-${req.url}"`
      });
      return res.json(cached);
    }
    
    // Interceptar res.json para cachear la respuesta
    const originalJson = res.json;
    res.json = function(data: any) {
      if (data && !data.error) {
        responseCache.set(cacheKey, data);
        res.set({
          'X-Cache': 'MISS',
          'Cache-Control': 'private, max-age=300',
          'ETag': `"${Date.now()}-${req.url}"`
        });
      }
      return originalJson.call(this, data);
    };
  }
  next();
});

// =============================================================================
// RUTAS DE LA API
// =============================================================================

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: '1.0.0'
  });
});

// Health check con información del servidor
app.get('/api/health', (req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    memory: process.memoryUsage(),
    version: '1.0.0',
    features: {
      compression: true,
      cache: true,
      rateLimit: true,
      cors: true,
      helmet: true
    }
  };
  
  res.json({
    success: true,
    data: health
  });
});

// API Status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  const status = {
    server: {
      uptime: process.uptime(),
      environment: NODE_ENV,
      port: PORT,
      version: '1.0.0'
    },
    performance: {
      memory: process.memoryUsage(),
      cache: {
        size: responseCache.size,
        hits: responseCache.hits,
        misses: responseCache.misses,
        hitRate: responseCache.hits + responseCache.misses > 0 ? 
          `${Math.round((responseCache.hits / (responseCache.hits + responseCache.misses)) * 100)}%` : 
          'N/A'
      }
    },
    timestamp: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: status
  });
});

// API routes básicas para desarrollo
app.get('/api/test', (req: Request, res: Response) => {
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

// API usuarios mock (para desarrollo frontend)
app.get('/api/users/profile', (req: Request, res: Response) => {
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

app.post('/api/auth/login', (req: Request, res: Response) => {
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

// Admin endpoints (solo para desarrollo)
app.get('/api/admin/stats', (req: Request, res: Response) => {
  const stats = {
    server: {
      uptime: process.uptime(),
      environment: NODE_ENV,
      timestamp: new Date().toISOString()
    },
    performance: {
      memory: process.memoryUsage(),
      cache: {
        size: responseCache.size,
        hits: responseCache.hits,
        misses: responseCache.misses,
        hitRate: responseCache.hits + responseCache.misses > 0 ? 
          `${Math.round((responseCache.hits / (responseCache.hits + responseCache.misses)) * 100)}%` : 
          'N/A'
      }
    },
    requests: {
      total: 0,
      errors: 0,
      averageResponseTime: 0
    }
  };
  
  res.json({
    success: true,
    data: stats
  });
});

// Limpiar cache endpoint (solo desarrollo)
app.post('/api/admin/clear-cache', (req: Request, res: Response) => {
  responseCache.clear();
  
  res.json({
    success: true,
    message: 'Cache limpiado correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta de fallback para rutas no encontradas
app.get('/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Ruta no encontrada: ${req.originalUrl}`,
      code: 'NOT_FOUND',
      availableRoutes: [
        '/health',
        '/api/health',
        '/api/status',
        '/api/test',
        '/api/auth/login',
        '/api/users/profile',
        '/api/admin/stats'
      ]
    },
    timestamp: new Date().toISOString()
  });
});

// Middleware de manejo de errores
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: NODE_ENV === 'development' ? err.message : 'Error interno del servidor',
      code: err.code || 'INTERNAL_ERROR',
      ...(NODE_ENV === 'development' && { stack: err.stack })
    },
    timestamp: new Date().toISOString()
  });
});

// Log de estadísticas cada 5 minutos
setInterval(() => {
  const stats = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cache: {
      size: responseCache.size,
      hits: responseCache.hits,
      misses: responseCache.misses
    }
  };
  
  console.log('📊 Stats:', stats);
}, 5 * 60 * 1000);

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log('🚀 Servidor TheFreed.v1 iniciado');
  console.log(`🌐 Entorno: ${NODE_ENV}`);
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 API Status: http://localhost:${PORT}/api/status`);
  console.log('✅ Optimizaciones activas:');
  console.log('   - Compresión Gzip');
  console.log('   - Cache LRU en memoria');
  console.log('   - Rate Limiting');
  console.log('   - Headers de seguridad');
  console.log('   - CORS configurado');
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