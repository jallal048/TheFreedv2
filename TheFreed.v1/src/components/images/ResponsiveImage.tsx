import React from 'react'
import { ImageOptimized } from './ImageOptimized'

interface ResponsiveImageProps {
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

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className,
  aspectRatio,
  quality = 85,
  priority = false,
  breakpoints
}) => {
  // Generar URLs para diferentes tamaños
  const generateSrcSet = (baseSrc: string, sizes: number[]) => {
    return sizes.map(size => `${baseSrc}?w=${size}&q=${quality} ${size}w`).join(', ')
  }

  // Breakpoints por defecto
  const defaultBreakpoints = {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }

  const activeBreakpoints = breakpoints || defaultBreakpoints

  // Generar sizes string
  const sizes = `(max-width: ${activeBreakpoints.sm}) 100vw,
                 (max-width: ${activeBreakpoints.md}) 50vw,
                 (max-width: ${activeBreakpoints.lg}) 33vw,
                 (max-width: ${activeBreakpoints.xl}) 25vw,
                 (max-width: ${activeBreakpoints['2xl']}) 20vw,
                 16vw`

  return (
    <ImageOptimized
      src={src}
      srcSet={{
        webp: generateSrcSet(src.replace(/\.(jpg|jpeg|png)$/i, '.webp'), [320, 640, 960, 1280, 1920]),
        fallback: generateSrcSet(src, [320, 640, 960, 1280, 1920])
      }}
      sizes={sizes}
      alt={alt}
      className={className}
      aspectRatio={aspectRatio}
      quality={quality}
      priority={priority}
      loading="lazy"
    />
  )
}

export default ResponsiveImage