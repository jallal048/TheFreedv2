import { useEffect, useState, useCallback } from 'react'

interface CriticalAssetConfig {
  src: string
  as: 'image' | 'style' | 'script' | 'font' | 'video'
  type?: string
  crossOrigin?: 'anonymous' | 'use-credentials'
  integrity?: string
  priority?: 'high' | 'low' | 'auto'
  fetchPriority?: 'high' | 'low' | 'auto'
}

interface UseCriticalAssetsOptions {
  assets: CriticalAssetConfig[]
  preloadDelay?: number
  retryCount?: number
  retryDelay?: number
}

export const useCriticalAssets = ({
  assets,
  preloadDelay = 0,
  retryCount = 3,
  retryDelay = 1000
}: UseCriticalAssetsOptions) => {
  const [loadedAssets, setLoadedAssets] = useState<Set<string>>(new Set())
  const [failedAssets, setFailedAssets] = useState<Set<string>>(new Set())
  const [loadingAssets, setLoadingAssets] = useState<Set<string>>(new Set())

  const preloadAsset = useCallback(async (config: CriticalAssetConfig, attempt = 1): Promise<boolean> => {
    const assetKey = `${config.as}:${config.src}`
    
    // Si ya está cargado o en proceso, no volver a cargar
    if (loadedAssets.has(assetKey) || loadingAssets.has(assetKey)) {
      return loadedAssets.has(assetKey)
    }

    setLoadingAssets(prev => new Set(prev).add(assetKey))

    try {
      // Crear elemento link para preload
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = config.src
      link.as = config.as
      
      if (config.type) link.type = config.type
      if (config.crossOrigin) link.crossOrigin = config.crossOrigin
      if (config.integrity) link.integrity = config.integrity
      if (config.fetchPriority) link.setAttribute('fetchpriority', config.fetchPriority)

      // Para imágenes, también añadir formats
      if (config.as === 'image' && config.src.match(/\.(jpg|jpeg)$/i)) {
        const webpSrc = config.src.replace(/\.(jpg|jpeg)$/i, '.webp')
        const avifSrc = config.src.replace(/\.(jpg|jpeg)$/i, '.avif')
        
        // Preload WebP
        const webpLink = document.createElement('link')
        webpLink.rel = 'preload'
        webpLink.as = 'image'
        webpLink.href = webpSrc
        webpLink.type = 'image/webp'
        webpLink.setAttribute('fetchpriority', config.fetchPriority || 'auto')
        document.head.appendChild(webpLink)
        
        // Preload AVIF
        const avifLink = document.createElement('link')
        avifLink.rel = 'preload'
        avifLink.as = 'image'
        avifLink.href = avifSrc
        avifLink.type = 'image/avif'
        avifLink.setAttribute('fetchpriority', config.fetchPriority || 'auto')
        document.head.appendChild(avifLink)
      }

      document.head.appendChild(link)

      // Para imágenes, verificar que se cargue correctamente
      if (config.as === 'image') {
        await new Promise<void>((resolve, reject) => {
          const img = new Image()
          
          img.onload = () => {
            setLoadedAssets(prev => new Set(prev).add(assetKey))
            setLoadingAssets(prev => {
              const newSet = new Set(prev)
              newSet.delete(assetKey)
              return newSet
            })
            resolve()
          }
          
          img.onerror = () => {
            setFailedAssets(prev => new Set(prev).add(assetKey))
            setLoadingAssets(prev => {
              const newSet = new Set(prev)
              newSet.delete(assetKey)
              return newSet
            })
            reject(new Error(`Failed to load image: ${config.src}`))
          }
          
          img.src = config.src
          
          // Timeout de 10 segundos
          setTimeout(() => {
            reject(new Error(`Timeout loading image: ${config.src}`))
          }, 10000)
        })
      } else {
        // Para otros tipos de assets, solo marcar como cargado
        setLoadedAssets(prev => new Set(prev).add(assetKey))
        setLoadingAssets(prev => {
          const newSet = new Set(prev)
          newSet.delete(assetKey)
          return newSet
        })
      }

      return true

    } catch (error) {
      setFailedAssets(prev => new Set(prev).add(assetKey))
      setLoadingAssets(prev => {
        const newSet = new Set(prev)
        newSet.delete(assetKey)
        return newSet
      })

      // Reintentar si no se ha alcanzado el límite
      if (attempt < retryCount) {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        return preloadAsset(config, attempt + 1)
      }

      console.warn(`Failed to preload asset after ${retryCount} attempts:`, config.src, error)
      return false
    }
  }, [loadedAssets, loadingAssets, retryCount, retryDelay])

  // Preload todos los assets críticos
  useEffect(() => {
    const preloadAllAssets = async () => {
      const delay = preloadDelay
      
      for (let i = 0; i < assets.length; i++) {
        const config = assets[i]
        
        if (delay > 0 && i > 0) {
          await new Promise(resolve => setTimeout(resolve, delay))
        }
        
        preloadAsset(config)
      }
    }

    if (typeof window !== 'undefined' && document.readyState === 'complete') {
      preloadAllAssets()
    } else {
      window.addEventListener('load', preloadAllAssets)
      return () => window.removeEventListener('load', preloadAllAssets)
    }
  }, [assets, preloadDelay, preloadAsset])

  // Función para limpiar assets
  const cleanupAssets = useCallback(() => {
    assets.forEach(config => {
      const assetKey = `${config.as}:${config.src}`
      const link = document.querySelector(`link[rel="preload"][href="${config.src}"]`)
      if (link) {
        link.remove()
      }
    })
    
    setLoadedAssets(new Set())
    setFailedAssets(new Set())
    setLoadingAssets(new Set())
  }, [assets])

  // Estado de carga
  const isLoading = loadingAssets.size > 0
  const hasLoaded = loadedAssets.size > 0
  const hasErrors = failedAssets.size > 0
  const progress = assets.length > 0 ? loadedAssets.size / assets.length : 0

  return {
    loadedAssets,
    failedAssets,
    loadingAssets,
    isLoading,
    hasLoaded,
    hasErrors,
    progress,
    preloadAsset,
    cleanupAssets
  }
}

