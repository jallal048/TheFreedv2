// Componente de tarjeta de contenido trending memoizado
import React, { memo } from 'react';
import { TrendingUp } from 'lucide-react';

interface TrendingCardProps {
  item: {
    contentId: string;
    trendScore: number;
    views24h: number;
    likes24h: number;
    comments24h: number;
    shares24h: number;
    velocity: number;
    category: string;
    creatorId: string;
  };
}

// Memoizar el componente de tarjeta trending
const TrendingCard: React.FC<TrendingCardProps> = memo(({ item }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-red-500" />
          <span className="text-sm font-medium text-gray-900">
            Trending #{item.trendScore.toFixed(1)}
          </span>
        </div>
        <span className="text-xs text-gray-500 capitalize">{item.category}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Vistas 24h</span>
          <span className="font-medium">{item.views24h.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Likes 24h</span>
          <span className="font-medium">{item.likes24h.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Comentarios 24h</span>
          <span className="font-medium">{item.comments24h.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Compartidos 24h</span>
          <span className="font-medium">{item.shares24h.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Velocidad</span>
          <span className="font-medium text-green-600">+{item.velocity.toFixed(1)}/h</span>
        </div>
      </div>

      <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Ver Contenido
      </button>
    </div>
  );
});

TrendingCard.displayName = 'TrendingCard';

export default TrendingCard;