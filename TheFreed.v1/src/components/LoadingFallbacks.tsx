import React from 'react';

// Fallback para páginas principales
export const PageLoadingFallback: React.FC<{ pageName: string }> = ({ pageName }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        Cargando {pageName}...
      </h2>
      <p className="text-gray-500">
        Por favor espera mientras cargamos el contenido
      </p>
    </div>
  </div>
);

// Fallback específico para Login
export const LoginLoadingFallback: React.FC = () => (
  <PageLoadingFallback pageName="Login" />
);

// Fallback específico para Register
export const RegisterLoadingFallback: React.FC = () => (
  <PageLoadingFallback pageName="Registro" />
);

// Fallback específico para Dashboard
export const DashboardLoadingFallback: React.FC = () => (
  <PageLoadingFallback pageName="Dashboard" />
);

// Fallback específico para Admin
export const AdminLoadingFallback: React.FC = () => (
  <PageLoadingFallback pageName="Panel de Administración" />
);

// Fallback específico para Discovery
export const DiscoveryLoadingFallback: React.FC = () => (
  <PageLoadingFallback pageName="Descubrimiento" />
);