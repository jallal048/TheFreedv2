import { useEffect } from 'react';

// Hook para prefetch de rutas críticas
export const useRoutePrefetch = () => {
  const prefetchRoute = (routePath: string) => {
    // Solo prefetch en producción para evitar sobrecarga en desarrollo
    if (process.env.NODE_ENV === 'production') {
      // Crear link para prefetch del chunk
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = routePath;
      link.as = 'document';
      document.head.appendChild(link);
    }
  };

  const prefetchOnHover = (routePath: string) => {
    return () => {
      prefetchRoute(routePath);
    };
  };

  // Prefetch automático de rutas críticas al montar el componente
  useEffect(() => {
    // Prefetch de rutas más utilizadas después de que la página principal cargue
    const timer = setTimeout(() => {
      prefetchRoute('/dashboard');
      prefetchRoute('/discover');
    }, 2000); // Esperar 2 segundos después del mount inicial

    return () => clearTimeout(timer);
  }, []);

  return {
    prefetchRoute,
    prefetchOnHover
  };
};