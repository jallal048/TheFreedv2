#!/bin/bash

# Script de configuración para optimización de imágenes y assets
# Proyecto: TheFreed.v1

echo "=== CONFIGURACIÓN DE OPTIMIZACIÓN DE IMÁGENES ==="
echo "Proyecto: TheFreed.v1"
echo "Fecha: $(date)"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

section() {
    echo -e "\n${CYAN}=== $1 ===${NC}"
}

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

section "1. Verificando dependencias"

# Instalar dependencias de optimización de imágenes
if ! command -v npm &> /dev/null; then
    error "npm no está instalado"
    exit 1
fi

log "Instalando dependencias para optimización de imágenes..."
npm install sharp --save-dev

log "Instalando plugins de Tailwind CSS..."
npm install @tailwindcss/aspect-ratio @tailwindcss/typography @tailwindcss/forms --save-dev

section "2. Configurando Vite"

# Backup del vite.config.ts original si existe
if [ -f "vite.config.ts" ]; then
    cp vite.config.ts vite.config.ts.backup
    log "Backup de vite.config.ts creado"
fi

# Crear configuración optimizada de Vite
log "Configurando Vite para optimización de assets..."
if [ -f "vite.config.optimized.ts" ]; then
    cp vite.config.optimized.ts vite.config.ts
    log "Configuración optimizada de Vite aplicada"
else
    warning "vite.config.optimized.ts no encontrado, usando configuración actual"
fi

section "3. Configurando Tailwind CSS"

# Backup del tailwind.config.js original si existe
if [ -f "tailwind.config.js" ]; then
    cp tailwind.config.js tailwind.config.js.backup
    log "Backup de tailwind.config.js creado"
fi

# Crear configuración optimizada de Tailwind
log "Configurando Tailwind CSS para optimización de imágenes..."
if [ -f "tailwind.config.optimized.js" ]; then
    cp tailwind.config.optimized.js tailwind.config.js
    log "Configuración optimizada de Tailwind aplicada"
else
    warning "tailwind.config.optimized.js no encontrado, usando configuración actual"
fi

section "4. Creando estructura de directorios"

# Crear directorios para assets optimizados
log "Creando estructura de directorios..."
mkdir -p public/images/optimized
mkdir -p public/images/responsive
mkdir -p public/videos/optimized
mkdir -p public/fonts/optimized
mkdir -p src/assets/images
mkdir -p src/assets/videos

log "Directorios creados:"
echo "  - public/images/optimized/"
echo "  - public/images/responsive/"
echo "  - public/videos/optimized/"
echo "  - public/fonts/optimized/"
echo "  - src/assets/images/"
echo "  - src/assets/videos/"

section "5. Configurando script de optimización"

# Hacer el script de optimización ejecutable
if [ -f "optimize-images.js" ]; then
    chmod +x optimize-images.js
    log "Script de optimización configurado"
else
    warning "optimize-images.js no encontrado"
fi

section "6. Actualizando package.json"

# Crear scripts adicionales en package.json si no existen
log "Añadiendo scripts de optimización..."

# Verificar si jq está disponible para modificar JSON
if command -v jq &> /dev/null; then
    # Backup del package.json
    cp package.json package.json.backup
    
    # Añadir scripts de optimización
    jq '.scripts += {
        "optimize:images": "node optimize-images.js",
        "optimize:build": "npm run optimize:images && npm run build",
        "optimize:watch": "nodemon --watch public/images --ext jpg,jpeg,png,gif --exec \"npm run optimize:images\"",
        "analyze:bundle": "npm run build && npx vite-bundle-analyzer"
    }' package.json > package.json.tmp && mv package.json.tmp package.json
    
    log "Scripts de optimización añadidos a package.json"
