import React, { useEffect, useState } from 'react';
import { formatRelativeTime, formatCompactNumber } from '@/utils/formatters';

// Tipo para un contenido de ejemplo
type FeedPost = {
  id: string;
  title: string;
  description?: string;
  mediaUrl?: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  views: number;
  likes: number;
};

// Card visual para cada post
const FeedCard: React.FC<{ post: FeedPost }> = ({ post }) => (
  <article className="bg-white dark:bg-gray-950 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
    {post.mediaUrl ? (
      <img src={post.mediaUrl} alt={post.title} className="w-full h-60 object-cover" />
    ) : (
      <div className="w-full h-60 bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-3xl text-gray-400 dark:text-gray-600">Sin imagen</div>
    )}
    <div className="p-5 flex-1 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {post.authorAvatar ? (
          <img src={post.authorAvatar} alt={post.authorName} className="h-10 w-10 rounded-full border-2 border-blue-400" />
        ) : (
          <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-xl text-gray-500 dark:text-gray-300">{post.authorName.charAt(0).toUpperCase()}</div>
        )}
        <span className="font-semibold text-gray-700 dark:text-gray-100">{post.authorName}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{formatRelativeTime(post.createdAt)}</span>
      </div>
      <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 leading-tight">{post.title}</h2>
      {post.description && <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">{post.description}</p>}
      <div className="flex items-center gap-6 mt-2">
        <span className="text-blue-600 dark:text-blue-300 font-bold text-xs">{formatCompactNumber(post.views)} vistas</span>
        <span className="text-gray-500 dark:text-gray-400 text-xs">{formatCompactNumber(post.likes)} likes</span>
      </div>
    </div>
  </article>
);

// Imagenes de prueba de Unsplash y avatars
const AVATARS = [
  'https://randomuser.me/api/portraits/women/68.jpg',
  'https://randomuser.me/api/portraits/men/42.jpg',
  'https://randomuser.me/api/portraits/women/43.jpg',
  'https://randomuser.me/api/portraits/men/16.jpg',
];
const IMAGES = [
  'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1444065381814-865dc9da92c0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Simular datos de prueba mezclando imágenes/avatars
const generateMockPosts = (count = 12): FeedPost[] => {
  return Array.from({ length: count }).map((_, i) => {
    const idx = i % IMAGES.length;
    return {
      id: String(i + 1),
      title: `Ejemplo visual ${i + 1}`,
      description: 'Este es un contenido de ejemplo generado automáticamente para comprobar el feed visual. ¡Personaliza esto y conecta con tu backend!',
      mediaUrl: IMAGES[idx],
      authorName: `Autor${i + 1}`,
      authorAvatar: AVATARS[i % AVATARS.length],
      createdAt: new Date(Date.now() - getRandomInt(1, 48) * 3600000).toISOString(),
      views: getRandomInt(1000, 25000),
      likes: getRandomInt(100, 5000),
    };
  });
};

export default function FeedPage() {
  const [feed, setFeed] = useState<FeedPost[]>([]);

  useEffect(() => {
    setFeed(generateMockPosts(16));
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-3 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Feed de contenidos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {feed.map((post) => (
          <FeedCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
