# 📊 Guía Rápida - Sistema de Monitoring TheFreed.v1

## 🚀 Inicio Rápido

### 1. Ver el Dashboard en Tiempo Real
```bash
npm run dev
# Navegar a: http://localhost:3000/performance-dashboard
```

### 2. Ejecutar Auditoría Completa
```bash
npm run performance:audit
```

### 3. Análisis de Bundle
```bash
npm run build:analyze
# Ver: dist/stats.html
```

## 📊 Scripts Principales

```bash
# Desarrollo
npm run dev                          # Iniciar servidor con monitoring
npm run performance:dev             # Dev + Lighthouse automático

# Build y Análisis
npm run build:analyze               # Build + análisis de bundle
npm run performance:audit           # Auditoría completa de performance

# Lighthouse
npm run lighthouse                  # Ejecutar Lighthouse
npm run lighthouse:ci              # Lighthouse para CI
npm run lighthouse:watch           # Lighthouse en modo watch

# Análisis
npm run bundle-analyzer            # Solo análisis de bundle
npm run metrics:report             # Generar reporte de métricas

# Testing
npm run test:performance           # Test de performance
npm run monitor:start              # Iniciar monitoreo
npm run monitor:dashboard          # Mostrar URL del dashboard
```

## 🎯 Acceso Rápido

### Dashboard de Rendimiento
- **URL:** `/performance-dashboard`
- **Descripción:** Dashboard completo con métricas en tiempo real
- **Acceso:** Requiere autenticación

### Widget Flotante
- **Componente:** `PerformanceWidget`
- **Uso:** Se muestra automáticamente o se puede integrar manualmente
- **Posición:** Bottom-right corner

### Widgets Disponibles
```tsx
// Widget flotante con controles
import { PerformanceWidget } from './components/PerformanceWidget';

<PerformanceWidget 
  position="floating"
  showControls={true}
  realTime={true}
/>

// Estadísticas rápidas
import { QuickPerformanceStats } from './components/PerformanceWidget';

<QuickPerformanceStats showChart={true} compact={false} />

// Indicador de estado
import { PerformanceIndicator } from './components/PerformanceWidget';

<PerformanceIndicator status="good" message="Performance óptimo" />
```

## 📈 Métricas Principales

### Core Web Vitals
- **FCP:** < 1800ms (good)
- **LCP:** < 2500ms (good)
- **CLS:** < 0.1 (good)
- **INP:** < 200ms (good)
- **TTFB:** < 800ms (good)

### Targets de Bundle
- **Total Size:** < 500KB gzipped
- **Main Bundle:** < 250KB
- **Chunks:** < 100KB cada uno
- **Compression:** > 60%

## 🔧 Configuración Rápida

### Error Reporting
```typescript
// En src/main.tsx o App.tsx
import { initializeErrorReporting } from './services/errorReporting';

initializeErrorReporting({
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
  serviceName: 'TheFreed.v1'
});
```

### Umbrales Personalizados
```typescript
// En cualquier componente
import { useWebVitals } from './hooks/useWebVitals';

const { thresholds } = useWebVitals();
thresholds.fcp = { good: 1500, poor: 2500 };
```

## 📱 Integración en Páginas

### En el Dashboard Principal
```tsx
// En src/pages/dashboard/DashboardPage.tsx
import { PerformanceWidget } from '../components/PerformanceWidget';

export default function DashboardPage() {
  return (
    <div>
      {/* Contenido del dashboard */}
      <PerformanceWidget position="sidebar" />
    </div>
  );
}
```

### En Componentes Específicos
```tsx
import { QuickPerformanceStats } from './components/PerformanceWidget';

export function AdminPanel() {
  return (
    <div>
      <QuickPerformanceStats compact />
      {/* Contenido del panel */}
    </div>
  );
}
```

## 🚨 Alertas y Errores

### Tipos de Errores Capturados
- JavaScript errors
- Resource loading failures
- API errors
- Performance threshold violations
- Custom errors

### Severidades
- **Low:** Warnings menores
- **Medium:** Errores que afectan UX
- **High:** Errores críticos
- **Critical:** Errores que rompen funcionalidad