else
    warning "jq no está instalado. Scripts no añadidos automáticamente."
    info "Puedes añadir manualmente los siguientes scripts a package.json:"
    echo '  "optimize:images": "node optimize-images.js",'
    echo '  "optimize:build": "npm run optimize:images && npm run build",'
    echo '  "optimize:watch": "nodemon --watch public/images --ext jpg,jpeg,png,gif --exec \"npm run optimize:images\"",'
    echo '  "analyze:bundle": "npm run build && npx vite-bundle-analyzer"'
fi

section "7. Creando archivo de configuración"

# Crear archivo de configuración para optimización
cat > image-optimization.config.js << 'EOF'
// Configuración de optimización de imágenes para TheFreed.v1
module.exports = {
  // Configuración general
  general: {
    inputDir: 'public/images',
    outputDir: 'public/images/optimized',
    responsiveDir: 'public/images/responsive',
    watchDir: 'public/images',
    backupDir: 'public/images/backup'
  },
  
  // Configuración de formatos
  formats: {
    webp: {
      enabled: true,
      qualities: [90, 75, 60],
      effort: 6
    },
    avif: {
      enabled: true, 
      qualities: [85, 70, 55],
      effort: 9
    },
    jpeg: {
      enabled: true,
      qualities: [90, 80, 70],
      mozjpeg: true
    },
    png: {
      enabled: true,
      qualities: [90, 80, 70],
      compressionLevel: 9
    }
  },
  
  // Configuración de tamaños
  sizes: {
    thumbnail: 150,
    small: 400,
    medium: 800,
    large: 1200,
    xlarge: 1600,
    original: 1920
  },
  
  // Configuración de breakpoints
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  },
  
  // Configuración de lazy loading
  lazyLoading: {
    rootMargin: '100px',
    threshold: 0.1,
    retryCount: 3,
    retryDelay: 1000
  },
  
  // Configuración de preload
  preload: {
    criticalImages: [],
    criticalFonts: [],
    preloadDelay: 0,
    fetchPriority: 'high'
  }
}
EOF

log "Archivo de configuración creado: image-optimization.config.js"

section "8. Documentación"

# Crear documentación de uso
cat > IMAGE_OPTIMIZATION_USAGE.md << 'EOF'
# Guía de Uso - Optimización de Imágenes TheFreed.v1

## Componentes Disponibles

### 1. ImageOptimized
Componente principal para optimización de imágenes con lazy loading.

```tsx
import { ImageOptimized } from '@/components/images'

<ImageOptimized
  src="/images/sample.jpg"
  srcSet={{
    webp: "/images/sample.webp",
    avif: "/images/sample.avif",
    fallback: "/images/sample.jpg"
  }}
  alt="Descripción de la imagen"
  className="w-full h-64 object-cover"
  placeholder="blur"
  quality={85}
  priority={false}
/>
```

### 2. ResponsiveImage
Componente para imágenes completamente responsivas.

```tsx
import { ResponsiveImage } from '@/components/images'

<ResponsiveImage
  src="/images/responsive.jpg"
  alt="Imagen responsive"
  className="w-full"
  aspectRatio="16/9"
  quality={80}
  breakpoints={{
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }}
/>
```

### 3. LazyImage
Componente con lazy loading avanzado y sistema de reintentos.

```tsx
import { LazyImage } from '@/components/images'

<LazyImage
  src="/images/gallery.jpg"
  alt="Imagen con lazy loading"
  className="w-full h-48 object-cover"
  placeholder="skeleton"
  retryCount={3}
  retryDelay={2000}
  threshold={0.2}
/>
```

### 4. AutoOptimizedImage
Optimización automática con múltiples formatos y calidades.

```tsx
import { AutoOptimizedImage } from '@/components/images'

<AutoOptimizedImage
  src="/images/auto.jpg"
  alt="Optimización automática"
  formats={{
    webp: "/images/auto.webp",
    avif: "/images/auto.avif",
    fallback: "/images/auto.jpg"
  }}
  compressionLevel="medium"
  lazy={true}
/>
```

### 5. OptimizedVideo
Componente para optimización de videos.

