// Servidor simplificado de TheFreed.v1 para pruebas - VERSIÓN OPTIMIZADA
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import LRU from 'lru-cache';
import { createClient } from 'redis';

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

// Rate limiting más eficiente con Redis (si está disponible)
let rateLimiter: any;

if (process.env.REDIS_URL) {
  // Usar Redis en producción para distribución multi-instancia
  const redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.connect().catch(console.error);
  
  rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rl_main',
    points: 100, // Número de puntos
    duration: 60 * 15, // Duración en segundos (15 minutos)
    blockDuration: 0, // No bloquear, solo limitar
  });
} else {
  // Usar memoria en desarrollo
  rateLimiter = new RateLimiterMemory({
    keyPrefix: 'rl_main',
    points: 100, // Número de puntos
    duration: 60 * 15, // Duración en segundos (15 minutos)
    blockDuration: 0, // No bloquear, solo limitar
  });
}

// Middleware de rate limiting eficiente
const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      error: {
        message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: secs
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Middleware de compresión gzip optimizado
const compressionMiddleware = compression({
  filter: (req, res) => {
    // Solo comprimir si es beneficial (tipo de contenido apropiado)
    const contentType = res.getHeader('Content-Type') as string;
    if (!contentType) return false;
    
    // Tipos de contenido que se benefician de compresión
    const compressibleTypes = [
      'text/plain',
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'application/json',
      'application/xml',
      'text/xml',
      'image/svg+xml'
    ];
    
    return compressibleTypes.some(type => contentType.includes(type));
  },
  threshold: 1024, // Solo comprimir respuestas mayores a 1KB
  level: 6, // Nivel de compresión balanceado
});

// Middleware de caché para respuestas GET
const cacheMiddleware = (duration: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Solo cachear requests GET
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `${req.method}-${req.path}-${JSON.stringify(req.query)}`;
    const cached = responseCache.get(cacheKey);

    if (cached) {
      // Headers de caché para respuesta cacheada
      res.set({
        'X-Cache': 'HIT',
        'Cache-Control': `public, max-age=${Math.floor(duration / 1000)}`,
        'ETag': `"cached-${Date.now()}"`,
        'Expires': new Date(Date.now() + duration).toUTCString(),
      });
      return res.json(cached);
    }

    // Guardar referencia original de res.json
    const originalJson = res.json.bind(res);
    
    res.json = function(body: any) {
      // Cachear la respuesta
      responseCache.set(cacheKey, body);
      
      // Headers de caché para nueva respuesta
      res.set({
        'X-Cache': 'MISS',
        'Cache-Control': `public, max-age=${Math.floor(duration / 1000)}`,
        'ETag': `"${Buffer.from(JSON.stringify(body)).toString('base64').slice(0, 16)}"`,
        'Expires': new Date(Date.now() + duration).toUTCString(),
      });
      
      return originalJson(body);
    };

    next();
  };
};

// Configuración optimizada de middleware
app.disable('x-powered-by'); // Mejorar seguridad
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Logger optimizado solo en desarrollo
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(cookieParser());
app.use(compressionMiddleware);

