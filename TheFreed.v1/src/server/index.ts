// Servidor principal de TheFreed.v1
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Cargar variables de entorno
dotenv.config();

// Configuraciones
import { corsConfig } from './config/cors';
import { rateLimitConfig } from './config/rateLimit';
import { logger } from './config/logger';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Rutas
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import contentRoutes from './routes/content';
import subscriptionRoutes from './routes/subscriptions';
import paymentRoutes from './routes/payments';
import messageRoutes from './routes/messages';
import notificationRoutes from './routes/notifications';
import adminRoutes from './routes/admin';
import analyticsRoutes from './routes/analytics';
import moderationRoutes from './routes/moderation';

const app = express();
const PORT = process.env.API_PORT || 5174;

// Configuración de seguridad
app.use(helmet());
app.use(cors(corsConfig));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit(rateLimitConfig);
app.use('/api/', limiter);

// Logging
app.use(morgan('combined', { stream: { write: logger.info } }));

// Parser de body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/moderation', moderationRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'TheFreed.v1 API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`🚀 Servidor TheFreed.v1 iniciado en puerto ${PORT}`);
  logger.info(`📖 Documentación API: http://localhost:${PORT}/api/docs`);
  logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

// Manejar cierre graceful
process.on('SIGTERM', () => {
  logger.info('🛑 Cerrando servidor...');
  process.exit(0);
});

export default app;