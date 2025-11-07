// App principal: añade feed a las rutas protegidas
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContextSupabase';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MainLayout } from './components/layout/MainLayout';

const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage'));
const AdminPage = React.lazy(() => import('./pages/admin/AdminPage'));
const DiscoveryPage = React.lazy(() => import('./pages/discovery/DiscoveryPage'));
const ProfilePage = React.lazy(() => import('./pages/profile/ProfilePage'));
const CreatorProfilePage = React.lazy(() => import('./pages/creator/CreatorProfilePage'));
const PublicProfilePage = React.lazy(() => import('./pages/public/PublicProfilePage'));
const SettingsPage = React.lazy(() => import('./pages/settings/SettingsPage'));
const CreateContentPage = React.lazy(() => import('./pages/content/CreateContentPage'));
const ContentManagerPage = React.lazy(() => import('./pages/content/ContentManagerPage'));
const FeedPage = React.lazy(() => import('./pages/FeedPage'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
        Cargando...
      </h2>
    </div>
  </div>
);

const RootRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }
  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LandingPage />
    </Suspense>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Layout global para rutas principales */}
            <Route element={<MainLayout />}>
              <Route
                path="/feed"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ProtectedRoute>
                      <FeedPage />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
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
                path="/discover"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ProtectedRoute>
                      <DiscoveryPage />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
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
              {/* Más rutas aquí */}
            </Route>

            {/* Rutas públicas fuera del layout principal */}
            <Route path="/" element={<RootRoute />} />
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
                    <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-500 mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                      Página no encontrada
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
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
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