// Optimización de parsing JSON
app.use(express.json({ 
  limit: '10mb',
  strict: true,
  type: 'application/json',
  verify: (req: any, res: Response, buf: Buffer) => {
    // Verificar que es JSON válido
    if (buf.length && buf[0] !== 0x7b) { // 0x7b = {
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 1000 // Limitar número de parámetros
}));

// Aplicar rate limiting eficiente
app.use('/api/', rateLimitMiddleware);

// Limpiar caché periódicamente
setInterval(() => {
  const size = responseCache.size;
  const maxSize = responseCache.max;
  console.log(`🔄 Cache stats: ${size}/${maxSize} entries`);
}, 300000); // Cada 5 minutos

// Ruta de salud mejorada
app.get('/health', (req, res) => {
  // Headers de caché para health check
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  res.json({
    status: 'OK',
    message: 'TheFreed.v1 API funcionando correctamente (modo optimizado)',
    timestamp: new Date().toISOString(),
    version: '1.0.0-optimized',
    performance: {
      cacheEnabled: true,
      compressionEnabled: true,
      rateLimiterType: rateLimiter.constructor.name,
      cacheStats: {
        size: responseCache.size,
        maxSize: responseCache.max,
        ttl: cacheOptions.ttl
      }
    }
  });
});

// Rutas básicas de API con caché y optimización
app.get('/api/health', 
  cacheMiddleware(60000), // Cache por 1 minuto
  (req, res) => {
    res.json({
      success: true,
      message: 'API de TheFreed funcionando',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        performance: {
          compression: 'gzip',
          caching: 'enabled',
          rateLimiting: 'flexible'
        }
      }
    });
  }
);

app.get('/api/status', 
  cacheMiddleware(120000), // Cache por 2 minutos
  (req, res) => {
    const statusData = {
      success: true,
      data: {
        server: 'TheFreed.v1',
        version: '1.0.0-optimized',
        status: 'operational',
        database: 'disconnected', // Simplificado por ahora
        environment: NODE_ENV,
        features: {
          auth: 'basic',
          content: 'basic',
          payments: 'basic',
          subscriptions: 'basic'
        },
        performance: {
          compression: 'gzip-enabled',
          caching: 'lru-cache',
          rateLimiting: 'redis-memory-flexible',
          cacheSize: responseCache.size,
          cacheMax: responseCache.max
        }
      }
    };
    
    res.json(statusData);
  }
);

// Endpoint para limpiar caché (solo en desarrollo)
if (NODE_ENV === 'development') {
  app.post('/api/admin/clear-cache', (req, res) => {
    responseCache.clear();
    res.json({
      success: true,
      message: 'Cache limpiado correctamente',
      timestamp: new Date().toISOString()
    });
  });
}

// Endpoint para ver estadísticas del servidor
app.get('/api/admin/stats', 
  cacheMiddleware(30000), // Cache por 30 segundos
  (req, res) => {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    res.json({
      success: true,
      data: {
        server: {
          uptime: Math.floor(uptime),
          environment: NODE_ENV,
          version: '1.0.0-optimized'
        },
        performance: {
          memory: {
            rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
          },
          cache: {
            size: responseCache.size,
            maxSize: responseCache.max,
            ttl: cacheOptions.ttl,
            hitRate: responseCache.hits > 0 ? 
              `${Math.round((responseCache.hits / (responseCache.hits + responseCache.misses)) * 100)}%` : 
              'N/A'
          },
          compression: 'enabled',
          rateLimiting: rateLimiter.constructor.name
        },
        timestamp: new Date().toISOString()
      }
    });
  }
);

// Ruta para invalidar caché específico
app.delete('/api/cache/:key', (req, res) => {
  const { key } = req.params;
  const deleted = responseCache.delete(key);
  
  res.json({
    success: true,
    message: deleted ? 'Entrada eliminada del cache' : 'Entrada no encontrada',
    key,
    timestamp: new Date().toISOString()
  });
});

// Manejo mejorado de errores con información de rendimiento
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  // Log del error (solo en desarrollo)
  if (NODE_ENV === 'development') {
    console.error('❌ Error occurred:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }

  const status = error.status || error.statusCode || 500;
  const message = NODE_ENV === 'production' && status === 500 
    ? 'Error interno del servidor' 
    : error.message || 'Error interno del servidor';

  // Headers para respuesta de error
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Error-Code': error.code || 'INTERNAL_ERROR'
  });

  res.status(status).json({
    success: false,
    error: {
      message,
      code: error.code || 'INTERNAL_ERROR',
      ...(NODE_ENV === 'development' && { stack: error.stack })
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

// Manejo de rutas no encontradas con headers de caché apropiados
app.use('/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Ruta no encontrada: ${req.originalUrl}`,
      code: 'NOT_FOUND'
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
  
  // Cerrar rate limiter si usa Redis
  if (rateLimiter instanceof RateLimiterRedis) {
    rateLimiter.close();
  }
  
  console.log('✅ Graceful shutdown completed');
  process.exit(0);
};

// Eventos de cierre graceful
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Función para iniciar el servidor con retry
const startServer = async (retries = 3) => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor TheFreed.v1 optimizado iniciado en puerto ${PORT}`);
      console.log(`📖 Health check: http://localhost:${PORT}/health`);
      console.log(`📖 API Health: http://localhost:${PORT}/api/health`);
      console.log(`📖 API Status: http://localhost:${PORT}/api/status`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`🔧 Environment: ${NODE_ENV}`);
      console.log(`⚡ Performance optimizations enabled:`);
      console.log(`   • Compression: gzip`);
      console.log(`   • Caching: LRU (${responseCache.max} entries)`);
      console.log(`   • Rate Limiting: ${rateLimiter.constructor.name}`);
      console.log(`   • JSON Parsing: optimized`);
    });

    // Manejo de errores del servidor
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE' && retries > 0) {
        console.log(`⚠️ Puerto ${PORT} ocupado, reintentando en 2s... (${retries} intentos restantes)`);
        setTimeout(() => startServer(retries - 1), 2000);
      } else {
        console.error('❌ Error starting server:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();

export default app;