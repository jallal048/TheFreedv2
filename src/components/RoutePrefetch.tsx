import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Componente para prefetch automático de rutas críticas
export const RoutePrefetchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Prefetch de rutas críticas después de que la app cargue
    const timer = setTimeout(() => {
      // Solo en producción para evitar overhead en desarrollo
      if (process.env.NODE_ENV === 'production') {
        // Precargar rutas más utilizadas
        const criticalRoutes = ['/dashboard', '/discover'];
        
        criticalRoutes.forEach(route => {
          // Crear link de prefetch
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = route;
          link.as = 'document';
          document.head.appendChild(link);
          
          // Limpiar después de un tiempo
          setTimeout(() => {
            document.head.removeChild(link);
          }, 30000); // Limpiar después de 30 segundos
        });
      }
    }, 3000); // Esperar 3 segundos después del mount

    return () => clearTimeout(timer);
  }, [navigate]);

  return <>{children}</>;
};

// Hook para prefetch manual de componentes lazy
export const useLazyPrefetch = () => {
  const prefetchComponent = (importFunc: () => Promise<any>) => {
    if (process.env.NODE_ENV === 'production') {
      // Ejecutar el import para precargar el chunk
      importFunc();
    }
  };

  return { prefetchComponent };
};

// Componente de mejora de UX para navegación
export const NavigationEnhancer: React.FC = () => {
  useEffect(() => {
    // Agregar event listeners para prefetch en hover sobre enlaces
    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      const href = target.getAttribute('href');
      
      if (href && href.startsWith('/')) {
        // Solo prefetch rutas que sabemos que son lazy-loaded
        if (['/dashboard', '/discover', '/admin'].includes(href)) {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = href;
          link.as = 'document';
          document.head.appendChild(link);
        }
      }
    };

    // Agregar listener al documento
    document.addEventListener('mouseenter', handleMouseEnter, true);

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true);
    };
  }, []);

  return null; // Este componente no renderiza nada
};