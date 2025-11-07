// Layout principal integrando Sidebar y Header global
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Alternar modo oscuro
  const toggleDark = () => setDarkMode((d) => !d);

  // Mock usuario para perfil miniatura
  const user = {
    name: 'Demo User',
    avatarUrl: '',
  };

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`flex bg-gray-50 dark:bg-gray-950 min-h-screen`}>
      {/* Sidebar navegación vertical */}
      <Sidebar darkMode={darkMode} toggleDark={toggleDark} />
      {/* Main */}
      <div className="flex-1 ml-24">
        {/* Header sticky top */}
        <Header user={user} />
        <main className="mt-16 px-8 py-10 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
