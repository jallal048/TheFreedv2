// App principal para TheFreed.v1 con Lazy Loading y Code Splitting
import React, { Suspense, memo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LazyErrorBoundary } from './components/LazyErrorBoundary';
import { initializeErrorReporting } from './services/errorReporting';

// Lazy loading de páginas principales con chunk naming para debugging
const LoginPage = React.lazy(() => 
  import('./pages/auth/LoginPage' /* webpackChunkName: "auth-login" */)
);

const RegisterPage = React.lazy(() => 
  import('./pages/auth/RegisterPage' /* webpackChunkName: "auth-register" */)
);

const DashboardPage = React.lazy(() => 
  import('./pages/dashboard/DashboardPage' /* webpackChunkName: "dashboard-main" */)
);

const AdminPage = React.lazy(() => 
  import('./pages/admin/AdminPage' /* webpackChunkName: "admin-panel" */)
);

const DiscoveryPage = React.lazy(() => 
  import('./pages/discovery/DiscoveryPage' /* webpackChunkName: "discovery-main" */)
);

const PerformanceDashboardPage = React.lazy(() => 
  import('./pages/performance/PerformanceDashboardPage' /* webpackChunkName: "performance-dashboard" */)
);

// Importar fallbacks de loading
import {
  LoginLoadingFallback,
  RegisterLoadingFallback,
  DashboardLoadingFallback,
  AdminLoadingFallback,
  DiscoveryLoadingFallback
} from './components/LoadingFallbacks';

const PerformanceLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700">
        Cargando Dashboard de Rendimiento...
      </h2>
    </div>
  </div>
);

// Hook para prefetch de rutas críticas
import { useRoutePrefetch } from './hooks/useRoutePrefetch';
// Componente de prefetch automático
import { RoutePrefetchProvider } from './components/RoutePrefetch';

// Componentes globales
import './App.css';

// Componente de rutas con lazy loading
const AppRoutes: React.FC = () => {
  const { prefetchRoute } = useRoutePrefetch();

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Rutas públicas con lazy loading */}
        <Route 
          path="/login" 
          element={
            <LazyErrorBoundary>
              <Suspense fallback={<LoginLoadingFallback />}>
                <LoginPage />
              </Suspense>
            </LazyErrorBoundary>
          } 
        />
        <Route 
          path="/register" 
          element={
            <LazyErrorBoundary>
              <Suspense fallback={<RegisterLoadingFallback />}>
                <RegisterPage />
              </Suspense>
            </LazyErrorBoundary>
          } 
        />
        
        {/* Rutas protegidas con lazy loading */}
        <Route 
          path="/dashboard" 
          element={
            <LazyErrorBoundary>
              <Suspense fallback={<DashboardLoadingFallback />}>
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              </Suspense>
            </LazyErrorBoundary>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <LazyErrorBoundary>
              <Suspense fallback={<AdminLoadingFallback />}>
                <ProtectedRoute requireAdmin={true}>
                  <AdminPage />
                </ProtectedRoute>
              </Suspense>
            </LazyErrorBoundary>
          } 
        />
        
        <Route 
          path="/discover" 
          element={
            <LazyErrorBoundary>
              <Suspense fallback={<DiscoveryLoadingFallback />}>
                <ProtectedRoute>
                  <DiscoveryPage />
                </ProtectedRoute>
              </Suspense>
            </LazyErrorBoundary>
          } 
        />
        
        {/* Dashboard de Rendimiento - Accesible para usuarios autenticados */}
        <Route 
          path="/performance-dashboard" 
          element={
            <LazyErrorBoundary>
              <Suspense fallback={<PerformanceLoadingFallback />}>
                <ProtectedRoute>
                  <PerformanceDashboardPage />
                </ProtectedRoute>
              </Suspense>
            </LazyErrorBoundary>
          } 
        />
        
        {/* Redirección por defecto */}
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" replace />} 
        />
        
        {/* Página 404 */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                  Página no encontrada
                </h2>
                <p className="text-gray-500 mb-8">
                  La página que buscas no existe.
                </p>
                <a
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  onMouseEnter={() => prefetchRoute('/dashboard')}
                >
                  Volver al Dashboard
                </a>
              </div>
            </div>
          } 
        />
      </Routes>
    </div>
  );
};

// Componente interno para evitar re-renders innecesarios
const AppContent = memo(() => {
  // Inicializar sistema de error reporting
  useEffect(() => {
    initializeErrorReporting({
      environment: process.env.NODE_ENV as 'development' | 'staging' | 'production',
      enabled: process.env.NODE_ENV !== 'test',
      serviceName: 'TheFreed.v1',
      version: '1.0.0'
    });

    // Log inicial para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Sistema de monitoring inicializado');
      console.log('📊 Visita /performance-dashboard para ver las métricas en tiempo real');
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">
                  Cargando aplicación...
                </h2>
              </div>
            </div>
          }>
            <AppRoutes />
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

// Memoizar el componente para evitar re-renders innecesarios
const App = memo(() => (
  <RoutePrefetchProvider>
    <AppContent />
  </RoutePrefetchProvider>
));
App.displayName = 'App';

export default App;