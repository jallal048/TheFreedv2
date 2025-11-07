// Hook personalizado para manejar localStorage con type-safety
import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Estado para almacenar nuestro valor
  // Pasamos la función de inicialización a useState para que el lógica solo se ejecute una vez
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // Obtener del localStorage por key
      const item = window.localStorage.getItem(key);
      // Parsear el JSON almacenado o si no existe, retornar initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Si hay error, también retornar initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Retornar una versión wrapped de la función setter de useState que...
  // ...persiste el nuevo valor en localStorage.
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Permitir que el value sea una función para tener la misma API que useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Guardar estado
        setStoredValue(valueToStore);
        
        // Guardar en localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          
          // Disparar un evento personalizado para sincronizar entre tabs/ventanas
          window.dispatchEvent(
            new CustomEvent('localStorageChange', {
              detail: { key, value: valueToStore },
            })
          );
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Función para eliminar el valor del localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        
        // Disparar evento de cambio
        window.dispatchEvent(
          new CustomEvent('localStorageChange', {
            detail: { key, value: undefined },
          })
        );
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Sincronizar el estado cuando cambia en otra tab/ventana
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if (e instanceof StorageEvent) {
        // Evento nativo de storage (cross-tab)
        if (e.key === key && e.newValue !== null) {
          try {
            setStoredValue(JSON.parse(e.newValue));
          } catch (error) {
            console.error(`Error parsing localStorage value for key "${key}":`, error);
          }
        }
      } else if (e instanceof CustomEvent) {
        // Evento personalizado (same-tab)
        const detail = (e as CustomEvent).detail;
        if (detail.key === key) {
          setStoredValue(detail.value ?? initialValue);
        }
      }
    };

    // Escuchar eventos de storage
    window.addEventListener('storage', handleStorageChange as EventListener);
    window.addEventListener('localStorageChange', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('localStorageChange', handleStorageChange as EventListener);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// Hook especializado para almacenar objetos complejos
export function useLocalStorageObject<T extends Record<string, any>>(
  key: string,
  initialValue: T
) {
  const [value, setValue, removeValue] = useLocalStorage<T>(key, initialValue);

  // Función para actualizar propiedades específicas sin reemplazar todo el objeto
  const updateProperty = useCallback(
    <K extends keyof T>(property: K, newValue: T[K]) => {
      setValue((prev) => ({
        ...prev,
        [property]: newValue,
      }));
    },
    [setValue]
  );

  // Función para actualizar múltiples propiedades
  const updateProperties = useCallback(
    (updates: Partial<T>) => {
      setValue((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    [setValue]
  );

  return {
    value,
    setValue,
    updateProperty,
    updateProperties,
    removeValue,
  };
}

// Hook para almacenar arrays
export function useLocalStorageArray<T>(
  key: string,
  initialValue: T[] = []
) {
  const [value, setValue, removeValue] = useLocalStorage<T[]>(key, initialValue);

  // Añadir item al array
  const addItem = useCallback(
    (item: T) => {
      setValue((prev) => [...prev, item]);
    },
    [setValue]
  );

  // Remover item por índice
  const removeItem = useCallback(
    (index: number) => {
      setValue((prev) => prev.filter((_, i) => i !== index));
    },
    [setValue]
  );

  // Actualizar item por índice
  const updateItem = useCallback(
    (index: number, newItem: T) => {
      setValue((prev) => prev.map((item, i) => (i === index ? newItem : item)));
    },
    [setValue]
  );

  // Limpiar el array
  const clearArray = useCallback(() => {
    setValue([]);
  }, [setValue]);

  return {
    value,
    setValue,
    addItem,
    removeItem,
    updateItem,
    clearArray,
    removeValue,
  };
}

// Utilidades para trabajar con localStorage
export const localStorageUtils = {
  // Obtener un item con type-safety
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  // Establecer un item
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  },

  // Remover un item
  remove: (key: string): void => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  // Limpiar todo el localStorage
  clear: (): void => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  // Obtener todas las keys
  getAllKeys: (): string[] => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      return Object.keys(window.localStorage);
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  },

  // Obtener el tamaño usado en bytes
  getSize: (): number => {
    if (typeof window === 'undefined') {
      return 0;
    }

    try {
      let size = 0;
      for (const key in window.localStorage) {
        if (window.localStorage.hasOwnProperty(key)) {
          size += window.localStorage[key].length + key.length;
        }
      }
      return size;
    } catch (error) {
      console.error('Error calculating localStorage size:', error);
      return 0;
    }
  },

  // Verificar si existe una key
  has: (key: string): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(key) !== null;
  },
};

// Constantes para keys comunes de localStorage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'thefreed_auth_token',
  USER_DATA: 'thefreed_user_data',
  THEME: 'thefreed_theme',
  LANGUAGE: 'thefreed_language',
  PREFERENCES: 'thefreed_preferences',
  DRAFT_CONTENT: 'thefreed_draft_content',
  RECENT_SEARCHES: 'thefreed_recent_searches',
} as const;
