/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Extend aspect-ratio utilities para mejor soporte
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2', 
        '2/3': '2 / 3',
        '9/16': '9 / 16',
        '21/9': '21 / 9',
      },
      // Animaciones para placeholders y skeleton
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-out': 'scaleOut 0.3s ease-in',
      },
      keyframes: {
        shimmer: {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
      },
      // Optimización de filtros para imágenes
      filter: {
        'blur-xs': 'blur(2px)',
        'blur-sm': 'blur(4px)',
        'blur-md': 'blur(8px)',
        'blur-lg': 'blur(16px)',
        'blur-xl': 'blur(24px)',
      },
      // Backdrop filters
      backdropBlur: {
        'xs': '2px',
      },
      // Gradientes personalizados para placeholders
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      },
      // Transiciones optimizadas para imágenes
      transitionProperty: {
        'image': 'opacity, transform, filter',
        'image-bg': 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter',
      },
      // Tamaños personalizados para imágenes responsivas
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Z-index para overlays
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      // Colores para diferentes tipos de placeholders
      colors: {
        'skeleton': {
          '50': '#fafafa',
          '100': '#f4f4f5',
          '200': '#e4e4e7',
          '300': '#d4d4d8',
          '400': '#a1a1aa',
          '500': '#71717a',
          '600': '#52525b',
          '700': '#3f3f46',
          '800': '#27272a',
          '900': '#18181b',
        },
        'placeholder': {
          'blue': '#dbeafe',
          'green': '#dcfce7',
          'yellow': '#fef3c7',
          'red': '#fee2e2',
          'purple': '#ede9fe',
          'pink': '#fce7f3',
        }
      },
      // Typography para textos en estados de carga
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      // Optimización de object-fit
      objectPosition: {
        'center': 'center',
        'top': 'top',
        'bottom': 'bottom',
        'left': 'left',
        'right': 'right',
        'top-left': 'top left',
        'top-right': 'top right',
        'bottom-left': 'bottom left',
        'bottom-right': 'bottom right',
      },
      // Shadows para diferentes estados
      boxShadow: {
        'image': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'image-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [
    // Plugin para aspect-ratio (si no está incluido en la versión actual)
    require('@tailwindcss/aspect-ratio'),
    // Plugin para typography
    require('@tailwindcss/typography'),
    // Plugin para formularios (opcional)
    require('@tailwindcss/forms'),
    // Plugin custom para utilidades de imagen
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Utilidades para object-fit
        '.object-contain': { 'object-fit': 'contain' },
        '.object-cover': { 'object-fit': 'cover' },
        '.object-fill': { 'object-fit': 'fill' },
        '.object-none': { 'object-fit': 'none' },
        '.object-scale-down': { 'object-fit': 'scale-down' },
        
        // Utilidades para transition optimizadas
        '.transition-image': {
          'transition-property': 'opacity, transform, filter',
          'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
          'transition-duration': '300ms',
        },
        '.transition-image-fast': {
          'transition-property': 'opacity, transform, filter',
          'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
          'transition-duration': '150ms',
        },
        '.transition-image-slow': {
          'transition-property': 'opacity, transform, filter',
          'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
          'transition-duration': '500ms',
        },
        
        // Utilidades para loading states
        '.loading-shimmer': {
          'background': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          'background-size': '200% 100%',
          'animation': 'shimmer 2s linear infinite',
        },
        '.loading-pulse-slow': {
          'animation': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        
        // Utilidades para z-index
        '.z-image-overlay': { 'z-index': '10' },
        '.z-placeholder': { 'z-index': '5' },
        '.z-loading': { 'z-index': '20' },
        
        // Utilidades para filtros de imagen
        '.filter-blur-xs': { 'filter': 'blur(2px)' },
        '.filter-blur-sm': { 'filter': 'blur(4px)' },
        '.filter-blur-none': { 'filter': 'blur(0px)' },
        
        // Utilidades para preload states
        '.preload-high': { 'fetchpriority': 'high' },
        '.preload-low': { 'fetchpriority': 'low' },
        '.preload-auto': { 'fetchpriority': 'auto' },
      }
      
      addUtilities(newUtilities)
    }
  ],
}