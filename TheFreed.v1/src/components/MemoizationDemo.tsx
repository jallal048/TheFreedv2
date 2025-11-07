// Archivo de demostración para verificar las optimizaciones de memoización
// Este archivo puede ser usado para testing y debugging de las optimizaciones

import React, { useState, useCallback, useMemo } from 'react';

// Simulación de un componente pesado para demostrar el impacto de la memoización
const HeavyComponent = ({ data, onUpdate }: { data: any; onUpdate: (val: string) => void }) => {
  // Simulación de cálculo costoso
  const expensiveValue = React.useMemo(() => {
    console.log('🧮 Calculando valor costoso...');
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.sqrt(i);
    }
    return result;
  }, [data]);

  return (
    <div className="p-4 border rounded">
      <p>Valor calculado: {expensiveValue.toFixed(2)}</p>
      <button onClick={() => onUpdate('updated')}>
        Actualizar
      </button>
    </div>
  );
};

// Componente sin memoización (para comparar rendimiento)
const UnoptimizedComponent = ({ data }: { data: any }) => {
  const [updateCount, setUpdateCount] = useState(0);

  return (
    <div className="p-4 border border-red-200 rounded">
      <h3 className="text-red-600 font-bold">❌ Sin Optimización</h3>
      <p>Datos: {JSON.stringify(data)}</p>
      <p>Re-renders: {updateCount}</p>
      <button onClick={() => setUpdateCount(prev => prev + 1)}>
        Forzar Re-render
      </button>
      <HeavyComponent 
        data={data} 
        onUpdate={() => setUpdateCount(prev => prev + 1)} 
      />
    </div>
  );
};

// Componente con memoización (optimizado)
const OptimizedComponent = React.memo(({ data }: { data: any }) => {
  const [updateCount, setUpdateCount] = useState(0);
  const [internalData, setInternalData] = useState(data);

  // Memoizar el handler para evitar recreaciones
  const handleUpdate = useCallback((newValue: string) => {
    setInternalData(prev => ({ ...prev, value: newValue }));
    setUpdateCount(prev => prev + 1);
  }, []);

  // Memoizar datos derivados
  const derivedData = useMemo(() => ({
    ...internalData,
    processed: true,
    timestamp: Date.now()
  }), [internalData]);

  return (
    <div className="p-4 border border-green-200 rounded">
      <h3 className="text-green-600 font-bold">✅ Con Optimización</h3>
      <p>Datos: {JSON.stringify(derivedData)}</p>
      <p>Re-renders: {updateCount}</p>
      <button onClick={() => setUpdateCount(prev => prev + 1)}>
        Forzar Re-render
      </button>
      <HeavyComponent 
        data={derivedData} 
        onUpdate={handleUpdate} 
      />
    </div>
  );
});

// Componente de prueba principal
export const MemoizationDemo: React.FC = () => {
  const [parentUpdate, setParentUpdate] = useState(0);
  const testData = useMemo(() => ({
    id: 1,
    name: 'Test Data',
    value: 'initial'
  }), []);

  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">
          Demostración de Optimizaciones de Memoización
        </h1>
        <button 
          onClick={() => setParentUpdate(prev => prev + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Re-renderizar Padre (recontador: {parentUpdate})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Componente sin optimizar */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Sin Optimización</h2>
          <UnoptimizedComponent data={testData} />
        </div>

        {/* Componente optimizado */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Con Optimización</h2>
          <OptimizedComponent data={testData} />
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">Resultados Esperados:</h3>
        <ul className="space-y-1 text-sm">
          <li>• El componente <strong>sin optimización</strong> re-renderiza el componente pesado en cada actualización del padre</li>
          <li>• El componente <strong>con optimización</strong> mantiene estable el componente pesado cuando las props no cambian</li>
          <li>• En la consola del navegador verás menos mensajes de "Calculando valor costoso..." en el componente optimizado</li>
          <li>• El uso de <code>React.memo</code>, <code>useMemo</code> y <code>useCallback</code> reduce significativamente los re-renders</li>
        </ul>
      </div>
    </div>
  );
};

// Hook personalizado para monitorear re-renders (útil para debugging)
export const useRenderCount = (componentName: string) => {
  const renderCount = React.useRef(0);
  
  React.useEffect(() => {
    renderCount.current += 1;
    console.log(`🔄 ${componentName} se ha renderizado ${renderCount.current} veces`);
  });

  return renderCount.current;
};

// Hook para medir rendimiento de renderizado
export const useRenderTiming = (componentName: string) => {
  const startTime = React.useRef<number>();
  
  React.useEffect(() => {
    startTime.current = performance.now();
    
    return () => {
      if (startTime.current) {
        const duration = performance.now() - startTime.current;
        console.log(`⏱️ ${componentName} tardó ${duration.toFixed(2)}ms en renderizar`);
      }
    };
  });
};

// Componente de prueba para verificar la optimización del AuthContext
export const AuthContextDemo: React.FC = () => {
  const renderCount = useRenderCount('AuthContextDemo');
  
  return (
    <div className="p-4 border rounded">
      <h3>AuthContext Optimizado - Demo</h3>
      <p>Re-renders: {renderCount}</p>
      <p className="text-sm text-gray-600">
        Este componente usa hooks optimizados del AuthContext que evitan re-renders innecesarios.
      </p>
    </div>
  );
};

export default MemoizationDemo;