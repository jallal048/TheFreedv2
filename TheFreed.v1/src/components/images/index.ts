// Components de optimización de imágenes y assets
export { useIntersectionObserver } from './useIntersectionObserver'
export { default as ImageOptimized } from './ImageOptimized'
export { default as ResponsiveImage } from './ResponsiveImage'
export { usePreloadAsset, usePreloadCriticalAssets, CriticalImage } from './PreloadAssets'
export { default as LazyImage } from './LazyImage'
export { default as AutoOptimizedImage } from './AutoOptimizedImage'
export { default as OptimizedVideo } from './OptimizedVideo'

// Types para los componentes
export interface ImageOptimizedProps {
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

export interface ResponsiveImageProps {
  src: string
  alt: string
  className?: string
  aspectRatio?: string
  quality?: number
  priority?: boolean
  breakpoints?: {
    sm?: string
    md?: string
    lg?: string
    xl?: string
    '2xl'?: string
  }
}

export interface LazyImageProps {
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

export interface OptimizedImageFormats {
  webp?: string
  avif?: string
  jpg?: string
  png?: string
  fallback?: string
}

export interface AutoOptimizedImageProps {
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

export interface OptimizedVideoProps {
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

// Utilidades para optimización
export const imageFormats = {
  WEBP: 'image/webp',
  AVIF: 'image/avif',
  JPEG: 'image/jpeg',
  PNG: 'image/png'
}

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}

export const imageSizes = {
  thumbnail: 150,
  small: 400,
  medium: 800,
  large: 1200,
  original: 1920
}