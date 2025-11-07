// Página principal del panel de administración para TheFreed.v1
import React, { useState } from 'react';
import { useAuth, useAdmin } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  DollarSign, 
  Shield, 
  BarChart3, 
  Settings,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  UserCheck,
  Calendar
} from 'lucide-react';
import UsersManagement from './components/UsersManagement';

interface DashboardStats {
  totalUsers: number;
  activeCreators: number;
  totalContent: number;
  totalRevenue: number;
  pendingReports: number;
  newUsersToday: number;
}

const AdminPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const isAdmin = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Datos de ejemplo para las estadísticas
  const [stats] = useState<DashboardStats>({
    totalUsers: 12847,
    activeCreators: 1256,
    totalContent: 8964,
    totalRevenue: 156789.50,
    pendingReports: 12,
    newUsersToday: 89
  });

  // Verificar permisos de administrador
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'content', label: 'Contenido', icon: FileText },
    { id: 'moderation', label: 'Moderación', icon: Shield },
    { id: 'analytics', label: 'Analíticas', icon: TrendingUp },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600">Bienvenido, {user?.firstName} {user?.lastName}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Sistema Operativo
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'dashboard' && (
              <DashboardContent stats={stats} />
            )}
            {activeTab === 'users' && (
              <UsersContent />
            )}
            {activeTab === 'content' && (
              <ContentContent />
            )}
            {activeTab === 'moderation' && (
              <ModerationContent />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsContent />
            )}
            {activeTab === 'settings' && (
              <SettingsContent />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente del Dashboard
const DashboardContent: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total de Usuarios',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Creadores Activos',
      value: stats.activeCreators.toLocaleString(),
      icon: UserCheck,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'Contenido Total',
      value: stats.totalContent.toLocaleString(),
      icon: FileText,
      color: 'purple',
      change: '+15%'
    },
    {
      title: 'Ingresos Totales',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'yellow',
      change: '+23%'
    },
    {
      title: 'Reportes Pendientes',
      value: stats.pendingReports.toString(),
      icon: AlertTriangle,
      color: 'red',
      change: '-5%'
    },
    {
      title: 'Nuevos Usuarios Hoy',
      value: stats.newUsersToday.toString(),
      icon: Calendar,
      color: 'indigo',
      change: '+18%'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-600',
              green: 'bg-green-50 text-green-600',
              purple: 'bg-purple-50 text-purple-600',
              yellow: 'bg-yellow-50 text-yellow-600',
              red: 'bg-red-50 text-red-600',
              indigo: 'bg-indigo-50 text-indigo-600'
            };
            
            return (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-green-600 text-sm mt-1">{stat.change} vs mes anterior</p>
                  </div>
                  <div className={`p-3 rounded-full ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
        <div className="space-y-4">
          {[
            { type: 'user', message: 'Nuevo usuario registrado: juan.perez@example.com', time: '2 min', icon: UserCheck },
            { type: 'content', message: 'Contenido reportado por spam', time: '5 min', icon: AlertTriangle },
            { type: 'payment', message: 'Pago procesado: $45.99', time: '8 min', icon: DollarSign },
            { type: 'moderation', message: 'Reporte de contenido resuelto', time: '12 min', icon: CheckCircle }
          ].map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded-full">
                  <Icon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 text-sm">{activity.message}</p>
                  <p className="text-gray-500 text-xs">Hace {activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Placeholder components para otras pestañas
const UsersContent: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Gestión de Usuarios</h2>
      <UsersManagement />
    </div>
  );
};

const ContentContent: React.FC = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestión de Contenido</h2>
    <div className="text-gray-600">
      <p>Panel de gestión de contenido en desarrollo...</p>
      <ul className="mt-4 list-disc list-inside space-y-2">
        <li>Revisión de contenido reportado</li>
        <li>Moderación automática y manual</li>
        <li>Estadísticas de engagement</li>
        <li>Gestión de categorías</li>
      </ul>
    </div>
  </div>
);

const ModerationContent: React.FC = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Centro de Moderación</h2>
    <div className="text-gray-600">
      <p>Centro de moderación en desarrollo...</p>
      <ul className="mt-4 list-disc list-inside space-y-2">
        <li>Reportes de usuarios pendientes</li>
        <li>Herramientas de moderación</li>
        <li>Historial de acciones</li>
        <li>Configuración de filtros automáticos</li>
      </ul>
    </div>
  </div>
);

const AnalyticsContent: React.FC = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Analíticas Avanzadas</h2>
    <div className="text-gray-600">
      <p>Panel de analíticas en desarrollo...</p>
      <ul className="mt-4 list-disc list-inside space-y-2">
        <li>Métricas de crecimiento de usuarios</li>
        <li>Análisis de ingresos y transacciones</li>
        <li>Engagement y retención</li>
        <li>Reportes exportables</li>
      </ul>
    </div>
  </div>
);

const SettingsContent: React.FC = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuración del Sistema</h2>
    <div className="text-gray-600">
      <p>Panel de configuración en desarrollo...</p>
      <ul className="mt-4 list-disc list-inside space-y-2">
        <li>Configuración general de la plataforma</li>
        <li>Gestión de API keys</li>
        <li>Configuración de notificaciones</li>
        <li>Respaldos y seguridad</li>
      </ul>
    </div>
  </div>
);

export default AdminPage;
