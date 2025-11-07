import React, { useState, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageFormats {
  webp?: string
  avif?: string
  jpg?: string
  png?: string
  fallback?: string
}

interface AutoOptimizedImageProps {
  src: string
  alt: string
  className?: string
  formats?: OptimizedImageFormats
  quality?: number
  sizes?: {
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
    original?: string
  }
  aspectRatio?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  lazy?: boolean
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
  placeholder?: 'blur' | 'empty' | 'color'
  placeholderColor?: string
  compressionLevel?: 'low' | 'medium' | 'high' | 'maximum'
}

export const AutoOptimizedImage: React.FC<AutoOptimizedImageProps> = ({
  src,
  alt,
  className,
  formats,
  quality = 85,
  sizes,
  aspectRatio,
  objectFit = 'cover',
  lazy = true,
  priority = false,
  onLoad,
  onError,
  placeholder = 'blur',
  placeholderColor = '#f3f4f6',
  compressionLevel = 'medium'
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentFormat, setCurrentFormat] = useState<string | null>(null)

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
  }, [onError])

  // Detectar soporte del navegador para diferentes formatos
  const formatSupport = useMemo(() => {
    if (typeof window === 'undefined') return { webp: true, avif: true }

    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1

    return {
      webp: canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0,
      avif: (() => {
        try {
          const avifCanvas = document.createElement('canvas')
          avifCanvas.width = 1
          avifCanvas.height = 1
          return avifCanvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
        } catch {
          return false
        }
      })()
    }
  }, [])

  // Generar URLs optimizadas con diferentes parámetros
  const generateOptimizedUrls = useCallback((baseSrc: string) => {
    const baseUrl = baseSrc.split('?')[0]
    const queryParams = baseSrc.includes('?') ? baseSrc.split('?')[1] : ''

    const sizes_map = {
      thumbnail: 150,
      small: 400,
      medium: 800,
      large: 1200,
      original: 1920
    }

    const urls: Record<string, string> = {}

    Object.entries(sizes_map).forEach(([key, width]) => {
      const params = new URLSearchParams(queryParams)
      params.set('w', width.toString())
      params.set('q', quality.toString())
      
      if (compressionLevel !== 'medium') {
        const compressionMap = {
          low: 90,
          medium: 75,
          high: 60,
          maximum: 45
        }
        params.set('q', compressionMap[compressionLevel].toString())
      }
      
      urls[key] = `${baseUrl}?${params.toString()}`
    })

    return urls
  }, [quality, compressionLevel])

  // Seleccionar el mejor formato disponible
  const selectedFormat = useMemo(() => {
    if (!formats) return null

    if (formatSupport.avif && formats.avif) return 'avif'
    if (formatSupport.webp && formats.webp) return 'webp'
    if (formats.jpg) return 'jpg'
    if (formats.png) return 'png'
    return formats.fallback || 'jpg'
  }, [formats, formatSupport])

  // Generar srcSet responsivo
  const generateSrcSet = useCallback((format: string) => {
    if (!sizes || !formats) return undefined

    const urls = generateOptimizedUrls(formats[format as keyof OptimizedImageFormats] || src)
    
    return Object.entries(urls)
      .map(([size, url]) => `${url} ${size}`)
      .join(', ')
  }, [src, formats, sizes, generateOptimizedUrls])

  // Componente de placeholder
  const Placeholder = () => {
    if (placeholder === 'empty') return null

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

  return (
    <div className={containerClasses}>
      {/* Placeholder */}
      {!isLoaded && !hasError && <Placeholder />}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 mb-2"
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
            <p className="text-sm">Error cargando imagen</p>
            <p className="text-xs text-gray-500 mt-1">{currentFormat}</p>
          </div>
        </div>
      )}

      {/* Imagen principal */}
      {selectedFormat && (
        <img
          src={formats?.[selectedFormat as keyof OptimizedImageFormats] || src}
          alt={alt}
          className={imageClasses}
          onLoad={(e) => {
            setCurrentFormat(selectedFormat)
            handleLoad()
          }}
          onError={handleError}
          loading={priority ? 'eager' : (lazy ? 'lazy' : 'eager')}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          {...(generateSrcSet(selectedFormat) && {
            srcSet: generateSrcSet(selectedFormat)
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

export default AutoOptimizedImage