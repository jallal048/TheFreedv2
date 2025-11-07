// Configuración de optimización de imágenes para TheFreed.v1
module.exports = {
  // Configuración general
  general: {
    inputDir: 'public/images',
    outputDir: 'public/images/optimized',
    responsiveDir: 'public/images/responsive',
    watchDir: 'public/images',
    backupDir: 'public/images/backup'
  },
  
  // Configuración de formatos
  formats: {
    webp: {
      enabled: true,
      qualities: [90, 75, 60],
      effort: 6
    },
    avif: {
      enabled: true, 
      qualities: [85, 70, 55],
      effort: 9
    },
    jpeg: {
      enabled: true,
      qualities: [90, 80, 70],
      mozjpeg: true
    },
    png: {
      enabled: true,
      qualities: [90, 80, 70],
      compressionLevel: 9
    }
  },
  
  // Configuración de tamaños
  sizes: {
    thumbnail: 150,
    small: 400,
    medium: 800,
    large: 1200,
    xlarge: 1600,
    original: 1920
  },
  
  // Configuración de breakpoints
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  },
  
  // Configuración de lazy loading
  lazyLoading: {
    rootMargin: '100px',
    threshold: 0.1,
    retryCount: 3,
    retryDelay: 1000
  },
  
  // Configuración de preload
  preload: {
    criticalImages: [],
    criticalFonts: [],
    preloadDelay: 0,
    fetchPriority: 'high'
  }
}