```tsx
import { OptimizedVideo } from '@/components/images'

<OptimizedVideo
  src="/videos/sample.mp4"
  poster="/images/video-poster.jpg"
  className="w-full"
  autoPlay={false}
  muted={true}
  controls={true}
  lazy={true}
  quality="medium"
/>
```

## Hooks Personalizados

### useIntersectionObserver
Hook para detectar cuando un elemento entra en el viewport.

```tsx
import { useIntersectionObserver } from '@/components/images'

const { ref, isIntersecting, hasBeenVisible } = useIntersectionObserver({
  rootMargin: '50px',
  threshold: 0.1,
  onIntersect: () => console.log('Element visible')
})
```

### useCriticalAssets
Hook para preload de assets críticos.

```tsx
import { useCriticalImages } from '@/hooks/useCriticalAssets'

const { loadedAssets, isLoading, progress } = useCriticalImages([
  '/images/hero.jpg',
  '/images/logo.png'
], {
  preloadDelay: 100,
  priority: 'high'
})
```

## Scripts Disponibles

### Optimización de Imágenes
```bash
# Optimizar todas las imágenes
npm run optimize:images

# Optimizar y hacer build
npm run optimize:build

# Optimización en modo watch
npm run optimize:watch

# Analizar bundle
npm run analyze:bundle
```

## Configuración

La configuración se encuentra en `image-optimization.config.js`. Puedes personalizar:

- Formatos de salida (WebP, AVIF, JPEG, PNG)
- Calidades de compresión
- Tamaños responsivos
- Breakpoints
- Configuración de lazy loading
- Assets críticos para preload

## Mejores Prácticas

1. **Usar WebP/AVIF**: Proporciona múltiples formatos para mejor compatibilidad
2. **Lazy Loading**: Actívalo por defecto para imágenes no críticas
3. **Preload**: Solo para imágenes Above the Fold críticas
4. **Placeholder**: Usa "blur" para mejor UX
5. **Responsive**: Siempre especifica sizes para mejor optimización
6. **Compresión**: Usa quality 75-85 como equilibrio óptimo

## Ejemplo Completo

Ver `src/components/images/ImageOptimizationDemo.tsx` para un ejemplo completo de uso.
EOF

log "Documentación creada: IMAGE_OPTIMIZATION_USAGE.md"

section "9. Verificación final"

# Verificar que todos los archivos están en su lugar
required_files=(
    "src/components/images/useIntersectionObserver.ts"
    "src/components/images/ImageOptimized.tsx"
    "src/components/images/ResponsiveImage.tsx"
    "src/components/images/LazyImage.tsx"
    "src/components/images/AutoOptimizedImage.tsx"
    "src/components/images/OptimizedVideo.tsx"
    "src/components/images/PreloadAssets.tsx"
    "src/components/images/index.ts"
    "src/hooks/useCriticalAssets.ts"
    "src/components/images/ImageOptimizationDemo.tsx"
    "optimize-images.js"
    "image-optimization.config.js"
    "IMAGE_OPTIMIZATION_USAGE.md"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    log "Todos los archivos están en su lugar"
else
    error "Archivos faltantes:"
    printf '  - %s\n' "${missing_files[@]}"
fi

section "10. Instrucciones finales"

echo -e "${GREEN}¡Configuración completada!${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Ejecuta 'npm run optimize:images' para optimizar las imágenes existentes"
echo "2. Revisa IMAGE_OPTIMIZATION_USAGE.md para la documentación completa"
echo "3. Importa los componentes desde '@/components/images'"
echo "4. Configura tus assets críticos en image-optimization.config.js"
echo ""
echo "Scripts útiles:"
echo "  npm run optimize:images    # Optimizar imágenes"
echo "  npm run optimize:build     # Optimizar + build"
echo "  npm run optimize:watch     # Watch mode"
echo ""
echo -e "${BLUE}¡El sistema de optimización de imágenes está listo para usar!${NC}"