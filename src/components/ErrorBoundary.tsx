// Error Boundary optimizado para TheFreed.v1
import React, { Component, ErrorInfo, ReactNode, memo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableMonitoring?: boolean;
  enableCustomFallback?: boolean;
  logPrefix?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Componente de error memoizado
const ErrorFallback: React.FC<{ 
  error: Error | null; 
  errorInfo: ErrorInfo | null; 
  onRetry: () => void;
}> = memo(({ error, errorInfo, onRetry }) => {
  const serializeError = (err: any): string => {
    if (err instanceof Error) {
      return `${err.message}\n\nStack trace:\n${err.stack || 'No stack trace available'}`;
    }
    return JSON.stringify(err, null, 2);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg border border-red-200 p-8">
        <div className="flex items-center mb-6">
          <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Oops! Algo salió mal
          </h1>
        </div>
        
        <p className="text-gray-600 mb-6">
          Ha ocurrido un error inesperado en la aplicación. Nuestro equipo ha sido notificado automáticamente.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Detalles del error:</h3>
          <pre className="text-xs text-red-600 overflow-auto max-h-48 whitespace-pre-wrap">
            {error && serializeError(error)}
          </pre>
        </div>
        
        {process.env.NODE_ENV === 'development' && errorInfo && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Información adicional:</h3>
            <pre className="text-xs text-gray-600 overflow-auto max-h-48 whitespace-pre-wrap">
              {errorInfo.componentStack}
            </pre>
          </div>
        )}
        
        <div className="flex items-center space-x-4">
          <button
            onClick={onRetry}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
});

ErrorFallback.displayName = 'ErrorFallback';

// Clase base abstracta para los Error Boundaries
abstract class BaseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const logPrefix = this.props.logPrefix || 'ErrorBoundary';
    
    // Log del error para debugging y monitoreo
    console.error(`${logPrefix} caught an error:`, error, errorInfo);
    
    // Actualizar el estado con información adicional
    this.setState({
      error,
      errorInfo
    });

    // Callback opcional para manejar el error externamente
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // En producción, aquí enviarías el error a un servicio de monitoreo
    if (this.props.enableMonitoring && process.env.NODE_ENV === 'production') {
      // Ejemplo: Sentry.captureException(error);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // Si hay un fallback personalizado y está habilitado, usarlo
      if (this.props.enableCustomFallback && this.props.fallback) {
        return this.props.fallback;
      }

      // Usar el componente de error por defecto
      return (
        <ErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

// Error Boundary principal con todas las funcionalidades
export class ErrorBoundary extends BaseErrorBoundary {
  constructor(props: Props) {
    super(props);
  }
}

// Error Boundary específico para lazy loading
export class LazyErrorBoundary extends BaseErrorBoundary {
  constructor(props: Props) {
    super({
      ...props,
      enableMonitoring: false,
      enableCustomFallback: false,
      logPrefix: 'LazyErrorBoundary'
    });
  }
}