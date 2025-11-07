// Servicio de API completamente migrado a Supabase
import {
  User, AuthTokens, LoginCredentials, RegisterData,
  ApiResponse, PaginatedResponse, Content, Subscription,
  Message, Notification, Payment, UserSettings
} from '../types';
import { supabase } from './supabase';
import { AuthService } from './auth';
import {
  getMockRecommendations, getMockTrendingContent, getMockDiscoverContent,
  trackMockAnalytics, simulateNetworkDelay
} from './mockData';

// Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Request pool interface
interface RequestPool {
  [key: string]: {
    promise: Promise<any>;
    timestamp: number;
  };
}

// Error types
class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class CircuitBreakerError extends ApiError {
  constructor(message: string) {
    super(message, 503, 'CIRCUIT_BREAKER_OPEN', true);
    this.name = 'CircuitBreakerError';
  }
}

class ApiService {
  private token: string | null = null;
  
  // Cache en memoria con TTL
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos por defecto
  private readonly MAX_CACHE_SIZE = 100;
  
  // Request deduplication
  private requestPool: RequestPool = {};
  private readonly REQUEST_POOL_CLEANUP_TIME = 30 * 1000; // 30 segundos
  
  // Debounce timers para búsquedas
  private searchDebounceTimers = new Map<string, NodeJS.Timeout>();
  private readonly SEARCH_DEBOUNCE_DELAY = 300; // 300ms
  
  // Connection pooling simulado
  private activeRequests = 0;
  private readonly MAX_CONCURRENT_REQUESTS = 10;
  private requestQueue: Array<() => Promise<any>> = [];
  
  // Circuit breaker pattern
  private circuitBreakerState = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  private circuitBreakerFailures = 0;
  private circuitBreakerLastFailureTime = 0;
  private readonly CIRCUIT_BREAKER_THRESHOLD = 5;
  private readonly CIRCUIT_BREAKER_TIMEOUT = 60 * 1000; // 1 minuto
  
  // Request retry configuration
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 segundo

  constructor() {
    // Cargar sesión de Supabase
    this.initializeAuth();
    
    // Inicializar limpieza periódica del cache y request pool
    this.startCleanupInterval();
    
    // Inicializar circuit breaker check
    this.startCircuitBreakerCheck();
  }

