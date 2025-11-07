// Configuración de Rate Limiting para TheFreed.v1
import { Options } from 'express-rate-limit';

export const rateLimitConfig: Partial<Options> = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 requests por IP por ventana
  message: {
    error: 'Demasiadas solicitudes desde esta IP',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Saltar rate limiting para health checks
    return req.path === '/health' || req.path === '/api/health';
  }
};

// Rate limiting específico para autenticación
export const authRateLimitConfig: Partial<Options> = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Solo 5 intentos de login por IP
  message: {
    error: 'Demasiados intentos de autenticación',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false
};

// Rate limiting para uploads
export const uploadRateLimitConfig: Partial<Options> = {
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // Máximo 10 uploads por hora
  message: {
    error: 'Demasiados archivos subidos',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
    retryAfter: '1 hora'
  },
  standardHeaders: true,
  legacyHeaders: false
};