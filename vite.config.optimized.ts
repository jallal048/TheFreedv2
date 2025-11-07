import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import sourceIdentifierPlugin from 'vite-plugin-source-identifier'

const isProd = process.env.BUILD_MODE === 'prod'

export default defineConfig({
  plugins: [
    react(),
    sourceIdentifierPlugin({
      enabled: !isProd,
      attributePrefix: 'data-matrix',
      includeProps: true,
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Configuración optimizada para producción
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: isProd, // Elimina console.log en producción
        drop_debugger: isProd,
        pure_funcs: isProd ? ['console.log', 'console.info', 'console.debug'] : [],
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        passes: 2, // Múltiples pasadas para mejor compresión
      },
      format: {
        comments: false, // Elimina comentarios en producción
      },
      mangle: {
        safari10: true, // Compatibilidad con Safari 10+
      },
    },
    // Tree shaking agresivo habilitado
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
      output: {
        // CSS code splitting con optimización mejorada
        assetFileNames: (assetInfo) => {
          // Separar archivos CSS en chunks separados
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'css/[name]-[hash][extname]'
          }
          // Imágenes optimizadas
          if (/\.(png|jpe?g|gif|svg|webp|avif|ico)$/i.test(assetInfo.name || '')) {
            return 'images/[name]-[hash][extname]'
          }
          // Fuentes optimizadas
          if (/\.(woff2?|ttf|eot|otf)$/i.test(assetInfo.name || '')) {
            return 'fonts/[name]-[hash][extname]'
          }
          // Videos optimizados
          if (/\.(mp4|webm|ogv|mov)$/i.test(assetInfo.name || '')) {
            return 'videos/[name]-[hash][extname]'
          }
          // Otros assets
          return 'assets/[name]-[hash][extname]'
        },
        // Chunk naming optimizado para lazy loading y debugging
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          
          if (facadeModuleId) {
            // Detectar páginas lazy-loaded para naming específico
            if (facadeModuleId.includes('LoginPage')) {
              return 'js/auth-login-[hash].js'
            }
            if (facadeModuleId.includes('RegisterPage')) {
              return 'js/auth-register-[hash].js'
            }
            if (facadeModuleId.includes('DashboardPage')) {
              return 'js/dashboard-main-[hash].js'
            }
            if (facadeModuleId.includes('AdminPage')) {
              return 'js/admin-panel-[hash].js'
            }
            if (facadeModuleId.includes('DiscoveryPage')) {
              return 'js/discovery-main-[hash].js'
            }
          }
          
          // Fallback para otros chunks
          return 'js/[name]-[hash].js'
        },
        entryFileNames: 'js/[name]-[hash].js',
      },
      // Optimización manual de chunks
      external: isProd ? [] : [],
      // Configuración manual de chunks para mejor optimización
      manualChunks: {
        // Core React chunks
        'react-vendor': ['react', 'react-dom'],
        // Router chunks
        'router': ['react-router-dom'],
        // State management chunks
        'state': ['zustand'],
        // UI library chunks
        'ui': ['lucide-react'],
        // Form management chunks
        'forms': ['react-hook-form'],
        // Animation chunks
        'animations': ['framer-motion'],
        // Date/time chunks
        'datetime': ['date-fns'],
        // Utility chunks
        'utils': ['clsx', 'tailwind-merge'],
        // Image optimization chunks
        'image-optimization': ['./src/components/images'],
      },
    },
    // CSS optimization
    cssCodeSplit: true,
    cssMinify: true,
    // Build optimization
    sourcemap: !isProd,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
    // Brotli/Gzip compression
    reportCompressedSize: true,
    // Optimize dependencies
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // Assets optimization mejorada
    assetsInlineLimit: 2048, // Reducido a 2kb para mejor optimización
    // Image optimization settings
    assetsDir: 'assets',
    // Compression settings
    minify: 'terser',
    // Optimization for large dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'zustand',
        'lucide-react',
        'react-hook-form',
        'framer-motion',
        'date-fns',
        'clsx',
        'tailwind-merge',
        // Image optimization dependencies
        './src/components/images',
      ],
      exclude: [
        // Excluir dependencias grandes que no necesitan pre-bundle
      ]
    },
  },
  // Development server optimization
  server: {
    hmr: {
      overlay: false, // Mejor rendimiento HMR
    },
  },
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'lucide-react',
      'react-hook-form',
      'framer-motion',
      'date-fns',
      'clsx',
      'tailwind-merge',
      // Image optimization
      './src/components/images',
    ],
  },
  // Vite plugins optimization
  esbuild: {
    target: 'es2020',
    // Remove dead code (tree shaking)
    drop: isProd ? ['console', 'debugger'] : [],
    // Minify identifiers
    minifyIdentifiers: isProd,
    // Minify syntax
    minifySyntax: isProd,
    // Minify whitespace
    minifyWhitespace: isProd,
  },
  // Define constants for tree shaking
  define: {
    __DEV__: !isProd,
    __PROD__: isProd,
  },
  // Image optimization configuration
  worker: {
    format: 'es'
  },
  // Experimental features for better optimization
  experimental: {
    renderBuiltUrl(filename: string) {
      // Optimized asset URLs for production
      if (isProd) {
        return { relative: true }
      }
      return { relative: false }
    }
  }
})