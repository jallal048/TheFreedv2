import React, { useState, useEffect, useMemo } from 'react';
import { useWebVitals, WebVitalMetric, PerformanceMetrics } from '../hooks/useWebVitals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Database, 
  Download, 
  Globe, 
  Monitor, 
  RefreshCw, 
  TrendingUp,
  XCircle,
  Zap
} from 'lucide-react';

interface PerformanceMonitorProps {
  isVisible?: boolean;
  showErrors?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface MetricDisplayProps {
  metric?: WebVitalMetric;
  name: string;
  label: string;
  unit: string;
  icon: React.ReactNode;
  threshold: { good: number; poor: number };
}

function MetricDisplay({ metric, name, label, unit, icon, threshold }: MetricDisplayProps) {
  const getStatus = () => {
    if (!metric) return { status: 'loading', color: 'bg-gray-400' };
    
    switch (metric.label) {
      case 'good': return { status: 'good', color: 'bg-green-500' };
      case 'needs-improvement': return { status: 'warning', color: 'bg-yellow-500' };
      case 'poor': return { status: 'poor', color: 'bg-red-500' };
      default: return { status: 'unknown', color: 'bg-gray-500' };
    }
  };

  const { status, color } = getStatus();

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
          </div>
          {metric && (
            <Badge 
              variant={status === 'good' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}
              className="text-xs"
            >
              {status === 'good' ? 'Bueno' : status === 'warning' ? 'Mejorar' : 'Pobre'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            {metric ? `${metric.value.toFixed(0)}${unit}` : '---'}
          </div>
          {metric && (
            <div className="space-y-1">
              <Progress 
                value={Math.min(100, (metric.value / threshold.poor) * 100)} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Objetivo: {threshold.good}{unit}</span>
                <span>Límite: {threshold.poor}{unit}</span>
              </div>
            </div>
          )}
          {metric && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {status === 'good' ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : status === 'warning' ? (
                <AlertTriangle className="w-3 h-3 text-yellow-500" />
              ) : (
                <XCircle className="w-3 h-3 text-red-500" />
              )}
              <span>Delta: {metric.delta.toFixed(0)}</span>
            </div>
          )}
        </div>
      </CardContent>
      <div className={`absolute top-0 left-0 w-1 h-full ${color}`}></div>
    </Card>
  );
}

interface ResourceMetricProps {
  resources: PerformanceResourceTiming[];
}

function ResourceMetrics({ resources }: ResourceMetricProps) {
  const resourceTypes = useMemo(() => {
    const types = resources.reduce((acc, resource) => {
      const type = resource.initiatorType;
      if (!acc[type]) {
        acc[type] = { count: 0, totalSize: 0, avgDuration: 0, totalDuration: 0 };
      }
      acc[type].count++;
      acc[type].totalDuration += resource.duration;
      acc[type].totalSize += resource.transferSize || 0;
      return acc;
    }, {} as Record<string, { count: number; totalSize: number; avgDuration: number; totalDuration: number }>);

    // Calcular promedios
    Object.keys(types).forEach(type => {
      types[type].avgDuration = types[type].totalDuration / types[type].count;
    });

    return Object.entries(types).sort(([,a], [,b]) => b.totalDuration - a.totalDuration);
  }, [resources]);

  return (
    <div className="space-y-3">
      <h4 className="font-medium">Recursos por Tipo</h4>
      {resourceTypes.map(([type, stats]) => (
        <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Download className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="font-medium capitalize">{type}</div>
              <div className="text-sm text-muted-foreground">{stats.count} recursos</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">{stats.avgDuration.toFixed(0)}ms</div>
            <div className="text-sm text-muted-foreground">
              {stats.totalSize > 0 ? `${(stats.totalSize / 1024).toFixed(1)}KB` : 'N/A'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorList({ errors }: { errors: PerformanceMetrics['errors'] }) {
  if (errors.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
        <p>No hay errores registrados</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {errors.slice(0, 10).map((error, index) => (
        <Alert key={index} variant={error.severity === 'critical' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{error.message}</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {error.url}
                                  {error.lineNumber && `:${error.lineNumber}`}
                                  {error.columnNumber && `:${error.columnNumber}`}
                                </div>
                              </div>
                              <Badge variant="outline" className="ml-2">
                                {error.type}
                              </Badge>
                            </div>
                          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}

function PerformanceSummary({ metrics, onRefresh }: { metrics: PerformanceMetrics; onRefresh: () => void }) {
  const summary = useMemo(() => {
    const vitals = metrics.coreWebVitals;
    const vitalsEntries = Object.entries(vitals);
    
    const good = vitalsEntries.filter(([, v]) => v?.label === 'good').length;
    const needsImprovement = vitalsEntries.filter(([, v]) => v?.label === 'needs-improvement').length;
    const poor = vitalsEntries.filter(([, v]) => v?.label === 'poor').length;
    const total = vitalsEntries.length;

    const overallScore = total > 0 ? Math.round((good / total) * 100) : 0;

    return {
      good,
      needsImprovement, 
      poor,
      total,
      overallScore,
      errorCount: metrics.errors.length,
      resourceCount: metrics.resourceTimings.length
    };
  }, [metrics]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Resumen de Rendimiento
          </CardTitle>
          <Button size="sm" variant="outline" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.good}</div>
            <div className="text-sm text-muted-foreground">Buenos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{summary.needsImprovement}</div>
            <div className="text-sm text-muted-foreground">Mejorar</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{summary.poor}</div>
            <div className="text-sm text-muted-foreground">Pobres</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{summary.overallScore}%</div>
            <div className="text-sm text-muted-foreground">Puntuación</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Errores registrados</span>
            <span className={summary.errorCount > 0 ? 'text-red-600' : 'text-green-600'}>
              {summary.errorCount}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Recursos cargados</span>
            <span>{summary.resourceCount}</span>
          </div>
        </div>

        <Progress value={summary.overallScore} className="mt-4" />
      </CardContent>
    </Card>
  );
}

export function PerformanceMonitor({ 
  isVisible = true, 
  showErrors = true, 
  autoRefresh = false, 
  refreshInterval = 5000 
}: PerformanceMonitorProps) {
  const { metrics, isLoading, reportError, addCustomMetric, getPerformanceSummary } = useWebVitals();
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const handleRefresh = () => {
    setLastRefresh(Date.now());
    // Forzar nueva medición
    if ('performance' in window && 'getEntriesByType' in performance) {
      performance.clearResourceTimings();
      performance.clearMarks();
      performance.clearMeasures();
    }
  };

  useEffect(() => {
    if (autoRefresh && isVisible) {
      const interval = setInterval(handleRefresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isVisible, refreshInterval]);

  // Agregar métricas personalizadas cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      addCustomMetric('memory_usage', (performance as any).memory?.usedJSHeapSize || 0);
      addCustomMetric('connection_type', (navigator as any).connection?.effectiveType || 'unknown');
    }, 30000);

    return () => clearInterval(interval);
  }, [addCustomMetric]);

  if (!isVisible) return null;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6 bg-background">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Monitor className="w-6 h-6" />
          Monitor de Rendimiento
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            Actualizado: {new Date(lastRefresh).toLocaleTimeString()}
          </Badge>
          {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
        </div>
      </div>

      {/* Resumen de rendimiento */}
      <PerformanceSummary metrics={metrics} onRefresh={handleRefresh} />

      <Tabs defaultValue="core-vitals" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="core-vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
          <TabsTrigger value="metrics">Métricas Adicionales</TabsTrigger>
          {showErrors && <TabsTrigger value="errors">Errores</TabsTrigger>}
        </TabsList>

        <TabsContent value="core-vitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricDisplay
              metric={metrics.coreWebVitals.fcp}
              name="fcp"
              label="First Contentful Paint"
              unit="ms"
              icon={<Zap className="w-4 h-4" />}
              threshold={{ good: 1800, poor: 3000 }}
            />
            <MetricDisplay
              metric={metrics.coreWebVitals.lcp}
              name="lcp"
              label="Largest Contentful Paint"
              unit="ms"
              icon={<Activity className="w-4 h-4" />}
              threshold={{ good: 2500, poor: 4000 }}
            />
            <MetricDisplay
              metric={metrics.coreWebVitals.cls}
              name="cls"
              label="Cumulative Layout Shift"
              unit=""
              icon={<TrendingUp className="w-4 h-4" />}
              threshold={{ good: 0.1, poor: 0.25 }}
            />
            <MetricDisplay
              metric={metrics.coreWebVitals.inp}
              name="inp"
              label="Interaction to Next Paint"
              unit="ms"
              icon={<Cpu className="w-4 h-4" />}
              threshold={{ good: 200, poor: 500 }}
            />
            <MetricDisplay
              metric={metrics.coreWebVitals.ttfb}
              name="ttfb"
              label="Time to First Byte"
              unit="ms"
              icon={<Globe className="w-4 h-4" />}
              threshold={{ good: 800, poor: 1800 }}
            />
            <MetricDisplay
              metric={metrics.coreWebVitals.fid}
              name="fid"
              label="First Input Delay"
              unit="ms"
              icon={<Clock className="w-4 h-4" />}
              threshold={{ good: 100, poor: 300 }}
            />
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <ResourceMetrics resources={metrics.resourceTimings} />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas Personalizadas</CardTitle>
              <CardDescription>
                Métricas adicionales del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(metrics.customMetrics).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="font-mono">
                      {typeof value === 'number' && value > 1000 
                        ? `${(value / 1024 / 1024).toFixed(2)}MB`
                        : value.toString()
                      }
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {showErrors && (
          <TabsContent value="errors" className="space-y-4">
            <ErrorList errors={metrics.errors} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}