import { useEffect, useState, useCallback } from 'react';

export interface WebVitalMetric {
  name: string;
  value: number;
  id: string;
  label: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: PerformanceNavigationTiming['type'];
  timestamp: number;
}

export interface CoreWebVitals {
  fcp?: WebVitalMetric; // First Contentful Paint
  lcp?: WebVitalMetric; // Largest Contentful Paint
  cls?: WebVitalMetric; // Cumulative Layout Shift
  fid?: WebVitalMetric; // First Input Delay (deprecated, usar INP)
  inp?: WebVitalMetric; // Interaction to Next Paint
  ttfb?: WebVitalMetric; // Time to First Byte
}

export interface PerformanceMetrics {
  coreWebVitals: CoreWebVitals;
  resourceTimings: PerformanceResourceTiming[];
  navigationTimings: PerformanceNavigationTiming[];
  customMetrics: Record<string, number>;
  errors: PerformanceError[];
}

export interface PerformanceError {
  type: 'js-error' | 'resource-error' | 'api-error' | 'custom';
  message: string;
  stack?: string;
  url: string;
  lineNumber?: number;
  columnNumber?: number;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface MetricThresholds {
  fcp: { good: number; poor: number };
  lcp: { good: number; poor: number };
  cls: { good: number; poor: number };
  fid: { good: number; poor: number };
  inp: { good: number; poor: number };
  ttfb: { good: number; poor: number };
}

const DEFAULT_THRESHOLDS: MetricThresholds = {
  fcp: { good: 1800, poor: 3000 },
  lcp: { good: 2500, poor: 4000 },
  cls: { good: 0.1, poor: 0.25 },
  fid: { good: 100, poor: 300 },
  inp: { good: 200, poor: 500 },
  ttfb: { good: 800, poor: 1800 },
};

export function useWebVitals() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    coreWebVitals: {},
    resourceTimings: [],
    navigationTimings: [],
    customMetrics: {},
    errors: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [thresholds] = useState<MetricThresholds>(DEFAULT_THRESHOLDS);

  const evaluatePerformance = useCallback((metric: WebVitalMetric): 'good' | 'needs-improvement' | 'poor' => {
    const threshold = thresholds[metric.name as keyof MetricThresholds];
    if (!threshold) return 'good';
    
    if (metric.value <= threshold.good) return 'good';
    if (metric.value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }, [thresholds]);

  const reportMetric = useCallback((metric: WebVitalMetric) => {
    const evaluated = evaluatePerformance(metric);
    
    setMetrics(prev => ({
      ...prev,
      coreWebVitals: {
        ...prev.coreWebVitals,
        [metric.name]: {
          ...metric,
          label: evaluated
        }
      }
    }));

    // Enviar a analytics si está configurado
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: evaluated,
        value: Math.round(metric.name === 'cls' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      });
    }

    // Log para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`Web Vital: ${metric.name} = ${metric.value}ms (${evaluated})`);
    }
  }, [evaluatePerformance]);

  const reportError = useCallback((error: Omit<PerformanceError, 'timestamp'>) => {
    const performanceError: PerformanceError = {
      ...error,
      timestamp: Date.now()
    };

    setMetrics(prev => ({
      ...prev,
      errors: [performanceError, ...prev.errors].slice(0, 100) // Mantener solo los últimos 100 errores
    }));

    // Reportar a servicio de error tracking
    if (process.env.NODE_ENV === 'production') {
      // Aquí integrar con Sentry, LogRocket, etc.
    }
  }, []);

  const addCustomMetric = useCallback((name: string, value: number) => {
    setMetrics(prev => ({
      ...prev,
      customMetrics: {
        ...prev.customMetrics,
        [name]: value
      }
    }));
  }, []);

  const getPerformanceSummary = useCallback(() => {
    const vitals = metrics.coreWebVitals;
    const errorCount = metrics.errors.length;
    
    const score = {
      performance: calculatePerformanceScore(vitals),
      accessibility: 100, // Se calcularía con lighthouse
      bestPractices: 100,
      seo: 100,
      pwa: 100
    };

    return {
      score,
      errorCount,
      totalMetrics: Object.keys(vitals).length,
      goodMetrics: Object.values(vitals).filter(v => v?.label === 'good').length,
      poorMetrics: Object.values(vitals).filter(v => v?.label === 'poor').length,
      timestamp: Date.now()
    };
  }, [metrics]);

  // Función para calcular score general basado en Core Web Vitals
  const calculatePerformanceScore = (vitals: CoreWebVitals): number => {
    let score = 100;
    
    // Penalizar por métricas pobres
    Object.values(vitals).forEach(vital => {
      if (!vital) return;
      
      switch (vital.label) {
        case 'poor':
          score -= 25;
          break;
        case 'needs-improvement':
          score -= 10;
          break;
        case 'good':
          score += 0;
          break;
      }
    });

    return Math.max(0, Math.min(100, score));
  };

  // Función para medir tiempos de recursos
  const measureResourceTimings = useCallback(() => {
    if (typeof performance === 'undefined') return;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const navigation = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];

    setMetrics(prev => ({
      ...prev,
      resourceTimings: resources,
      navigationTimings: navigation
    }));
  }, []);

  // Inicialización de Web Vitals
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsLoading(true);

    // Dynamic import de web-vitals
    import('web-vitals').then(({ onCLS, onFID, onLCP, onFCP, onTTFB, onINP }) => {
      // First Contentful Paint
      onFCP((metric) => reportMetric({
        ...metric,
        name: 'fcp'
      }));

      // Largest Contentful Paint
      onLCP((metric) => reportMetric({
        ...metric,
        name: 'lcp'
      }));

      // Cumulative Layout Shift
      onCLS((metric) => reportMetric({
        ...metric,
        name: 'cls'
      }));

      // First Input Delay (deprecated)
      onFID((metric) => reportMetric({
        ...metric,
        name: 'fid'
      }));

      // Interaction to Next Paint
      onINP((metric) => reportMetric({
        ...metric,
        name: 'inp'
      }));

      // Time to First Byte
      onTTFB((metric) => reportMetric({
        ...metric,
        name: 'ttfb'
      }));

      setIsLoading(false);
    }).catch((error) => {
      reportError({
        type: 'custom',
        message: `Failed to load web-vitals: ${error.message}`,
        url: window.location.href,
        severity: 'medium'
      });
      setIsLoading(false);
    });

    // Medir timings de recursos
    if ('performance' in window && 'getEntriesByType' in performance) {
      measureResourceTimings();
    }

    // Configurar listener para errores de JavaScript
    const handleError = (event: ErrorEvent) => {
      reportError({
        type: 'js-error',
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        lineNumber: event.lineno,
        columnNumber: event.colno,
        severity: 'high'
      });
    };

    // Configurar listener para errores de recursos
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLScriptElement | HTMLLinkElement | HTMLImageElement;
      reportError({
        type: 'resource-error',
        message: `Failed to load resource: ${target.src || target.href}`,
        url: target.src || target.href,
        severity: 'medium'
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      reportError({
        type: 'custom',
        message: `Unhandled promise rejection: ${event.reason}`,
        url: window.location.href,
        severity: 'high'
      });
    });

    // Escuchar errores de recursos que fallen al cargar
    document.addEventListener('error', handleResourceError, true);

    return () => {
      window.removeEventListener('error', handleError);
      document.removeEventListener('error', handleResourceError, true);
    };
  }, [reportMetric, reportError, measureResourceTimings]);

  return {
    metrics,
    isLoading,
    reportError,
    addCustomMetric,
    getPerformanceSummary,
    reportMetric,
    thresholds
  };
}