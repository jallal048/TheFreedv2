// Middleware de validación para TheFreed.v1
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { createError } from './errorHandler';

// Validación de errores
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return next(
      createError(
        `Datos de entrada inválidos: ${errors.array().map(e => e.msg).join(', ')}`,
        400
      )
    );
  }
  
  next();
};

// Validaciones comunes
export const commonValidations = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  password: body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
  
  username: body('username')
    .isAlphanumeric('es-ES', { ignore: '_-' })
    .isLength({ min: 3, max: 20 })
    .withMessage('El nombre de usuario debe tener entre 3 y 20 caracteres'),
  
  firstName: body('firstName')
    .isLength({ min: 1, max: 50 })
    .withMessage('El nombre debe tener entre 1 y 50 caracteres'),
  
  lastName: body('lastName')
    .isLength({ min: 1, max: 50 })
    .withMessage('El apellido debe tener entre 1 y 50 caracteres')
};