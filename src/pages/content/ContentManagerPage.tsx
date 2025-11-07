import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContextSupabase';
import { supabaseService, Content } from '../../services/supabase';
import { ScheduledPostsManager } from '../../components/ScheduledPostsManager';
import { 
  Edit2, 
  Trash2, 
  Eye, 
  Heart, 
  Download, 
  MoreVertical,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Plus,
  TrendingUp,
  Calendar
} from 'lucide-react';

export const ContentManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'published' | 'scheduled'>('published');

  const loadContent = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await supabaseService.getContentsByAuthor(user.id, 'published');
      setContents(data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el contenido');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleDelete = async (contentId: string) => {
    setIsDeleting(true);

    try {
      await supabaseService.deleteContent(contentId);
      setContents(prev => prev.filter(c => c.id !== contentId));
      setShowDeleteModal(false);
      setSelectedContent(null);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el contenido');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredContents = contents.filter(content => {
    const matchesSearch = !searchQuery || 
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || content.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: contents.length,
    views: contents.reduce((sum, c) => sum + c.views, 0),
    likes: contents.reduce((sum, c) => sum + c.likesCount, 0),
    downloads: contents.reduce((sum, c) => sum + c.downloads, 0)
  };

  if (user?.userType !== 'CREATOR') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600 mb-6">
            Solo los creadores pueden gestionar contenido.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Contenido</h1>
              <p className="mt-1 text-sm text-gray-500">Administra todo tu contenido publicado</p>
            </div>
            <button
              onClick={() => navigate('/create')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Crear Contenido</span>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Contenido</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Visualizaciones</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.views.toLocaleString()}</p>
                </div>
                <Eye className="h-8 w-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-pink-600 font-medium">Me Gusta</p>
                  <p className="text-2xl font-bold text-pink-900">{stats.likes.toLocaleString()}</p>
                </div>
                <Heart className="h-8 w-8 text-pink-500" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Descargas</p>
                  <p className="text-2xl font-bold text-green-900">{stats.downloads.toLocaleString()}</p>
                </div>
                <Download className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('published')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'published'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contenido Publicado
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'scheduled'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Publicaciones Programadas</span>
            </button>
          </nav>
        </div>

        {activeTab === 'scheduled' ? (
          <ScheduledPostsManager />
        ) : (
          <>
            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar contenido..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas las categorías</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="fitness">Fitness</option>
            <option value="cooking">Cocina</option>
            <option value="music">Música</option>
            <option value="art">Arte</option>
            <option value="travel">Viajes</option>
            <option value="tech">Tecnología</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay contenido</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filterCategory !== 'all' 
                ? 'No se encontró contenido con los filtros seleccionados'
                : 'Aún no has creado contenido. ¡Comienza ahora!'
              }
            </p>
            <button
              onClick={() => navigate('/create')}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Crear Contenido</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map(content => (
              <div key={content.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Thumbnail */}
                <div className="relative h-48 bg-gray-100">
                  {content.thumbnailUrl ? (
                    <img 
                      src={content.thumbnailUrl} 
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Eye className="h-12 w-12" />
                    </div>
                  )}
                  {content.isPremium && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded">
                      Premium
                    </span>
                  )}
                </div>

                {/* Content Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {content.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {content.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{content.views}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{content.likesCount}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Download className="h-4 w-4" />
                      <span>{content.downloads}</span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/content/${content.id}`)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Ver</span>
                    </button>
                    <button
                      onClick={() => navigate(`/edit/${content.id}`)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedContent(content);
                        setShowDeleteModal(true);
                      }}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          </>
        )}
      </main>

      {/* Delete Modal */}
      {showDeleteModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar Contenido</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar "{selectedContent.title}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedContent(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(selectedContent.id)}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Eliminar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagerPage;
