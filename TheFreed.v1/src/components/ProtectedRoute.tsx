// Componente de ruta protegida para TheFreed.v1
import React, { memo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, useAdmin } from '../contexts/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

// Componente interno para evitar re-renders innecesarios
const ProtectedRouteContent: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const isAdminUser = useAdmin();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Verificando autenticación...
            </h2>
            <p className="text-gray-600">
              Por favor espera mientras verificamos tu sesión.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirigir al login con la ubicación actual como estado
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar permisos de administrador si es requerido
  if (requireAdmin && !isAdminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-8 text-center">
          <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder a esta sección. Solo los administradores pueden ver esta página.
          </p>
          <div className="space-y-3">
            <a
              href="/dashboard"
              className="block w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Volver al Dashboard
            </a>
            <a
              href="/"
              className="block w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Ir al Inicio
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Memoizar el componente para evitar re-renders innecesarios
export const ProtectedRoute = memo(ProtectedRouteContent);
ProtectedRoute.displayName = 'ProtectedRoute';