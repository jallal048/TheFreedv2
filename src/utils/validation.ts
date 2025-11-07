// Sistema de validación para formularios
import { z } from 'zod';

// Esquemas de validación

// Validación de registro de usuario
export const registerSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .min(5, 'El email debe tener al menos 5 caracteres')
    .max(255, 'El email es demasiado largo'),
  username: z
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(50, 'El nombre de usuario es demasiado largo')
    .regex(/^[a-zA-Z0-9_-]+$/, 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña es demasiado larga')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'La contraseña debe contener al menos un carácter especial'),
  confirmPassword: z.string(),
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre es demasiado largo'),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido es demasiado largo'),
  dateOfBirth: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18;
    }, 'Debes tener al menos 18 años'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// Validación de login
export const loginSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .min(1, 'El email es requerido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
});

// Validación de contenido
export const contentSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título es demasiado largo'),
  description: z
    .string()
    .max(5000, 'La descripción es demasiado larga')
    .optional(),
  contentType: z.enum(['VIDEO', 'AUDIO', 'IMAGE', 'TEXT', 'LIVESTREAM', 'GALLERY', 'DOCUMENT']),
  category: z
    .string()
    .min(1, 'Debes seleccionar una categoría'),
  tags: z
    .array(z.string())
    .max(10, 'Puedes agregar hasta 10 tags')
    .optional(),
  isPremium: z.boolean().default(false),
  isFree: z.boolean().default(true),
  price: z
    .number()
    .min(0, 'El precio no puede ser negativo')
    .max(10000, 'El precio es demasiado alto')
    .optional(),
  isNSFW: z.boolean().default(false),
  ageRestriction: z
    .number()
    .min(0)
    .max(21)
    .optional(),
});

// Validación de perfil de creador
export const creatorProfileSchema = z.object({
  displayName: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  bio: z
    .string()
    .max(1000, 'La biografía es demasiado larga')
    .optional(),
  website: z
    .string()
    .url('URL inválida')
    .optional()
    .or(z.literal('')),
  monthlyPrice: z
    .number()
    .min(0, 'El precio no puede ser negativo')
    .max(1000, 'El precio es demasiado alto')
    .optional(),
  yearlyPrice: z
    .number()
    .min(0, 'El precio no puede ser negativo')
    .max(10000, 'El precio es demasiado alto')
    .optional(),
  isAdultContent: z.boolean().default(false),
});

// Validación de mensaje
export const messageSchema = z.object({
  content: z
    .string()
    .min(1, 'El mensaje no puede estar vacío')
    .max(5000, 'El mensaje es demasiado largo'),
  receiverId: z.string().min(1, 'Debes seleccionar un destinatario'),
});

// Validación de comentario
export const commentSchema = z.object({
  text: z
    .string()
    .min(1, 'El comentario no puede estar vacío')
    .max(2000, 'El comentario es demasiado largo'),
});

// Validación de reporte
export const reportSchema = z.object({
  reason: z
    .string()
    .min(1, 'Debes seleccionar una razón'),
  description: z
    .string()
    .min(10, 'Proporciona más detalles (mínimo 10 caracteres)')
    .max(1000, 'La descripción es demasiado larga')
    .optional(),
});

// Validación de configuración de usuario
export const settingsSchema = z.object({
  language: z.string().min(2).max(5),
  timezone: z.string(),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  privacyLevel: z.enum(['PUBLIC', 'FRIENDS', 'PRIVATE']),
  twoFactorEnabled: z.boolean(),
});

// Tipos TypeScript generados desde los esquemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ContentInput = z.infer<typeof contentSchema>;
export type CreatorProfileInput = z.infer<typeof creatorProfileSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;

// Función helper para validar datos
export const validate = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: Record<string, string> } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Error de validación desconocido' } };
  }
};

// Validación de email simple
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validación de URL simple
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validación de contraseña fuerte
export const isStrongPassword = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};

// Sanitización de texto
export const sanitizeText = (text: string): string => {
  return text
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validación de tamaño de archivo
export const validateFileSize = (file: File, maxSizeMB: number = 50): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// Validación de tipo de archivo
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.some(type => file.type.includes(type));
};

// Validaciones específicas para archivos multimedia
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!validateFileType(file, allowedTypes)) {
    return { valid: false, error: 'Tipo de archivo no permitido. Usa JPG, PNG, GIF o WebP' };
  }
  
  if (!validateFileSize(file, maxSize)) {
    return { valid: false, error: `El archivo es demasiado grande. Máximo ${maxSize}MB` };
  }
  
  return { valid: true };
};

export const validateVideoFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 500; // 500MB
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  
  if (!validateFileType(file, allowedTypes)) {
    return { valid: false, error: 'Tipo de archivo no permitido. Usa MP4, WebM u OGG' };
  }
  
  if (!validateFileSize(file, maxSize)) {
    return { valid: false, error: `El archivo es demasiado grande. Máximo ${maxSize}MB` };
  }
  
  return { valid: true };
};

export const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 100; // 100MB
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
  
  if (!validateFileType(file, allowedTypes)) {
    return { valid: false, error: 'Tipo de archivo no permitido. Usa MP3, WAV u OGG' };
  }
  
  if (!validateFileSize(file, maxSize)) {
    return { valid: false, error: `El archivo es demasiado grande. Máximo ${maxSize}MB` };
  }
  
  return { valid: true };
};
