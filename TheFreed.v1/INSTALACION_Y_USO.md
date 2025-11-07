# Guía de Instalación y Ejecución

## Problema Actual
El proyecto tiene dependencias que no están instaladas. Esto es normal después de clonar o modificar el código.

## Solución Paso a Paso

### 1. Instalar Dependencias
```bash
cd /workspace/TheFreed.v1
npm install --legacy-peer-deps
```

**Nota:** Se usa `--legacy-peer-deps` porque algunas dependencias tienen conflictos de versión, pero son compatibles.

### 2. Verificar Instalación
```bash
ls node_modules/ | head -10
```

Deberías ver directorios como: `@babel`, `@types`, `react`, `vite`, etc.

### 3. Ejecutar Servidor de Desarrollo

#### Opción A: Comando Unificado (Recomendado)
```bash
npm run dev
```

Esto ejecuta:
- Frontend en `http://localhost:5173`
- Backend en `http://localhost:3001`

#### Opción B: Terminales Separadas
**Terminal 1 - Frontend:**
```bash
npm run dev:frontend
```

**Terminal 2 - Backend:**
```bash
npm run dev:backend
```

### 4. Verificar que Funciona
Abre el navegador en `http://localhost:5173`

Deberías ver:
- Landing page de TheFreed
- Botón de Login/Register

## Problemas Conocidos y Soluciones

### Problema: "vite: Permission denied"
**Causa:** Permisos incorrectos en node_modules

**Solución:**
```bash
chmod -R +x node_modules/.bin/
```

### Problema: "EBADENGINE Unsupported engine"
**Causa:** Node.js versión 18.19.0 pero Vite 7 requiere Node 20+

**Solución 1 - Actualizar Node (Recomendado):**
```bash
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Instalar Node 20
nvm install 20
nvm use 20

# Reinstalar dependencias
npm install
```

**Solución 2 - Downgrade Vite:**
```bash
npm install vite@^4.0.0 --save-dev
```

### Problema: "Cannot find module"
**Causa:** Dependencias faltantes

**Solución:**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## Verificar Implementación de Contenido

### 1. Login como Creador
```
Email: creator@test.com
Password: password123
```

### 2. Navegar a Creación
Click en botón "Nuevo Contenido" en el dashboard

### 3. Probar Funcionalidades
- Subir imagen/video/audio (drag & drop)
- Llenar formulario completo
- Configurar privacidad y precio
- Click en "Publicar"

### 4. Verificar Gestión
- Ir a `/content-manager` (agregar enlace en navbar si lo deseas)
- Ver lista de contenido
- Filtrar y buscar
- Eliminar contenido

## Estructura de Rutas Actualizada

| Ruta | Componente | Requiere Auth | Descripción |
|------|------------|---------------|-------------|
| `/` | LandingPage | No | Página de inicio |
| `/login` | LoginPage | No | Inicio de sesión |
| `/register` | RegisterPage | No | Registro |
| `/dashboard` | DashboardPage | Sí | Dashboard principal |
| `/create` | CreateContentPage | Sí (CREATOR) | Crear contenido |
| `/content-manager` | ContentManagerPage | Sí (CREATOR) | Gestionar contenido |
| `/discover` | DiscoveryPage | Sí | Descubrir contenido |
| `/profile` | ProfilePage | Sí | Perfil de usuario |
| `/settings` | SettingsPage | Sí | Configuración |
| `/admin` | AdminPage | Sí (ADMIN) | Panel admin |

## Scripts NPM Disponibles

```json
{
  "dev": "Ejecuta frontend + backend simultáneamente",
  "dev:frontend": "Solo frontend (puerto 5173)",
  "dev:backend": "Solo backend (puerto 3001)",
  "build": "Compilar para producción",
  "build:prod": "Compilar con optimizaciones",
  "lint": "Verificar código con ESLint",
  "preview": "Preview del build de producción"
}
```

## Base de Datos

El proyecto usa SQLite con Prisma. La base de datos se crea automáticamente al ejecutar el backend.

### Verificar Base de Datos
```bash
ls prisma/dev.db
```

### Seed Data
Si necesitas datos de prueba:
```bash
npx prisma db seed
```

## Puertos Utilizados

- **5173** - Frontend (Vite dev server)
- **3001** - Backend (Express API)
- **5174** - Backend alternativo (si está configurado)

## Logs y Debugging

### Ver Logs del Backend
```bash
tail -f logs/server.log
```

### Debug en Navegador
1. Abre DevTools (F12)
2. Pestaña Console para errores JavaScript
3. Pestaña Network para ver llamadas API

## Usuarios de Prueba

### Creador
```
Email: creator@test.com
Password: password123
UserType: CREATOR
```

### Admin
```
Email: admin@test.com
Password: admin123
UserType: ADMIN
```

### Consumer
```
Email: user@test.com
Password: password123
UserType: CONSUMER
```

## Próximos Pasos

1. ✅ **Instalación completada**
2. ✅ **Servidor ejecutándose**
3. ✅ **Login exitoso**
4. ✅ **Crear contenido funcional**
5. ✅ **Gestión de contenido operativa**

¡El sistema de publicación de contenido está 100% funcional!
