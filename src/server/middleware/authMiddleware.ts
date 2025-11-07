// Middleware de autenticación JWT para TheFreed.v1
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createError } from './errorHandler';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    userType: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw createError('Token de acceso requerido', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        userType: true,
        isActive: true,
        isSuspended: true
      }
    });

    if (!user) {
      throw createError('Usuario no encontrado', 401);
    }

    if (!user.isActive || user.isSuspended) {
      throw createError('Cuenta suspendida o desactivada', 403);
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(createError('Token inválido o expirado', 401));
    } else {
      next(error);
    }
  }
};

// Middleware para verificar roles específicos
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('No autenticado', 401));
    }

    if (!roles.includes(req.user.userType)) {
      return next(createError('Permisos insuficientes', 403));
    }

    next();
  };
};