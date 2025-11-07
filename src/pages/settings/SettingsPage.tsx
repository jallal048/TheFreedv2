// Página moderna de Settings (Ajustes) con pestañas y secciones visuales
import React, { useState } from 'react';

const tabs = [
  { label: 'Cuenta', value: 'account' },
  { label: 'Privacidad', value: 'privacy' },
  { label: 'Notificaciones', value: 'notifications' },
  { label: 'Personalización', value: 'personalization' }
];

export default function SettingsPage() {
  const [tab, setTab] = useState('account');

  return (
    <section className="max-w-3xl mx-auto bg-white dark:bg-gray-950 rounded-xl shadow-lg p-8 mt-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Ajustes</h1>
      <div className="flex gap-3 border-b border-gray-200 dark:border-gray-800 mb-7">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors duration-150 focus:outline-none ${tab === t.value ? 'bg-blue-600 text-white shadow -mb-0.5' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-[14rem]">
        {tab === 'account' && (
          <div>
            <h2 className="font-semibold text-lg mb-3">Datos de Cuenta</h2>
            <form className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                <input type="text" className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100" placeholder="Tu nombre completo" />
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input type="email" className="w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100" placeholder="usuario@email.com" />
              </div>
              <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded">Guardar cambios</button>
            </form>
          </div>
        )}
        {tab === 'privacy' && (
          <div>
            <h2 className="font-semibold text-lg mb-3">Privacidad</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="form-checkbox rounded text-blue-600" /> Perfil privado
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="form-checkbox rounded text-blue-600" /> Ocultar actividad en feed
              </label>
            </div>
          </div>
        )}
        {tab === 'notifications' && (
          <div>
            <h2 className="font-semibold text-lg mb-3">Notificaciones</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="form-checkbox rounded text-blue-600" /> Emails de actividad importante
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="form-checkbox rounded text-blue-600" /> Mensajes de nuevos seguidores
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="form-checkbox rounded text-blue-600" /> Promociones y novedades
              </label>
            </div>
          </div>
        )}
        {tab === 'personalization' && (
          <div>
            <h2 className="font-semibold text-lg mb-3">Personalización</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="form-checkbox rounded text-blue-600" /> Activar modo oscuro automático
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="form-checkbox rounded text-blue-600" /> Mostrar contadores animados
              </label>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
