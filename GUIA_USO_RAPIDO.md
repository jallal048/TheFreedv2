# 🚀 Guía de Uso Rápido - Servidor Optimizado TheFreed.v1

## 📋 Resumen de Optimizaciones Implementadas

✅ **1. Compresión Gzip** - Reduce tamaño de respuestas en 70-80%  
✅ **2. Cache LRU en Memoria** - Respuestas instantáneas para datos frecuentes  
✅ **3. Rate Limiting Avanzado** - Protección contra abuso con Redis  
✅ **4. Headers de Caché** - Cache-Control, ETag, Expires apropiados  
✅ **5. JSON Parsing Optimizado** - Validación estricta y límites  
✅ **6. Middleware Optimizado** - Cadena de procesamiento eficiente  

## ⚡ Inicio Rápido

### 1. Instalar Dependencias
```bash
cd TheFreed.v1
npm install
```

### 2. Iniciar Servidor
```bash
# Modo desarrollo (frontend + backend)
npm run dev

# Solo backend
npm run dev:backend
```

### 3. Probar Optimizaciones
```bash
# Script de pruebas completo
node src/server/test-optimizations.js

# Prueba manual rápida
curl -H "Accept-Encoding: gzip" http://localhost:5174/api/status
```

## 🔧 Comandos Útiles

### Verificar Estado del Servidor
```bash
# Health check
curl http://localhost:5174/health

# Estadísticas del servidor
curl http://localhost:5174/api/admin/stats

# Estado con métricas
curl http://localhost:5174/api/status
```

### Gestionar Cache (Solo Desarrollo)
```bash
# Limpiar todo el cache
curl -X POST http://localhost:5174/api/admin/clear-cache

# Ver estadísticas de cache
curl http://localhost:5174/api/admin/stats | jq '.data.performance.cache'
```

### Verificar Compresión
```bash
# Con compresión
curl -H "Accept-Encoding: gzip" -v http://localhost:5174/api/status

# Sin compresión  
curl -v http://localhost:5174/api/status
```

### Probar Rate Limiting
```bash
# Hacer múltiples requests rápidos
for i in {1..10}; do
  echo "Request $i:"
  curl -w "Status: %{http_code}, Time: %{time_total}s\n" -s -o /dev/null http://localhost:5174/api/health
  sleep 0.1
done
```

## 📊 Monitoreo en Tiempo Real

### Logs de Servidor
El servidor muestra:
- Estadísticas de cache cada 5 minutos
- Métricas de rendimiento en headers
- Logs de errores en desarrollo

### Headers Útiles para Debug
```bash
curl -I http://localhost:5174/api/health
```

Busca estos headers:
- `X-Cache: HIT/MISS` - Estado del cache
- `Content-Encoding: gzip` - Compresión activa
- `Cache-Control` - Directivas de cache
- `ETag` - Validación de recursos

## 🎛️ Configuración por Entorno

### Desarrollo (NODE_ENV=development)
- Rate limiter en memoria (local)
- Logs detallados con Morgan
- Endpoints de administración habilitados
- CSP deshabilitado

### Producción (NODE_ENV=production)
- Rate limiter con Redis distribuido
- Logs combinados
- Endpoints admin protegidos
- CSP habilitado

### Variables de Entorno Opcionales
```env
# Para rate limiting distribuido
REDIS_URL=redis://localhost:6379

# Puerto personalizado
API_PORT=5174

# URL del frontend
FRONTEND_URL=https://tu-dominio.com
```

## 🚨 Solución de Problemas

### Puerto Ocupado
```bash
# El servidor reintentará automáticamente
# También puedes usar un puerto diferente
API_PORT=5175 npm run dev
```

### Dependencias Faltantes
```bash
# Instalar dependencias específicas
npm install compression lru-cache rate-limiter-flexible redis
```

### Redis No Disponible
- El servidor funcionará con rate limiter en memoria
- Logs mostrarán: "Rate Limiting: RateLimiterMemory"

### Cache No Funcionando
```bash
# Verificar estadísticas
curl http://localhost:5174/api/admin/stats

# Limpiar cache si es necesario
curl -X POST http://localhost:5174/api/admin/clear-cache
```

## 📈 Métricas de Rendimiento

### Métricas Esperadas
- **Latencia**: < 500ms promedio
- **Compresión**: 70-80% reducción de tamaño
- **Cache Hit Rate**: > 60% para endpoints cacheables
- **Throughput**: 30-50% incremento vs. versión original

### Benchmark Rápido
```bash
# Prueba de rendimiento con múltiples requests
time for i in {1..10}; do
  curl -s http://localhost:5174/api/status > /dev/null
done
```

## 🔗 Endpoints Disponibles

| Endpoint | Descripción | Cache | Rate Limit |
|----------|-------------|-------|------------|
| `GET /health` | Estado básico | No | ✅ |
| `GET /api/health` | API health check | 1 min | ✅ |
| `GET /api/status` | Estado detallado | 2 min | ✅ |
| `GET /api/admin/stats` | Estadísticas | 30 seg | ✅ |
| `POST /api/admin/clear-cache` | Limpiar cache | No | ✅ |

## 🎯 Próximos Pasos

1. **Instalar dependencias**: `npm install`
2. **Probar el servidor**: `npm run dev`
3. **Ejecutar pruebas**: `node src/server/test-optimizations.js`
4. **Revisar documentación**: `src/server/OPTIMIZACIONES.md`
5. **Configurar producción**: Añadir Redis y variables de entorno

---

**🎉 ¡El servidor TheFreed.v1 está ahora optimizado para máximo rendimiento!**