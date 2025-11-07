// App principal para TheFreed.v1 optimizado
import React, { Suspense, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy loading de páginas principales
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage'));
const AdminPage = React.lazy(() => import('./pages/admin/AdminPage'));
const DiscoveryPage = React.lazy(() => import('./pages/discovery/DiscoveryPage'));

// Lazy loading de páginas de perfil
const ProfilePage = React.lazy(() => import('./pages/profile/ProfilePage'));
const CreatorProfilePage = React.lazy(() => import('./pages/creator/CreatorProfilePage'));
const PublicProfilePage = React.lazy(() => import('./pages/public/PublicProfilePage'));
const SettingsPage = React.lazy(() => import('./pages/settings/SettingsPage'));

// Lazy loading de páginas de contenido
const CreateContentPage = React.lazy(() => import('./pages/content/CreateContentPage'));
const ContentManagerPage = React.lazy(() => import('./pages/content/ContentManagerPage'));

// Componente de loading simple
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700">
        Cargando...
      </h2>
    </div>
  </div>
);

// Componente para manejar la ruta raíz basado en autenticación
const RootRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <LandingPage />
    </Suspense>
  );
};

// Página de métricas simple
const SimpleMetricsPage = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        📊 Dashboard de Rendimiento
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Optimizaciones Activas</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ Code Splitting</li>
            <li>✅ Lazy Loading</li>
            <li>✅ Memoización</li>
            <li>✅ API Cache</li>
            <li>✅ Compresión</li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Servidores</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>🚀 Frontend: Puerto 5173</li>
            <li>⚡ Backend: Puerto 5174</li>
            <li>📡 Estado: Operativo</li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Performance</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>📦 Bundle optimizado</li>
            <li>🎯 HMR mejorado</li>
            <li>💾 Cache inteligente</li>
            <li>🔧 Monitoreo activo</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Rutas públicas */}
              <Route 
                path="/" 
                element={<RootRoute />} 
              />
              <Route 
                path="/login" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <LoginPage />
                  </Suspense>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <RegisterPage />
                  </Suspense>
                } 
              />
              
              {/* Rutas protegidas */}
              <Route 
                path="/dashboard" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  </Suspense>
                } 
              />
              
              <Route 
                path="/admin" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ProtectedRoute requireAdmin={true}>
                      <AdminPage />
                    </ProtectedRoute>
                  </Suspense>
                } 
              />
              
              <Route 
                path="/discover" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ProtectedRoute>
                      <DiscoveryPage />
                    </ProtectedRoute>
                  </Suspense>
                } 
              />
              
              {/* Rutas de contenido */}
              <Route 
                path="/create" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ProtectedRoute>
                      <CreateContentPage />
                    </ProtectedRoute>
                  </Suspense>
                } 
              />
              
              <Route 
                path="/content-manager" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ProtectedRoute>
                      <ContentManagerPage />
                    </ProtectedRoute>
                  </Suspense>
                } 
              />
              
              <Route 
                path="/performance-dashboard" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ProtectedRoute>
                      <SimpleMetricsPage />
                    </ProtectedRoute>
                  </Suspense>
                } 
              />
              
              {/* Rutas de perfil - protegidas */}
              <Route 
                path="/profile" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  </Suspense>
                } 
              />
              
              <Route 
                path="/creator" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ProtectedRoute>
                      <CreatorProfilePage />
                    </ProtectedRoute>
                  </Suspense>
                } 
              />
              
              <Route 
                path="/settings" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  </Suspense>
                } 
              />
              
              {/* Ruta de perfil público - sin protección de autenticación */}
              <Route 
                path="/public/:userId" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <PublicProfilePage />
                  </Suspense>
                } 
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
                        href="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Volver al Inicio
                      </a>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;