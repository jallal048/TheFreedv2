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