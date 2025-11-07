import { PerformanceError } from '../hooks/useWebVitals';

// Configuración del error reporting
interface ErrorReportingConfig {
  endpoint?: string;
  apiKey?: string;
  environment: 'development' | 'staging' | 'production';
  sampleRate?: number;
  enabled: boolean;
  serviceName: string;
  version: string;
}

interface ErrorContext {
  userId?: string;
  sessionId: string;
  url: string;
  userAgent: string;
  timestamp: number;
  additionalData?: Record<string, any>;
}

interface ErrorReport {
  id: string;
  type: 'js-error' | 'resource-error' | 'api-error' | 'custom' | 'performance';
  message: string;
  stack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: ErrorContext;
  metadata: {
    url?: string;
    lineNumber?: number;
    columnNumber?: number;
    fileName?: string;
    functionName?: string;
    userAgent: string;
    timestamp: number;
    memoryUsage?: number;
    connectionType?: string;
  };
  performanceData?: {
    fcp?: number;
    lcp?: number;
    cls?: number;
    ttfb?: number;
    fid?: number;
    inp?: number;
  };
}

// Configuración por defecto
const DEFAULT_CONFIG: ErrorReportingConfig = {
  environment: 'development',
  sampleRate: 1.0,
  enabled: true,
  serviceName: 'TheFreed.v1',
  version: '1.0.0'
};

class ErrorReportingService {
  private config: ErrorReportingConfig;
  private sessionId: string;
  private queue: ErrorReport[] = [];
  private isOnline = navigator.onLine;
  private flushInterval: NodeJS.Timeout | null = null;
  private localStorageKey = 'error_reporting_queue';

  constructor(config: Partial<ErrorReportingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
    this.initializeOnlineListener();
    this.loadQueueFromStorage();
    this.startFlushInterval();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeOnlineListener(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load error queue from storage:', error);
    }
  }

