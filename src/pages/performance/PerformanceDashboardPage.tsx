import React, { useState } from 'react';
import { PerformanceMonitor } from '../components/PerformanceMonitor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  Activity,
  BarChart3,
  Monitor,
  Settings,
  TrendingUp,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function PerformanceDashboardPage() {
  const [monitorVisible, setMonitorVisible] = useState(true);
  const [showErrors, setShowErrors] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Dashboard de Rendimiento
                </h1>
                <p className="text-sm text-gray-500">
                  Monitoreo en tiempo real de métricas y Core Web Vitals
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={autoRefresh ? "default" : "secondary"}>
                {autoRefresh ? 'Tiempo Real' : 'Pausado'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <Monitor className="w-4 h-4 mr-2" />
                {autoRefresh ? 'Pausar' : 'Reanudar'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Configuración */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Tabs defaultValue="monitor" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monitor">Monitor</TabsTrigger>
            <TabsTrigger value="overview">Vista General</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="monitor" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Controles */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Controles
                    </CardTitle>
                    <CardDescription>
                      Configuración del monitor en tiempo real
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Monitor Visible</span>
                      <Button
                        variant={monitorVisible ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMonitorVisible(!monitorVisible)}
                      >
                        {monitorVisible ? 'Ocultar' : 'Mostrar'}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Mostrar Errores</span>
                      <Button
                        variant={showErrors ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowErrors(!showErrors)}
                      >
                        {showErrors ? 'Sí' : 'No'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Auto-refresh</span>
                      <Button
                        variant={autoRefresh ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                      >
                        {autoRefresh ? 'Activo' : 'Inactivo'}
                      </Button>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Estado del Sistema</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Web Vitals Tracking</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Error Reporting</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Performance API</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Resource Monitoring</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Atajos rápidos */}
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Acciones Rápidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Análisis de Bundle
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Lighthouse CI
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Activity className="w-4 h-4 mr-2" />
                      Reporte Completo
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Monitor Principal */}
              <div className="lg:col-span-3">
                <PerformanceMonitor
                  isVisible={monitorVisible}
                  showErrors={showErrors}
                  autoRefresh={autoRefresh}
                  refreshInterval={5000}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Métricas Clave */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Performance Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">92</div>
                  <p className="text-xs text-muted-foreground">
                    +5 desde la última hora
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Core Web Vitals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">3/5</div>
                  <p className="text-xs text-muted-foreground">
                    Métricas en rango óptimo
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Errores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">2</div>
                  <p className="text-xs text-muted-foreground">
                    Últimas 24 horas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Bundle Size
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">245KB</div>
                  <p className="text-xs text-muted-foreground">
                    -12% vs. semana anterior
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Información adicional */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Información del Sistema</CardTitle>
                <CardDescription>
                  Detalles técnicos del entorno de monitoreo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Node.js</div>
                    <div className="text-muted-foreground">{process.version}</div>
                  </div>
                  <div>
                    <div className="font-medium">Plataforma</div>
                    <div className="text-muted-foreground">{process.platform}</div>
                  </div>
                  <div>
                    <div className="font-memory">Memoria</div>
                    <div className="text-muted-foreground">
                      {Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Tiempo Activo</div>
                    <div className="text-muted-foreground">
                      {Math.round(process.uptime() / 60)}min
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema de Monitoring</CardTitle>
                <CardDescription>
                  Configuración avanzada para métricas y reporting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Configuración de Web Vitals</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">FCP Threshold (ms)</label>
                        <input
                          type="number"
                          defaultValue="1800"
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">LCP Threshold (ms)</label>
                        <input
                          type="number"
                          defaultValue="2500"
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Configuración de Reporting</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Auto-reporting de errores</label>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Tracking de analytics</label>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Performance budget alerts</label>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Scripts Disponibles</h3>
                    <div className="space-y-2">
                      <code className="block p-2 bg-gray-100 rounded text-sm">
                        npm run performance:audit
                      </code>
                      <code className="block p-2 bg-gray-100 rounded text-sm">
                        npm run lighthouse:ci
                      </code>
                      <code className="block p-2 bg-gray-100 rounded text-sm">
                        npm run bundle-analyzer
                      </code>
                      <code className="block p-2 bg-gray-100 rounded text-sm">
                        npm run metrics:report
                      </code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}