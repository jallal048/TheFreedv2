// DiscoverUsersPage - Solo buscador sin filtro, preparada para integrarse con discovery
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Users, Loader2, X } from 'lucide-react';
import { apiService } from '../../services/api';
import { User } from '../../types';
import UserCard from '../../components/UserCard';

const DiscoverUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Solo búsqueda rápida, sin filtros
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
      const response = await apiService.getUsers(params);
      if (response.success && response.data) {
        setUsers(append ? [...users, ...response.data] : response.data);
        setHasMore(response.pagination?.hasNextPage || false);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [searchQuery, isLoading, users]);

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
    // eslint-disable-next-line
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) loadUsers(currentPage + 1, true);
  }, [isLoading, hasMore, currentPage, loadUsers]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="py-6 flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="w-8 h-8 mr-3 text-blue-600" /> Descubrir Usuarios
              </h1>
              <p className="text-gray-600 mt-1">Encuentra creadores y usuarios interesantes.</p>
            </div>
          </div>
          {/* Buscador central */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar usuarios por nombre, username o bio..."
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button onClick={clearSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center">
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {isLoading && users.length === 0 ? 'Cargando usuarios...' : `${users.length} usuario${users.length !== 1 ? 's' : ''} encontrado${users.length !== 1 ? 's' : ''}`}
          </p>
          {searchQuery && (
            <p className="text-sm text-gray-500">Resultados para: <span className="font-medium text-gray-900">"{searchQuery}"</span></p>
          )}
        </div>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
            <p className="text-gray-600 mb-4">{searchQuery ? `No hay resultados para "${searchQuery}"` : 'Intenta un término de búsqueda diferente.'}</p>
            {searchQuery && (
              <button onClick={clearSearch} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Limpiar búsqueda</button>
            )}
          </div>
        ) : (
          <>
            {/* Grid de usuarios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {users.map((user) => (
                <UserCard key={user.id} user={user} variant="full" showFollowButton={true} />
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <button onClick={handleLoadMore} disabled={isLoading} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto transition-colors">
                  {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Cargando...</>) : (<>Ver más usuarios</>)}
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
