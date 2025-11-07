// Utilidades de formato para la aplicación

// Formateo de fechas
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  
  return new Intl.DateTimeFormat('es-ES', defaultOptions).format(dateObj);
};

// Fecha relativa (hace X tiempo)
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Justo ahora';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `Hace ${diffInWeeks} ${diffInWeeks === 1 ? 'semana' : 'semanas'}`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `Hace ${diffInMonths} ${diffInMonths === 1 ? 'mes' : 'meses'}`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `Hace ${diffInYears} ${diffInYears === 1 ? 'año' : 'años'}`;
};

// Formateo de números
export const formatNumber = (num: number, options?: Intl.NumberFormatOptions): string => {
  return new Intl.NumberFormat('es-ES', options).format(num);
};

// Formateo de moneda
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Formateo de números grandes (1K, 1M, etc.)
export const formatCompactNumber = (num: number): string => {
  if (num < 1000) {
    return num.toString();
  }
  
  if (num < 1000000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  
  if (num < 1000000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  
  return `${(num / 1000000000).toFixed(1)}B`;
};

// Formateo de porcentaje
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

// Formateo de duración (segundos a HH:MM:SS)
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Formateo de tamaño de archivo
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

// Truncar texto con puntos suspensivos
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  
  return `${text.substring(0, maxLength)}...`;
};

// Truncar en palabras
export const truncateWords = (text: string, maxWords: number): string => {
  const words = text.split(' ');
  
  if (words.length <= maxWords) {
    return text;
  }
  
  return `${words.slice(0, maxWords).join(' ')}...`;
};

// Capitalizar primera letra
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Capitalizar cada palabra
export const capitalizeWords = (text: string): string => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

// Convertir a slug (URL-friendly)
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Reemplazar espacios con -
    .replace(/[^\w\-]+/g, '')    // Remover caracteres no alfanuméricos
    .replace(/\-\-+/g, '-')      // Reemplazar múltiples - con uno solo
    .replace(/^-+/, '')          // Trim - del inicio
    .replace(/-+$/, '');         // Trim - del final
};

// Formateo de nombre completo
export const formatFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};

// Formateo de iniciales
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

// Formateo de número de teléfono
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

// Formateo de tarjeta de crédito
export const formatCreditCard = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cardNumber;
};

// Ocultar parte de un email
export const maskEmail = (email: string): string => {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  
  const visibleChars = Math.min(3, Math.floor(name.length / 2));
  const maskedName = name.substring(0, visibleChars) + '*'.repeat(name.length - visibleChars);
  
  return `${maskedName}@${domain}`;
};

// Ocultar parte de un número de teléfono
export const maskPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length < 4) return phone;
  
  const visible = cleaned.slice(-4);
  const masked = '*'.repeat(cleaned.length - 4);
  
  return masked + visible;
};

// Formateo de URL
export const formatUrl = (url: string): string => {
  if (!url) return '';
  
  // Agregar https:// si no tiene protocolo
  if (!url.match(/^https?:\/\//i)) {
    return `https://${url}`;
  }
  
  return url;
};

// Extraer dominio de URL
export const getDomainFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(formatUrl(url));
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
};

// Formateo de lista con comas y "y"
export const formatList = (items: string[]): string => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} y ${items[1]}`;
  
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
};

// Calcular tiempo de lectura estimado
export const calculateReadingTime = (text: string, wordsPerMinute: number = 200): string => {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  
  return `${minutes} min de lectura`;
};

// Extraer extracto de texto
export const getExcerpt = (text: string, maxLength: number = 150): string => {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.substring(0, lastSpace) + '...';
};

// Formateo de coordenadas
export const formatCoordinates = (lat: number, lng: number, decimals: number = 6): string => {
  return `${lat.toFixed(decimals)}, ${lng.toFixed(decimals)}`;
};

// Validar y formatear código postal
export const formatPostalCode = (code: string, country: string = 'US'): string => {
  const cleaned = code.replace(/\s/g, '');
  
  if (country === 'US' && cleaned.length === 5) {
    return cleaned;
  }
  
  if (country === 'US' && cleaned.length === 9) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  
  return code;
};
