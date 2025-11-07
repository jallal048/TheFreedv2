// Servicio de API optimizado para TheFreed.v1
import {
  User, AuthTokens, LoginCredentials, RegisterData,
  ApiResponse, PaginatedResponse, Content, Subscription,
  Message, Notification, Payment, UserSettings
} from '../types';
import {
  getMockContent, getMockSubscriptions, getMockNotifications,
  getMockRecommendations, getMockTrendingContent, getMockDiscoverContent,
  trackMockAnalytics, simulateNetworkDelay
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
    // Cargar token desde localStorage al inicializar
    this.token = localStorage.getItem('thefreed_token');
    
    // Inicializar limpieza periódica del cache y request pool
    this.startCleanupInterval();
    
    // Inicializar circuit breaker check
    this.startCircuitBreakerCheck();
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
    // Limpiar cache si está lleno
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
      // Limpiar timer anterior si existe
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
  private getRequestKey(endpoint: string, options: RequestInit): string {
    return `${endpoint}_${options.method || 'GET'}_${JSON.stringify(options.body)}`;
  }

  private async deduplicateRequest<T>(
    key: string,
    fn: () => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T>> {
    const now = Date.now();
    
    // Limpiar requests antiguos del pool
    for (const [poolKey, poolEntry] of Object.entries(this.requestPool)) {
      if (now - poolEntry.timestamp > this.REQUEST_POOL_CLEANUP_TIME) {
        delete this.requestPool[poolKey];
      }
    }

    // Verificar si ya existe un request idéntico
    if (this.requestPool[key]) {
      return this.requestPool[key].promise;
    }

    // Crear nuevo request
    const promise = fn().finally(() => {
      // Limpiar del pool después de completar
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

  // ==================== CONNECTION POOLING SIMULADO ====================
  private async acquireConnection(): Promise<void> {
    return new Promise((resolve) => {
      if (this.activeRequests < this.MAX_CONCURRENT_REQUESTS) {
        this.activeRequests++;
        resolve();
        return;
      }

      // Agregar a la cola de espera
      this.requestQueue.push(() => {
        this.activeRequests++;
        return Promise.resolve();
      });

      // Procesar cola cuando haya conexiones disponibles
      const checkQueue = () => {
        if (this.activeRequests < this.MAX_CONCURRENT_REQUESTS && this.requestQueue.length > 0) {
          const nextRequest = this.requestQueue.shift()!;
          nextRequest().then(resolve);
        }
      };

      // Verificar periódicamente
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
    
    // Procesar siguiente request en cola
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

  // ==================== ERROR HANDLING OPTIMIZADO ====================
  private isRetryableError(error: any): boolean {
    if (error instanceof ApiError) {
      return error.retryable;
    }
    
    // Errores de red y servidor son reintentables
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status) || 
           error.name === 'TypeError' || // Network errors
           (error.message && error.message.includes('fetch'));
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
        
        // Exponential backoff: 1s, 2s, 4s, 8s...
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
      // Limpiar cache expirado
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (!this.isValidCacheEntry(entry)) {
          this.cache.delete(key);
        }
      }
      
      // Limpiar debounce timers
      for (const [key, timer] of this.searchDebounceTimers.entries()) {
        clearTimeout(timer);
        this.searchDebounceTimers.delete(key);
      }
      

    }, 60000); // Cada minuto
  }

  private startCircuitBreakerCheck(): void {
    setInterval(() => {
      if (this.circuitBreakerState === 'OPEN' && 
          Date.now() - this.circuitBreakerLastFailureTime > this.CIRCUIT_BREAKER_TIMEOUT) {
        this.circuitBreakerState = 'HALF_OPEN';
      }
    }, 30000); // Cada 30 segundos
  }

  // ==================== REQUEST PRINCIPAL OPTIMIZADO ====================
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnUnauthorized: boolean = true,
    useCache: boolean = false,
    cacheTTL?: number
  ): Promise<ApiResponse<T>> {
    
    // Verificar circuit breaker
    if (!this.canMakeRequest()) {
      throw new CircuitBreakerError('Circuit breaker is open. Too many failures.');
    }

    // Manejar cache para requests GET
    if (useCache && (!options.method || options.method === 'GET')) {
      const cacheKey = this.getCacheKey(endpoint, options.body);
      const cachedData = this.getCache<T>(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
    }

    // Request deduplication
    const requestKey = this.getRequestKey(endpoint, options);
    
    const makeRequest = async (): Promise<ApiResponse<T>> => {
      await this.acquireConnection();
      
      try {
        const url = `${API_BASE_URL}${endpoint}`;
        
        const headers = {
          'Content-Type': 'application/json',
          ...options.headers,
        };

        if (this.token) {
          headers['Authorization'] = `Bearer ${this.token}`;
        }

        // Preparar fetch options
        const fetchOptions: RequestInit = {
          ...options,
          headers,
          // Agregar timeout simulado
          signal: AbortSignal.timeout(30000) // 30 segundos
        };

        const response = await fetch(url, fetchOptions);
        const data = await response.json();

        // Manejar cache para responses exitosas
        if (useCache && response.ok && (!options.method || options.method === 'GET')) {
          const cacheKey = this.getCacheKey(endpoint, options.body);
          this.setCache(cacheKey, data, cacheTTL);
        }

        if (!response.ok) {
          // Si es 401 y podemos reintentar, intentar refresh token
          if (response.status === 401 && retryOnUnauthorized && this.token) {
            const refreshed = await this.refreshAccessToken();
            if (refreshed) {
              // Reintentar la petición con el nuevo token
              return this.request<T>(endpoint, options, false, useCache, cacheTTL);
            }
          }
          
          const apiError = new ApiError(
            data.error?.message || data.message || `HTTP error! status: ${response.status}`,
            response.status,
            data.error?.code,
            this.isRetryableError({ status: response.status })
          );
          
          throw apiError;
        }

        return data;
      } finally {
        this.releaseConnection();
      }
    };

    // Deduplicar y reintentar con backoff
    const finalRequest = async (): Promise<ApiResponse<T>> => {
      try {
        return await this.retryWithBackoff(makeRequest);
      } catch (error) {
        // Invalidar cache en caso de error
        if (useCache) {
          this.invalidateCache(endpoint);
        }
        throw error;
      }
    };

    return this.deduplicateRequest(requestKey, finalRequest);
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('thefreed_refresh_token');
      if (!refreshToken) {
        this.clearToken();
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data?.token) {
        this.token = data.data.token;
        localStorage.setItem('thefreed_token', data.data.token);
        return true;
      } else {
        this.clearToken();
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearToken();
      return false;
    }
  }

  // Métodos de autenticación
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const response = await this.request<{ user: User; token: string; refreshToken: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('thefreed_token', response.data.token);
      localStorage.setItem('thefreed_refresh_token', response.data.refreshToken);
      
      // Invalidar cache después del login
      this.invalidateUserCache();
      
      return {
        ...response,
        data: {
          user: response.data,
          tokens: {
            token: response.data.token,
            refreshToken: response.data.refreshToken
          }
        }
      };
    }

    return response;
  }

  async register(userData: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const response = await this.request<{ user: User; token: string; refreshToken: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('thefreed_token', response.data.token);
      localStorage.setItem('thefreed_refresh_token', response.data.refreshToken);
      
      // Invalidar cache después del registro
      this.invalidateUserCache();
      
      return {
        ...response,
        data: {
          user: response.data,
          tokens: {
            token: response.data.token,
            refreshToken: response.data.refreshToken
          }
        }
      };
    }

    return response;
  }

  async logout(): Promise<ApiResponse<null>> {
    const response = await this.request<null>('/api/auth/logout', {
      method: 'POST',
    });

    if (response.success) {
      this.token = null;
      localStorage.removeItem('thefreed_token');
      localStorage.removeItem('thefreed_refresh_token');
      
      // Limpiar todo el cache después del logout
      this.clearCache();
    }

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/api/auth/me');
  }

  // Métodos de usuarios con optimizaciones
  async getUsers(params?: { page?: number; limit?: number; search?: string; userType?: string }): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/api/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    // Aplicar debounce solo para búsquedas
    if (params?.search) {
      const searchKey = `getUsers_${params.search}`;
      return this.debounceSearch(searchKey, () => 
        this.request<PaginatedResponse<User>>(endpoint, {}, true, true, 2 * 60 * 1000) // Cache por 2 min para búsquedas
      );
    }
    
    // Cache por 5 minutos para requests sin búsqueda
    return this.request<PaginatedResponse<User>>(endpoint, {}, true, true, 5 * 60 * 1000);
  }

  async getUser(id: string): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>(`/api/users/${id}`);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getUserSettings(userId: string): Promise<ApiResponse<{ settings: UserSettings }>> {
    return this.request<{ settings: UserSettings }>(`/api/users/${userId}/settings`);
  }

  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<ApiResponse<{ settings: UserSettings }>> {
    return this.request<{ settings: UserSettings }>(`/api/users/${userId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Métodos de contenido con datos mock para carga instantánea
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
    // Simular un pequeño delay para mostrar que la carga funciona
    await simulateNetworkDelay(50);
    
    // Usar datos mock en lugar de llamada HTTP
    return getMockContent(params);
  }

  async getContentById(id: string): Promise<ApiResponse<{ content: Content }>> {
    await simulateNetworkDelay(10);
    
    // Buscar contenido por ID en los datos mock
    const allContent = getMockContent();
    const content = allContent.data.find(c => c.id === id);
    
    if (!content) {
      return {
        success: false,
        error: 'Content not found',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      success: true,
      data: { content },
      timestamp: new Date().toISOString()
    };
  }

  async getContentByCategory(category: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Content>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/api/content/category/${category}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    // Cache por 10 minutos para contenido por categoría (menos cambiante)
    return this.request<PaginatedResponse<Content>>(endpoint, {}, true, true, 10 * 60 * 1000);
  }

  async createContent(contentData: Partial<Content>): Promise<ApiResponse<{ content: Content }>> {
    const response = await this.request<{ content: Content }>('/api/content', {
      method: 'POST',
      body: JSON.stringify(contentData),
    });
    
    // Invalidar cache de contenido después de crear
    if (response.success) {
      this.invalidateContentCache();
    }
    
    return response;
  }

  async updateContent(id: string, contentData: Partial<Content>): Promise<ApiResponse<{ content: Content }>> {
    const response = await this.request<{ content: Content }>(`/api/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contentData),
    });
    
    // Invalidar cache de contenido después de actualizar
    if (response.success) {
      this.invalidateContentCache();
    }
    
    return response;
  }

  async deleteContent(id: string): Promise<ApiResponse<null>> {
    const response = await this.request<null>(`/api/content/${id}`, {
      method: 'DELETE',
    });
    
    // Invalidar cache de contenido después de eliminar
    if (response.success) {
      this.invalidateContentCache();
    }
    
    return response;
  }

  async likeContent(id: string): Promise<ApiResponse<{ liked: boolean }>> {
    return this.request<{ liked: boolean }>(`/api/content/${id}/like`, {
      method: 'POST',
    });
  }

  async uploadContentFile(file: File): Promise<ApiResponse<{ fileUrl: string; fileName: string; originalName: string; size: number; mimeType: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/content/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new ApiError(`Upload failed: ${response.statusText}`, response.status, 'UPLOAD_ERROR', true);
      }

      const result = await response.json();
      
      // Invalidar cache de contenido después de subir archivo
      if (result.success) {
        this.invalidateContentCache();
      }

      return result;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  // Métodos de suscripciones
  async getSubscriptions(params?: { page?: number; limit?: number; status?: string; creatorId?: string }): Promise<PaginatedResponse<Subscription>> {
    // Simular un pequeño delay para mostrar que la carga funciona
    await simulateNetworkDelay(30);
    
    // Usar datos mock en lugar de llamada HTTP
    return getMockSubscriptions(params);
  }

  async createSubscription(subscriptionData: {
    creatorId: string;
    subscriptionType: 'MONTHLY' | 'YEARLY' | 'LIFETIME' | 'CUSTOM';
    paymentMethodId?: string;
  }): Promise<ApiResponse<{ subscription: Subscription }>> {
    const response = await this.request<{ subscription: Subscription }>('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
    
    // Invalidar cache de suscripciones después de crear
    if (response.success) {
      this.invalidateSubscriptionCache();
    }
    
    return response;
  }

  async cancelSubscription(id: string): Promise<ApiResponse<{ subscription: Subscription }>> {
    const response = await this.request<{ subscription: Subscription }>(`/api/subscriptions/${id}/cancel`, {
      method: 'PUT',
    });
    
    // Invalidar cache de suscripciones después de cancelar
    if (response.success) {
      this.invalidateSubscriptionCache();
    }
    
    return response;
  }

  async renewSubscription(id: string): Promise<ApiResponse<{ subscription: Subscription }>> {
    const response = await this.request<{ subscription: Subscription }>(`/api/subscriptions/${id}/renew`, {
      method: 'PUT',
    });
    
    // Invalidar cache de suscripciones después de renovar
    if (response.success) {
      this.invalidateSubscriptionCache();
    }
    
    return response;
  }

  // Métodos de pagos
  async getPayments(params?: { page?: number; limit?: number; status?: string; type?: string }): Promise<PaginatedResponse<Payment>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/api/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<PaginatedResponse<Payment>>(endpoint);
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
    return this.request('/api/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async confirmPayment(paymentIntentId: string): Promise<ApiResponse<{ payment: Payment }>> {
    return this.request<{ payment: Payment }>('/api/payments/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    });
  }

  // Métodos de mensajes con optimizaciones
  async getMessages(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Message>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/api/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    // Aplicar debounce solo para búsquedas
    if (params?.search) {
      const searchKey = `getMessages_${params.search}`;
      return this.debounceSearch(searchKey, () => 
        this.request<PaginatedResponse<Message>>(endpoint, {}, true, true, 1 * 60 * 1000) // Cache por 1 min para mensajes
      );
    }
    
    // Cache por 2 minutos para mensajes sin búsqueda
    return this.request<PaginatedResponse<Message>>(endpoint, {}, true, true, 2 * 60 * 1000);
  }

  async sendMessage(messageData: {
    receiverId: string;
    content: string;
    messageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE';
    mediaUrl?: string;
  }): Promise<ApiResponse<{ message: Message }>> {
    const response = await this.request<{ message: Message }>('/api/messages/send', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
    
    // Invalidar cache de mensajes después de enviar
    if (response.success) {
      this.invalidateMessageCache();
    }
    
    return response;
  }

  // Métodos de notificaciones con optimizaciones
  async getNotifications(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Notification>> {
    // Simular un pequeño delay para mostrar que la carga funciona
    await simulateNetworkDelay(20);
    
    // Usar datos mock en lugar de llamada HTTP
    return getMockNotifications(params);
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<null>> {
    const response = await this.request<null>(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
    
    // Invalidar cache de notificaciones después de marcar como leída
    if (response.success) {
      this.invalidateNotificationCache();
    }
    
    return response;
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<null>> {
    const response = await this.request<null>('/api/notifications/read-all', {
      method: 'PUT',
    });
    
    // Invalidar cache de notificaciones después de marcar todas como leídas
    if (response.success) {
      this.invalidateNotificationCache();
    }
    
    return response;
  }

  // Utilidades de autenticación
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('thefreed_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('thefreed_token');
    localStorage.removeItem('thefreed_refresh_token');
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Verificar si el token está próximo a expirar (menos de 1 hora)
  isTokenExpiringSoon(): boolean {
    if (!this.token) return true;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - currentTime;
      
      // Menos de 1 hora (3600 segundos)
      return timeUntilExpiry < 3600;
    } catch {
      return true;
    }
  }

  // Renovar token automáticamente si está próximo a expirar
  async ensureValidToken(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    if (this.isTokenExpiringSoon()) {
      return await this.refreshAccessToken();
    }

    return true;
  }

  // Obtener información del token (payload decodificado)
  getTokenInfo(): any {
    if (!this.token) return null;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return {
        userId: payload.userId,
        exp: payload.exp,
        iat: payload.iat,
        timeUntilExpiry: payload.exp - Math.floor(Date.now() / 1000)
      };
    } catch {
      return null;
    }
  }

  // ==================== MÉTODOS PÚBLICOS PARA CONTROL DE OPTIMIZACIONES ====================
  
  // Invalidar cache manualmente
  invalidateApiCache(pattern?: string): void {
    this.invalidateCache(pattern);
  }

  // Obtener estadísticas de rendimiento
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

  // Obtener información del cache
  getCacheInfo(): Array<{
    key: string;
    age: number;
    ttl: number;
    isExpired: boolean;
  }> {
    const now = Date.now();
    const cacheInfo: Array<{
      key: string;
      age: number;
      ttl: number;
      isExpired: boolean;
    }> = [];

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

  // Limpiar cache completamente
  clearCache(): void {
    this.cache.clear();
    if (process.env.NODE_ENV === 'development') {
    }
  }

  // Configurar TTL del cache
  setCacheTTL(ttl: number): void {
    if (ttl > 0 && ttl <= 60 * 60 * 1000) { // Máximo 1 hora
      this.CACHE_TTL = ttl;
    }
  }

  // Obtener TTL actual del cache
  getCacheTTL(): number {
    return this.CACHE_TTL;
  }

  // Configurar delay de debounce para búsquedas
  setSearchDebounceDelay(delay: number): void {
    if (delay >= 100 && delay <= 2000) { // Entre 100ms y 2s
      // Configurar debounce delay
    }
  }

  // Obtener delay actual de debounce
  getSearchDebounceDelay(): number {
    return this.SEARCH_DEBOUNCE_DELAY;
  }

  // Estado del circuit breaker
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

  // Reset manual del circuit breaker
  resetCircuitBreaker(): void {
    this.circuitBreakerState = 'CLOSED';
    this.circuitBreakerFailures = 0;
    this.circuitBreakerLastFailureTime = 0;
  }

  // Métodos específicos para invalidar cache después de operaciones que cambian datos
  invalidateUserCache(): void {
    this.invalidateCache('/api/users');
    this.invalidateCache('/api/auth/me');
  }

  invalidateContentCache(): void {
    this.invalidateCache('/api/content');
  }

  invalidateSubscriptionCache(): void {
    this.invalidateCache('/api/subscriptions');
  }

  invalidatePaymentCache(): void {
    this.invalidateCache('/api/payments');
  }

  invalidateMessageCache(): void {
    this.invalidateCache('/api/messages');
  }

  invalidateNotificationCache(): void {
    this.invalidateCache('/api/notifications');
  }

  // Optimización específica para operaciones que requieren datos frescos
  async requestFreshData<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnUnauthorized: boolean = true
  ): Promise<ApiResponse<T>> {
    // Invalidar cache para este endpoint específico
    this.invalidateCache(endpoint);
    
    // Hacer request sin cache
    return this.request<T>(endpoint, options, retryOnUnauthorized, false);
  }

  // Obtener métricas de rendimiento para debugging
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

    // Cálculos aproximados de métricas de rendimiento
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
        averageCacheHitTime: 10, // Estimado en ms
        averageRequestTime: 150, // Estimado en ms
        cacheEfficiency
      }
    };
  }

  // ==================== MÉTODOS DE DISCOVERY Y ANALYTICS ====================
  
  // Obtener recomendaciones
  async getRecommendations(params: { limit?: number; refresh?: boolean } = {}): Promise<ApiResponse<any>> {
    await simulateNetworkDelay(50);
    return getMockRecommendations(params);
  }

  // Obtener contenido trending
  async getTrendingContent(): Promise<ApiResponse<any>> {
    await simulateNetworkDelay(30);
    return getMockTrendingContent();
  }

  // Obtener contenido discover
  async getDiscoverContent(params: any = {}): Promise<ApiResponse<any>> {
    await simulateNetworkDelay(40);
    return getMockDiscoverContent(params);
  }

  // Track de eventos de analytics
  async trackAnalytics(event: string, data: any = {}): Promise<ApiResponse<any>> {
    await simulateNetworkDelay(20);
    return trackMockAnalytics(event);
  }

  // Track de interacciones de recomendaciones
  async trackRecommendationInteraction(contentId: string, action: 'view' | 'like' | 'share' | 'comment'): Promise<ApiResponse<any>> {
    await simulateNetworkDelay(15);
    return {
      success: true,
      data: { tracked: true },
      timestamp: new Date().toISOString()
    };
  }

  // Track de eventos de sesión
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

  // Track de búsquedas
  async trackSearchQuery(query: string, results: number = 0): Promise<ApiResponse<any>> {
    await simulateNetworkDelay(10);
    return {
      success: true,
      data: { tracked: true },
      timestamp: new Date().toISOString()
    };
  }

  // Obtener datos de comportamiento del usuario
  async getUserBehavior(): Promise<ApiResponse<any>> {
    await simulateNetworkDelay(30);
    return {
      success: true,
      data: {
        userId: 'user_1',
        viewedContent: mockContent.slice(0, 10).map(c => c.id),
        likedContent: mockContent.slice(0, 5).map(c => c.id),
        followedCreators: mockUsers.slice(0, 8).map(u => u.id),
        searchQueries: ['fitness', 'cooking', 'music', 'travel'],
        sessionDuration: 1800, // 30 minutos
        engagementRate: 75.5,
        preferredContentTypes: ['video', 'image'],
        timeSpentPerCategory: {
          'lifestyle': 25,
          'fitness': 20,
          'cooking': 15,
          'music': 10,
          'travel': 30
        },
        lastActive: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
  }
}

// Singleton instance
export const apiService = new ApiService();
export default apiService;