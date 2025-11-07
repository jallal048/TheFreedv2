// Middleware de manejo de errores para TheFreed.v1
import { Request, Response, NextFunction } from 'express';
import { logger, logError } from '../config/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode = 500, message } = error;

  // Error de validación de Prisma
  if (error.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = 'Error de base de datos';
  }

  // Error de validación de Prisma
  if (error.name === 'PrismaClientValidationError') {
    statusCode = 400;
    message = 'Datos inválidos';
  }

  // Error de JWT
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
  }

  // Log del error
  logError(error, req);

  // Respuesta de error
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: error.name,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        details: error
      })
    },
    timestamp: new Date().toISOString()
  });
};

// Crear error personalizado
export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

// Wrapper para funciones async
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};