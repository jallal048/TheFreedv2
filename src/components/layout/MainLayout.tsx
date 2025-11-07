// Layout principal con botón de prueba de perfil público
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import TestProfileButton from '../TestProfileButton';

const NAV = [
  { label: 'Feed', icon: '🏠', path: '/feed' },
  { label: 'Explorar', icon: '🧭', path: '/discover' },
  { label: 'Usuarios', icon: '👥', path: '/discover/users' },
  { label: 'Estadísticas', icon: '📊', path: '/dashboard' },
  { label: 'Mensajes', icon: '✉️', path: '/messages' },
  { label: 'Perfil', icon: '👤', path: '/profile' },
  { label: 'Configuración', icon: '⚙️', path: '/settings' },
];

export const MainLayout: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const user = {
    name: 'Demo User',
    avatarUrl: '',
  };

  return (
    <div className={`flex bg-gray-50 dark:bg-gray-950 min-h-screen`}>
      {/* Sidebar navegación vertical */}
      <aside className="fixed left-0 top-0 h-screen w-24 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-md z-40 flex flex-col items-center pt-8 gap-4 transition-all duration-300">
        {NAV.map(item => (
          <button
            key={item.path}
            className={`group flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-800 ${location.pathname === item.path ? 'bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => navigate(item.path)}
            title={item.label}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-semibold">{item.label}</span>
          </button>
        ))}
        <button
          className="mt-auto mb-8 flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900"
          title="Crear contenido"
          onClick={() => navigate('/create')}
        >
          <span className="text-3xl">➕</span>
          <span className="text-xs font-semibold">Crear</span>
        </button>
        <button
          onClick={() => setDarkMode(m => !m)}
          className="mb-6 px-3 py-2 rounded-full text-xl"
          title={darkMode ? 'Modo claro' : 'Modo oscuro'}
        >
          {darkMode ? '🌙' : '☀️'}
        </button>
      </aside>
      {/* Main content area + header sticky */}
      <div className="flex-1 ml-24">
        <header className="fixed top-0 left-24 right-0 h-16 bg-white dark:bg-gray-900 flex items-center justify-between px-8 border-b border-gray-200 dark:border-gray-800 shadow-sm z-30 transition-all duration-300">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="TheFreed Logo" className="h-9 w-9" />
            <span className="font-bold text-lg text-blue-700 dark:text-blue-300 tracking-widest">TheFreed</span>
          </div>
          <div className="flex-1 flex items-center mx-8">
            <input type="text" placeholder="Buscar creadores, contenido, mensajes..."
                   className="w-full rounded-full px-4 py-1 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center gap-8">
            <span title="Notificaciones" className="relative cursor-pointer">
              <span className="text-xl">🔔</span>
              <span className="absolute -top-2 -right-2 bg-red-500 text-xs text-white px-1 rounded-full">3</span>
            </span>
            <span title="Mensajes" className="relative cursor-pointer">
              <span className="text-xl">✉️</span>
              <span className="absolute -top-2 -right-2 bg-blue-500 text-xs text-white px-1 rounded-full">5</span>
            </span>
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{user.name}</span>
            </span>
          </div>
        </header>
        <main className="mt-16 px-8 py-10 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
        
        {/* Botón de prueba para ver perfil público */}
        <TestProfileButton />
      </div>
    </div>
  );
};
