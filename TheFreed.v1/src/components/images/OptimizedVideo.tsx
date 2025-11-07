import React, { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useIntersectionObserver } from './useIntersectionObserver'

interface OptimizedVideoProps {
  src: string
  poster?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
  lazy?: boolean
  quality?: 'low' | 'medium' | 'high' | 'auto'
  onLoad?: () => void
  onError?: () => void
  onPlay?: () => void
  onPause?: () => void
  aspectRatio?: string
  preload?: 'none' | 'metadata' | 'auto'
}

export const OptimizedVideo: React.FC<OptimizedVideoProps> = ({
  src,
  poster,
  className,
  autoPlay = false,
  muted = true,
  loop = false,
  controls = true,
  lazy = true,
  quality = 'auto',
  onLoad,
  onError,
  onPlay,
  onPause,
  aspectRatio,
  preload = 'metadata'
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [currentSrc, setCurrentSrc] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
  }, [onError])

  const handlePlay = useCallback(() => {
    onPlay?.()
  }, [onPlay])

  const handlePause = useCallback(() => {
    onPause?.()
  }, [onPause])

  // Intersection Observer para lazy loading
  const { ref: containerRef, isIntersecting } = useIntersectionObserver({
    rootMargin: '200px', // Cargar 200px antes de que sea visible
    threshold: 0.1,
    onIntersect: () => setIsInView(true),
  })

  // Determinar calidad del video
  const getVideoQuality = useCallback((baseSrc: string, qualityLevel: string) => {
    if (qualityLevel === 'auto') return baseSrc

    const baseUrl = baseSrc.split('?')[0]
    const params = new URLSearchParams(baseSrc.includes('?') ? baseSrc.split('?')[1] : '')
    
    const qualityMap = {
      low: { bitrate: '500k', size: '480p' },
      medium: { bitrate: '1000k', size: '720p' },
      high: { bitrate: '2000k', size: '1080p' }
    }

    const qualitySettings = qualityMap[qualityLevel as keyof typeof qualityMap]
    if (qualitySettings) {
      params.set('bitrate', qualitySettings.bitrate)
      params.set('quality', qualitySettings.size)
    }

    return `${baseUrl}?${params.toString()}`
  }, [])

  // Cargar video cuando esté en vista
  useEffect(() => {
    if (isInView || !lazy) {
      const optimizedSrc = getVideoQuality(src, quality)
      setCurrentSrc(optimizedSrc)
    }
  }, [isInView, src, quality, lazy, getVideoQuality])

  const containerClasses = cn(
    'relative overflow-hidden',
    aspectRatio && `aspect-${aspectRatio.replace(':', '-')}`,
    className
  )

  const videoClasses = cn(
    'w-full h-full object-cover',
    !isLoaded && 'opacity-0',
    isLoaded && 'opacity-100 transition-opacity duration-300'
  )

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* Placeholder/Poster */}
      {!isLoaded && !hasError && poster && (
        <img
          src={poster}
          alt="Video poster"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Loading state */}
      {!isLoaded && !hasError && !poster && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-white">
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
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9 5a2 2 0 002 2h10a2 2 0 002-2m-1-5v4m0-2V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4"
              />
            </svg>
            <p className="text-sm">Error cargando video</p>
          </div>
        </div>
      )}

      {/* Video element */}
      {(isInView || !lazy) && currentSrc && (
        <video
          ref={videoRef}
          className={videoClasses}
          poster={poster}
          autoPlay={autoPlay && !lazy}
          muted={muted}
          loop={loop}
          controls={controls}
          preload={lazy ? 'none' : preload}
          onLoadedData={handleLoad}
          onError={handleError}
          onPlay={handlePlay}
          onPause={handlePause}
          playsInline
          webkit-playsinline="true"
          style={{
            filter: isLoaded ? 'none' : 'blur(2px)',
            transform: isLoaded ? 'none' : 'scale(1.02)',
          }}
        >
          <source src={currentSrc} type="video/mp4" />
          <source src={currentSrc.replace('.mp4', '.webm')} type="video/webm" />
          <source src={currentSrc.replace('.mp4', '.ogv')} type="video/ogg" />
          Tu navegador no soporta el elemento de video.
        </video>
      )}

      {/* Controles customizados si no se usan los nativos */}
      {!controls && isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-30">
          <button
            onClick={() => {
              if (videoRef.current) {
                if (videoRef.current.paused) {
                  videoRef.current.play()
                } else {
                  videoRef.current.pause()
                }
              }
            }}
            className="bg-white bg-opacity-80 rounded-full p-4 hover:bg-opacity-100 transition-all duration-200"
          >
            {videoRef.current?.paused ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default OptimizedVideo