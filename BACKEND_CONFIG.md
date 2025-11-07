# Configuración del Backend - TheFreed.v1

## Estado Actual: Supabase como Backend Principal ✅

**Fecha:** 2025-11-07  
**Sistema:** TheFreed.v1 - Plataforma de Publicación de Contenido

---

## 🏗️ ARQUITECTURA DE BACKEND

### Backend Principal: **Supabase** (En Producción)
- **URL:** https://eaggsjqcsjzdjrkdjeog.supabase.co
- **Base de datos:** PostgreSQL con RLS (Row Level Security)
- **Storage:** Buckets para media files
- **Edge Functions:** Lógica de negocio (cron jobs, procesamiento)
- **Auth:** Autenticación integrada
- **Real-time:** Sincronización en tiempo real

### Backend de Desarrollo: **server-temp.js** (Para Testing)
- **Puerto:** 3001
- **Propósito:** Servidor temporal para desarrollo local
- **Endpoints:** API mock con datos demo

---

## 🔧 COMANDOS DE DESARROLLO

### Frontend (React + Vite)
```bash
pnpm dev:frontend
# Servidor en: http://localhost:5173
```

### Backend Temporal (Solo para testing)
```bash
pnpm dev:backend
# Servidor en: http://localhost:3001
```

### Ambos Servidores (Concurrently)
```bash
pnpm dev
# Ejecuta: pnpm dev:backend & pnpm dev:frontend
```

### Verificar Supabase
```bash
curl -f https://eaggsjqcsjzdjrkdjeog.supabase.co/rest/v1/contents \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhZ2dzanFjc2p6ZGpya2RqZW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDQzMzcsImV4cCI6MjA3ODAyMDMzN30.3UYBnXyumaceB6frWFEF2MC1n9WNm4qNkDQoy8qxdek"
```

---

## 📊 BASE DE DATOS SUPABASE

### Tablas Principales:
1. **`contents`** - Contenido publicado
2. **`drafts`** - Borradores con autoguardado  
3. **`scheduled_posts`** - Publicaciones programadas

### Storage Buckets:
- **`content-media`** - Archivos multimedia de contenidos

### Edge Functions:
- **`publish-scheduled-posts`** - Cron job de publicación automática

---

## 🔌 INTEGRACIÓN CON FRONTEND

### Servicio Principal: `/src/services/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eaggsjqcsjzdjrkdjeog.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### Funcionalidades Implementadas:
- ✅ **Autoguardado de drafts** cada 30 segundos
- ✅ **Publicación programada** con cron jobs
- ✅ **Upload de archivos** a Supabase Storage
- ✅ **Autenticación** de usuarios
- ✅ **Real-time** updates de contenido

---

## 🚀 FLUJO DE DESARROLLO

### Para Desarrollo Local:
1. **Frontend:** `pnpm dev:frontend` (puerto 5173)
2. **Backend:** `pnpm dev:backend` (puerto 3001) - opcional
3. **Supabase:** Disponible en línea automáticamente

### Para Producción:
- **Frontend:** Build y deploy estático
- **Backend:** 100% Supabase (no requiere servidor local)
- **Storage:** Supabase Storage + CDN
- **Functions:** Supabase Edge Functions

---

## ⚠️ NOTAS IMPORTANTES

### `minimal.js` - **ARCHIVO OBSOLETO**
- ❌ **NO USAR** - Archivo truncado y con errores
- ✅ **USAR** - `server-temp.js` para testing
- ✅ **PRODUCCIÓN** - Supabase como backend principal

### Dependencias Críticas:
```json
{
  "@supabase/supabase-js": "^2.80.0",
  "react-quill": "^2.0.0"
}
```

### Credenciales Supabase:
- **URL:** https://eaggsjqcsjzdjrkdjeog.supabase.co
- **Anon Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Service Role:** Disponible para edge functions

---

## 🔍 TROUBLESHOOTING

### Backend no inicia:
```bash
# Verificar sintaxis de server-temp.js
node -c server-temp.js

# Ejecutar server-temp.js directamente
node server-temp.js
```

### Supabase no responde:
```bash
# Verificar conectividad
curl -f https://eaggsjqcsjzdjrkdjeog.supabase.co/rest/v1/

# Verificar edge functions
curl -f https://eaggsjqcsjzdjrkdjeog.supabase.co/functions/v1/publish-scheduled-posts
```

### Frontend no conecta:
- Verificar que las credenciales de Supabase estén configuradas
- Verificar que el AuthContext esté inicializado
- Verificar CORS en Supabase dashboard

---

## 📈 PRÓXIMOS PASOS

1. **Eliminar** `minimal.js` completamente
2. **Optimizar** server-temp.js con más endpoints mock
3. **Migrar** todas las funcionalidades a Supabase
4. **Setup** de monitoreo y logs en producción

---

**Autor:** MiniMax Agent  
**Última actualización:** 2025-11-07  
**Versión:** TheFreed.v1 Backend Configuration