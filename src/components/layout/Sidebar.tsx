// Nuevo Sidebar 2025 para TheFreed.v2
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaCompass, FaChartBar, FaUser, FaEnvelope, FaCog, FaMoon, FaSun, FaPlusCircle } from 'react-icons/fa';

const sidebarItems = [
  { name: 'Feed', icon: FaHome, to: '/feed' },
  { name: 'Explorar', icon: FaCompass, to: '/explore' },
  { name: 'Estadísticas', icon: FaChartBar, to: '/dashboard' },
  { name: 'Mensajes', icon: FaEnvelope, to: '/messages' },
  { name: 'Perfil', icon: FaUser, to: '/profile' },
  { name: 'Configuración', icon: FaCog, to: '/settings' }
];

export const Sidebar: React.FC<{ darkMode: boolean; toggleDark: () => void; }> = ({ darkMode, toggleDark }) => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-24 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-md z-40 flex flex-col items-center pt-8 gap-6 transition-all duration-300">
      {sidebarItems.map((item) => (
        <NavLink 
          to={item.to}
          key={item.name}
          className={({ isActive }) =>
            `group flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900 ${isActive ? 'bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`
          }
        >
          <item.icon className="w-7 h-7"/>
          <span className="text-xs font-semibold">{item.name}</span>
        </NavLink>
      ))}
      <button
        className="mt-auto mb-8 flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900"
        title="Crear contenido"
      >
        <FaPlusCircle className="w-8 h-8" />
        <span className="text-xs font-semibold">Crear</span>
      </button>
      <button
        onClick={toggleDark}
        className="mb-6 px-3 py-2 rounded-full text-xl"
        title={darkMode ? 'Modo claro' : 'Modo oscuro'}
      >
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>
    </aside>
  );
};
