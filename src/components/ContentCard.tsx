// Componente de tarjeta de contenido memoizado para evitar re-renders innecesarios
import { memo } from 'react';
import { Heart, MessageCircle, Eye, Share, PlayCircle, Image as ImageIcon, FileText, Music } from 'lucide-react';
import { Content } from '../types';

interface ContentCardProps {
  content: Content;
  viewMode: 'grid' | 'list';
  onInteraction: (content: Content, action: 'view' | 'like' | 'share' | 'comment') => void;
  showMetadata?: boolean;
}

// Memoizar el componente de tarjeta de contenido
const ContentCard: React.FC<ContentCardProps> = memo(({ 
  content, 
  viewMode, 
  onInteraction, 
  showMetadata = true 
}) => {
  // Memoizar iconos de tipo de contenido
  const contentIcons = {
    VIDEO: PlayCircle,
    IMAGE: ImageIcon,
    TEXT: FileText,
    AUDIO: Music,
    FILE: FileText
  };

  const ContentIcon = contentIcons[content.contentType as keyof typeof contentIcons] || FileText;
  const iconColor = {
    VIDEO: 'text-red-500',
    IMAGE: 'text-blue-500',
    TEXT: 'text-green-500',
    AUDIO: 'text-purple-500',
    FILE: 'text-gray-500'
  }[content.contentType as keyof typeof contentIcons] || 'text-gray-500';

  // Memoizar el manejo de interacciones para evitar re-renders
  const handleClick = () => onInteraction(content, 'view');
  
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInteraction(content, 'like');
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer p-6 flex space-x-4"
        onClick={handleClick}
      >
        <div className="flex-shrink-0">
          {content.thumbnailUrl ? (
            <img
              src={content.thumbnailUrl}
              alt={content.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
              <ContentIcon className={`h-8 w-8 ${iconColor}`} />
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
                {content.viewsCount?.toLocaleString() || 0}
              </span>
              <span className="flex items-center">
                <Heart className="h-4 w-4 mr-1" />
                {content.likesCount?.toLocaleString() || 0}
              </span>
              <span className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                {content.commentsCount?.toLocaleString() || 0}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={(e) => e.stopPropagation()}
                className="text-gray-400 hover:text-gray-600"
              >
                <Share className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-400">
                {new Date(content.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      <div className="aspect-video relative">
        {content.thumbnailUrl ? (
          <img
            src={content.thumbnailUrl}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <ContentIcon className={`h-16 w-16 ${iconColor}`} />
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
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {content.creatorUsername?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <span className="text-sm text-gray-600">
            @{content.creatorUsername || 'Unknown'}
          </span>
          {showMetadata && content.contentType && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {content.contentType}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLike}
              className="flex items-center space-x-1 hover:text-red-600 transition-colors"
            >
              <Heart className="h-4 w-4" />
              <span>{content.likesCount?.toLocaleString() || 0}</span>
            </button>
            <span className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{content.commentsCount?.toLocaleString() || 0}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{content.viewsCount?.toLocaleString() || 0}</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={(e) => e.stopPropagation()}
              className="text-gray-400 hover:text-gray-600"
            >
              <Share className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ContentCard.displayName = 'ContentCard';

export default ContentCard;