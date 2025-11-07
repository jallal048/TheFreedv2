// Componente de descubrimiento y recomendaciones para TheFreed.v1 con memoización optimizada
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Sparkles,
  RefreshCw,
  Grid,
  List,
  ChevronRight
} from 'lucide-react';
import { 
  useRecommendations, 
  useTrending, 
  useDiscovery, 
  useUserBehavior,
  DiscoveryFilters,
  recommendationUtils
} from '../../hooks/useDiscovery';
import { Content } from '../../types';

// Importar componentes memoizados
import ContentCard from '../../components/ContentCard';
import TrendingCard from '../../components/TrendingCard';
import DiscoveryFiltersPanel from '../../components/DiscoveryFiltersPanel';

// Componente interno del DiscoveryPage para optimización con memo
const DiscoveryPageContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'for-you' | 'trending' | 'discover'>('for-you');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<DiscoveryFilters>({
    contentTypes: [],
    categories: [],
    dateRange: 'week',
    sortBy: 'relevance',
    minLikes: 0
  });

  // Memoizar hooks para evitar recreaciones innecesarias
  const { 
    recommendations, 
    loading: recommendationsLoading, 
    trackInteraction 
  } = useRecommendations(20);

  const { 
    trending, 
    loading: trendingLoading 
  } = useTrending(undefined, 20);

  const { 
    discoverContent, 
    loading: discoverLoading, 
    hasMore, 
    loadMore 
  } = useDiscovery(filters);

  const { behavior } = useUserBehavior();

  // Memoizar funciones para evitar recreaciones innecesarias
  const handleContentInteraction = useCallback((content: Content, action: 'view' | 'like' | 'share' | 'comment') => {
    trackInteraction(content.id, action);
  }, [trackInteraction]);

  // Memoizar la función para obtener recomendaciones
  const getRecommendations = useMemo(() => {
    return () => {
      if (recommendations.length > 0) {
        return recommendations;
      }
      
      // Fallback a contenido trending si no hay recomendaciones personalizadas
      return trending.slice(0, 10).map(item => ({
        id: `trending_${item.contentId}`,
        content: {} as Content, // Se llenaría con datos reales
        score: item.trendScore,
        reason: 'trending' as const,
        confidence: 0.7,
        metadata: {
          views24h: item.views24h,
          likes24h: item.likes24h
        }
      }));
    };
  }, [recommendations, trending]);

  // Memoizar las funciones de cambio de vista y filtros
  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  const handleShowFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  // Memoizar la función de cambio de tab
  const handleTabChange = useCallback((tab: 'for-you' | 'trending' | 'discover') => {
    setActiveTab(tab);
  }, []);

  // Memoizar los elementos de las tabs
  const tabElements = useMemo(() => [
    { id: 'for-you', name: 'Para Ti', icon: Sparkles },
    { id: 'trending', name: 'Trending', icon: TrendingUp },
    { id: 'discover', name: 'Explorar', icon: Search },
  ], []);

  // Memoizar el componente de tabs
  const Tabs = useMemo(() => memo(({ tabs, activeTab, onTabChange }: {
    tabs: typeof tabElements;
    activeTab: string;
    onTabChange: (tab: string) => void;
  }) => (
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
            {tab.id === 'for-you' && recommendations.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {recommendations.length}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  )), [recommendations.length]);

  // Memoizar la sección de recomendaciones
  const RecommendationsSection = useMemo(() => memo(() => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Para Ti
        </h2>
        <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center">
          <RefreshCw className="w-4 h-4 mr-1" />
          Actualizar
        </button>
      </div>
      
      {recommendationsLoading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 max-h-screen overflow-y-auto">
          {getRecommendations().map((rec) => (
            <div key={rec.id} className="relative">
              <ContentCard 
                content={rec.content} 
                viewMode="list" 
                onInteraction={handleContentInteraction}
                showMetadata={true}
              />
              {rec.reason !== 'cold_start' && (
                <div className="absolute top-2 right-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {rec.reason === 'similar_content' && 'Similar'}
                    {rec.reason === 'followed_creator' && 'Creador seguido'}
                    {rec.reason === 'trending' && 'Trending'}
                    {rec.reason === 'personalized' && 'Personalizado'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )), [recommendationsLoading, getRecommendations, handleContentInteraction, recommendations.length]);

  // Memoizar la sección de trending
  const TrendingSection = useMemo(() => memo(() => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Contenido Trending
        </h2>
        <div className="text-sm text-gray-600">
          Actualizado cada 15 minutos
        </div>
      </div>
      
      {trendingLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trending.map((item) => (
            <TrendingCard key={item.contentId} item={item} />
          ))}
        </div>
      )}
    </div>
  )), [trendingLoading, trending]);

  // Memoizar la sección de descubrimiento
  const DiscoverSection = useMemo(() => memo(() => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Explorar Contenido
        </h2>
        <div className="text-sm text-gray-600">
          {discoverContent.length} resultados
        </div>
      </div>
      
      {discoverLoading && discoverContent.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {discoverContent.map((content) => (
              <ContentCard 
                key={content.id}
                content={content} 
                viewMode={viewMode} 
                onInteraction={handleContentInteraction}
                showMetadata={true}
              />
            ))}
          </div>
          
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={discoverLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
              >
                {discoverLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4 mr-2" />
                    Cargar más
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )), [discoverLoading, discoverContent.length, viewMode, handleContentInteraction, hasMore, loadMore, discoverLoading]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Sparkles className="w-6 h-6 mr-2 text-blue-600" />
                {activeTab === 'for-you' ? 'Para Ti' : 'Descubrimiento'}
              </h1>
              <p className="text-gray-600">
                {activeTab === 'for-you' 
                  ? 'Contenido personalizado para ti' 
                  : 'Encuentra contenido que te encantará'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle - Solo mostrar para Trending y Discover */}
              {activeTab !== 'for-you' && (
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleViewModeChange('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleViewModeChange('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                onClick={handleShowFilters}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b p-4">
          <div className="max-w-7xl mx-auto">
            <DiscoveryFiltersPanel filters={filters} onFiltersChange={setFilters} />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <Tabs tabs={tabElements} activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        {/* Content Area */}
        <div>
          {activeTab === 'for-you' && <RecommendationsSection />}
          {activeTab === 'trending' && <TrendingSection />}
          {activeTab === 'discover' && <DiscoverSection />}
        </div>
      </div>
    </div>
  );
};

// Memoizar el componente completo
const DiscoveryPage = memo(DiscoveryPageContent);
DiscoveryPage.displayName = 'DiscoveryPage';

export default DiscoveryPage;