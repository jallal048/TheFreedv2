import React from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';

// Props que incluyen configuración de prefetch
interface LazyLinkProps extends RouterLinkProps {
  enablePrefetch?: boolean;
  preloadComponent?: () => Promise<any>;
}

// Componente Link mejorado con prefetch automático
export const LazyLink: React.FC<LazyLinkProps> = ({ 
  children, 
  enablePrefetch = true, 
  preloadComponent,
  onMouseEnter,
  ...props 
}) => {
  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (enablePrefetch && props.to && typeof props.to === 'string') {
      // Prefetch de rutas críticas
      const criticalRoutes = ['/dashboard', '/discover', '/admin'];
      
      if (criticalRoutes.includes(props.to)) {
        // Crear link de prefetch del navegador
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = props.to;
        link.as = 'document';
        document.head.appendChild(link);
        
        // Limpiar después de un tiempo
        setTimeout(() => {
          try {
            document.head.removeChild(link);
          } catch (e) {
            // Link ya fue removido, ignorar
          }
        }, 30000);
      }
      
      // Prefetch de componente si se proporciona
      if (preloadComponent && process.env.NODE_ENV === 'production') {
        preloadComponent();
      }
    }
    
    // Llamar al handler original si existe
    if (onMouseEnter) {
      onMouseEnter(e);
    }
  };

  return (
    <RouterLink
      {...props}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </RouterLink>
  );
};

// Componente Button mejorado con lazy loading
interface LazyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  to?: string;
  preloadComponent?: () => Promise<any>;
  enablePrefetch?: boolean;
}

export const LazyButton: React.FC<LazyButtonProps> = ({ 
  children, 
  to, 
  preloadComponent, 
  enablePrefetch = true,
  onMouseEnter,
  onClick,
  ...props 
}) => {
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (enablePrefetch && to && process.env.NODE_ENV === 'production') {
      // Prefetch de ruta
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = to;
      link.as = 'document';
      document.head.appendChild(link);
      
      setTimeout(() => {
        try {
          document.head.removeChild(link);
        } catch (e) {
          // Link ya fue removido, ignorar
        }
      }, 30000);
    }
    
    if (preloadComponent && process.env.NODE_ENV === 'production') {
      preloadComponent();
    }
    
    if (onMouseEnter) {
      onMouseEnter(e);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (to) {
      // Navegar programáticamente
      window.location.href = to;
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      {...props}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

// HOC para crear componentes con prefetch automático
export const withLazyPrefetch = <P extends object>(
  Component: React.ComponentType<P>,
  preloadFunc?: () => Promise<any>
) => {
  const WrappedComponent = (props: P) => {
    React.useEffect(() => {
      if (preloadFunc && process.env.NODE_ENV === 'production') {
        // Precargar después de que el componente se monte
        const timer = setTimeout(() => {
          preloadFunc();
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }, []);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withLazyPrefetch(${Component.displayName || Component.name})`;
  return WrappedComponent;
};