### Acceso a Errores
1. Dashboard → Tab "Errores"
2. PerformanceMonitor → Panel inferior
3. Console logs (desarrollo)

## 📊 Reportes

### Reporte de Bundle (`analysis/`)
- `bundle-analysis-report.json` - Análisis técnico detallado
- `dist/stats.html` - Visualización interactiva

### Reporte de Métricas (`metrics-report/`)
- `performance-metrics-report.md` - Reporte completo en Markdown
- Incluye recomendaciones priorizadas

### Reporte de Lighthouse (`lighthouse-results/`)
- Archivos JSON con resultados detallados
- Uno por URL testeada

## 🎯 Casos de Uso Comunes

### 1. Monitoreo durante Desarrollo
```bash
npm run dev
# Abrir /performance-dashboard para monitoreo en tiempo real
```

### 2. Verificar Performance antes de Deploy
```bash
npm run performance:audit
# Revisar reporte generado
```

### 3. Analizar Bundle Grande
```bash
npm run build:analyze
open dist/stats.html  # Ver visualización interactiva
```

### 4. Debugging de Errores
```bash
# Los errores aparecen automáticamente en el dashboard
# O revisar console en desarrollo
npm run dev
```

### 5. Optimización Continua
```bash
# Ejecutar tests de performance automáticamente
npm run test:performance
```

## 🔍 Troubleshooting

### Problemas Comunes

#### Lighthouse falla al ejecutar
```bash
# Verificar que el servidor esté corriendo
npm run dev & sleep 10
npm run lighthouse
```

#### Widget no aparece
```typescript
// Verificar que el componente esté importado correctamente
import { PerformanceWidget } from './components/PerformanceWidget';

// Verificar que useWebVitals esté funcionando
const { isLoading } = useWebVitals();
```

#### Métricas no se actualizan
- Verificar que `autoRefresh` esté habilitado
- Revisar errores en console
- Verificar que no haya errores de JavaScript

#### Bundle analyzer no genera archivos
```bash
# Asegurar que el build se completó exitosamente
npm run build
# Luego ejecutar análisis
npm run bundle-analyzer
```

### Logs Útiles
```bash
# Logs de desarrollo incluyen información de monitoring
npm run dev
# Buscar mensajes como "🚀 Sistema de monitoring inicializado"
```

## 📋 Checklist de Performance

### Antes de Deploy
- [ ] Performance score > 90
- [ ] Todos los Core Web Vitals en "good"
- [ ] Bundle size < 500KB
- [ ] 0 errores críticos
- [ ] Reporte de auditoría generado

### Monitoreo Continuo
- [ ] Dashboard revisado semanalmente
- [ ] Alertas de errores configuradas
- [ ] Lighthouse CI en pipeline
- [ ] Reportes de métricas revisados

## 🎨 Personalización

### Temas del Dashboard
```css
/* CSS personalizado para el dashboard */
.performance-dashboard {
  --primary-color: #your-color;
  --success-color: #your-success;
  --warning-color: #your-warning;
  --error-color: #your-error;
}
```

### Métricas Adicionales
```typescript
// Agregar métricas personalizadas
const { addCustomMetric } = useWebVitals();

addCustomMetric('custom_metric', value);
```

### Umbrales Específicos por Entorno
```typescript
// Configuración por entorno
const thresholds = process.env.NODE_ENV === 'production' 
  ? PRODUCTION_THRESHOLDS 
  : DEVELOPMENT_THRESHOLDS;
```

## 📞 Soporte

### Recursos
- Documentación completa: `MONITORING_SYSTEM_IMPLEMENTATION.md`
- Issues de performance: Dashboard → Tab "Errors"
- Bundle analysis: `dist/stats.html`
- Reports: Carpetas `analysis/` y `metrics-report/`

### Contacto
- Dashboard de rendimiento: `/performance-dashboard`
- Logs de desarrollo: Console del navegador
- Archivos de análisis: `/analysis/` y `/metrics-report/`

---

**¡El sistema está listo para usar!** 🚀

**URLs importantes:**
- Dashboard: `/performance-dashboard`
- Build analyzer: `dist/stats.html` (después de build)
- Reportes: `/analysis/` y `/metrics-report/`