import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContextSupabase';
import { supabaseService, ScheduledPost, Content } from '../services/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, Loader2, AlertCircle, Trash2, Edit2, X } from 'lucide-react';

export const ScheduledPostsManager: React.FC = () => {
  const { user } = useAuth();
  const [scheduledPosts, setScheduledPosts] = useState<(ScheduledPost & { content?: Content })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);

  useEffect(() => {
    loadScheduledPosts();
  }, [user?.id]);

  const loadScheduledPosts = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const posts = await supabaseService.getScheduledPosts(user.id);
      
      // Cargar información de contenidos
      const postsWithContent = await Promise.all(
        posts.map(async (post) => {
          try {
            const content = await supabaseService.getContent(post.content_id);
            return { ...post, content };
          } catch (err) {
            return post;
          }
        })
      );

      setScheduledPosts(postsWithContent);
    } catch (err: any) {
      setError(err.message || 'Error al cargar publicaciones programadas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await supabaseService.cancelScheduledPost(id);
      await loadScheduledPosts();
      setShowCancelModal(false);
      setSelectedPost(null);
    } catch (err: any) {
      setError(err.message || 'Error al cancelar la publicación');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (scheduledPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay publicaciones programadas</h3>
        <p className="text-gray-500">
          Las publicaciones que programes aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
        <Calendar className="h-6 w-6" />
        <span>Publicaciones Programadas ({scheduledPosts.length})</span>
      </h2>

      <div className="grid gap-4">
        {scheduledPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {post.content?.title || 'Sin título'}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {post.content?.description}
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(new Date(post.scheduled_for), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                    </span>
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    post.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    post.status === 'published' ? 'bg-green-100 text-green-800' :
                    post.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {post.status === 'pending' ? 'Pendiente' :
                     post.status === 'published' ? 'Publicado' :
                     post.status === 'failed' ? 'Fallido' :
                     post.status === 'cancelled' ? 'Cancelado' : post.status}
                  </span>
                </div>

                {post.error_message && (
                  <div className="mt-2 text-sm text-red-600">
                    Error: {post.error_message}
                  </div>
                )}
              </div>

              {post.status === 'pending' && (
                <button
                  onClick={() => {
                    setSelectedPost(post);
                    setShowCancelModal(true);
                  }}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancelar Publicación Programada</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas cancelar esta publicación programada? El contenido permanecerá como borrador.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedPost(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Volver
              </button>
              <button
                onClick={() => handleCancel(selectedPost.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancelar Publicación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledPostsManager;
