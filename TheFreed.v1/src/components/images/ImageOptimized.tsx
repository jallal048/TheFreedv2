import React, { useState, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useIntersectionObserver } from './useIntersectionObserver'

interface ImageOptimizedProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  srcSet?: {
    webp?: string
    avif?: string
    fallback?: string
  }
  sizes?: string
  alt: string
  placeholder?: 'blur' | 'empty' | 'color'
  placeholderColor?: string
  quality?: number
  priority?: boolean
  className?: string
  onLoad?: () => void
  onError?: () => void
  loading?: 'lazy' | 'eager'
  aspectRatio?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
}

export const ImageOptimized: React.FC<ImageOptimizedProps> = ({
  src,
  srcSet,
  sizes = '100vw',
  alt,
  placeholder = 'empty',
  placeholderColor = '#f3f4f6',
  quality = 85,
  priority = false,
  className,
  onLoad,
  onError,
  loading = 'lazy',
  aspectRatio,
  objectFit = 'cover',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority)

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
  }, [onError])

  // Intersection Observer para lazy loading
  const { ref: imageRef, isIntersecting } = useIntersectionObserver({
    rootMargin: '50px', // Cargar 50px antes de que sea visible
    threshold: 0.1,
    onIntersect: () => setIsInView(true),
  })

  // Configurar srcSet basado en los formatos disponibles
  const imageSrcSet = useMemo(() => {
    if (!srcSet) return undefined

    const set: Record<string, string> = {}
    
    if (srcSet.webp) {
      set['image/webp'] = srcSet.webp
    }
    if (srcSet.avif) {
      set['image/avif'] = srcSet.avif
    }
    if (srcSet.fallback) {
      set['image/jpeg'] = srcSet.fallback
    }

    return set
  }, [srcSet])

  // Determinar la fuente principal
  const mainSrc = useMemo(() => {
    if (typeof window !== 'undefined') {
      // Verificar soporte para WebP y AVIF
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      
      if (srcSet?.webp && canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
        return srcSet.webp
      }
      
      if (srcSet?.avif) {
        return srcSet.avif
      }
    }
    
    return srcSet?.fallback || src
  }, [src, srcSet])

  // Clases de estilo
  const containerClasses = cn(
    'relative overflow-hidden',
    aspectRatio && `aspect-${aspectRatio.replace(':', '-')}`,
    className
  )

  const imageClasses = cn(
    'transition-opacity duration-300',
    isLoaded ? 'opacity-100' : 'opacity-0',
    objectFit === 'cover' && 'object-cover',
    objectFit === 'contain' && 'object-contain',
    objectFit === 'fill' && 'object-fill',
    objectFit === 'none' && 'object-none',
    objectFit === 'scale-down' && 'object-scale-down'
  )

  // Placeholder component
  const Placeholder = () => {
    if (placeholder === 'empty') return null

    if (placeholder === 'color') {
      return (
        <div
          className="absolute inset-0 animate-pulse"
          style={{ backgroundColor: placeholderColor }}
        />
      )
    }

    // Placeholder con blur
    return (
      <div
        className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"
        style={{
          background: `linear-gradient(90deg, ${placeholderColor} 25%, ${placeholderColor}50 50%, ${placeholderColor} 75%)`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite'
        }}
      />
    )
  }

  return (
    <div ref={imageRef} className={containerClasses}>
      {/* Placeholder */}
      {!isLoaded && !hasError && <Placeholder />}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="mt-2 text-sm">Error cargando imagen</p>
          </div>
        </div>
      )}

      {/* Imagen principal */}
      {isInView && (
        <img
          {...props}
          src={mainSrc}
          alt={alt}
          className={imageClasses}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : loading}
          sizes={sizes}
          {...(imageSrcSet && { srcSet: Object.entries(imageSrcSet)
            .map(([format, url]) => `${url} ${format}`)
            .join(', ')
          })}
          decoding="async"
          style={{
            filter: isLoaded ? 'none' : 'blur(0.5px)',
            transform: isLoaded ? 'none' : 'scale(1.05)',
          }}
        />
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}

export default ImageOptimized