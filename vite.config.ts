import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [
      react()
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: 'es2020',
      minify: 'terser',
      rollupOptions: {
        treeshake: true,
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]'
        },
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
          forms: ['react-hook-form']
        }
      }
    },
    optimizeDeps: {
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
        'tailwind-merge'
      ],
      exclude: ['vite-plugin-source-identifier']
    }
  }
})