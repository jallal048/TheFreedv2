import React, { useState, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useIntersectionObserver } from './useIntersectionObserver'

interface LazyImageProps {
  src: string
  srcSet?: {
    webp?: string
    avif?: string
    fallback?: string
  }
  alt: string
  className?: string
  placeholder?: 'blur' | 'empty' | 'skeleton' | 'color'
  threshold?: number
  rootMargin?: string
  loading?: 'lazy' | 'eager'
  quality?: number
  aspectRatio?: string
  onLoad?: () => void
  onError?: () => void
  priority?: boolean
  retryCount?: number
  retryDelay?: number
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  srcSet,
  alt,
  className,
  placeholder = 'skeleton',
  threshold = 0.1,
  rootMargin = '100px',
  loading = 'lazy',
  quality = 85,
  aspectRatio,
  onLoad,
  onError,
  priority = false,
  retryCount = 3,
  retryDelay = 1000
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [retryAttempts, setRetryAttempts] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    setIsRetrying(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsRetrying(false)
    onError?.()
  }, [onError])

  const retryLoad = useCallback(() => {
    if (retryAttempts < retryCount) {
      setIsRetrying(true)
      setHasError(false)
      setRetryAttempts(prev => prev + 1)
      setTimeout(() => {
        // Forzar re-carga de la imagen
        const img = document.querySelector(`img[data-src="${src}"]`) as HTMLImageElement
        if (img) {
          img.src = ''
          img.src = src
        }
      }, retryDelay)
    }
  }, [src, retryAttempts, retryCount, retryDelay])

  // Intersection Observer con configuración avanzada
  const { ref: containerRef, isIntersecting, hasBeenVisible } = useIntersectionObserver({
    rootMargin,
    threshold,
    freezeOnceVisible: false, // Permitir re-intersección para reintentos
    onIntersect: (entry) => {
      // Configurar observador para reintentos
      if (hasError && retryAttempts < retryCount) {
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            retryLoad()
          }
        }, { rootMargin: '50px', threshold: 0.1 })
        
        observer.observe(entry.target)
      }
    }
  })

  // Determinar el src principal basado en soporte del navegador
  const mainSrc = useMemo(() => {
    if (typeof window === 'undefined') return src

    // Verificar soporte para WebP
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    
    if (srcSet?.webp && canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      return srcSet.webp
    }
    
    if (srcSet?.avif) {
      return srcSet.avif
    }
    
    return srcSet?.fallback || src
  }, [src, srcSet])

  // Clases condicionales
  const containerClasses = cn(
    'relative overflow-hidden',
    aspectRatio && `aspect-${aspectRatio.replace(':', '-')}`,
    className
  )

  const imageClasses = cn(
    'transition-all duration-500 ease-in-out',
    isLoaded 
      ? 'opacity-100 scale-100 blur-0' 
      : 'opacity-0 scale-105 blur-sm',
    isRetrying && 'animate-pulse'
  )

  // Componente de placeholder skeleton
  const SkeletonPlaceholder = () => (
    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" 
         style={{
           backgroundSize: '200% 100%',
           animation: 'shimmer 1.5s ease-in-out infinite'
         }}>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-400/20 to-transparent" />
    </div>
  )

  // Componente de placeholder color
  const ColorPlaceholder = ({ color = '#f3f4f6' }: { color?: string }) => (
    <div 
      className="absolute inset-0 animate-pulse" 
      style={{ backgroundColor: color }}
    />
  )

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* Placeholder - solo mostrar si no está cargado y no hay error */}
      {!isLoaded && !hasError && (
        <>
          {placeholder === 'skeleton' && <SkeletonPlaceholder />}
          {placeholder === 'color' && <ColorPlaceholder />}
          {placeholder === 'empty' && (
            <div className="absolute inset-0 bg-gray-100" />
          )}
        </>
      )}

      {/* Estado de error */}
      {hasError && !isRetrying && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <div className="text-center p-4">
            <svg
              className="mx-auto h-8 w-8 mb-2"
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
            <button
              onClick={retryLoad}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Estado de reintento */}
      {isRetrying && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Reintentando...</p>
          </div>
        </div>
      )}

      {/* Imagen - solo renderizar cuando esté en vista o sea prioritario */}
      {(isIntersecting || priority || hasBeenVisible) && !isRetrying && (
        <img
          data-src={src}
          src={mainSrc}
          alt={alt}
          className={imageClasses}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : loading}
          decoding="async"
          quality={quality}
          {...(srcSet && {
            srcSet: Object.entries(srcSet)
              .map(([format, url]) => `${url} ${format}`)
              .join(', ')
          })}
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

export default LazyImage