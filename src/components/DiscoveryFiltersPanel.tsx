// Componente de filtros de descubrimiento memoizado
import React, { memo, useCallback } from 'react';
import { DiscoveryFilters } from '../hooks/useDiscovery';

interface DiscoveryFiltersPanelProps {
  filters: DiscoveryFilters;
  onFiltersChange: (filters: DiscoveryFilters) => void;
}

const DiscoveryFiltersPanel: React.FC<DiscoveryFiltersPanelProps> = memo(({ 
  filters, 
  onFiltersChange 
}) => {
  // Memoizar arrays para evitar recreaciones
  const contentTypes = ['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE'];
  const categories = ['lifestyle', 'fitness', 'tech', 'education', 'entertainment', 'music'];

  // Memoizar funciones de actualización para evitar re-renders
  const updateFilter = useCallback((key: keyof DiscoveryFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  }, [filters, onFiltersChange]);

  const toggleArrayFilter = useCallback((key: 'contentTypes' | 'categories', value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  }, [filters, updateFilter]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Tipos de Contenido */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipos de Contenido
        </label>
        <div className="space-y-2">
          {contentTypes.map(type => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.contentTypes.includes(type)}
                onChange={() => toggleArrayFilter('contentTypes', type)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Categorías */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categorías
        </label>
        <div className="space-y-2">
          {categories.map(category => (
            <label key={category} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => toggleArrayFilter('categories', category)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rango de Fechas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rango de Fechas
        </label>
        <select
          value={filters.dateRange}
          onChange={(e) => updateFilter('dateRange', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
          <option value="all">Todo el tiempo</option>
        </select>
      </div>

      {/* Ordenar Por */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ordenar Por
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="relevance">Relevancia</option>
          <option value="trending">Trending</option>
          <option value="recent">Más reciente</option>
          <option value="popular">Más popular</option>
        </select>
      </div>
    </div>
  );
});

DiscoveryFiltersPanel.displayName = 'DiscoveryFiltersPanel';

export default DiscoveryFiltersPanel;