  private saveQueueToStorage(): void {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.queue));
    } catch (error) {
      console.warn('Failed to save error queue to storage:', error);
    }
  }

  private startFlushInterval(): void {
    if (this.config.environment === 'production') {
      this.flushInterval = setInterval(() => {
        this.flushQueue();
      }, 30000); // Flush cada 30 segundos en producción
    }
  }

  private shouldSample(): boolean {
    return Math.random() <= (this.config.sampleRate || 1.0);
  }

  private createErrorContext(): ErrorContext {
    return {
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      additionalData: {
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        connectionType: (navigator as any).connection?.effectiveType,
      }
    };
  }

  private createErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
    if (error.severity) return error.severity;

    // Determinar severidad basada en el tipo de error
    if (error.type === 'js-error') {
      if (error.message?.includes('Script error')) return 'critical';
      if (error.message?.includes('TypeError') || error.message?.includes('ReferenceError')) return 'high';
      return 'medium';
    }

    if (error.type === 'resource-error') return 'medium';
    if (error.type === 'api-error') return 'high';
    if (error.type === 'custom') return 'low';

    return 'medium';
  }

  private getPerformanceData(): any {
    if (typeof performance === 'undefined') return {};

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    return {
      fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
      lcp: navigation?.loadEventEnd - navigation?.fetchStart,
      ttfb: navigation?.responseStart - navigation?.fetchStart,
      memoryUsage: (performance as any).memory?.usedJSHeapSize,
    };
  }

  /**
   * Reporta un error
   */
  public reportError(error: Omit<PerformanceError, 'timestamp'> & { 
    context?: Partial<ErrorContext>;
    performanceData?: any;
  }): void {
    if (!this.config.enabled || !this.shouldSample()) return;

    const context = { ...this.createErrorContext(), ...error.context };
    const severity = this.determineSeverity(error);
    const performanceData = error.performanceData || this.getPerformanceData();

    const errorReport: ErrorReport = {
      id: this.createErrorId(),
      type: error.type,
      message: error.message,
      stack: error.stack,
      severity,
      context,
      metadata: {
        url: error.url,
        lineNumber: error.lineNumber,
        columnNumber: error.columnNumber,
        fileName: error.filename,
        functionName: error.functionName,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        memoryUsage: (performance as any).memory?.usedJSHeapSize,
        connectionType: (navigator as any).connection?.effectiveType,
      },
      performanceData
    };

    // Agregar a la cola
    this.queue.push(errorReport);
    this.saveQueueToStorage();

    // Log para desarrollo
    if (this.config.environment === 'development') {
      console.group('🚨 Error Report');
      console.error('Type:', error.type);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.error('Severity:', severity);
      console.groupEnd();
    }

    // Flush inmediato para errores críticos
    if (severity === 'critical') {
      this.flushQueue();
    }
  }

  /**
   * Reporta errores de JavaScript
   */
  public reportJSError(message: string, source?: string, lineno?: number, colno?: number, error?: Error): void {
    this.reportError({
      type: 'js-error',
      message,
      stack: error?.stack,
      url: source || window.location.href,
      lineNumber: lineno,
      columnNumber: colno,
      severity: error ? 'high' : 'medium'
    });
  }

  /**
   * Reporta errores de recursos
   */
  public reportResourceError(resourceUrl: string, resourceType: string): void {
    this.reportError({
      type: 'resource-error',
      message: `Failed to load ${resourceType}: ${resourceUrl}`,
      url: resourceUrl,
      severity: 'medium'
    });
  }

  /**
   * Reporta errores de API
   */
  public reportAPIError(endpoint: string, status: number, response: any): void {
    this.reportError({
      type: 'api-error',
      message: `API Error ${status} on ${endpoint}`,
      url: endpoint,
      severity: status >= 500 ? 'high' : 'medium'
    });

    // Agregar información adicional del response
    if (response && typeof response === 'object') {
      // Puedes agregar información adicional aquí si es necesario
    }
  }

  /**
   * Reporta métricas de rendimiento como errores si superan umbrales
   */
  public reportPerformanceIssue(metric: string, value: number, threshold: number): void {
    if (value > threshold) {
      this.reportError({
        type: 'performance',
        message: `Performance metric ${metric} exceeded threshold: ${value} > ${threshold}`,
        url: window.location.href,
        severity: value > threshold * 1.5 ? 'high' : 'medium'
      });
    }
  }

  /**
   * Envía la cola de errores
   */
  private async flushQueue(): Promise<void> {
    if (!this.isOnline || this.queue.length === 0 || !this.config.endpoint) {
      return;
    }

    const errorsToSend = [...this.queue];
    this.queue = [];

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey || '',
          'X-Service': this.config.serviceName,
          'X-Version': this.config.version,
          'X-Environment': this.config.environment,
        },
        body: JSON.stringify({
          errors: errorsToSend,
          sessionId: this.sessionId,
          timestamp: Date.now(),
        }),
      });

      if (response.ok) {
        localStorage.removeItem(this.localStorageKey);
        if (this.config.environment === 'development') {
          console.log(`✅ Sent ${errorsToSend.length} error reports`);
        }
      } else {
        // Re-queue if failed
        this.queue.unshift(...errorsToSend);
        this.saveQueueToStorage();
      }
    } catch (error) {
      // Re-queue on network error
      this.queue.unshift(...errorsToSend);
      this.saveQueueToStorage();
      
      if (this.config.environment === 'development') {
        console.warn('Failed to send error reports:', error);
      }
    }
  }

  /**
   * Configura el servicio
   */
  public configure(newConfig: Partial<ErrorReportingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.startFlushInterval();
  }

  /**
   * Obtiene estadísticas de errores
   */
  public getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recentErrors: ErrorReport[];
  } {
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    const recentErrors = this.queue.slice(-10);

    this.queue.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
    });

    return {
      totalErrors: this.queue.length,
      errorsByType,
      errorsBySeverity,
      recentErrors
    };
  }

  /**
   * Limpia la cola de errores
   */
  public clearQueue(): void {
    this.queue = [];
    localStorage.removeItem(this.localStorageKey);
  }

  /**
   * Destruye el servicio
   */
  public destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    window.removeEventListener('online', this.flushQueue);
    window.removeEventListener('offline', () => this.isOnline = false);
  }
}

// Instancia singleton del servicio
let errorService: ErrorReportingService | null = null;

/**
 * Hook para usar el servicio de error reporting
 */
export function useErrorReporting(config?: Partial<ErrorReportingConfig>) {
  if (!errorService) {
    errorService = new ErrorReportingService(config);
  }

  return errorService;
}

/**
 * Función para configurar el servicio de error reporting globalmente
 */
export function initializeErrorReporting(config: Partial<ErrorReportingConfig> = {}) {
  if (errorService) {
    errorService.configure(config);
  } else {
    errorService = new ErrorReportingService(config);
  }

  // Configurar listeners globales para errores de JavaScript
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      errorService?.reportJSError(event.message, event.filename, event.lineno, event.colno, event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      errorService?.reportError({
        type: 'custom',
        message: `Unhandled promise rejection: ${event.reason}`,
        url: window.location.href,
        severity: 'high'
      });
    });

    // Listener para errores de recursos
    document.addEventListener('error', (event) => {
      const target = event.target as HTMLScriptElement | HTMLLinkElement | HTMLImageElement | HTMLObjectElement;
      if (target && (target.src || target.href)) {
        errorService?.reportResourceError(target.src || target.href || '', target.tagName.toLowerCase());
      }
    }, true);
  }

  return errorService;
}

// Exportar la clase para uso avanzado
export { ErrorReportingService };
export type { ErrorReport, ErrorContext, ErrorReportingConfig };