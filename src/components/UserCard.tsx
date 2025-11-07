// UserCard - Componente para mostrar tarjetas de usuarios con link a perfil público
import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { UserPlus, UserMinus, CheckCircle, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';

interface UserCardProps {
  user: User;
  variant?: 'compact' | 'full';
  showFollowButton?: boolean;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

const UserCard: React.FC<UserCardProps> = memo(({
  user,
  variant = 'full',
  showFollowButton = true,
  initialIsFollowing = false,
  onFollowChange
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoadingFollow(true);
    
    try {
      const response = await apiService.followUser(user.id);
      
      if (response.success && response.data) {
        const newFollowingState = response.data.following;
        setIsFollowing(newFollowingState);
        onFollowChange?.(newFollowingState);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const displayName = user.profile?.displayName || 
                       `${user.firstName} ${user.lastName}`.trim() || 
                       user.username;

  if (variant === 'compact') {
    return (
      <Link
        to={`/public/${user.id}`}
        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
      >
        <div className="relative flex-shrink-0">
          <img
            src={user.profile?.avatarUrl || '/default-avatar.png'}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover"
          />
          {user.profile?.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {displayName}
            </p>
          </div>
          <p className="text-xs text-gray-500 truncate">@{user.username}</p>
        </div>

        {showFollowButton && (
          <button
            onClick={handleFollowToggle}
            disabled={isLoadingFollow}
            className={`flex-shrink-0 px-3 py-1 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
              isFollowing
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoadingFollow ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : isFollowing ? (
              'Siguiendo'
            ) : (
              'Seguir'
            )}
          </button>
        )}
      </Link>
    );
  }

  // Versión full
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/public/${user.id}`} className="block">
        {/* Banner */}
        {user.profile?.bannerUrl ? (
          <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
            <img
              src={user.profile.bannerUrl}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600" />
        )}

        {/* Avatar y info */}
        <div className="px-4 pb-4">
          <div className="relative -mt-12 mb-3">
            <div className="relative inline-block">
              <img
                src={user.profile?.avatarUrl || '/default-avatar.png'}
                alt={displayName}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
              />
              {user.profile?.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                {displayName}
              </h3>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>

            {user.profile?.bio && (
              <p className="text-sm text-gray-700 line-clamp-2">
                {user.profile.bio}
              </p>
            )}

            {/* Categorías */}
            {user.profile?.categories && user.profile.categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {user.profile.categories.slice(0, 3).map((category: string) => (
                  <span
                    key={category}
                    className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                  >
                    {category}
                  </span>
                ))}
                {user.profile.categories.length > 3 && (
                  <span className="text-xs text-gray-400">+{user.profile.categories.length - 3}</span>
                )}
              </div>
            )}

            {/* Estadísticas */}
            <div className="flex items-center space-x-4 text-xs text-gray-500 pt-2 border-t">
              <div>
                <span className="font-semibold text-gray-900">{user.profile?.followerCount?.toLocaleString() || 0}</span>
                {' '}Seguidores
              </div>
              <div>
                <span className="font-semibold text-gray-900">{user.profile?.totalContent?.toLocaleString() || 0}</span>
                {' '}Posts
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Botón de seguir */}
      {showFollowButton && (
        <div className="px-4 pb-4">
          <button
            onClick={handleFollowToggle}
            disabled={isLoadingFollow}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isFollowing
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoadingFollow ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cargando...</span>
              </>
            ) : isFollowing ? (
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
        </div>
      )}
    </div>
  );
});

UserCard.displayName = 'UserCard';

export default UserCard;
