// PublicProfilePage - Página de perfil público para TheFreed.v1
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { User, CreatorProfile, Content } from '../../types';
import { 
  ArrowLeft,
  UserPlus,
  UserMinus,
  MessageCircle,
  MapPin,
  Globe,
  CheckCircle,
  Grid,
  List,
  Eye,
  Heart,
  Download,
  Calendar,
  Loader2,
  UserX,
  Share2,
  MoreVertical,
  Bell,
  Flag
} from 'lucide-react';

// Componente para mostrar la información del usuario público
const UserHeader: React.FC<{
  publicUser: User & { profile?: CreatorProfile };
  isFollowing: boolean;
  onFollowToggle: () => void;
  onMessage: () => void;
}> = ({ publicUser, isFollowing, onFollowToggle, onMessage }) => {
  // Memoizar el nombre completo para optimizar renders
  const fullName = useMemo(() => {
    return publicUser.profile?.displayName || 
           `${publicUser.firstName} ${publicUser.lastName}`.trim() || 
           publicUser.username;
  }, [publicUser]);

  // Memoizar la bio para evitar recreaciones
  const bio = useMemo(() => {
    return publicUser.profile?.bio || 'No hay biografía disponible';
  }, [publicUser.profile?.bio]);

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      {/* Cover/Banner */}
      {publicUser.profile?.bannerUrl && (
        <div className="h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
          <img
            src={publicUser.profile.bannerUrl}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Avatar */}
          <div className="flex items-start space-x-6 -mt-16 md:-mt-20">
            <div className="relative">
              <img
                src={publicUser.profile?.avatarUrl || '/default-avatar.png'}
                alt={fullName}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg object-cover"
              />
              {publicUser.profile?.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-1.5">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              )}
            </div>

            {/* Información del usuario */}
            <div className="flex-1 min-w-0 pt-8 md:pt-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">
                    {fullName}
                  </h1>
                  
                  <p className="text-gray-500 text-sm md:text-base mt-1">
                    @{publicUser.username}
                  </p>

                  {/* Metadata del usuario */}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                    {publicUser.profile?.website && (
                      <a
                        href={publicUser.profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        <span>Sitio web</span>
                      </a>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Se unió en {new Date(publicUser.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-700 mt-4 max-w-2xl leading-relaxed">
                    {bio}
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-3 mt-4 md:mt-0 md:ml-6">
                  <button
                    onClick={onFollowToggle}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isFollowing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="h-4 w-4" />
                        <span>Dejar de seguir</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        <span>Seguir</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={onMessage}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Enviar mensaje</span>
                  </button>

                  <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <Share2 className="h-4 w-4" />
                  </button>

                  <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar las estadísticas del usuario
const UserStats: React.FC<{
  stats: {
    posts: number;
    followers: number;
    following: number;
    totalViews: number;
  };
}> = ({ stats }) => {
  // Memoizar el formato de números
  const formatNumber = useCallback((num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }, []);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center md:justify-start space-x-8 md:space-x-12">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stats.posts)}
            </div>
            <div className="text-sm text-gray-600">Publicaciones</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stats.followers)}
            </div>
            <div className="text-sm text-gray-600">Seguidores</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stats.following)}
            </div>
            <div className="text-sm text-gray-600">Siguiendo</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stats.totalViews)}
            </div>
            <div className="text-sm text-gray-600">Visualizaciones</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para el grid/lista de contenido
const ContentGrid: React.FC<{
  contents: Content[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}> = memo(({ contents, viewMode, onViewModeChange }) => {
  // Memoizar el componente de tarjeta de contenido
  const ContentCard = useMemo(() => memo(({ content }: { content: Content }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100">
        {content.thumbnailUrl || content.mediaUrl ? (
          <img
            src={content.thumbnailUrl || content.mediaUrl}
            alt={content.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-gray-400 text-sm">
              {content.contentType === 'VIDEO' ? 'Video' :
               content.contentType === 'AUDIO' ? 'Audio' :
               content.contentType === 'IMAGE' ? 'Imagen' :
               content.contentType === 'TEXT' ? 'Texto' : 'Contenido'}
            </span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {content.isPremium && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded font-medium">
              Premium
            </span>
          )}
          {content.isNSFW && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
              +18
            </span>
          )}
        </div>

        {/* Duración para videos */}
        {content.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {Math.floor(content.duration / 60)}:{(content.duration % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Content info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {content.title}
        </h3>
        
        {content.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {content.description}
          </p>
        )}

        {/* Meta información */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{content.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{content.likesCount}</span>
            </div>
            {content.downloads > 0 && (
              <div className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span>{content.downloads}</span>
              </div>
            )}
          </div>
          
          <div className="text-xs">
            {new Date(content.createdAt).toLocaleDateString('es-ES')}
          </div>
        </div>

        {/* Tags */}
        {content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {content.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
            {content.tags.length > 3 && (
              <span className="text-gray-400 text-xs">
                +{content.tags.length - 3} más
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )), []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header de controles */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Contenido público ({contents.length})
            </h2>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {contents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📝</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay contenido público
            </h3>
            <p className="text-gray-600">
              Este usuario aún no ha publicado contenido público.
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {contents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// Componente principal PublicProfilePage
const PublicProfilePageContent: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  
  // Estados
  const [publicUser, setPublicUser] = useState<User & { profile?: CreatorProfile } | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<string | null>(null);

  // Memoizar estadísticas del usuario
  const userStats = useMemo(() => {
    if (!publicUser) return { posts: 0, followers: 0, following: 0, totalViews: 0 };
    
    return {
      posts: publicUser.profile?.totalContent || 0,
      followers: publicUser.profile?.followerCount || 0,
      following: 0, // Necesitaríamos una API diferente para obtener esto
      totalViews: publicUser.profile?.totalViews || 0,
    };
  }, [publicUser]);

  // Memoizar función de formato de números
  const formatNumber = useCallback((num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }, []);

  // Memoizar función de carga de datos
  const loadProfileData = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Cargar datos del usuario público
      const userResponse = await apiService.getUserById(userId);
      if (userResponse.success && userResponse.data) {
        setPublicUser(userResponse.data);
        
        // Cargar contenido público del usuario
        const contentResponse = await apiService.getContent({ 
          creatorId: userId, 
          isPublic: true,
          page: 1, 
          limit: 50 
        });
        
        if (contentResponse.success && contentResponse.data) {
          setContents(contentResponse.data);
        }
        
        // Verificar si el usuario actual sigue a este usuario
        if (currentUser) {
          // Aquí implementaríamos la lógica para verificar si se sigue
          setIsFollowing(false); // Placeholder
        }
      } else {
        setError('Usuario no encontrado');
      }
    } catch (err) {
      console.error('Error loading profile data:', err);
      setError('Error al cargar el perfil');
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentUser]);

  // Memoizar handlers
  const handleFollowToggle = useCallback(async () => {
    if (!publicUser || !currentUser) return;
    
    try {
      if (isFollowing) {
        await apiService.unfollowUser(publicUser.id);
        setIsFollowing(false);
        setPublicUser(prev => prev ? {
          ...prev,
          profile: prev.profile ? {
            ...prev.profile,
            followerCount: Math.max(0, prev.profile.followerCount - 1)
          } : undefined
        } : null);
      } else {
        await apiService.followUser(publicUser.id);
        setIsFollowing(true);
        setPublicUser(prev => prev ? {
          ...prev,
          profile: prev.profile ? {
            ...prev.profile,
            followerCount: prev.profile.followerCount + 1
          } : undefined
        } : null);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  }, [publicUser, currentUser, isFollowing]);

  const handleMessage = useCallback(() => {
    if (!publicUser) return;
    // Navegar a la página de mensajes o abrir modal
  }, [publicUser]);

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Cargando perfil...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !publicUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserX className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Usuario no encontrado'}
          </h1>
          <p className="text-gray-600 mb-6">
            El perfil que buscas no existe o ha sido eliminado.
          </p>
          <Link
            to="/discover"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al descubrimiento
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de navegación */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              to="/discover"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span>Volver</span>
            </Link>
            
            <div className="ml-6 flex-1">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {publicUser.profile?.displayName || `${publicUser.firstName} ${publicUser.lastName}` || publicUser.username}
              </h1>
            </div>

            {/* Opciones adicionales */}
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Flag className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Header del usuario */}
      <UserHeader
        publicUser={publicUser}
        isFollowing={isFollowing}
        onFollowToggle={handleFollowToggle}
        onMessage={handleMessage}
      />

      {/* Estadísticas del usuario */}
      <UserStats stats={userStats} />

      {/* Grid de contenido */}
      <ContentGrid
        contents={contents}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
    </div>
  );
};

// Memoizar el componente completo
const PublicProfilePage = memo(PublicProfilePageContent);
PublicProfilePage.displayName = 'PublicProfilePage';

export default PublicProfilePage;