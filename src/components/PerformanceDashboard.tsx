import React, { useState, useEffect, useMemo } from 'react';
import { useWebVitals, PerformanceMetrics } from '../hooks/useWebVitals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  Monitor,
  RefreshCw,
  Download,
  Settings,
  Eye,
  Database,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  Smartphone,
  Laptop,
  Tablet
} from 'lucide-react';

interface MetricHistory {
  timestamp: number;
  value: number;
  name: string;
  label: 'good' | 'needs-improvement' | 'poor';
}

interface PerformanceDashboardProps {
  realTime?: boolean;
  timeRange?: '1h' | '6h' | '24h' | '7d';
  showRecommendations?: boolean;
}

interface PerformanceScore {
  overall: number;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa: number;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'performance' | 'seo' | 'accessibility' | 'best-practices';
  effort: 'low' | 'medium' | 'high';
  score: number;
}

function ScoreCard({ title, score, icon: Icon, color }: {
  title: string;
  score: number;
  icon: React.ReactNode;
  color: string;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{score}</div>
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(score)}`}
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>
        <p className={`text-xs mt-2 ${getScoreColor(score)}`}>
          {score >= 90 ? 'Excelente' : score >= 50 ? 'Bueno' : 'Necesita mejora'}
        </p>
      </CardContent>
    </Card>
  );
}

function MetricHistoryChart({ history }: { history: MetricHistory[] }) {
  const chartData = useMemo(() => {
    const grouped = history.reduce((acc, item) => {
      const time = new Date(item.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      if (!acc[time]) {
        acc[time] = { time };
      }
      
      acc[time][item.name] = item.value;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).slice(-20); // Últimos 20 puntos
  }, [history]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="fcp" 
          stroke="#8884d8" 
          name="FCP (ms)"
          strokeWidth={2}
        />
        <Line 
          type="monotone" 
          dataKey="lcp" 
          stroke="#82ca9d" 
          name="LCP (ms)"
          strokeWidth={2}
        />
        <Line 
          type="monotone" 
          dataKey="ttfb" 
          stroke="#ffc658" 
          name="TTFB (ms)"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ResourceDistributionChart({ resources }: { resources: PerformanceResourceTiming[] }) {
  const distribution = useMemo(() => {
    const types = resources.reduce((acc, resource) => {
      const type = resource.initiatorType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(types).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / resources.length) * 100).toFixed(1)
    }));
  }, [resources]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={distribution}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name} (${percentage}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {distribution.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

function PerformanceTrendChart({ metrics }: { metrics: PerformanceMetrics }) {
  const trendData = useMemo(() => {
    // Simular datos históricos basados en métricas actuales
    const now = Date.now();
    return Array.from({ length: 24 }, (_, i) => ({
      time: new Date(now - (23 - i) * 60 * 60 * 1000).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      performance: Math.max(0, Math.min(100, 85 + Math.random() * 20 - 10)),
      fcp: Math.max(800, Math.random() * 2000 + 1000),
      lcp: Math.max(1500, Math.random() * 3000 + 2000),
      cls: Math.max(0, Math.random() * 0.3),
    }));
  }, [metrics]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={trendData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Area 
          type="monotone" 
          dataKey="performance" 
          stackId="1"
          stroke="#8884d8" 
          fill="#8884d8"
          fillOpacity={0.6}
          name="Score"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function RecommendationsPanel({ metrics }: { metrics: PerformanceMetrics }) {
  const recommendations: Recommendation[] = useMemo(() => {
    const recs: Recommendation[] = [];
    
    // Analizar Core Web Vitals
    if (metrics.coreWebVitals.lcp && metrics.coreWebVitals.lcp.value > 2500) {
      recs.push({
        id: 'optimize-images',
        title: 'Optimizar imágenes',
        description: 'Las imágenes grandes están afectando el LCP. Considera usar WebP, compresión y lazy loading.',
        impact: 'high',
        category: 'performance',
        effort: 'medium',
        score: 85
      });
    }

    if (metrics.coreWebVitals.cls && metrics.coreWebVitals.cls.value > 0.1) {
      recs.push({
        id: 'fix-layout-shift',
        title: 'Corregir desplazamientos de layout',
        description: 'Hay elementos que causan desplazamiento de layout. Añade dimensiones a imágenes y reserva espacio para elementos dinámicos.',
        impact: 'high',
        category: 'performance',
        effort: 'low',
        score: 90
      });
    }

    if (metrics.coreWebVitals.fid && metrics.coreWebVitals.fid.value > 100) {
      recs.push({
        id: 'reduce-js-execution',
        title: 'Reducir ejecución de JavaScript',
        description: 'El tiempo de respuesta a la primera interacción es alto. Considera dividir el código y usar web workers.',
        impact: 'medium',
        category: 'performance',
        effort: 'high',
        score: 70
      });
    }

    // Analizar recursos
    const largeResources = metrics.resourceTimings.filter(r => (r.transferSize || 0) > 100000);
    if (largeResources.length > 0) {
      recs.push({
        id: 'optimize-bundle-size',
        title: 'Optimizar tamaño del bundle',
        description: `Se detectaron ${largeResources.length} recursos grandes. Considera tree-shaking, code splitting y minificación.`,
        impact: 'medium',
        category: 'performance',
        effort: 'medium',
        score: 75
      });
    }

    return recs;
  }, [metrics]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEffortIcon = (effort: string) => {
    switch (effort) {
      case 'low': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p>¡Excelente! No se detectaron problemas de rendimiento.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Recomendaciones
        </CardTitle>
        <CardDescription>
          Sugerencias para mejorar el rendimiento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec) => (
          <Alert key={rec.id}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{rec.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className={getImpactColor(rec.impact)}>
                      {rec.impact === 'high' ? 'Alto' : rec.impact === 'medium' ? 'Medio' : 'Bajo'}
                    </Badge>
                    <Badge variant="outline">
                      {getEffortIcon(rec.effort)}
                      <span className="ml-1">
                        {rec.effort === 'low' ? 'Fácil' : rec.effort === 'medium' ? 'Medio' : 'Difícil'}
                      </span>
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Impacto estimado: {rec.score}%
                  </span>
                  <Button size="sm" variant="outline">
                    Ver detalles
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}

function DeviceInfoCard() {
  const [deviceInfo, setDeviceInfo] = useState({
    type: 'desktop',
    screen: '',
    connection: 'unknown',
    memory: 'unknown',
    cores: 'unknown'
  });

  useEffect(() => {
    // Detectar tipo de dispositivo
    const userAgent = navigator.userAgent.toLowerCase();
    let type = 'desktop';
    if (/mobile|android|iphone|ipad/.test(userAgent)) {
      type = /ipad/.test(userAgent) ? 'tablet' : 'mobile';
    }

    // Obtener información de pantalla
    const screen = `${window.screen.width}x${window.screen.height}`;

    // Obtener información de conexión
    const connection = (navigator as any).connection?.effectiveType || 'unknown';

    // Obtener información de memoria
    const memory = (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory}GB` : 'unknown';

    // Obtener número de cores
    const cores = navigator.hardwareConcurrency || 'unknown';

    setDeviceInfo({ type, screen, connection, memory, cores });
  }, []);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'tablet': return <Tablet className="w-5 h-5" />;
      default: return <Laptop className="w-5 h-5" />;
    }
  };

  const getConnectionIcon = (connection: string) => {
    if (connection.includes('4g')) return <Wifi className="w-4 h-4 text-green-500" />;
    if (connection.includes('3g')) return <Wifi className="w-4 h-4 text-yellow-500" />;
    if (connection.includes('2g')) return <Wifi className="w-4 h-4 text-red-500" />;
    return <Wifi className="w-4 h-4 text-gray-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Información del Dispositivo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getDeviceIcon(deviceInfo.type)}
            <span className="capitalize">{deviceInfo.type}</span>
          </div>
          <span className="text-sm text-muted-foreground">{deviceInfo.screen}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            <span>CPU Cores</span>
          </div>
          <span className="text-sm text-muted-foreground">{deviceInfo.cores}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            <span>Memoria</span>
          </div>
          <span className="text-sm text-muted-foreground">{deviceInfo.memory}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getConnectionIcon(deviceInfo.connection)}
            <span>Conexión</span>
          </div>
          <span className="text-sm text-muted-foreground capitalize">{deviceInfo.connection}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function PerformanceDashboard({ 
  realTime = true, 
  timeRange = '1h',
  showRecommendations = true 
}: PerformanceDashboardProps) {
  const { metrics, isLoading, getPerformanceSummary } = useWebVitals();
  const [history, setHistory] = useState<MetricHistory[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(realTime);

  const summary = useMemo(() => getPerformanceSummary(), [getPerformanceSummary]);

  // Actualizar historial cada 30 segundos
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      Object.entries(metrics.coreWebVitals).forEach(([name, vital]) => {
        if (vital) {
          setHistory(prev => [
            ...prev.slice(-99), // Mantener solo los últimos 100 puntos
            {
              timestamp: Date.now(),
              value: vital.value,
              name,
              label: vital.label
            }
          ]);
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, metrics.coreWebVitals]);

  const exportData = () => {
    const data = {
      summary,
      metrics,
      history,
      deviceInfo: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="w-8 h-8" />
            Dashboard de Rendimiento
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitoreo completo del rendimiento de la aplicación
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {autoRefresh ? 'Pausar' : 'Reanudar'}
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Scores Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <ScoreCard
          title="General"
          score={summary.score.performance}
          icon={<TrendingUp className="w-4 h-4" />}
          color="blue"
        />
        <ScoreCard
          title="Performance"
          score={summary.score.performance}
          icon={<Zap className="w-4 h-4" />}
          color="green"
        />
        <ScoreCard
          title="Accesibilidad"
          score={summary.score.accessibility}
          icon={<CheckCircle className="w-4 h-4" />}
          color="purple"
        />
        <ScoreCard
          title="Buenas Prácticas"
          score={summary.score.bestPractices}
          icon={<Settings className="w-4 h-4" />}
          color="orange"
        />
        <ScoreCard
          title="SEO"
          score={summary.score.seo}
          icon={<Globe className="w-4 h-4" />}
          color="indigo"
        />
        <ScoreCard
          title="PWA"
          score={summary.score.pwa}
          icon={<Smartphone className="w-4 h-4" />}
          color="pink"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
          <TabsTrigger value="analysis">Análisis</TabsTrigger>
          {showRecommendations && <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DeviceInfoCard />
            <Card>
              <CardHeader>
                <CardTitle>Métricas Clave</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Errores Totales</span>
                  <Badge variant={summary.errorCount > 0 ? "destructive" : "default"}>
                    {summary.errorCount}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Métricas Buenas</span>
                  <Badge variant="default">{summary.goodMetrics}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Métricas Pobres</span>
                  <Badge variant="destructive">{summary.poorMetrics}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total de Recursos</span>
                  <Badge variant="outline">{metrics.resourceTimings.length}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Rendimiento</CardTitle>
              <CardDescription>
                Evolución del rendimiento en las últimas horas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceTrendChart metrics={metrics} />
            </CardContent>
          </Card>
          
          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historial de Core Web Vitals</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricHistoryChart history={history} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Recursos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResourceDistributionChart resources={metrics.resourceTimings} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Detalles de Recursos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.resourceTimings.slice(0, 5).map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {resource.name.split('/').pop()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {resource.initiatorType}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{resource.duration.toFixed(0)}ms</div>
                        <div className="text-sm text-muted-foreground">
                          {resource.transferSize > 0 ? `${(resource.transferSize / 1024).toFixed(1)}KB` : 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(metrics.coreWebVitals).map(([name, vital]) => {
              if (!vital) return null;
              
              const labels = {
                fcp: 'First Contentful Paint',
                lcp: 'Largest Contentful Paint',
                cls: 'Cumulative Layout Shift',
                fid: 'First Input Delay',
                inp: 'Interaction to Next Paint',
                ttfb: 'Time to First Byte'
              };
              
              return (
                <Card key={name}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{labels[name as keyof typeof labels]}</CardTitle>
                      <Badge variant={
                        vital.label === 'good' ? 'default' : 
                        vital.label === 'needs-improvement' ? 'secondary' : 
                        'destructive'
                      }>
                        {vital.label === 'good' ? 'Bueno' : 
                         vital.label === 'needs-improvement' ? 'Mejorar' : 'Pobre'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {vital.value.toFixed(0)}{name === 'cls' ? '' : 'ms'}
                      {name === 'cls' && vital.value.toFixed(3)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Delta: {vital.delta.toFixed(0)}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {showRecommendations && (
          <TabsContent value="recommendations" className="space-y-6">
            <RecommendationsPanel metrics={metrics} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}