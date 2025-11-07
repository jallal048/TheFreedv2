// Feed visual tipo red social moderna (Instagram/Patreon)
import React from 'react';
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
    {/* Imagen principal */}
    {post.mediaUrl ? (
      <img src={post.mediaUrl} alt={post.title} className="w-full h-60 object-cover" />
    ) : (
      <div className="w-full h-60 bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-3xl text-gray-400 dark:text-gray-600">Sin imagen</div>
    )}
    {/* Info */}
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

// Grid responsivo
const FEED_DATA: FeedPost[] = [
  {
    id: '1',
    title: 'Mi primer video premium',
    description: '¡Bienvenidos a mi contenido exclusivo!',
    mediaUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80',
    authorName: 'Sofía Digital',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    views: 25140,
    likes: 2049,
  },
  {
    id: '2',
    title: 'Acústico en directo',
    description: 'Clip en vivo compartido con todos mis seguidores.',
    mediaUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80',
    authorName: 'David Beats',
    authorAvatar: '',
    createdAt: new Date(Date.now() - 7 * 3600000).toISOString(),
    views: 12377,
    likes: 1222,
  },
  {
    id: '3',
    title: 'Making-of: sesión de fotos',
    mediaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    authorName: 'Elena Shots',
    createdAt: new Date(Date.now() - 15 * 3600000).toISOString(),
    views: 7628,
    likes: 789,
  },
  {
    id: '4',
    title: 'Nuevo tutorial: cómo configuro mis streams',
    description: 'Tips y herramientas top para creadores de contenido.',
    mediaUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    authorName: 'Kike Streamer',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    views: 14576,
    likes: 1936,
  },
];

export default function FeedPage() {
  return (
    <section className="max-w-6xl mx-auto px-3 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Feed de contenidos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {FEED_DATA.map((post) => (
          <FeedCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
