// Sistema centralizado de manejo de errores

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'No autenticado') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Demasiadas solicitudes, intenta más tarde') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Error de conexión') {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

// Tipos de errores de la API
export interface ApiErrorResponse {
  error: {
    message: string;
    code?: string;
    statusCode?: number;
    details?: any;
  };
}

// Handler principal de errores
export const handleError = (error: unknown): AppError => {
  // Si ya es un AppError, retornarlo
  if (error instanceof AppError) {
    return error;
  }

  // Si es un error de fetch/network
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError('No se pudo conectar con el servidor');
  }

  // Si es un error de la API
  if (typeof error === 'object' && error !== null) {
    const apiError = error as any;
    
    // Error con respuesta de la API
    if (apiError.response) {
      const { status, data } = apiError.response;
      const message = data?.error?.message || data?.message || 'Error del servidor';
      const code = data?.error?.code || data?.code;
      const details = data?.error?.details || data?.details;
      
      return new AppError(message, status, code, details);
    }
    
    // Error de validación de Zod
    if (apiError.name === 'ZodError') {
      return new ValidationError('Datos inválidos', apiError.errors);
    }
    
    // Error genérico con mensaje
    if (apiError.message) {
      return new AppError(apiError.message);
    }
  }

  // Error desconocido
  return new AppError('Ha ocurrido un error inesperado', 500, 'UNKNOWN_ERROR');
};

// Obtener mensaje de error amigable para el usuario
export const getErrorMessage = (error: unknown): string => {
  const appError = handleError(error);
  
  // Mensajes personalizados según el código de error
  switch (appError.code) {
    case 'AUTHENTICATION_ERROR':
      return 'Por favor, inicia sesión para continuar';
    case 'AUTHORIZATION_ERROR':
      return 'No tienes permisos para realizar esta acción';
    case 'VALIDATION_ERROR':
      return appError.message || 'Los datos proporcionados no son válidos';
    case 'NOT_FOUND_ERROR':
      return appError.message || 'El recurso solicitado no existe';
    case 'CONFLICT_ERROR':
      return appError.message || 'Ya existe un recurso con estos datos';
    case 'RATE_LIMIT_ERROR':
      return 'Has excedido el límite de solicitudes. Espera un momento';
    case 'NETWORK_ERROR':
      return 'No se pudo conectar con el servidor. Verifica tu conexión';
    default:
      return appError.message || 'Ha ocurrido un error inesperado';
  }
};

// Determinar si el error requiere autenticación
export const isAuthError = (error: unknown): boolean => {
  const appError = handleError(error);
  return appError.statusCode === 401 || appError.code === 'AUTHENTICATION_ERROR';
};

// Determinar si el error es de validación
export const isValidationError = (error: unknown): boolean => {
  const appError = handleError(error);
  return appError.code === 'VALIDATION_ERROR';
};

// Determinar si el error es de red
export const isNetworkError = (error: unknown): boolean => {
  const appError = handleError(error);
  return appError.code === 'NETWORK_ERROR';
};

// Log de errores (puede ser extendido para enviar a servicios externos)
export const logError = (error: unknown, context?: string): void => {
  const appError = handleError(error);
  
  console.error('Error:', {
    message: appError.message,
    code: appError.code,
    statusCode: appError.statusCode,
    context,
    details: appError.details,
    stack: appError.stack,
  });
  
  // Aquí podrías enviar el error a un servicio externo como Sentry
  // if (process.env.NODE_ENV === 'production') {
  //   sentryService.captureException(appError, { context });
  // }
};

// Retry logic para operaciones que fallan
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // No reintentar si es un error de validación o autorización
      if (isValidationError(error) || isAuthError(error)) {
        throw error;
      }
      
      // Esperar antes de reintentar
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }
  
  throw lastError;
};

// Wrapper para funciones asíncronas con manejo de errores
export const asyncHandler = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, fn.name);
      throw handleError(error);
    }
  };
};

// Extraer detalles de validación de un error
export const getValidationErrors = (error: unknown): Record<string, string> => {
  const appError = handleError(error);
  
  if (appError.code === 'VALIDATION_ERROR' && appError.details) {
    // Si los detalles son un objeto con campos y mensajes
    if (typeof appError.details === 'object') {
      return appError.details;
    }
    
    // Si es un array de errores de Zod
    if (Array.isArray(appError.details)) {
      const errors: Record<string, string> = {};
      appError.details.forEach((err: any) => {
        if (err.path && err.message) {
          errors[err.path.join('.')] = err.message;
        }
      });
      return errors;
    }
  }
  
  return {};
};

// Verificar si una operación puede ser reintentada
export const canRetry = (error: unknown): boolean => {
  const appError = handleError(error);
  
  // No reintentar errores de cliente (4xx)
  if (appError.statusCode >= 400 && appError.statusCode < 500) {
    return false;
  }
  
  // Reintentar errores de servidor (5xx) y de red
  return appError.statusCode >= 500 || appError.code === 'NETWORK_ERROR';
};

// Formatear error para mostrar al usuario
export const formatErrorForUser = (error: unknown): {
  title: string;
  message: string;
  details?: string[];
} => {
  const appError = handleError(error);
  
  let title = 'Error';
  switch (appError.code) {
    case 'AUTHENTICATION_ERROR':
      title = 'Autenticación requerida';
      break;
    case 'AUTHORIZATION_ERROR':
      title = 'Acceso denegado';
      break;
    case 'VALIDATION_ERROR':
      title = 'Datos inválidos';
      break;
    case 'NOT_FOUND_ERROR':
      title = 'No encontrado';
      break;
    case 'NETWORK_ERROR':
      title = 'Error de conexión';
      break;
  }
  
  const message = getErrorMessage(error);
  const validationErrors = getValidationErrors(error);
  const details = Object.values(validationErrors);
  
  return {
    title,
    message,
    details: details.length > 0 ? details : undefined,
  };
};