// Hook simplificado para imágenes críticas
export const useCriticalImages = (imageUrls: string[], options?: {
  preloadDelay?: number
  priority?: 'high' | 'low' | 'auto'
}) => {
  const { priority = 'high', preloadDelay = 0 } = options || {}
  
  const assets: CriticalAssetConfig[] = imageUrls.map(src => ({
    src,
    as: 'image',
    fetchPriority: priority
  }))

  return useCriticalAssets({ assets, preloadDelay })
}

// Hook para fonts críticos
export const useCriticalFonts = (fontUrls: string[], options?: {
  preloadDelay?: number
  display?: 'swap' | 'block' | 'fallback' | 'optional'
}) => {
  const { preloadDelay = 100 } = options || {}
  
  const assets: CriticalAssetConfig[] = fontUrls.map(src => ({
    src,
    as: 'font',
    type: 'font/woff2'
  }))

  const result = useCriticalAssets({ assets, preloadDelay })

  // Aplicar font-display a las fonts cargadas
  useEffect(() => {
    if (result.hasLoaded) {
      const style = document.createElement('style')
      style.textContent = `
        @font-face {
          font-display: ${options?.display || 'swap'};
        }
      `
      document.head.appendChild(style)
    }
  }, [result.hasLoaded, options?.display])

  return result
}

// Hook para estilos críticos
export const useCriticalStyles = (styleUrls: string[], options?: {
  preloadDelay?: number
}) => {
  const { preloadDelay = 50 } = options || {}
  
  const assets: CriticalAssetConfig[] = styleUrls.map(src => ({
    src,
    as: 'style',
    type: 'text/css'
  }))

  return useCriticalAssets({ assets, preloadDelay })
}

export default useCriticalAssets