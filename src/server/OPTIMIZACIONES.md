# Optimizaciones de Rendimiento - TheFreed.v1 Server

## Resumen de Mejoras Implementadas

Este documento detalla las optimizaciones de rendimiento implementadas en el servidor `simple.ts` de TheFreed.v1.

## 🚀 Características Principales

### 1. **Compresión Gzip**
- **Middleware**: `compression` de Express
- **Configuración**: Solo comprime respuestas > 1KB
- **Nivel**: 6 (balanceado entre velocidad y compresión)
- **Tipos de contenido**: JSON, HTML, CSS, JavaScript, XML, SVG
- **Beneficio**: Reduce tamaño de respuesta en ~70-80%

### 2. **Cache en Memoria (LRU)**
- **Biblioteca**: `lru-cache`
- **Capacidad**: 1000 entradas máximas
- **TTL**: 5 minutos
- **Estrategia**: Cache para rutas GET según patrones de URL
- **Headers**: ETag, Cache-Control, Expires
- **Beneficio**: Respuestas instantáneas para datos frecuentes

### 3. **Rate Limiting Avanzado**
- **Biblioteca**: `rate-limiter-flexible`
- **Configuración**:
  - Desarrollo: RateLimiterMemory (local)
  - Producción: RateLimiterRedis (distribuido)
  - Límite: 100 requests por 15 minutos por IP
- **Funcionalidad**: Headers Retry-After automáticos
- **Beneficio**: Protección contra DDoS y abuso

### 4. **Optimización de Middleware**
- **Helmet**: Configuración optimizada según entorno
- **CORS**: Configuración específica por dominio
- **Logger**: Solo en desarrollo, combinado en producción
- **Parsing JSON**: Verificación de validez y límites optimizados

### 5. **Headers de Cache Apropiados**
- **GET requests**: Cache-Control, ETag, Expires
- **POST/PUT/DELETE**: No-cache headers
- **Health checks**: No-cache para datos dinámicos
- **ETags**: Generación basada en contenido

### 6. **Optimización de JSON Parsing**
- **Límite**: 10MB por request
- **Verificación**: Validación de JSON antes del parsing
- **Strict mode**: Solo JSON válido permitido
- **Parámetros**: Límite de 1000 parámetros por request

## 📊 Métricas y Monitoreo

### Endpoints de Monitoreo

#### `GET /api/admin/stats`
Proporciona estadísticas detalladas del servidor:
- Uso de memoria (RSS, Heap)
- Estadísticas de cache (tamaño, hit rate)
- Información del rate limiter
- Tiempo de actividad del servidor

#### `POST /api/admin/clear-cache` (Solo desarrollo)
Permite limpiar el cache manualmente para testing.

#### `DELETE /api/cache/:key`
Invalidar entradas específicas del cache.

## 🛠️ Configuración de Dependencias

### Nuevas Dependencias Requeridas
```json
{
  "compression": "^1.7.4",
  "lru-cache": "^7.18.3",
  "rate-limiter-flexible": "^2.4.2",
  "redis": "^4.6.7"
}
```

### Variables de Entorno Opcionales
```env
REDIS_URL=redis://localhost:6379
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
```

## 🔧 Configuración Recomendada

### Para Desarrollo
- Usar `NODE_ENV=development`
- Rate limiter en memoria
- Logs detallados con Morgan
- Endpoints de administración habilitados

### Para Producción
- Usar `NODE_ENV=production`
- Conectar a Redis para rate limiting distribuido
- Logs combinados
- Deshabilitar endpoints de admin (configurar firewall)
- Habilitar CSP de Helmet

## 📈 Beneficios de Rendimiento

### Mejoras Esperadas
- **Latencia**: Reducción de 40-60% para respuestas cacheadas
- **Throughput**: Incremento de 30-50% con compresión gzip
- **Uso de memoria**: Optimizado con LRU cache
- **Seguridad**: Rate limiting y headers de seguridad mejorados

### Casos de Uso Optimizados
1. **Health checks**: Cache de 1 minuto para `/api/health`
2. **Status info**: Cache de 2 minutos para `/api/status`
3. **Admin stats**: Cache de 30 segundos para `/api/admin/stats`
4. **Datos estáticos**: Cache automático basado en patterns

## 🔍 Debugging y Troubleshooting

### Logs de Cache
El servidor loguea estadísticas de cache cada 5 minutos:
```
🔄 Cache stats: 156/1000 entries
```

### Headers Útiles
- `X-Cache`: HIT/MISS para debugging de cache
- `Cache-Control`: Directivas de cache para clientes
- `ETag`: Validación condicional de recursos
- `Retry-After`: Rate limiting feedback

### Comandos de Debug
```bash
# Ver estadísticas del servidor
curl http://localhost:5174/api/admin/stats

# Limpiar cache (solo dev)
curl -X POST http://localhost:5174/api/admin/clear-cache

# Verificar health con cache headers
curl -I http://localhost:5174/api/health
```

## 🔐 Consideraciones de Seguridad

### Headers de Seguridad
- `X-Powered-By`: Deshabilitado
- `Content-Security-Policy`: Configurado por entorno
- `Cross-Origin-Embedder-Policy`: Deshabilitado en desarrollo

### Rate Limiting
- Protección contra ataques de fuerza bruta
- Distribución en múltiples instancias con Redis
- Headers informativos para clientes

### Validación de Input
- Verificación estricta de JSON
- Límites de tamaño para requests
- Sanitización automática de parámetros

## 🎯 Próximas Optimizaciones Posibles

1. **Database Connection Pooling**: Para futuras integraciones de DB
2. **CDN Integration**: Para assets estáticos
3. **HTTP/2**: Upgrade del servidor para HTTP/2
4. **Clustering**: Usar PM2 para múltiples procesos
5. **Metrics Export**: Integración con Prometheus/Grafana