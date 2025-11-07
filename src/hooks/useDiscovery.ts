// Hook para algoritmos de descubrimiento y recomendaciones en TheFreed.v1
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { Content, User } from '../types';

export interface Recommendation {
  id: string;
  content: Content;
  score: number;
  reason: 'similar_content' | 'followed_creator' | 'trending' | 'personalized' | 'cold_start';
  confidence: number;
  metadata: {
    matchedTags?: string[];
    creatorSimilarity?: number;
    engagementScore?: number;
    timeDecay?: number;
  };
}

export interface DiscoveryFilters {
  contentTypes: string[];
  categories: string[];
  dateRange: 'today' | 'week' | 'month' | 'all';
  sortBy: 'relevance' | 'trending' | 'recent' | 'popular';
  minLikes?: number;
  maxDuration?: number; // Para videos/audio
  language?: string;
}

export interface UserBehavior {
  userId: string;
  viewedContent: string[];
  likedContent: string[];
  followedCreators: string[];
  searchQueries: string[];
  sessionDuration: number;
  engagementRate: number;
  preferredContentTypes: string[];
  timeSpentPerCategory: Record<string, number>;
  lastActive: string;
}

export interface TrendingContent {
  contentId: string;
  trendScore: number;
  views24h: number;
  likes24h: number;
  comments24h: number;
  shares24h: number;
  velocity: number; // Crecimiento por hora
  category: string;
  creatorId: string;
}

// Hook para obtener recomendaciones personalizadas
export const useRecommendations = (limit: number = 10) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async (refresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getRecommendations({ 
        limit, 
        refresh 
      });

      if (response.success && response.data) {
        setRecommendations(response.data.recommendations || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar recomendaciones');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const trackInteraction = useCallback(async (contentId: string, action: 'view' | 'like' | 'share' | 'comment') => {
    try {
      await apiService.trackRecommendationInteraction(contentId, action);
    } catch (err: any) {
      console.error('Error tracking interaction:', err);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    loading,
    error,
    fetchRecommendations,
    trackInteraction
  };
};

// Hook para contenido trending
export const useTrending = (category?: string, limit: number = 20) => {
  const [trending, setTrending] = useState<TrendingContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getTrendingContent();

      if (response.success && response.data) {
        setTrending(response.data.trending || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar contenido trending');
    } finally {
      setLoading(false);
    }
  }, [category, limit]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return {
    trending,
    loading,
    error,
    refetch: fetchTrending
  };
};

// Hook para descubrimiento con filtros
export const useDiscovery = (filters: DiscoveryFilters) => {
  const [discoverContent, setDiscoverContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const fetchDiscovery = useCallback(async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: Math.floor((cursor || 0) / 20) + 1,
        limit: 20,
        contentTypes: filters.contentTypes.length > 0 ? filters.contentTypes.join(',') : undefined,
        categories: filters.categories.length > 0 ? filters.categories.join(',') : undefined,
        dateRange: filters.dateRange,
        sortBy: filters.sortBy,
        minLikes: filters.minLikes,
        maxDuration: filters.maxDuration,
        language: filters.language,
        cursor: cursor && !reset ? cursor : undefined
      };

      const response = await apiService.getDiscoverContent(params);

      if (response.success && response.data) {
        const newContent = response.data.content || [];
        
        setDiscoverContent(prev => reset ? newContent : [...prev, ...newContent]);
        setHasMore(response.data.hasMore || false);
        setCursor(response.data.nextCursor || null);
      }
    } catch (err: any) {
      setError(err.message || 'Error en descubrimiento');
    } finally {
      setLoading(false);
    }
  }, [filters, cursor]);

  useEffect(() => {
    fetchDiscovery(true);
  }, [fetchDiscovery]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchDiscovery(false);
    }
  }, [loading, hasMore, fetchDiscovery]);

  return {
    discoverContent,
    loading,
    error,
    hasMore,
    loadMore,
    refetch: () => fetchDiscovery(true)
  };
};

