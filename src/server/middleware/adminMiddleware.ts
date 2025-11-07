// Middleware de administrador para TheFreed.v1
import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { createError } from './errorHandler';

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(createError('No autenticado', 401));
  }

  if (req.user.userType !== 'ADMIN') {
    return next(createError('Acceso denegado. Se requieren permisos de administrador', 403));
  }

  next();
};