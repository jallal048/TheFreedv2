import { useEffect } from 'react'

interface PreloadAssetOptions {
  as: 'image' | 'style' | 'script' | 'font'
  type?: string
  crossOrigin?: 'anonymous' | 'use-credentials'
  integrity?: string
}

export const usePreloadAsset = (href: string, options: PreloadAssetOptions = { as: 'image' }) => {
  useEffect(() => {
    if (!href) return

    // Verificar si ya existe el preload
    const existingLink = document.querySelector(`link[rel="preload"][href="${href}"]`)
    if (existingLink) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = options.as
    
    if (options.type) link.type = options.type
    if (options.crossOrigin) link.crossOrigin = options.crossOrigin
    if (options.integrity) link.integrity = options.integrity

    document.head.appendChild(link)

    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link)
      }
    }
  }, [href, options])
}

export const usePreloadCriticalAssets = (criticalImages: string[] = []) => {
  useEffect(() => {
    criticalImages.forEach((src, index) => {
      // Delay para evitar sobrecarga en la carga inicial
      setTimeout(() => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = src
        
        // Añadir diferentes formatos para mejor compatibilidad
        if (src.match(/\.(jpg|jpeg)$/i)) {
          const webpSrc = src.replace(/\.(jpg|jpeg)$/i, '.webp')
          const avifSrc = src.replace(/\.(jpg|jpeg)$/i, '.avif')
          
          // Preload WebP
          const webpLink = document.createElement('link')
          webpLink.rel = 'preload'
          webpLink.as = 'image'
          webpLink.href = webpSrc
          webpLink.type = 'image/webp'
          document.head.appendChild(webpLink)
          
          // Preload AVIF
          const avifLink = document.createElement('link')
          avifLink.rel = 'preload'
          avifLink.as = 'image'
          avifLink.href = avifSrc
          avifLink.type = 'image/avif'
          document.head.appendChild(avifLink)
        }
        
        document.head.appendChild(link)
      }, index * 100) // Stagger de 100ms entre cada preload
    })
  }, [criticalImages])
}

interface CriticalImageProps {
  src: string
  alt: string
  className?: string
  children?: React.ReactNode
}

export const CriticalImage: React.FC<CriticalImageProps> = ({
  src,
  alt,
  className,
  children
}) => {
  usePreloadAsset(src, { as: 'image' })

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="eager"
      fetchPriority="high"
    />
  )
}

export default CriticalImage