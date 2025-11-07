import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import sourceIdentifierPlugin from 'vite-plugin-source-identifier'
import { visualizer } from 'rollup-plugin-visualizer'

const isProd = process.env.BUILD_MODE === 'prod'
const isDev = process.env.NODE_ENV === 'development'
const isProfile = process.env.VITE_PROFILE === 'true'

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [
      react({
        // Optimizaciones de React para desarrollo
        fastRefresh: isDev,
        // Optimización de JSX
        jsxRuntime: 'automatic',
        jsxImportSource: 'react',
        // Exclude large node_modules for faster HMR
        exclude: isDev ? [/node_modules/] : [],
        // Fast refresh optimizations
        ...(isDev && {
          babel: {
            plugins: [
              ['babel-plugin-react-remove-properties', { properties: ['data-testid'] }],
              ['babel-plugin-react-displayname', { remove: true }]
            ]
          }
        })
      }),
      sourceIdentifierPlugin({
        enabled: !isProd,
        attributePrefix: 'data-matrix',
        includeProps: true,
      }),
      // Bundle analyzer para análisis de tamaño
      ...(isProfile || mode === 'analyze' ? [
        visualizer({
          filename: 'dist/stats.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
          sourcemap: !isProd,
          title: 'TheFreed.v1 Bundle Analysis',
        })
      ] : [])
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      // Optimización de resolución
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
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
          passes: isProd ? 2 : 1, // Múltiples pasadas para mejor compresión en producción
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
          // Habilitar tree shaking más agresivo en desarrollo para mejor debugging
          ...(isDev && {
            preset: 'recommended',
            tryCatchDeoptimization: false,
          }),
        },
        output: {
          // CSS code splitting
          assetFileNames: (assetInfo) => {
            // Separar archivos CSS en chunks separados
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'css/[name]-[hash][extname]'
            }
            // Imágenes y otros assets
            if (/\.(png|jpe?g|gif|svg|webp|ico|woff2?|ttf|eot)$/i.test(assetInfo.name || '')) {
              return 'assets/[name]-[hash][extname]'
            }
            // Archivos por defecto
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
              if (facadeModuleId.includes('ProfilePage')) {
                return 'js/profile-user-[hash].js'
              }
              if (facadeModuleId.includes('SettingsPage')) {
                return 'js/settings-main-[hash].js'
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
          'forms': ['react-hook-form', '@hookform/resolvers'],
          // Animation chunks
          'animations': ['framer-motion'],
          // Date/time chunks
          'datetime': ['date-fns'],
          // Utility chunks
          'utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          // Radix UI chunks
          'radix-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
            '@radix-ui/react-accordion',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-switch',
            '@radix-ui/react-slider'
          ],
          // Backend chunks
          'backend': ['express', 'bcryptjs', 'jsonwebtoken', 'cookie-parser'],
          // Validation chunks
          'validation': ['zod', 'joi', 'celebrate', 'express-validator'],
          // Payment chunks
          'payment': ['stripe'],
          // Database chunks
          'database': ['prisma', 'redis'],
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
      // Assets optimization
      assetsInlineLimit: 4096, // Inline assets pequeños (< 4kb)
      // Watch mode optimization
      watch: isDev ? {
        ignored: ["**/node_modules/**", "**/dist/**", "**/.git/**"]
      } : undefined,
      // Performance profiling
      ...(isProfile && {
        sourcemap: true,
        minify: false,
      }),
    },
    // Development server optimization
    server: {
      // Host configuration para desarrollo en red
      host: true,
      port: 3000,
      // HMR optimizations
      hmr: {
        overlay: false, // Mejor rendimiento HMR
        port: 24678, // Puerto específico para HMR
        // HMR connection timeout
        clientPort: 24678,
        // Improved HMR for large projects
        ...(isDev && {
          overlay: {
            errors: true,
            warnings: false,
          },
        }),
      },
      // File watching optimizations
      watch: {
        ignored: ["**/node_modules/**", "**/dist/**", "**/.git/**", "**/reports/**"],
        usePolling: false, // Better performance on most systems
      },
      // Development server performance
      fs: {
        strict: false, // Allow importing from outside
        allow: ['..', './src', './public'],
      },
      // Enable CORS in development
      cors: true,
      // Development server timing
      ...(isDev && {
        hmr: {
          overlay: false,
        },
      }),
      // Cache optimization
      ...(isDev && {
        cacheDir: 'node_modules/.vite',
      }),
      // Development middleware
      middlewareMode: false,
      // Port and host configuration
      ...(process.env.PORT && { port: parseInt(process.env.PORT) }),
      // Hot reload optimizations
      ...(isDev && {
        strictPort: false,
        host: 'localhost',
      }),
    },
    // Dependency optimization
    optimizeDeps: {
      // Pre-bundle dependencies for faster startup
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'zustand',
        'lucide-react',
        'react-hook-form',
        '@hookform/resolvers',
        'date-fns',
        'clsx',
        'tailwind-merge',
        'class-variance-authority',
        // Radix UI components
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-tooltip',
        '@radix-ui/react-popover',
        // Utils
        'zod',
        'uuid',
        'bcryptjs',
      ],
      // Exclude large dependencies that don't need pre-bundling
      exclude: [
        'vite-plugin-source-identifier'
      ],
      // Force dependency pre-bundling
      force: isDev,
      // Clear cache on restart in development
      ...(isDev && {
        noExternal: [],
      }),
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
      // Enable tree shaking
      treeShaking: true,
      // Format options
      format: 'esm',
    },
    // Define constants for tree shaking and debugging
    define: {
      __DEV__: !isProd,
      __PROD__: isProd,
      __PROFILE__: isProfile,
      // Development constants
      ...(isDev && {
        __HMR_PORT__: JSON.stringify(24678),
        __HMR_HOST__: JSON.stringify('localhost'),
      }),
    },
    // CSS optimization
    css: {
      // CSS preprocessor options
      preprocessorOptions: {
        less: {},
        stylus: {},
        sass: {},
      },
      // CSS modules configuration
      modules: {
        localsConvention: 'camelCase',
      },
      // PostCSS configuration
      postcss: {},
      // Dev CSS sourcemap
      devSourcemap: isDev,
      // Preload modules
      preprocessorMaxWorkers: true,
    },
    // Worker configuration
    worker: {
      format: 'es',
    },
    // Asset configuration
    assetsInclude: ['**/*.md', '**/*.txt'],
    // JSON configuration
    json: {
      namedExports: true,
      stringify: false,
    },
    // HTML configuration
    html: {
      minify: isProd,
      template: 'index.html',
    },
    // Preview configuration
    preview: {
      port: 4173,
      host: true,
    },
    // Profile configuration
    ...(isProfile && {
      define: {
        global: 'globalThis',
      },
    }),
  }
})