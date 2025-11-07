// Contexto de autenticación para TheFreed.v1
import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { User, LoginCredentials, RegisterData } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  tokenInfo: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoizar el valor de isAuthenticated para evitar cálculos innecesarios
  const isAuthenticated = useMemo(() => !!user, [user]);

  // Renovar token proactivamente cuando esté próximo a expirar
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      try {
        const refreshed = await apiService.ensureValidToken();
        if (refreshed) {
        }
      } catch (error) {
        console.error('Error al renovar token proactivamente:', error);
      }
    }, 5 * 60 * 1000); // Cada 5 minutos

    return () => clearInterval(refreshInterval);
  }, [user]);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      const token = apiService.getToken();
      
      if (token) {
        try {
          // Verificar que el token no esté próximo a expirar
          const isValid = await apiService.ensureValidToken();
          
          if (isValid) {
            const response = await apiService.getCurrentUser();
            
            if (response.success && response.data?.user) {
              setUser(response.data.user);
            } else {
              // Token inválido, limpiar
              apiService.clearToken();
            }
          } else {
            // Token expirado o no válido, limpiar
            apiService.clearToken();
          }
        } catch (error) {
          console.error('Error al verificar autenticación:', error);
          apiService.clearToken();
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Memoizar la función login para evitar recreaciones innecesarias
  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await apiService.login(credentials);
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return { success: true };
      }
      
      return { success: false, error: response.error?.message || 'Error desconocido' };
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      return { 
        success: false, 
        error: error.message || 'Error de conexión. Intenta nuevamente.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memoizar la función register para evitar recreaciones innecesarias
  const register = useCallback(async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await apiService.register(userData);
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return { success: true };
      }
      
      return { success: false, error: response.error?.message || 'Error desconocido' };
    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      return { 
        success: false, 
        error: error.message || 'Error de conexión. Intenta nuevamente.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memoizar la función logout para evitar recreaciones innecesarias
  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setUser(null);
      apiService.clearToken();
    }
  }, []);

  // Memoizar la función refreshUser para evitar recreaciones innecesarias
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const response = await apiService.getCurrentUser();
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  }, []);

  // Memoizar tokenInfo para evitar llamadas repetidas
  const tokenInfo = useMemo(() => apiService.getTokenInfo(), [user]);

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const value = useMemo<AuthContextType>(() => ({
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    tokenInfo,
  }), [user, isLoading, isAuthenticated, login, register, logout, refreshUser, tokenInfo]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para usar el contexto de autenticación
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};

// Hook para verificar roles específicos
export const useRole = (requiredRoles: string[]) => {
  const { user } = useAuth();
  
  if (!user) {
    return false;
  }
  
  return requiredRoles.includes(user.userType);
};

// Hook para verificar si el usuario es creador
export const useCreator = () => {
  const { user } = useAuth();
  return user?.userType === 'CREATOR';
};

// Hook para verificar si el usuario es administrador
export const useAdmin = () => {
  const { user } = useAuth();
  return user?.userType === 'ADMIN';
};