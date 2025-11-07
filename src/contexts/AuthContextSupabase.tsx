// Contexto de autenticación usando Supabase para TheFreed.v1
import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { User, LoginCredentials, RegisterData } from '../types';
import { AuthService } from '../services/auth';

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
        const result = await AuthService.refreshToken();
        if (result.success) {
          // Token renovado exitosamente
          console.log('Token renovado automáticamente');
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
      try {
        const hasSession = await AuthService.hasActiveSession();
        
        if (hasSession) {
          const result = await AuthService.getCurrentUser();
          
          if (result.success && result.data?.user) {
            setUser(result.data.user);
          } else {
            // No hay sesión válida
            console.log('No hay sesión válida');
          }
        } else {
          console.log('No hay sesión activa');
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Memoizar la función login para evitar recreaciones innecesarias
  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const result = await AuthService.login(credentials.email, credentials.password);
      
      if (result.success && result.data?.user) {
        setUser(result.data.user);
        return { success: true };
      }
      
      return { success: false, error: result.error || 'Error de autenticación' };
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

  // Memoizar la función register
  const register = useCallback(async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const result = await AuthService.register(
        userData.email, 
        userData.password,
        {
          firstName: userData.firstName,
          lastName: userData.lastName,
          username: userData.username,
          displayName: `${userData.firstName} ${userData.lastName}`
        }
      );
      
      if (result.success && result.data?.user) {
        setUser(result.data.user);
        return { success: true };
      }
      
      return { success: false, error: result.error || 'Error de registro' };
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

  // Memoizar la función logout
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memoizar la función refreshUser
  const refreshUser = useCallback(async () => {
    try {
      const result = await AuthService.getCurrentUser();
      
      if (result.success && result.data?.user) {
        setUser(result.data.user);
      } else {
        // Usuario no válido, cerrar sesión
        await logout();
      }
    } catch (error) {
      console.error('Error al refrescar usuario:', error);
      await logout();
    }
  }, [logout]);

  // Memoizar el valor del contexto
  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    tokenInfo: null // Se puede implementar si es necesario
  }), [
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Hook para verificar si el usuario está autenticado
export const useIsAuthenticated = (): boolean => {
  return useAuth().isAuthenticated;
};

// Hook para obtener el usuario actual
export const useCurrentUser = (): User | null => {
  return useAuth().user;
};

// Hook para obtener funciones de autenticación
export const useAuthActions = () => {
  const { login, register, logout, refreshUser } = useAuth();
  return { login, register, logout, refreshUser };
};

// Hook para verificar si el usuario es administrador
export const useAdmin = (): boolean => {
  const { user } = useAuth();
  return user?.userType === 'ADMIN';
};

// Hook para verificar si el usuario es creador
export const useCreator = (): boolean => {
  const { user } = useAuth();
  return user?.userType === 'CREATOR';
};