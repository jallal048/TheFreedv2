// Dashboard principal para TheFreed.v1 con optimización de memoización
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useAdmin } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { 
  Content, 
  Subscription, 
  Notification
} from '../../types';
import { 
  Plus, 
  Search,
  Filter,
  Grid,
  List,
  Sparkles,
  RefreshCw,
  Loader2
} from 'lucide-react';

// Importar componentes memoizados
import { ContentCard, SubscriptionCard, NotificationCard } from '../../components/DashboardCards';
import DashboardTabs from '../../components/DashboardTabs';

// Componente interno del Dashboard para optimización con memo
const DashboardPageContent: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = useAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('feed');
  const [contents, setContents] = useState<Content[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Memoizar categorías para evitar recreaciones
  const categories = useMemo(() => [
    { id: 'all', name: 'Todo', icon: null },
    { id: 'lifestyle', name: 'Lifestyle', icon: null },
    { id: 'fitness', name: 'Fitness', icon: null },
    { id: 'cooking', name: 'Cocina', icon: null },
    { id: 'music', name: 'Música', icon: null },
    { id: 'art', name: 'Arte', icon: null },
    { id: 'travel', name: 'Viajes', icon: null },
    { id: 'tech', name: 'Tecnología', icon: null },
    { id: 'beauty', name: 'Belleza', icon: null },
    { id: 'fashion', name: 'Moda', icon: null },
    { id: 'photography', name: 'Fotografía', icon: null },
    { id: 'business', name: 'Negocios', icon: null },
    { id: 'education', name: 'Educación', icon: null },
    { id: 'premium', name: 'Premium', icon: null },
  ], []);

  // Memoizar número de notificaciones no leídas
  const unreadNotificationsCount = useMemo(() => 
    notifications.filter(n => !n.isRead).length, 
    [notifications]
  );

  // Memoizar función de formato de números
  const formatNumber = useCallback((num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }, []);

  // Memoizar función de carga de datos - SOLO FILTRA datos existentes
  const loadDashboardData = useCallback(() => {
    try {
      if (activeTab === 'feed') {
        // Filtrar contenido existente en lugar de hacer nueva llamada
        let contentData = contents;
        
        if (selectedCategory !== 'all' && selectedCategory !== 'premium') {
          contentData = contents.filter(content => content.category === selectedCategory);
        } else if (selectedCategory === 'premium') {
          contentData = contents.filter(content => content.isExclusive);
        }
        
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          contentData = contentData.filter(content => 
            content.title.toLowerCase().includes(searchLower) ||
            content.description.toLowerCase().includes(searchLower) ||
            content.tags.some(tag => tag.toLowerCase().includes(searchLower))
          );
        }
        
        setContents([...contentData]); // Forzar re-render
      }
      
      // Los datos de suscripciones y notificaciones ya están cargados
    } catch (error) {
      console.error('Error filtering dashboard data:', error);
    }
  }, [activeTab, selectedCategory, searchQuery, contents]);

  // Cargar TODOS los datos al inicio para que esté siempre disponible
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        // Cargar todos los datos en paralelo al inicio
        const [contentResponse, subscriptionsResponse, notificationsResponse] = await Promise.all([
          apiService.getContent({ page: 1, limit: 50 }),
          apiService.getSubscriptions({ page: 1, limit: 25 }),
          apiService.getNotifications({ page: 1, limit: 30 })
        ]);

        if (contentResponse.data) {
          setContents(contentResponse.data);
        }
        if (subscriptionsResponse.data) {
          setSubscriptions(subscriptionsResponse.data);
        }
        if (notificationsResponse.data) {
          setNotifications(notificationsResponse.data);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []); // Solo ejecutar al montar

  // Recargar datos solo cuando cambien búsqueda o categoría
  useEffect(() => {
    // Filtrar contenido existente en lugar de hacer nueva llamada
    if (searchQuery || (selectedCategory !== 'all' && selectedCategory !== 'premium')) {
      loadDashboardData();
    }
  }, [selectedCategory, searchQuery]);

  // Memoizar handlers para evitar recreaciones
  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  }, []);

  // Memoizar las secciones del dashboard
  const FeedSection = useMemo(() => memo(() => (
    <div>
      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          
          <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewModeChange('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleViewModeChange('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <List className="h-5 w-5" />
          </button>
          
          <button 
            onClick={() => navigate('/create')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Contenido</span>
          </button>
        </div>
      </div>

      {/* Content Grid/List */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {contents.map((content) => (
          <ContentCard 
            key={content.id} 
            content={content} 
            viewMode={viewMode} 
            formatNumber={formatNumber}
          />
        ))}
      </div>
    </div>
  )), [selectedCategory, categories, handleCategoryChange, viewMode, handleViewModeChange, contents, formatNumber]);

  const SubscriptionsSection = useMemo(() => memo(() => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {subscriptions.map((subscription) => (
        <SubscriptionCard key={subscription.id} subscription={subscription} />
      ))}
    </div>
  )), [subscriptions]);

  const NotificationsSection = useMemo(() => memo(() => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700">
            Marcar todas como leídas
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {notifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  )), [notifications]);

  const DiscoverSection = useMemo(() => memo(() => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Descubrimiento y Recomendaciones</h2>
          <a
            href="/discover"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Explorar Todo
          </a>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Para Ti</h3>
            <p className="text-gray-600 text-sm mb-4">Contenido personalizado basado en tus intereses</p>
            <a
              href="/discover"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Ver Recomendaciones →
            </a>
          </div>
          <div className="text-center p-6 bg-red-50 rounded-lg">
            <RefreshCw className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Trending</h3>
            <p className="text-gray-600 text-sm mb-4">Contenido popular y en tendencia</p>
            <a
              href="/discover"
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Ver Trending →
            </a>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <Search className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Explorar</h3>
            <p className="text-gray-600 text-sm mb-4">Descubre nuevo contenido con filtros avanzados</p>
            <a
              href="/discover"
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Explorar Todo →
            </a>
          </div>
        </div>
      </div>
    </div>
  )), []);

  const AdminSection = useMemo(() => memo(() => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Panel de Administración</h2>
          <a
            href="/admin"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Abrir Panel Completo
          </a>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-lg">👥</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Usuarios</h3>
            <p className="text-gray-600 text-sm mb-4">Administra usuarios, roles y permisos</p>
            <a
              href="/admin"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Ir al Panel →
            </a>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <RefreshCw className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analíticas</h3>
            <p className="text-gray-600 text-sm mb-4">Métricas y estadísticas del sistema</p>
            <a
              href="/admin"
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Ver Analíticas →
            </a>
          </div>
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <RefreshCw className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Configuración</h3>
            <p className="text-gray-600 text-sm mb-4">Ajustes y configuraciones del sistema</p>
            <a
              href="/admin"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Configurar →
            </a>
          </div>
        </div>
      </div>
    </div>
  )), []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-white">T</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">TheFreed</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar contenido..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('notifications')}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="h-6 w-6" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
              
              <div className="flex items-center space-x-3">
                <img
                  src={user?.profile?.avatarUrl || '/default-avatar.png'}
                  alt={user?.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <DashboardTabs 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isAdmin={isAdmin}
            notificationsCount={unreadNotificationsCount}
          />
        </div>

        {/* Content */}
        {activeTab === 'feed' && <FeedSection />}
        {activeTab === 'subscriptions' && <SubscriptionsSection />}
        {activeTab === 'notifications' && <NotificationsSection />}
        {activeTab === 'discover' && <DiscoverSection />}
        {activeTab === 'admin' && isAdmin && <AdminSection />}
      </div>
    </div>
  );
};

// Memoizar el componente completo
const DashboardPage = memo(DashboardPageContent);
DashboardPage.displayName = 'DashboardPage';

export default DashboardPage;