// Componente memoizado para las tabs del dashboard
import React, { memo } from 'react';
import { Home, Users, Bell, Compass, Shield } from 'lucide-react';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAdmin: boolean;
  notificationsCount: number;
}

interface Tab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DashboardTabs: React.FC<DashboardTabsProps> = memo(({ 
  activeTab, 
  onTabChange, 
  isAdmin, 
  notificationsCount 
}) => {
  // Memoizar las tabs para evitar recreaciones
  const tabs: Tab[] = [
    { id: 'feed', name: 'Feed', icon: Home },
    { id: 'subscriptions', name: 'Suscripciones', icon: Users },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'discover', name: 'Descubrir', icon: Compass },
    ...(isAdmin ? [{ id: 'admin', name: 'Admin', icon: Shield }] : [])
  ];

  return (
    <nav className="-mb-px flex space-x-8">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } transition-colors`}
          >
            <Icon className="h-5 w-5" />
            <span>{tab.name}</span>
            {tab.id === 'notifications' && notificationsCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {notificationsCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
});

DashboardTabs.displayName = 'DashboardTabs';

export default DashboardTabs;