// Hook para analytics de comportamiento de usuario
export const useUserBehavior = () => {
  const [behavior, setBehavior] = useState<UserBehavior | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBehavior = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getUserBehavior();

      if (response.success && response.data) {
        setBehavior(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar comportamiento');
    } finally {
      setLoading(false);
    }
  };

  const trackSearchQuery = async (query: string) => {
    try {
      await apiService.trackSearchQuery(query, 0);
    } catch (err: any) {
      console.error('Error tracking search:', err);
    }
  };

  const trackSessionStart = () => {
    sessionStorage.setItem('sessionStart', Date.now().toString());
  };

  const trackSessionEnd = async () => {
    const startTime = sessionStorage.getItem('sessionStart');
    if (startTime) {
      const duration = Date.now() - parseInt(startTime);
      try {
        await apiService.trackSessionEvent('end', { duration });
      } catch (err: any) {
        console.error('Error tracking session:', err);
      }
      sessionStorage.removeItem('sessionStart');
    }
  };

  useEffect(() => {
    fetchBehavior();
    trackSessionStart();
    
    const handleBeforeUnload = () => trackSessionEnd();
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      trackSessionEnd();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return {
    behavior,
    loading,
    error,
    fetchBehavior,
    trackSearchQuery,
    trackSessionStart,
    trackSessionEnd
  };
};

// Hook para creadores similares
export const useSimilarCreators = (creatorId: string, limit: number = 5) => {
  const [similarCreators, setSimilarCreators] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSimilarCreators = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.request(`/api/discover/similar-creators/${creatorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`,
          'X-Limit': limit.toString()
        }
      });

      if (response.success && response.data) {
        setSimilarCreators(response.data.creators || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error al buscar creadores similares');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (creatorId) {
      fetchSimilarCreators();
    }
  }, [creatorId, limit]);

  return {
    similarCreators,
    loading,
    error,
    refetch: fetchSimilarCreators
  };
};

// Utilidades para algoritmos de recomendación
export const recommendationUtils = {
  // Calcular score de similitud entre contenidos
  calculateContentSimilarity: (content1: Content, content2: Content): number => {
    let score = 0;
    
    // Similitud por tags/categorías
    const tags1 = content1.tags || [];
    const tags2 = content2.tags || [];
    const commonTags = tags1.filter(tag => tags2.includes(tag));
    score += (commonTags.length / Math.max(tags1.length, tags2.length)) * 0.4;
    
    // Similitud por tipo de contenido
    if (content1.contentType === content2.contentType) {
      score += 0.3;
    }
    
    // Similitud por creador
    if (content1.creatorId === content2.creatorId) {
      score += 0.3;
    }
    
    return Math.min(score, 1);
  },

  // Aplicar decay temporal al score
  applyTimeDecay: (score: number, createdAt: string): number => {
    const now = Date.now();
    const created = new Date(createdAt).getTime();
    const daysDiff = (now - created) / (1000 * 60 * 60 * 24);
    
    // Decay exponencial: score * e^(-0.1 * days)
    return score * Math.exp(-0.1 * daysDiff);
  },

  // Calcular score de trending
  calculateTrendingScore: (content: Content, views24h: number, likes24h: number): number => {
    const velocity = (likes24h + views24h * 0.1) / 24; // Por hora
    const engagementRate = content.likesCount / Math.max(content.viewsCount, 1);
    
    return velocity * 0.6 + engagementRate * 0.4;
  },

  // Generar cold start recommendations
  generateColdStartRecommendations: (allContent: Content[]): Recommendation[] => {
    // Para usuarios nuevos, recomendar contenido popular y reciente
    const sortedByPopularity = allContent
      .sort((a, b) => (b.likesCount + b.viewsCount) - (a.likesCount + a.viewsCount))
      .slice(0, 10);

    return sortedByPopularity.map(content => ({
      id: `cold_${content.id}`,
      content,
      score: 0.8,
      reason: 'cold_start' as const,
      confidence: 0.5,
      metadata: {
        engagementScore: (content.likesCount + content.viewsCount) / 2
      }
    }));
  }
};
