import React, { useState } from 'react';
import { PerformanceMonitor } from './PerformanceMonitor';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {
  Monitor,
  Activity,
  Settings,
  X,
  Maximize2,
  Minimize2,
  BarChart3,
  TrendingUp
} from 'lucide-react';

interface PerformanceWidgetProps {
  position?: 'floating' | 'sidebar' | 'bottom';
  showControls?: boolean;
  compact?: boolean;
  realTime?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

export function PerformanceWidget({
  position = 'floating',
  showControls = true,
  compact = false,
  realTime = true,
  theme = 'light',
  className = ''
}: PerformanceWidgetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(realTime);

  if (position === 'floating' && !isVisible) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={() => setIsVisible(true)}
          className="rounded-full h-12 w-12 shadow-lg"
          size="icon"
        >
          <Monitor className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  if (position === 'floating' && isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Card className="w-80 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Performance
              </CardTitle>
              <div className="flex items-center gap-1">
                <Badge variant={autoRefresh ? "default" : "secondary"} className="text-xs">
                  {autoRefresh ? 'LIVE' : 'PAUSE'}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMinimized(false)}
                >
                  <Maximize2 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsVisible(false)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xs text-muted-foreground">
              Click para expandir y ver métricas completas
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const containerClasses = {
    floating: `fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-hidden ${className}`,
    sidebar: `w-full max-w-sm ${className}`,
    bottom: `w-full ${className}`
  };

  return (
    <Card className={containerClasses[position]}>
      {(showControls || position === 'floating') && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Performance Monitor
            </CardTitle>
            <div className="flex items-center gap-1">
              {showControls && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className="text-xs"
                  >
                    {autoRefresh ? 'Pause' : 'Resume'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsMinimized(true)}
                  >
                    <Minimize2 className="w-3 h-3" />
                  </Button>
                </>
              )}
              {position === 'floating' && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsMinimized(true)}
                  >
                    <Minimize2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsVisible(false)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <CardDescription className="text-xs">
            Monitoreo en tiempo real de métricas
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent className={`${position !== 'floating' ? 'pt-0' : ''} ${compact ? 'p-0' : ''}`}>
        <PerformanceMonitor
          isVisible={!isMinimized}
          showErrors={showControls}
          autoRefresh={autoRefresh}
          refreshInterval={5000}
        />
      </CardContent>
    </Card>
  );
}

interface QuickPerformanceStatsProps {
  showChart?: boolean;
  compact?: boolean;
}

export function QuickPerformanceStats({ 
  showChart = false, 
  compact = false 
}: QuickPerformanceStatsProps) {
  const [stats] = useState({
    performance: 92,
    fcp: 1200,
    lcp: 2100,
    cls: 0.05,
    errors: 2,
    uptime: '99.9%'
  });

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Performance: {stats.performance}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span>Errores: {stats.errors}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Uptime: {stats.uptime}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{stats.performance}</div>
        <div className="text-sm text-muted-foreground">Performance</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{stats.fcp}ms</div>
        <div className="text-sm text-muted-foreground">FCP</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{stats.lcp}ms</div>
        <div className="text-sm text-muted-foreground">LCP</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{stats.errors}</div>
        <div className="text-sm text-muted-foreground">Errores</div>
      </div>
    </div>
  );
}

interface PerformanceIndicatorProps {
  status: 'good' | 'warning' | 'error';
  message?: string;
  showTooltip?: boolean;
}

export function PerformanceIndicator({ 
  status, 
  message, 
  showTooltip = true 
}: PerformanceIndicatorProps) {
  const statusConfig = {
    good: {
      color: 'bg-green-500',
      icon: '✅',
      label: 'Performance óptimo'
    },
    warning: {
      color: 'bg-yellow-500',
      icon: '⚠️',
      label: 'Performance necesita atención'
    },
    error: {
      color: 'bg-red-500',
      icon: '❌',
      label: 'Performance crítico'
    }
  };

  const config = statusConfig[status];

  return (
    <div className="relative inline-flex items-center gap-2">
      <div 
        className={`w-3 h-3 rounded-full ${config.color} animate-pulse`}
        title={message || config.label}
      ></div>
      {showTooltip && message && (
        <span className="text-sm text-muted-foreground">
          {message}
        </span>
      )}
    </div>
  );
}

export default PerformanceWidget;