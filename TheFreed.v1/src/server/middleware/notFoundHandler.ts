// Middleware para manejar rutas no encontradas (404)
import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: {
      message: error.message,
      code: 'ROUTE_NOT_FOUND',
      statusCode: 404
    },
    timestamp: new Date().toISOString()
  });
};