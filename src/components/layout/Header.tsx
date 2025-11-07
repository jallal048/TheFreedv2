// Header Sticky 2025 para TheFreed.v2
import React from 'react';
import { FaSearch, FaBell, FaEnvelope, FaUserCircle } from 'react-icons/fa';

export const Header: React.FC<{ user?: { name: string; avatarUrl?: string }; }> = ({ user }) => {
  return (
    <header className="fixed top-0 left-24 right-0 h-16 bg-white dark:bg-gray-900 flex items-center justify-between px-8 border-b border-gray-200 dark:border-gray-800 shadow-sm z-30 transition-all duration-300">
      {/* Logo / Marca */}
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="TheFreed Logo" className="h-9 w-9" />
        <span className="font-bold text-lg text-blue-700 dark:text-blue-300 tracking-widest">TheFreed</span>
      </div>
      {/* Buscador global */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 w-1/2 max-w-xl">
        <FaSearch className="mr-2 text-gray-500 dark:text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar creadores, contenido, mensajes..." 
          className="bg-transparent focus:outline-none w-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>
      {/* Accesos rápidos: Notificaciones y Mensajes */}
      <div className="flex items-center gap-7">
        <button className="relative group">
          <FaBell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          {/* Badge de notificaciones */}
          <span className="absolute -top-1 -right-2 bg-red-500 text-xs text-white px-1 py-0.5 rounded-full font-bold animate-bounce">3</span>
        </button>
        <button className="relative group">
          <FaEnvelope className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          <span className="absolute -top-1 -right-2 bg-blue-500 text-xs text-white px-1 py-0.5 rounded-full font-bold animate-bounce">5</span>
        </button>
        {/* Perfil miniatura + dropdown */}
        <button className="flex items-center gap-2 group">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full border-2 border-blue-400" />
          ) : (
            <FaUserCircle className="w-8 h-8 text-gray-500 dark:text-gray-300" />
          )}
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {user?.name || 'Usuario'}
          </span>
        </button>
      </div>
    </header>
  );
};
