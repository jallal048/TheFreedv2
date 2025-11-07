import React from 'react'
import { 
  ImageOptimized, 
  ResponsiveImage, 
  LazyImage, 
  AutoOptimizedImage,
  OptimizedVideo,
  CriticalImage,
  useCriticalImages,
  useCriticalFonts,
  useCriticalStyles
} from './index'

// Datos de ejemplo para assets críticos
const criticalImages = [
  '/images/hero-image.jpg',
  '/images/logo.png',
  '/images/avatar-default.webp'
]

const criticalFonts = [
  '/fonts/inter-var.woff2',
  '/fonts/inter-italic.woff2'
]

const criticalStyles = [
  '/css/critical.css',
  '/css/components.css'
]

// Componente de ejemplo para mostrar todas las optimizaciones
export const ImageOptimizationDemo: React.FC = () => {
  // Hook para assets críticos
  const { loadedAssets, isLoading, progress } = useCriticalImages(criticalImages, {
    preloadDelay: 100,
    priority: 'high'
  })

  useCriticalFonts(criticalFonts, {
    preloadDelay: 200,
    display: 'swap'
  })

  useCriticalStyles(criticalStyles, {
    preloadDelay: 50
  })

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12">
      {/* Header con progreso de carga */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Optimización de Imágenes Demo
        </h1>
        
        {isLoading && (
          <div className="w-full max-w-md mx-auto mb-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Cargando assets críticos... {Math.round(progress * 100)}%
            </p>
          </div>
        )}
      </div>

      {/* 1. Imagen Optimizada Básica */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          1. Imagen Optimizada Básica
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Con WebP/AVIF fallback</h3>
            <ImageOptimized
              src="/images/sample-image.jpg"
              srcSet={{
                webp: "/images/sample-image.webp",
                avif: "/images/sample-image.avif", 
                fallback: "/images/sample-image.jpg"
              }}
              alt="Imagen optimizada con múltiples formatos"
              className="w-full h-64 object-cover rounded-lg shadow-lg"
              placeholder="blur"
              quality={85}
              aspectRatio="16/9"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Con placeholder color</h3>
            <ImageOptimized
              src="/images/landscape.jpg"
              alt="Imagen con placeholder color"
              className="w-full h-64 object-cover rounded-lg shadow-lg"
              placeholder="color"
              placeholderColor="#e0e7ff"
              aspectRatio="4/3"
            />
          </div>
        </div>
      </section>

      {/* 2. Imagen Responsive */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          2. Imagen Responsive Automática
        </h2>
        
        <ResponsiveImage
          src="/images/responsive-sample.jpg"
          alt="Imagen responsive con múltiples breakpoints"
          className="w-full rounded-lg shadow-lg"
          aspectRatio="21/9"
          quality={80}
          breakpoints={{
            sm: '640px',
            md: '768px',
            lg: '1024px', 
            xl: '1280px',
            '2xl': '1536px'
          }}
        />
      </section>

      {/* 3. Lazy Loading con reintentos */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          3. Lazy Loading Avanzado
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Skeleton placeholder</h3>
            <LazyImage
              src="/images/gallery-1.jpg"
              srcSet={{
                webp: "/images/gallery-1.webp",
                fallback: "/images/gallery-1.jpg"
              }}
              alt="Lazy load con skeleton"
              className="w-full h-48 object-cover rounded-lg shadow-lg"
              placeholder="skeleton"
              retryCount={3}
              retryDelay={2000}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Blur placeholder</h3>
            <LazyImage
              src="/images/gallery-2.jpg"
              alt="Lazy load con blur"
              className="w-full h-48 object-cover rounded-lg shadow-lg"
              placeholder="blur"
              threshold={0.2}
              rootMargin="150px"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Color placeholder</h3>
            <LazyImage
              src="/images/gallery-3.jpg"
              alt="Lazy load con color"
              className="w-full h-48 object-cover rounded-lg shadow-lg"
              placeholder="color"
            />
          </div>
        </div>
      </section>

      {/* 4. Auto Optimizada */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          4. Optimización Automática Completa
        </h2>
        
        <AutoOptimizedImage
          src="/images/auto-optimized.jpg"
          alt="Imagen con optimización automática"
          className="w-full rounded-lg shadow-lg"
          formats={{
            webp: "/images/auto-optimized.webp",
            avif: "/images/auto-optimized.avif",
            fallback: "/images/auto-optimized.jpg"
          }}
          sizes={{
            thumbnail: "/images/auto-optimized-thumb.jpg",
            small: "/images/auto-optimized-small.jpg", 
            medium: "/images/auto-optimized-medium.jpg",
            large: "/images/auto-optimized-large.jpg",
            original: "/images/auto-optimized.jpg"
          }}
          quality={85}
          compressionLevel="medium"
          placeholder="blur"
          lazy={true}
        />
      </section>

      {/* 5. Imagen Crítica (preload) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          5. Imagen Crítica (Preload)
        </h2>
        
        <div className="text-center">
          <CriticalImage
            src="/images/hero-critical.jpg"
            alt="Imagen crítica con preload"
            className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
          />
          <p className="text-sm text-gray-600 mt-2">
            Esta imagen se precarga con prioridad alta
          </p>
        </div>
      </section>

      {/* 6. Video Optimizado */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          6. Video Optimizado
        </h2>
        
        <OptimizedVideo
          src="/videos/sample-video.mp4"
          poster="/images/video-poster.jpg"
          className="w-full rounded-lg shadow-lg"
          autoPlay={false}
          muted={true}
          loop={true}
          controls={true}
          lazy={true}
          quality="medium"
          aspectRatio="16/9"
          onLoad={() => console.log('Video loaded')}
          onPlay={() => console.log('Video playing')}
          onPause={() => console.log('Video paused')}
        />
      </section>

      {/* 7. Galería con lazy loading */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          7. Galería con Lazy Loading
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <LazyImage
              key={i}
              src={`/images/gallery-item-${i + 1}.jpg`}
              alt={`Galería item ${i + 1}`}
              className="w-full h-32 object-cover rounded-lg shadow-md"
              placeholder="skeleton"
              threshold={0.1}
              rootMargin="100px"
            />
          ))}
        </div>
      </section>

      {/* Información de rendimiento */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Información de Rendimiento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-700">Assets Críticos Cargados:</h4>
            <p className="text-gray-600">{loadedAssets.size} de {criticalImages.length}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700">Progreso de Carga:</h4>
            <p className="text-gray-600">{Math.round(progress * 100)}%</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700">Estado:</h4>
            <p className={`${isLoading ? 'text-yellow-600' : 'text-green-600'}`}>
              {isLoading ? 'Cargando...' : 'Completo'}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ImageOptimizationDemo