// Componentes memoizados para el Dashboard
import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Content, Subscription, Notification } from '../types';
import { 
  Eye,
  Heart,
  MessageCircle,
  PlayCircle,
  Image as ImageIcon,
  FileText,
  Music,
  Loader2,
  User,
  Settings,
  Crown,
  ArrowRight
} from 'lucide-react';

// Memoizar el componente de tarjeta de contenido
interface ContentCardProps {
  content: Content;
  viewMode: 'grid' | 'list';
  formatNumber: (num: number) => string;
}

const ContentCard: React.FC<ContentCardProps> = memo(({ content, viewMode, formatNumber }) => {
  // Memoizar iconos de tipo de contenido
  const contentTypes = [
    { id: 'VIDEO', icon: PlayCircle, color: 'text-red-500' },
    { id: 'IMAGE', icon: ImageIcon, color: 'text-blue-500' },
    { id: 'TEXT', icon: FileText, color: 'text-green-500' },
    { id: 'AUDIO', icon: Music, color: 'text-purple-500' },
  ];

  const ContentIcon = contentTypes.find(type => type.id === content.contentType)?.icon || FileText;
  const IconColor = contentTypes.find(type => type.id === content.contentType)?.color || 'text-gray-500';

  if (viewMode === 'list') {
    return (
      <div key={content.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {content.thumbnailUrl ? (
              <img
                src={content.thumbnailUrl}
                alt={content.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <ContentIcon className={`h-8 w-8 ${IconColor}`} />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {content.title}
              </h3>
              {content.isPremium && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Premium
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {content.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {formatNumber(content.viewsCount || 0)}
                </span>
                <span className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  {formatNumber(content.likesCount || 0)}
                </span>
                <span className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {content.creator.username}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {content.price && (
                  <span className="text-sm font-medium text-green-600">
                    ${content.price}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  {new Date(content.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div key={content.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video relative">
        {content.thumbnailUrl ? (
          <img
            src={content.thumbnailUrl}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <ContentIcon className={`h-16 w-16 ${IconColor}`} />
          </div>
        )}
        
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black bg-opacity-50 text-white">
            {content.contentType}
          </span>
        </div>
        
        {content.isPremium && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Premium
            </span>
          </div>
        )}
        
        {content.duration && (
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-black bg-opacity-75 text-white">
              {Math.floor(content.duration / 60)}:{(content.duration % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {content.title}
        </h3>
        
        <div className="flex items-center space-x-2 mb-3">
          <img
            src={content.creator.profile?.avatarUrl || '/default-avatar.png'}
            alt={content.creator.username}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm text-gray-600">
            {content.creator.profile?.displayName || content.creator.username}
          </span>
          {content.creator.profile?.isVerified && (
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {formatNumber(content.viewsCount || 0)}
            </span>
            <span className="flex items-center">
              <Heart className="h-4 w-4 mr-1" />
              {formatNumber(content.likesCount || 0)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {content.price && (
              <span className="font-medium text-green-600">
                ${content.price}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ContentCard.displayName = 'ContentCard';

// Memoizar el componente de tarjeta de suscripción
interface SubscriptionCardProps {
  subscription: Subscription;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = memo(({ subscription }) => (
  <div key={subscription.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <img
          src={subscription.creator.profile?.avatarUrl || '/default-avatar.png'}
          alt={subscription.creator.username}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <h3 className="font-semibold text-gray-900">
            {subscription.creator.profile?.displayName || subscription.creator.username}
          </h3>
          <p className="text-sm text-gray-600">
            @{subscription.creator.username}
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-medium text-gray-900">
          ${subscription.price}/{subscription.subscriptionType.toLowerCase()}
        </p>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          subscription.status === 'ACTIVE' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {subscription.status}
        </span>
      </div>
    </div>
    
    <div className="flex items-center justify-between text-sm text-gray-500">
      <span>
        Inicio: {new Date(subscription.startDate).toLocaleDateString()}
      </span>
      <span>
        Fin: {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'Permanente'}
      </span>
    </div>
  </div>
));

SubscriptionCard.displayName = 'SubscriptionCard';

// Memoizar el componente de tarjeta de notificación
interface NotificationCardProps {
  notification: Notification;
}

const NotificationCard: React.FC<NotificationCardProps> = memo(({ notification }) => (
  <div key={notification.id} className={`p-4 border-b border-gray-100 ${!notification.isRead ? 'bg-blue-50' : 'bg-white'}`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900 mb-1">
          {notification.title}
        </h4>
        <p className="text-sm text-gray-600 mb-2">
          {notification.content}
        </p>
        <span className="text-xs text-gray-400">
          {new Date(notification.createdAt).toLocaleDateString()}
        </span>
      </div>
      
      {!notification.isRead && (
        <div className="w-2 h-2 bg-blue-500 rounded-full ml-3 mt-2"></div>
      )}
    </div>
  </div>
));

NotificationCard.displayName = 'NotificationCard';

// Memoizar el componente de tarjeta de perfil
interface ProfileCardProps {
  userRole?: string;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = memo(({ 
  userRole = 'USER', 
  displayName = 'Usuario', 
  username = 'usuario',
  avatarUrl = '/default-avatar.png'
}) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header del perfil */}
      <div className="flex items-center space-x-4 mb-6">
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {displayName}
          </h3>
          <p className="text-sm text-gray-600">
            @{username}
          </p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
            userRole === 'CREATOR' 
              ? 'bg-purple-100 text-purple-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {userRole === 'CREATOR' ? 'Creador' : 'Usuario'}
          </span>
        </div>
      </div>

      {/* Enlaces de navegación */}
      <div className="space-y-3">
        {/* Perfil personal */}
        <button
          onClick={() => handleNavigation('/profile')}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Mi Perfil</p>
              <p className="text-xs text-gray-500">Ver y editar información personal</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </button>

        {/* Configuraciones */}
        <button
          onClick={() => handleNavigation('/settings')}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Settings className="h-4 w-4 text-gray-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Configuración</p>
              <p className="text-xs text-gray-500">Preferencias y ajustes de cuenta</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </button>

        {/* Panel de creador (solo si es CREATOR) */}
        {userRole === 'CREATOR' && (
          <button
            onClick={() => handleNavigation('/creator')}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Crown className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Panel de Creador</p>
                <p className="text-xs text-gray-500">Gestionar contenido y analytics</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Responsive para móvil */}
      <style jsx>{`
        @media (max-width: 640px) {
          .profile-card-mobile {
            padding: 1rem;
          }
          .profile-card-mobile .flex {
            flex-direction: column;
            text-align: center;
            space-x: 0;
          }
          .profile-card-mobile .space-x-4 > * + * {
            margin-top: 0.75rem;
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
});

ProfileCard.displayName = 'ProfileCard';

export { ContentCard, SubscriptionCard, NotificationCard, ProfileCard };