  private async initializeAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    this.token = session?.access_token || null;
  }

  // ==================== SISTEMA DE CACHÉ ====================
  private getCacheKey(endpoint: string, params?: any): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}_${paramString}`;
  }

  private isValidCacheEntry(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  private setCache<T>(key: string, data: T, ttl: number = this.CACHE_TTL): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (!this.isValidCacheEntry(entry)) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // ==================== DEBOUNCING ====================
  private debounceSearch<T>(
    key: string,
    fn: () => Promise<T>,
    delay: number = this.SEARCH_DEBOUNCE_DELAY
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.searchDebounceTimers.has(key)) {
        clearTimeout(this.searchDebounceTimers.get(key)!);
      }

      const timer = setTimeout(async () => {
        this.searchDebounceTimers.delete(key);
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);

      this.searchDebounceTimers.set(key, timer);
    });
  }

  // ==================== REQUEST DEDUPLICATION ====================
  private getRequestKey(queryName: string, params: any): string {
    return `${queryName}_${JSON.stringify(params)}`;
  }

  private async deduplicateRequest<T>(
    key: string,
    fn: () => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T>> {
    const now = Date.now();
    
    for (const [poolKey, poolEntry] of Object.entries(this.requestPool)) {
      if (now - poolEntry.timestamp > this.REQUEST_POOL_CLEANUP_TIME) {
        delete this.requestPool[poolKey];
      }
    }

    if (this.requestPool[key]) {
      return this.requestPool[key].promise;
    }

    const promise = fn().finally(() => {
      setTimeout(() => {
        delete this.requestPool[key];
      }, 1000);
    });

    this.requestPool[key] = {
      promise,
      timestamp: now
    };

    return promise;
  }

  // ==================== CONNECTION POOLING ====================
  private async acquireConnection(): Promise<void> {
    return new Promise((resolve) => {
      if (this.activeRequests < this.MAX_CONCURRENT_REQUESTS) {
        this.activeRequests++;
        resolve();
        return;
      }

      this.requestQueue.push(() => {
        this.activeRequests++;
        return Promise.resolve();
      });

      const checkQueue = () => {
        if (this.activeRequests < this.MAX_CONCURRENT_REQUESTS && this.requestQueue.length > 0) {
          const nextRequest = this.requestQueue.shift()!;
          nextRequest().then(resolve);
        }
      };

      const interval = setInterval(() => {
        checkQueue();
        if (this.activeRequests < this.MAX_CONCURRENT_REQUESTS || this.requestQueue.length === 0) {
          clearInterval(interval);
        }
      }, 50);
    });
  }

  private releaseConnection(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    
    if (this.requestQueue.length > 0) {
      const nextRequest = this.requestQueue.shift()!;
      this.activeRequests++;
      nextRequest();
    }
  }

  // ==================== CIRCUIT BREAKER ====================
  private canMakeRequest(): boolean {
    if (this.circuitBreakerState === 'CLOSED') return true;
    
    if (this.circuitBreakerState === 'OPEN') {
      if (Date.now() - this.circuitBreakerLastFailureTime > this.CIRCUIT_BREAKER_TIMEOUT) {
        this.circuitBreakerState = 'HALF_OPEN';
        return true;
      }
      return false;
    }
    
    return this.circuitBreakerState === 'HALF_OPEN';
  }

  private recordSuccess(): void {
    this.circuitBreakerFailures = 0;
    if (this.circuitBreakerState === 'HALF_OPEN') {
      this.circuitBreakerState = 'CLOSED';
    }
  }

  private recordFailure(): void {
    this.circuitBreakerFailures++;
    
    if (this.circuitBreakerFailures >= this.CIRCUIT_BREAKER_THRESHOLD) {
      this.circuitBreakerState = 'OPEN';
      this.circuitBreakerLastFailureTime = Date.now();
    }
  }

  // ==================== ERROR HANDLING ====================
  private isRetryableError(error: any): boolean {
    if (error instanceof ApiError) {
      return error.retryable;
    }
    
    return error?.message?.includes('timeout') || 
           error?.message?.includes('network') ||
           error?.code === 'PGRST301'; // Supabase timeout
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<ApiResponse<T>>,
    maxRetries: number = this.MAX_RETRIES
  ): Promise<ApiResponse<T>> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn();
        this.recordSuccess();
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries || !this.isRetryableError(error)) {
          this.recordFailure();
          break;
        }
        
        const delay = this.RETRY_DELAY * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }
    
    this.recordFailure();
    throw lastError;
  }

  // ==================== LIMPIEZA Y MANTENIMIENTO ====================
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (!this.isValidCacheEntry(entry)) {
          this.cache.delete(key);
        }
      }
      
      for (const [key, timer] of this.searchDebounceTimers.entries()) {
        clearTimeout(timer);
        this.searchDebounceTimers.delete(key);
      }
    }, 60000);
  }

  private startCircuitBreakerCheck(): void {
    setInterval(() => {
      if (this.circuitBreakerState === 'OPEN' && 
          Date.now() - this.circuitBreakerLastFailureTime > this.CIRCUIT_BREAKER_TIMEOUT) {
        this.circuitBreakerState = 'HALF_OPEN';
      }
    }, 30000);
  }

  // ==================== WRAPPER SUPABASE CON OPTIMIZACIONES ====================
  private async supabaseRequest<T>(
    queryName: string,
    fn: () => Promise<{ data: T | null; error: any }>,
    useCache: boolean = false,
    cacheTTL?: number
  ): Promise<ApiResponse<T>> {
    
    if (!this.canMakeRequest()) {
      throw new CircuitBreakerError('Circuit breaker is open. Too many failures.');
    }

    // Manejar cache
    if (useCache) {
      const cacheKey = this.getCacheKey(queryName);
      const cachedData = this.getCache<ApiResponse<T>>(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
    }

    const requestKey = this.getRequestKey(queryName, {});
    
    const makeRequest = async (): Promise<ApiResponse<T>> => {
      await this.acquireConnection();
      
      try {
        const { data, error } = await fn();

        if (error) {
          throw new ApiError(
            error.message || 'Database error',
            error.code === 'PGRST116' ? 404 : 500,
            error.code,
            true
          );
        }

        const response: ApiResponse<T> = {
          success: true,
          data: data as T,
          timestamp: new Date().toISOString()
        };

        // Guardar en cache
        if (useCache) {
          const cacheKey = this.getCacheKey(queryName);
          this.setCache(cacheKey, response, cacheTTL);
        }

        return response;
      } finally {
        this.releaseConnection();
      }
    };

    return this.deduplicateRequest(requestKey, () => this.retryWithBackoff(makeRequest));
  }

  // ==================== AUTENTICACIÓN ====================
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const result = await AuthService.login(credentials.email, credentials.password);
    
    if (result.success && result.data) {
      this.token = result.data.token;
      this.invalidateUserCache();
      
      return {
        success: true,
        data: {
          user: result.data.user,
          tokens: {
            token: result.data.token || '',
            refreshToken: result.data.refreshToken || ''
          }
        },
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: false,
      error: result.error || 'Error de autenticación',
      data: null,
      timestamp: new Date().toISOString()
    };
  }

  async register(userData: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const result = await AuthService.register(
      userData.email, 
      userData.password,
      {
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName
      }
    );
    
    if (result.success && result.data) {
      this.token = result.data.token;
      this.invalidateUserCache();
      
      return {
        success: true,
        data: {
          user: result.data.user,
          tokens: {
            token: result.data.token || '',
            refreshToken: result.data.refreshToken || ''
          }
        },
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: false,
      error: result.error || 'Error de registro',
      data: null,
      timestamp: new Date().toISOString()
    };
  }

  async logout(): Promise<ApiResponse<null>> {
    const result = await AuthService.logout();
    
    if (result.success) {
      this.token = null;
      this.clearCache();
    }

    return {
      success: result.success,
      error: result.error,
      data: null,
      timestamp: new Date().toISOString()
    };
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.supabaseRequest(
      'getCurrentUser',
      async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          return { data: null, error: error || new Error('No user found') };
        }

        return { 
          data: { user: AuthService.mapSupabaseUser(user) }, 
          error: null 
        };
      },
      true,
      2 * 60 * 1000
    );
  }

  // ==================== USUARIOS Y PERFILES ====================
  async getUsers(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    userType?: string 
  }): Promise<PaginatedResponse<User>> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;

    const queryFn = async () => {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      if (params?.search) {
        query = query.or(`username.ilike.%${params.search}%,display_name.ilike.%${params.search}%,bio.ilike.%${params.search}%`);
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error };
      }

      // Mapear profiles a Users
      const users: User[] = (data || []).map((profile: any) => ({
        id: profile.user_id,
        email: '',
        username: profile.username || '',
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        userType: 'USER' as any,
        isEmailVerified: true,
        isPhoneVerified: false,
        isActive: profile.is_active !== false,
        isSuspended: false,
        createdAt: profile.created_at,
        lastActive: profile.updated_at,
        profile: {
          id: profile.id,
          userId: profile.user_id,
          displayName: profile.display_name || profile.username || '',
          bio: profile.bio || '',
          avatarUrl: profile.avatar_url || '',
          bannerUrl: profile.banner_url || '',
          website: profile.website || '',
          socialLinks: profile.social_links || {},
          categories: profile.categories || [],
          contentTypes: [],
          isVerified: profile.is_verified || false,
          verificationLevel: 'BASIC' as any,
          isLiveStreaming: false,
          isAdultContent: false,
          monthlyPrice: profile.monthly_price || 0,
          yearlyPrice: 0,
          customPrice: 0,
          commissionRate: 15,
          isPublic: profile.is_public !== false,
          isActive: profile.is_active !== false,
          followerCount: profile.follower_count || 0,
          totalViews: 0,
          totalEarnings: 0,
          totalContent: 0,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at
        }
      }));

      return { data: users, error: null };
    };

    if (params?.search) {
      const searchKey = `getUsers_${params.search}`;
      return this.debounceSearch(searchKey, async () => {
        const { data, error } = await queryFn();
        
        if (error) {
          throw new ApiError(error.message, 500, error.code, true);
        }

        return {
          success: true,
          data: data || [],
          pagination: {
            currentPage: page,
            totalPages: Math.ceil((data?.length || 0) / limit),
            totalItems: data?.length || 0,
            itemsPerPage: limit,
            hasNextPage: offset + limit < (data?.length || 0),
            hasPrevPage: page > 1
          },
          timestamp: new Date().toISOString()
        };
      });
    }
    
    const { data, error } = await queryFn();
    
    if (error) {
      throw new ApiError(error.message, 500, error.code, true);
    }

    return {
      success: true,
      data: data || [],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((data?.length || 0) / limit),
        totalItems: data?.length || 0,
        itemsPerPage: limit,
        hasNextPage: offset + limit < (data?.length || 0),
        hasPrevPage: page > 1
      },
      timestamp: new Date().toISOString()
    };
  }

  async getUser(id: string): Promise<ApiResponse<{ user: User }>> {
    return this.supabaseRequest(
      `getUser_${id}`,
      async () => {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', id)
          .maybeSingle();

        if (error || !profile) {
          return { data: null, error: error || new Error('User not found') };
        }

        const user: User = {
          id: profile.user_id,
          email: '',
          username: profile.username || '',
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          userType: 'USER' as any,
          isEmailVerified: true,
          isPhoneVerified: false,
          isActive: profile.is_active !== false,
          isSuspended: false,
          createdAt: profile.created_at,
          lastActive: profile.updated_at,
          profile: {
            id: profile.id,
            userId: profile.user_id,
            displayName: profile.display_name || profile.username || '',
            bio: profile.bio || '',
            avatarUrl: profile.avatar_url || '',
            bannerUrl: profile.banner_url || '',
            website: profile.website || '',
            socialLinks: profile.social_links || {},
            categories: profile.categories || [],
            contentTypes: [],
            isVerified: profile.is_verified || false,
            verificationLevel: 'BASIC' as any,
            isLiveStreaming: false,
            isAdultContent: false,
            monthlyPrice: profile.monthly_price || 0,
            yearlyPrice: 0,
            customPrice: 0,
            commissionRate: 15,
            isPublic: profile.is_public !== false,
            isActive: profile.is_active !== false,
            followerCount: profile.follower_count || 0,
            totalViews: 0,
            totalEarnings: 0,
            totalContent: 0,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at
          }
        };

        return { data: { user }, error: null };
      },
      true,
      5 * 60 * 1000
    );
  }

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    const response = await this.supabaseRequest(
      `updateUser_${id}`,
      async () => {
        const updateData: any = {
          updated_at: new Date().toISOString()
        };

        if (userData.profile) {
          if (userData.profile.displayName) updateData.display_name = userData.profile.displayName;
          if (userData.profile.bio !== undefined) updateData.bio = userData.profile.bio;
          if (userData.profile.avatarUrl !== undefined) updateData.avatar_url = userData.profile.avatarUrl;
          if (userData.profile.bannerUrl !== undefined) updateData.banner_url = userData.profile.bannerUrl;
          if (userData.profile.website !== undefined) updateData.website = userData.profile.website;
          if (userData.profile.socialLinks) updateData.social_links = userData.profile.socialLinks;
          if (userData.profile.categories) updateData.categories = userData.profile.categories;
        }

        if (userData.username) updateData.username = userData.username;
        if (userData.firstName) updateData.first_name = userData.firstName;
        if (userData.lastName) updateData.last_name = userData.lastName;

        const { data, error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('user_id', id)
          .select()
          .maybeSingle();

        if (error || !data) {
          return { data: null, error: error || new Error('Update failed') };
        }

        const user: User = {
          id: data.user_id,
          email: '',
          username: data.username || '',
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          userType: 'USER' as any,
          isEmailVerified: true,
          isPhoneVerified: false,
          isActive: data.is_active !== false,
          isSuspended: false,
          createdAt: data.created_at,
          lastActive: data.updated_at,
          profile: {
            id: data.id,
            userId: data.user_id,
            displayName: data.display_name || data.username || '',
            bio: data.bio || '',
            avatarUrl: data.avatar_url || '',
            bannerUrl: data.banner_url || '',
            website: data.website || '',
            socialLinks: data.social_links || {},
            categories: data.categories || [],
            contentTypes: [],
            isVerified: data.is_verified || false,
            verificationLevel: 'BASIC' as any,
            isLiveStreaming: false,
            isAdultContent: false,
            monthlyPrice: data.monthly_price || 0,
            yearlyPrice: 0,
            customPrice: 0,
            commissionRate: 15,
            isPublic: data.is_public !== false,
            isActive: data.is_active !== false,
            followerCount: data.follower_count || 0,
            totalViews: 0,
            totalEarnings: 0,
            totalContent: 0,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          }
        };

        return { data: { user }, error: null };
      },
      false
    );

    if (response.success) {
      this.invalidateUserCache();
    }

    return response;
  }

  async getUserSettings(userId: string): Promise<ApiResponse<{ settings: UserSettings }>> {
    return this.supabaseRequest(
      `getUserSettings_${userId}`,
      async () => {
        // Si no tienes tabla de settings, devolver defaults
        const settings: UserSettings = {
          userId,
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          language: 'en',
          theme: 'light',
          privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showPhone: false
          }
        };

        return { data: { settings }, error: null };
      },
      true,
      5 * 60 * 1000
    );
  }

  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<ApiResponse<{ settings: UserSettings }>> {
    // Si no tienes tabla de settings, solo retornar success
    return {
      success: true,
      data: { settings: settings as UserSettings },
      timestamp: new Date().toISOString()
    };
  }

  // ==================== CONTENIDO ====================
  async getContent(params?: {
    page?: number;
    limit?: number;
    category?: string;
    contentType?: string;
    creatorId?: string;
    isPremium?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Content>> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;

    const queryFn = async () => {
      let query = supabase
        .from('contents')
        .select('*, profiles!contents_author_id_fkey(*)', { count: 'exact' })
        .eq('status', 'published');

      if (params?.category) {
        query = query.eq('category', params.category);
      }

      if (params?.contentType) {
        query = query.eq('content_type', params.contentType);
      }

      if (params?.creatorId) {
        query = query.eq('author_id', params.creatorId);
      }

      if (params?.isPremium !== undefined) {
        query = query.eq('is_premium', params.isPremium);
      }

      if (params?.search) {
        query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
      }

      const sortBy = params?.sortBy || 'created_at';
      const sortOrder = params?.sortOrder === 'asc';

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order(sortBy, { ascending: sortOrder });

      return { data, error, count };
    };

    if (params?.search) {
      const searchKey = `getContent_${params.search}`;
      return this.debounceSearch(searchKey, async () => {
        const { data, error, count } = await queryFn();
        
        if (error) {
          throw new ApiError(error.message, 500, error.code, true);
        }

        return {
          success: true,
          data: data as Content[] || [],
          pagination: {
            currentPage: page,
            totalPages: Math.ceil((count || 0) / limit),
            totalItems: count || 0,
            itemsPerPage: limit,
            hasNextPage: offset + limit < (count || 0),
            hasPrevPage: page > 1
          },
          timestamp: new Date().toISOString()
        };
      });
    }

    const { data, error, count } = await queryFn();
    
    if (error) {
      throw new ApiError(error.message, 500, error.code, true);
    }

    return {
      success: true,
      data: data as Content[] || [],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        totalItems: count || 0,
        itemsPerPage: limit,
        hasNextPage: offset + limit < (count || 0),
        hasPrevPage: page > 1
      },
      timestamp: new Date().toISOString()
    };
  }

  async getContentById(id: string): Promise<ApiResponse<{ content: Content }>> {
    return this.supabaseRequest(
      `getContentById_${id}`,
      async () => {
        const { data, error } = await supabase
          .from('contents')
          .select('*, profiles!contents_author_id_fkey(*)')
          .eq('id', id)
          .maybeSingle();

        if (error || !data) {
          return { data: null, error: error || new Error('Content not found') };
        }

        // Incrementar views
        await supabase
          .from('views')
          .insert([{ content_id: id, user_id: (await supabase.auth.getUser()).data.user?.id }])
          .select();

        return { data: { content: data as Content }, error: null };
      },
      true,
      5 * 60 * 1000
    );
  }

  async getContentByCategory(category: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Content>> {
    return this.getContent({ ...params, category });
  }

  async createContent(contentData: Partial<Content>): Promise<ApiResponse<{ content: Content }>> {
    const response = await this.supabaseRequest(
      'createContent',
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return { data: null, error: new Error('Not authenticated') };
        }

        const { data, error } = await supabase
          .from('contents')
          .insert([{
            title: contentData.title,
            description: contentData.description,
            content_html: contentData.contentHtml,
            content_type: contentData.contentType,
            category: contentData.category,
            tags: contentData.tags,
            visibility: contentData.visibility,
            price: contentData.price,
            is_premium: contentData.isPremium,
            is_free: contentData.isFree,
            is_nsfw: contentData.isNsfw,
            age_restriction: contentData.ageRestriction,
            media_url: contentData.mediaUrl,
            thumbnail_url: contentData.thumbnailUrl,
            status: 'published',
            author_id: user.id
          }])
          .select('*, profiles!contents_author_id_fkey(*)')
          .maybeSingle();

        if (error || !data) {
          return { data: null, error: error || new Error('Create failed') };
        }

        return { data: { content: data as Content }, error: null };
      },
      false
    );

    if (response.success) {
      this.invalidateContentCache();
    }

    return response;
  }

  async updateContent(id: string, contentData: Partial<Content>): Promise<ApiResponse<{ content: Content }>> {
    const response = await this.supabaseRequest(
      `updateContent_${id}`,
      async () => {
        const updateData: any = {
          updated_at: new Date().toISOString()
        };

        if (contentData.title) updateData.title = contentData.title;
        if (contentData.description !== undefined) updateData.description = contentData.description;
        if (contentData.contentHtml !== undefined) updateData.content_html = contentData.contentHtml;
        if (contentData.contentType) updateData.content_type = contentData.contentType;
        if (contentData.category) updateData.category = contentData.category;
        if (contentData.tags) updateData.tags = contentData.tags;
        if (contentData.visibility) updateData.visibility = contentData.visibility;
        if (contentData.price !== undefined) updateData.price = contentData.price;
        if (contentData.isPremium !== undefined) updateData.is_premium = contentData.isPremium;
        if (contentData.isFree !== undefined) updateData.is_free = contentData.isFree;
        if (contentData.isNsfw !== undefined) updateData.is_nsfw = contentData.isNsfw;
        if (contentData.mediaUrl !== undefined) updateData.media_url = contentData.mediaUrl;
        if (contentData.thumbnailUrl !== undefined) updateData.thumbnail_url = contentData.thumbnailUrl;

        const { data, error } = await supabase
          .from('contents')
          .update(updateData)
          .eq('id', id)
          .select('*, profiles!contents_author_id_fkey(*)')
          .maybeSingle();

        if (error || !data) {
          return { data: null, error: error || new Error('Update failed') };
        }

        return { data: { content: data as Content }, error: null };
      },
      false
    );

    if (response.success) {
      this.invalidateContentCache();
    }

    return response;
  }

  async deleteContent(id: string): Promise<ApiResponse<null>> {
    const response = await this.supabaseRequest(
      `deleteContent_${id}`,
      async () => {
        const { error } = await supabase
          .from('contents')
          .delete()
          .eq('id', id);

        if (error) {
          return { data: null, error };
        }

        return { data: null, error: null };
      },
      false
    );

    if (response.success) {
      this.invalidateContentCache();
    }

    return response;
  }

  async likeContent(id: string): Promise<ApiResponse<{ liked: boolean }>> {
    return this.supabaseRequest(
      `likeContent_${id}`,
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return { data: null, error: new Error('Not authenticated') };
        }

        // Verificar si ya existe el like en la tabla 'likes'
        const { data: existing } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('content_id', id)
          .maybeSingle();

        if (existing) {
          // Eliminar like
          const { error } = await supabase
            .from('likes')
            .delete()
            .eq('id', existing.id);

          if (error) return { data: null, error };

          return { data: { liked: false }, error: null };
        } else {
          // Crear like
          const { error } = await supabase
            .from('likes')
            .insert([{ user_id: user.id, content_id: id }]);

          if (error) return { data: null, error };

          return { data: { liked: true }, error: null };
        }
      },
      false
    );
  }

  async uploadContentFile(file: File): Promise<ApiResponse<{ 
    fileUrl: string; 
    fileName: string; 
    originalName: string; 
    size: number; 
    mimeType: string 
  }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new ApiError('Not authenticated', 401, 'UNAUTHORIZED', false);
      }

      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('content-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new ApiError(error.message, 500, 'UPLOAD_ERROR', true);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('content-media')
        .getPublicUrl(data.path);

      // Registrar en tabla 'media'
      await supabase
        .from('media')
        .insert([{
          file_name: data.path,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: user.id
        }]);

      const result: ApiResponse<any> = {
        success: true,
        data: {
          fileUrl: publicUrl,
          fileName: data.path,
          originalName: file.name,
          size: file.size,
          mimeType: file.type
        },
        timestamp: new Date().toISOString()
      };

      if (result.success) {
        this.invalidateContentCache();
      }

      return result;
    } catch (error: any) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  // ==================== SUSCRIPCIONES (si tienes tabla subscriptions) ====================
  async getSubscriptions(params?: { 
    page?: number; 
    limit?: number; 
    status?: string; 
    creatorId?: string 
  }): Promise<PaginatedResponse<Subscription>> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new ApiError('Not authenticated', 401, 'UNAUTHORIZED', false);
    }

    // Si no tienes tabla subscriptions, devolver vacío
    return {
      success: true,
      data: [],
      pagination: {
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasNextPage: false,
        hasPrevPage: false
      },
      timestamp: new Date().toISOString()
    };
  }

  async createSubscription(subscriptionData: {
    creatorId: string;
    subscriptionType: 'MONTHLY' | 'YEARLY' | 'LIFETIME' | 'CUSTOM';
    paymentMethodId?: string;
  }): Promise<ApiResponse<{ subscription: Subscription }>> {
    // Implementar cuando tengas tabla subscriptions
    return {
      success: false,
      error: 'Subscriptions not implemented yet',
      data: null,
      timestamp: new Date().toISOString()
    };
  }

  async cancelSubscription(id: string): Promise<ApiResponse<{ subscription: Subscription }>> {
    return {
      success: false,
      error: 'Subscriptions not implemented yet',
      data: null,
      timestamp: new Date().toISOString()
    };
  }

  async renewSubscription(id: string): Promise<ApiResponse<{ subscription: Subscription }>> {
    return {
      success: false,
      error: 'Subscriptions not implemented yet',
      data: null,
      timestamp: new Date().toISOString()
    };
  }

  // ==================== PAGOS (si tienes tabla payments) ====================
  async getPayments(params?: { 
    page?: number; 
    limit?: number; 
    status?: string; 
    type?: string 
  }): Promise<PaginatedResponse<Payment>> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;

    return {
      success: true,
      data: [],
      pagination: {
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasNextPage: false,
        hasPrevPage: false
      },
      timestamp: new Date().toISOString()
    };
  }

  async createPaymentIntent(paymentData: {
    amount: number;
    currency?: string;
    paymentMethodId?: string;
    type?: string;
    description?: string;
    subscriptionId?: string;
    contentId?: string;
  }): Promise<ApiResponse<{
    paymentIntent: {
      id: string;
      clientSecret: string;
      amount: number;
      currency: string;
      status: string;
    };
    payment: Payment;
  }>> {
    return {
      success: false,
      error: 'Payments not implemented yet',
      data: null,
      timestamp: new Date().toISOString()
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<ApiResponse<{ payment: Payment }>> {
    return {
      success: false,
      error: 'Payments not implemented yet',
      data: null,
      timestamp: new Date().toISOString()
    };
  }

  // ==================== MENSAJES (si tienes tabla messages) ====================
  async getMessages(params?: { 
    page?: number; 
    limit?: number; 
    search?: string 
  }): Promise<PaginatedResponse<Message>> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;

    return {
      success: true,
      data: [],
      pagination: {
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasNextPage: false,
        hasPrevPage: false
      },
      timestamp: new Date().toISOString()
    };
  }

  async sendMessage(messageData: {
    receiverId: string;
    content: string;
    messageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE';
    mediaUrl?: string;
  }): Promise<ApiResponse<{ message: Message }>> {
    return {
      success: false,
      error: 'Messages not implemented yet',
      data: null,
      timestamp: new Date().toISOString()
    };
  }

  // ==================== NOTIFICACIONES (si tienes tabla notifications) ====================
  async getNotifications(params?: { 
    page?: number; 
    limit?: number; 
    search?: string 
  }): Promise<PaginatedResponse<Notification>> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;

    return {
      success: true,
      data: [],
      pagination: {
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasNextPage: false,
        hasPrevPage: false
      },
      timestamp: new Date().toISOString()
    };
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<null>> {
    return {
      success: false,
      error: 'Notifications not implemented yet',
      data: null,
      timestamp: new Date().toISOString()
    };
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<null>> {
    return {
      success: false,
      error: 'Notifications not implemented yet',
      data: null,
      timestamp: new Date().toISOString()
    };
  }

  // ==================== COMENTARIOS ====================
  async getComments(contentId: string): Promise<ApiResponse<any[]>> {
    return this.supabaseRequest(
      `getComments_${contentId}`,
      async () => {
        const { data, error } = await supabase
          .from('comments')
          .select('*, profiles!comments_user_id_fkey(*)')
          .eq('content_id', contentId)
          .order('created_at', { ascending: false });

        if (error) {
          return { data: null, error };
        }

        return { data: data || [], error: null };
      },
      true,
      2 * 60 * 1000
    );
  }

  async addComment(contentId: string, text: string): Promise<ApiResponse<any>> {
    const response = await this.supabaseRequest(
      'addComment',
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return { data: null, error: new Error('Not authenticated') };
        }

        const { data, error } = await supabase
          .from('comments')
          .insert([{
            content_id: contentId,
            user_id: user.id,
            text: text
          }])
          .select('*, profiles!comments_user_id_fkey(*)')
          .maybeSingle();

        if (error || !data) {
          return { data: null, error: error || new Error('Comment creation failed') };
        }

        return { data, error: null };
      },
      false
    );

    if (response.success) {
      this.invalidateCache(`getComments_${contentId}`);
    }

    return response;
  }

  // ==================== FOLLOWS ====================
  async followUser(userId: string): Promise<ApiResponse<{ following: boolean }>> {
    return this.supabaseRequest(
      `followUser_${userId}`,
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return { data: null, error: new Error('Not authenticated') };
        }

        // Verificar si ya sigue
        const { data: existing } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', userId)
          .maybeSingle();

        if (existing) {
          // Dejar de seguir
          const { error } = await supabase
            .from('follows')
            .delete()
            .eq('id', existing.id);

          if (error) return { data: null, error };

          return { data: { following: false }, error: null };
        } else {
          // Seguir
          const { error } = await supabase
            .from('follows')
            .insert([{ 
              follower_id: user.id, 
              following_id: userId 
            }]);

          if (error) return { data: null, error };

          return { data: { following: true }, error: null };
        }
      },
      false
    );
  }

  async getFollowers(userId: string): Promise<ApiResponse<User[]>> {
    return this.supabaseRequest(
      `getFollowers_${userId}`,
      async () => {
        const { data, error } = await supabase
          .from('follows')
          .select('follower_id, profiles!follows_follower_id_fkey(*)')
          .eq('following_id', userId);

        if (error) {
          return { data: null, error };
        }

        const users = (data || []).map((follow: any) => ({
          id: follow.profiles.user_id,
          username: follow.profiles.username,
          profile: {
            displayName: follow.profiles.display_name,
            avatarUrl: follow.profiles.avatar_url,
            bio: follow.profiles.bio
          }
        }));

        return { data: users, error: null };
      },
      true,
      5 * 60 * 1000
    );
  }

  async getFollowing(userId: string): Promise<ApiResponse<User[]>> {
    return this.supabaseRequest(
      `getFollowing_${userId}`,
      async () => {
        const { data, error } = await supabase
          .from('follows')
          .select('following_id, profiles!follows_following_id_fkey(*)')
          .eq('follower_id', userId);

        if (error) {
          return { data: null, error };
        }

        const users = (data || []).map((follow: any) => ({
          id: follow.profiles.user_id,
          username: follow.profiles.username,
          profile: {
            displayName: follow.profiles.display_name,
            avatarUrl: follow.profiles.avatar_url,
            bio: follow.profiles.bio
          }
        }));

        return { data: users, error: null };
      },
      true,
      5 * 60 * 1000
    );
  }

  // ==================== DRAFTS ====================
  async getDrafts(): Promise<ApiResponse<any[]>> {
    return this.supabaseRequest(
      'getDrafts',
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return { data: null, error: new Error('Not authenticated') };
        }

        const { data, error } = await supabase
          .from('drafts')
          .select('*')
          .eq('author_id', user.id)
          .order('autosaved_at', { ascending: false });

        if (error) {
          return { data: null, error };
        }

        return { data: data || [], error: null };
      },
      true,
      1 * 60 * 1000
    );
  }

  async saveDraft(draftData: any, contentId?: string): Promise<ApiResponse<any>> {
    const response = await this.supabaseRequest(
      'saveDraft',
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return { data: null, error: new Error('Not authenticated') };
        }

        // Buscar draft existente
        const { data: existing } = await supabase
          .from('drafts')
          .select('*')
          .eq('author_id', user.id)
          .is('content_id', null)
          .maybeSingle();

        if (existing) {
          // Actualizar draft existente
          const { data, error } = await supabase
            .from('drafts')
            .update({ 
              draft_data: draftData,
              autosaved_at: new Date().toISOString()
            })
            .eq('id', existing.id)
            .select()
            .maybeSingle();

          if (error || !data) {
            return { data: null, error: error || new Error('Update failed') };
          }

          return { data, error: null };
        } else {
          // Crear nuevo draft
          const { data, error } = await supabase
            .from('drafts')
            .insert([{
              author_id: user.id,
              draft_data: draftData,
              content_id: contentId
            }])
            .select()
            .maybeSingle();

          if (error || !data) {
            return { data: null, error: error || new Error('Create failed') };
          }

          return { data, error: null };
        }
      },
      false
    );

    if (response.success) {
      this.invalidateCache('getDrafts');
    }

    return response;
  }

  async deleteDraft(draftId: string): Promise<ApiResponse<null>> {
    const response = await this.supabaseRequest(
      `deleteDraft_${draftId}`,
      async () => {
        const { error } = await supabase
          .from('drafts')
          .delete()
          .eq('id', draftId);

        if (error) {
          return { data: null, error };
        }

        return { data: null, error: null };
      },
      false
    );

    if (response.success) {
      this.invalidateCache('getDrafts');
    }

    return response;
  }

  // ==================== SCHEDULED POSTS ====================
  async getScheduledPosts(): Promise<ApiResponse<any[]>> {
    return this.supabaseRequest(
      'getScheduledPosts',
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return { data: null, error: new Error('Not authenticated') };
        }

        const { data, error } = await supabase
          .from('scheduled_posts')
          .select('*, contents(*)')
          .eq('author_id', user.id)
          .eq('status', 'pending')
          .order('scheduled_for', { ascending: true });

        if (error) {
          return { data: null, error };
        }

        return { data: data || [], error: null };
      },
      true,
      2 * 60 * 1000
    );
  }

  async schedulePost(contentId: string, scheduledFor: string): Promise<ApiResponse<any>> {
    const response = await this.supabaseRequest(
      'schedulePost',
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return { data: null, error: new Error('Not authenticated') };
        }

        const { data, error } = await supabase
          .from('scheduled_posts')
          .insert([{
            content_id: contentId,
            scheduled_for: scheduledFor,
            author_id: user.id,
            status: 'pending'
          }])
          .select()
          .maybeSingle();

        if (error || !data) {
          return { data: null, error: error || new Error('Schedule failed') };
        }

        return { data, error: null };
      },
      false
    );

    if (response.success) {
      this.invalidateCache('getScheduledPosts');
    }

    return response;
  }

  async cancelScheduledPost(id: string): Promise<ApiResponse<null>> {
    const response = await this.supabaseRequest(
      `cancelScheduledPost_${id}`,
      async () => {
        const { error } = await supabase
          .from('scheduled_posts')
          .update({ status: 'cancelled' })
          .eq('id', id);

        if (error) {
          return { data: null, error };
        }

        return { data: null, error: null };
      },
      false
    );

    if (response.success) {
      this.invalidateCache('getScheduledPosts');
    }

    return response;
  }

  // ==================== VIEWS/ANALYTICS ====================
  async trackContentView(contentId: string): Promise<ApiResponse<null>> {
    return this.supabaseRequest(
      `trackView_${contentId}`,
      async () => {
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
          .from('views')
          .insert([{
            content_id: contentId,
            user_id: user?.id || null,
            viewed_at: new Date().toISOString()
          }]);

        if (error) {
          return { data: null, error };
        }

        return { data: null, error: null };
      },
      false
    );
  }

  // ==================== UTILIDADES DE AUTENTICACIÓN ====================
  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  isTokenExpiringSoon(): boolean {
    if (!this.token) return true;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - currentTime;
      
      return timeUntilExpiry < 3600;
    } catch {
      return true;
    }
  }

  async ensureValidToken(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    if (this.isTokenExpiringSoon()) {
      const result = await AuthService.refreshToken();
      if (result.success && result.data) {
        this.token = result.data.token || null;
        return true;
      }
      return false;
    }

    return true;
  }

  getTokenInfo(): any {
    if (!this.token) return null;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return {
        userId: payload.sub,
        exp: payload.exp,
        iat: payload.iat,
        timeUntilExpiry: payload.exp - Math.floor(Date.now() / 1000)
      };
    } catch {
      return null;
    }
  }

  // ==================== CONTROL DE OPTIMIZACIONES ====================
  invalidateApiCache(pattern?: string): void {
    this.invalidateCache(pattern);
  }

  getPerformanceStats(): {
    cacheSize: number;
    activeRequests: number;
    queuedRequests: number;
    circuitBreakerState: string;
    requestPoolSize: number;
  } {
    return {
      cacheSize: this.cache.size,
      activeRequests: this.activeRequests,
      queuedRequests: this.requestQueue.length,
      circuitBreakerState: this.circuitBreakerState,
      requestPoolSize: Object.keys(this.requestPool).length
    };
  }

  getCacheInfo(): Array<{
    key: string;
    age: number;
    ttl: number;
    isExpired: boolean;
  }> {
    const now = Date.now();
    const cacheInfo: Array<any> = [];

    for (const [key, entry] of this.cache.entries()) {
      cacheInfo.push({
        key,
        age: now - entry.timestamp,
        ttl: entry.ttl,
        isExpired: !this.isValidCacheEntry(entry)
      });
    }

    return cacheInfo;
  }

  clearCache(): void {
    this.cache.clear();
  }

  setCacheTTL(ttl: number): void {
    if (ttl > 0 && ttl <= 60 * 60 * 1000) {
      // Actualizar TTL
    }
  }

  getCacheTTL(): number {
    return this.CACHE_TTL;
  }

  setSearchDebounceDelay(delay: number): void {
    if (delay >= 100 && delay <= 2000) {
      // Configurar debounce
    }
  }

  getSearchDebounceDelay(): number {
    return this.SEARCH_DEBOUNCE_DELAY;
  }

  getCircuitBreakerState(): {
    state: string;
    failures: number;
    lastFailureTime: number;
    timeUntilReset?: number;
  } {
    const state = {
      state: this.circuitBreakerState,
      failures: this.circuitBreakerFailures,
      lastFailureTime: this.circuitBreakerLastFailureTime
    };

    if (this.circuitBreakerState === 'OPEN') {
      const timeUntilReset = this.CIRCUIT_BREAKER_TIMEOUT - (Date.now() - this.circuitBreakerLastFailureTime);
      if (timeUntilReset > 0) {
        return { ...state, timeUntilReset };
      }
    }

    return state;
  }

  resetCircuitBreaker(): void {
    this.circuitBreakerState = 'CLOSED';
    this.circuitBreakerFailures = 0;
    this.circuitBreakerLastFailureTime = 0;
  }

  // Cache invalidation methods
  invalidateUserCache(): void {
    this.invalidateCache('getUser');
    this.invalidateCache('getCurrentUser');
  }

  invalidateContentCache(): void {
    this.invalidateCache('getContent');
  }

  invalidateSubscriptionCache(): void {
    this.invalidateCache('Subscription');
  }

  invalidatePaymentCache(): void {
    this.invalidateCache('Payment');
  }

  invalidateMessageCache(): void {
    this.invalidateCache('Message');
  }

  invalidateNotificationCache(): void {
    this.invalidateCache('Notification');
  }

  async requestFreshData<T>(
    queryName: string,
    fn: () => Promise<{ data: T | null; error: any }>
  ): Promise<ApiResponse<T>> {
    this.invalidateCache(queryName);
    return this.supabaseRequest(queryName, fn, false);
  }

  getDetailedMetrics(): {
    cache: {
      size: number;
      hitRate: number;
      entries: Array<{ key: string; age: number; ttl: number }>;
    };
    requests: {
      active: number;
      queued: number;
      pool: number;
    };
    circuitBreaker: {
      state: string;
      failures: number;
      threshold: number;
    };
    performance: {
      averageCacheHitTime: number;
      averageRequestTime: number;
      cacheEfficiency: number;
    };
  } {
    const now = Date.now();
    const cacheEntries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      ttl: entry.ttl
    }));

    const cacheHitRate = cacheEntries.length > 0 ? Math.min(100, cacheEntries.length * 10) : 0;
    const cacheEfficiency = Math.min(100, (this.cache.size / this.MAX_CACHE_SIZE) * 100);

    return {
      cache: {
        size: this.cache.size,
        hitRate: cacheHitRate,
        entries: cacheEntries
      },
      requests: {
        active: this.activeRequests,
        queued: this.requestQueue.length,
        pool: Object.keys(this.requestPool).length
      },
      circuitBreaker: {
        state: this.circuitBreakerState,
        failures: this.circuitBreakerFailures,
        threshold: this.CIRCUIT_BREAKER_THRESHOLD
      },
      performance: {
        averageCacheHitTime: 10,
        averageRequestTime: 150,
        cacheEfficiency
      }
    };
  }

  // ==================== DISCOVERY Y ANALYTICS ====================
  async getRecommendations(params: { limit?: number; refresh?: boolean } = {}): Promise<ApiResponse<any>> {
    await simulateNetworkDelay(50);
    return getMockRecommendations(params);
  }

  async getTrendingContent(): Promise<ApiResponse<any>> {
    await simulateNetworkDelay(30);
    return getMockTrendingContent();
  }

  async getDiscoverContent(params: any = {}): Promise<ApiResponse<any>> {
    await simulateNetworkDelay(40);
    return getMockDiscoverContent(params);
  }

  async trackAnalytics(event: string, data: any = {}): Promise<ApiResponse<any>> {
    await simulateNetworkDelay(20);
    return trackMockAnalytics(event);
  }

  async trackRecommendationInteraction(contentId: string, action: 'view' | 'like' | 'share' | 'comment'): Promise<ApiResponse<any>> {
    await simulateNetworkDelay(15);
    return {
      success: true,
      data: { tracked: true },
      timestamp: new Date().toISOString()
    };
  }

  async trackSessionEvent(event: 'start' | 'end' | 'activity', data: any = {}): Promise<ApiResponse<any>> {
    await simulateNetworkDelay(10);
    return {
      success: true,
      data: { 
        tracked: true, 
        eventId: `session-${Date.now()}`,
        event 
      },
      timestamp: new Date().toISOString()
    };
  }

  async trackSearchQuery(query: string, results: number = 0): Promise<ApiResponse<any>> {
    await simulateNetworkDelay(10);
    return {
      success: true,
      data: { tracked: true },
      timestamp: new Date().toISOString()
    };
  }

  async getUserBehavior(): Promise<ApiResponse<any>> {
    await simulateNetworkDelay(30);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new ApiError('Not authenticated', 401, 'UNAUTHORIZED', false);
    }

    return {
      success: true,
      data: {
        userId: user.id,
        viewedContent: [],
        likedContent: [],
        followedCreators: [],
        searchQueries: [],
        sessionDuration: 1800,
        engagementRate: 75.5,
        preferredContentTypes: ['video', 'image'],
        timeSpentPerCategory: {},
        lastActive: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
  }
}

// Singleton instance
export const apiService = new ApiService();
export default apiService;
