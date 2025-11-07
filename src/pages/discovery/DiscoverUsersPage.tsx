// DiscoverUsersPage - Página para descubrir y buscar usuarios
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, Users, TrendingUp, Loader2, X } from 'lucide-react';
import { apiService } from '../../services/api';
import { User } from '../../types';
import UserCard from '../../components/UserCard';

interface Filters {
  userType: string;
  categories: string[];
}

const AVAILABLE_CATEGORIES = [
  'lifestyle', 'fitness', 'cooking', 'music', 'art', 'travel', 
  'tech', 'beauty', 'fashion', 'photography', 'business', 'education'
];

const DiscoverUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    userType: 'all',
    categories: []
  });

  // Cargar usuarios
  const loadUsers = useCallback(async (page: number = 1, append: boolean = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const params: any = {
        page,
        limit: 20
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (filters.userType !== 'all') {
        params.userType = filters.userType;
      }

      const response = await apiService.getUsers(params);
      
      if (response.success && response.data) {
        if (append) {
          setUsers(prev => [...prev, ...response.data]);
        } else {
          setUsers(response.data);
        }
        
        setHasMore(response.pagination?.hasNextPage || false);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [searchQuery, filters, isLoading]);

  // Buscar con debouncing
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        loadUsers(1, false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      loadUsers(1, false);
    }
  }, [searchQuery]);

  // Cargar usuarios iniciales
  useEffect(() => {
    loadUsers(1, false);
  }, [filters]);

  // Handler para cargar más
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadUsers(currentPage + 1, true);
    }
  }, [isLoading, hasMore, currentPage, loadUsers]);

  // Handler para cambiar filtros
  const handleFilterChange = useCallback((filterType: keyof Filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  }, []);

  // Toggle de categoría
  const toggleCategory = useCallback((category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
    setCurrentPage(1);
  }, []);

  // Limpiar búsqueda
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Users className="w-8 h-8 mr-3 text-blue-600" />
                  Descubrir Usuarios
                </h1>
                <p className="text-gray-600 mt-1">
                  Encuentra creadores y usuarios interesantes
                </p>
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
                {(filters.userType !== 'all' || filters.categories.length > 0) && (
                  <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {(filters.userType !== 'all' ? 1 : 0) + filters.categories.length}
                  </span>
                )}
              </button>
            </div>

            {/* Barra de búsqueda */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar usuarios por nombre o username..."
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
              {isSearching && (
                <div className="absolute inset-y-0 right-10 pr-3 flex items-center">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="space-y-4">
              {/* Tipo de usuario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de usuario
                </label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'creator', 'user'].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleFilterChange('userType', type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filters.userType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type === 'all' ? 'Todos' : type === 'creator' ? 'Creadores' : 'Usuarios'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categorías */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categorías
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        filters.categories.includes(category)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contador de resultados */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {isLoading && users.length === 0 ? (
              'Cargando usuarios...'
            ) : (
              `${users.length} usuario${users.length !== 1 ? 's' : ''} encontrado${users.length !== 1 ? 's' : ''}`
            )}
          </p>
          
          {searchQuery && (
            <p className="text-sm text-gray-500">
              Resultados para: <span className="font-medium text-gray-900">"{searchQuery}"</span>
            </p>
          )}
        </div>

        {/* Loading inicial */}
        {isLoading && users.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
                <div className="space-y-3">
                  <div className="h-24 bg-gray-200 rounded" />
                  <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto -mt-8" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron usuarios
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? `No hay resultados para "${searchQuery}"`
                : 'Intenta ajustar tus filtros o realiza una búsqueda'}
            </p>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Grid de usuarios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  variant="full"
                  showFollowButton={true}
                />
              ))}
            </div>

            {/* Botón de cargar más */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      Ver más usuarios
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DiscoverUsersPage;
