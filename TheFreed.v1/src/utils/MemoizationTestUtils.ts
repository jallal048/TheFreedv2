// Utilidades para testing y verificación de optimizaciones
import { useEffect, useRef } from 'react';

// Hook para contar re-renders de un componente
export const useRenderCount = (componentName: string = 'Component') => {
  const count = useRef(0);
  
  useEffect(() => {
    count.current += 1;
    console.log(`🔄 ${componentName} - Render #${count.current}`);
  });

  return count.current;
};

// Hook para medir tiempo de renderizado
export const useRenderTiming = (componentName: string = 'Component') => {
  const startTime = useRef<number>();
  
  useEffect(() => {
    startTime.current = performance.now();
    
    return () => {
      if (startTime.current) {
        const duration = performance.now() - startTime.current;
        console.log(`⏱️ ${componentName} - Render time: ${duration.toFixed(2)}ms`);
      }
    };
  });
};

// Función para verificar si un componente se re-renderiza innecesariamente
export const createRenderTracker = (componentName: string) => {
  const renderCount = { current: 0 };
  const lastProps = { current: null };
  
  return {
    track: (props: any) => {
      renderCount.current += 1;
      const propsChanged = JSON.stringify(props) !== JSON.stringify(lastProps.current);
      lastProps.current = props;
      
      console.log(`📊 ${componentName} - Render #${renderCount.current} (Props changed: ${propsChanged})`);
      
      return {
        renderCount: renderCount.current,
        propsChanged
      };
    },
    getCount: () => renderCount.current,
    reset: () => {
      renderCount.current = 0;
      lastProps.current = null;
      console.log(`🔄 ${componentName} - Render count reset`);
    }
  };
};

// Utilidad para crear datos de prueba estables
export const createStableTestData = (id: number = 1) => ({
  id,
  name: `Test Item ${id}`,
  description: 'This is a test item for memoization testing',
  timestamp: Date.now(),
  metadata: {
    category: 'test',
    priority: 'high',
    tags: ['memoization', 'testing', 'optimization']
  }
});

// Utilidad para crear datos de prueba que cambien frecuentemente
export const createUnstableTestData = (id: number = 1) => ({
  id,
  name: `Test Item ${id}`,
  description: 'This is a test item for memoization testing',
  timestamp: Date.now(), // Este timestamp cambia en cada render
  metadata: {
    category: 'test',
    priority: 'high',
    tags: ['memoization', 'testing', 'optimization'],
    randomValue: Math.random() // Valor aleatorio en cada render
  }
});

// Función para simular un cálculo costoso
export const simulateExpensiveCalculation = (iterations: number = 1000000): number => {
  console.log('🧮 Ejecutando cálculo costoso...');
  let result = 0;
  
  for (let i = 0; i < iterations; i++) {
    result += Math.sqrt(i);
  }
  
  console.log('✅ Cálculo costoso completado');
  return result;
};

// Componente de prueba para verificar React.memo
export const MemoizedTestComponent = React.memo<{
  data: any;
  label: string;
}>(({ data, label }) => {
  const renderCount = useRenderCount(`${label}-Memoized`);
  
  return (
    <div className="p-4 border rounded border-green-200">
      <h4>{label} (Memoized)</h4>
      <p>Data: {JSON.stringify(data)}</p>
      <p>Renders: {renderCount}</p>
    </div>
  );
});

// Componente de prueba sin memoización
export const UnmemoizedTestComponent = ({ data, label }: { data: any; label: string }) => {
  const renderCount = useRenderCount(`${label}-Unmemoized`);
  
  return (
    <div className="p-4 border rounded border-red-200">
      <h4>{label} (Unmemoized)</h4>
      <p>Data: {JSON.stringify(data)}</p>
      <p>Renders: {renderCount}</p>
    </div>
  );
};

// Utilidad para performance testing
export const PerformanceProfiler: React.FC<{
  componentName: string;
  children: React.ReactNode;
}> = ({ componentName, children }) => {
  const renderCount = useRenderCount(componentName);
  useRenderTiming(componentName);
  
  return (
    <div data-component={componentName} data-renders={renderCount}>
      {children}
      <div className="text-xs text-gray-500 mt-2">
        {componentName}: {renderCount} renders
      </div>
    </div>
  );
};

// Función para verificar el impacto de las optimizaciones
export const runOptimizationTest = () => {
  console.group('🚀 Iniciando Test de Optimización');
  
  // Test 1: Verificar React.memo
  console.log('Test 1: React.memo');
  const memoTracker = createRenderTracker('MemoizedComponent');
  
  const testProps1 = { id: 1, name: 'test' };
  memoTracker.track(testProps1); // Render 1
  memoTracker.track(testProps1); // No debería re-renderizar
  memoTracker.track({ ...testProps1 }); // Debería re-renderizar (props cambiaron)
  
  // Test 2: Verificar useCallback
  console.log('\nTest 2: useCallback');
  const callbackRef = { current: null as ((arg: string) => void) | null };
  
  // Simular creación de callback sin useCallback
  const createCallback = () => (arg: string) => console.log('Callback called with:', arg);
  callbackRef.current = createCallback();
  const callback1 = callbackRef.current;
  callbackRef.current = createCallback();
  const callback2 = callbackRef.current;
  
  console.log('Callbacks are same reference:', callback1 === callback2); // false
  
  // Test 3: Verificar useMemo
  console.log('\nTest 3: useMemo');
  const expensiveValue = simulateExpensiveCalculation(100000);
  console.log('Expensive calculation result:', expensiveValue);
  
  console.groupEnd();
  
  return {
    memoTests: 'Verificar que React.memo previene re-renders innecesarios',
    callbackTests: 'Verificar que useCallback mantiene referencias estables',
    memoTests2: 'Verificar que useMemo evita recálculos costosos'
  };
};

// Exportar todas las utilidades
export const MemoizationTestUtils = {
  useRenderCount,
  useRenderTiming,
  createRenderTracker,
  createStableTestData,
  createUnstableTestData,
  simulateExpensiveCalculation,
  MemoizedTestComponent,
  UnmemoizedTestComponent,
  PerformanceProfiler,
  runOptimizationTest
};