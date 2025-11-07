import React, { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import { formatRelativeTime, formatCompactNumber } from '@/utils/formatters';

// Card Feed vertical
const FeedCard = ({ post }) => (
  <article className="bg-white dark:bg-gray-950 rounded-xl shadow-md flex flex-row gap-4 overflow-hidden hover:shadow-xl transition-shadow duration-300 items-center mb-6">
    {post.media_url ? (
      <img src={post.media_url} alt={post.title} className="w-32 h-32 object-cover shrink-0" />
    ) : (
      <div className="w-32 h-32 bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-3xl text-gray-400 dark:text-gray-600 shrink-0">Sin imagen</div>
    )}
    {/* Info */}
    <div className="flex flex-col gap-1 flex-1 p-3 min-w-0">
      <div className="flex items-center gap-3 mb-1">
        {post.profile_avatar_url ? (
          <img src={post.profile_avatar_url} alt={post.author} className="h-9 w-9 rounded-full border border-blue-400" />
        ) : (
          <div className="h-9 w-9 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-base text-gray-500 dark:text-gray-300">{post.author?.slice(0,2)?.toUpperCase()}</div>
        )}
        <span className="font-medium text-gray-700 dark:text-gray-100 text-sm truncate">{post.author}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{formatRelativeTime(post.created_at)}</span>
      </div>
      <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">{post.title}</h2>
      {post.description && <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-3 whitespace-pre-wrap">{post.description}</p>}
      <div className="flex items-center gap-5 mt-1">
        <span className="text-blue-600 dark:text-blue-300 font-bold text-xs">{formatCompactNumber(post.views || 0)} vistas</span>
        <span className="text-gray-500 dark:text-gray-400 text-xs">{formatCompactNumber(post.likes_count || 0)} likes</span>
      </div>
    </div>
  </article>
);

export default function FeedPage() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        // Obtener usuario actual (ajusta según Auth de tu proyecto)
        const user = supabase.auth.user();
        if (!user) {
          setError('Debes iniciar sesión.');
          setLoading(false);
          return;
        }
        // Obtener a quién sigue el usuario
        const { data: following, error: followErr } = await supabase
          .from('follows')
          .select('followed_id')
          .eq('follower_id', user.id);
        if (followErr) throw followErr;
        const followedIds = following?.map(f => f.followed_id) || [];
        if (!followedIds.length) {
          setFeed([]);
          setLoading(false);
          return;
        }
        // Traer publicaciones recientes de los seguidos con perfil
        const { data: posts, error: postsErr } = await supabase
          .from('contents')
          .select('*, profiles:author_id(display_name,avatar_url)')
          .in('author_id', followedIds)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false });
        if (postsErr) throw postsErr;
        setFeed(
          posts.map(post => ({
            ...post,
            author: post.profiles?.display_name || '',
            profile_avatar_url: post.profiles?.avatar_url || '',
          }))
        );
        setLoading(false);
      } catch (err) {
        setError('Error al cargar el feed');
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="max-w-2xl mx-auto py-8 px-3">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Feed de seguidos</h1>
      {loading && <div className="py-10 text-center text-gray-400">Cargando...</div>}
      {error && !loading && <div className="py-10 text-center text-red-600">{error}</div>}
      {!loading && !error && feed.length === 0 && (
        <div className="py-10 text-center text-gray-400">No sigues a nadie. Sigue a creadores para ver su contenido aquí.</div>
      )}
      <div>
        {feed.map(post => <FeedCard key={post.id} post={post} />)}
      </div>
    </section>
  );
}
