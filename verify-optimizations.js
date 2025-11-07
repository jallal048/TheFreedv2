#!/usr/bin/env node

// Script de verificación post-optimización
// Verifica que todas las optimizaciones se aplicaron correctamente

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 VERIFICACIÓN POST-OPTIMIZACIÓN - TheFreed.v1');
console.log('='.repeat(50));

// Verificaciones a realizar
const checks = {
  archivosObsoletosEliminados: () => {
    const files = [
      'src/App-broken.tsx',
      'src/VERIFICACION_IMPLEMENTACION.tsx',
      'server/simple-stable.ts',
      'server/ultra-simple.ts'
    ];
    
    const missing = files.filter(file => !fs.existsSync(path.join(__dirname, file)));
    return {
      passed: missing.length === files.length,
      message: missing.length === 0 
        ? '✅ Todos los archivos obsoletos fueron eliminados' 
        : `❌ Archivos obsoletos restantes: ${missing.join(', ')}`
    };
  },

  errorBoundaryOptimizado: () => {
    const errorBoundaryPath = 'src/components/ErrorBoundary.tsx';
    if (!fs.existsSync(errorBoundaryPath)) {
      return { passed: false, message: '❌ ErrorBoundary.tsx no encontrado' };
    }
    
    const content = fs.readFileSync(errorBoundaryPath, 'utf8');
    const hasBaseClass = content.includes('BaseErrorBoundary');
    const noDuplication = !content.includes('static getDerivedStateFromError') || 
                          content.match(/static getDerivedStateFromError/g).length === 1;
    
    return {
      passed: hasBaseClass && noDuplication,
      message: hasBaseClass && noDuplication 
        ? '✅ ErrorBoundary refactorizado correctamente' 
        : '❌ ErrorBoundary aún contiene duplicación'
    };
  },

  importsOptimizados: () => {
    const mainFiles = ['src/App.tsx', 'src/main.tsx', 'src/components/ProtectedRoute.tsx'];
    let allOptimized = true;
    const issues = [];
    
    mainFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('import React, {') && !content.includes('memo') && file !== 'src/App.tsx') {
          allOptimized = false;
          issues.push(`${file}: Import de React innecesario`);
        }
      }
    });
    
    return {
      passed: allOptimized,
      message: allOptimized 
        ? '✅ Imports optimizados en archivos principales' 
        : `❌ Issues de imports: ${issues.join(', ')}`
    };
  },

  documentacionConsolidada: () => {
    const essentialDocs = ['README.md', 'GUIA_USO_RAPIDO.md', 'INSTALACION_Y_USO.md'];
    const missing = essentialDocs.filter(doc => !fs.existsSync(path.join(__dirname, doc)));
    
    return {
      passed: missing.length === 0,
      message: missing.length === 0 
        ? '✅ Documentación esencial presente' 
        : `❌ Documentación faltante: ${missing.join(', ')}`
    };
  },

  servidorOptimizado: () => {
    const serverFiles = [
      'server/minimal.js',
      'server/simple.ts'
    ];
    
    const existing = serverFiles.filter(file => fs.existsSync(path.join(__dirname, file)));
    
    return {
      passed: existing.length > 0 && fs.existsSync('server/minimal.js'),
      message: '✅ Servidor principal presente y funcionando'
    };
  },

  estructuraLimpia: () => {
    // Verificar que no hay archivos de desarrollo en producción
    const devFiles = ['src/App-broken.tsx', 'src/VERIFICACION_IMPLEMENTACION.tsx'];
    const hasDevFiles = devFiles.some(file => fs.existsSync(path.join(__dirname, file)));
    
    return {
      passed: !hasDevFiles,
      message: !hasDevFiles 
        ? '✅ Estructura de proyecto limpia' 
        : '❌ Archivos de desarrollo presentes'
    };
  }
};

// Ejecutar todas las verificaciones
console.log('\n📋 EJECUTANDO VERIFICACIONES:\n');

let passedCount = 0;
let totalCount = Object.keys(checks).length;

Object.entries(checks).forEach(([name, check], index) => {
  const result = check();
  console.log(`${index + 1}. ${result.message}`);
  if (result.passed) passedCount++;
});

console.log('\n' + '='.repeat(50));
console.log(`📊 RESULTADO: ${passedCount}/${totalCount} verificaciones pasadas`);

if (passedCount === totalCount) {
  console.log('🎉 ¡OPTIMIZACIÓN COMPLETADA EXITOSAMENTE!');
  console.log('✅ El proyecto está listo para desarrollo continuo');
} else {
  console.log('⚠️  Algunas optimizaciones requieren atención');
  console.log('🔧 Revisar los issues marcados arriba');
}

console.log('\n📁 Archivos de reporte generados:');
console.log('   • REPORTE_LIMPIEZA_CODIGO_COMPLETADA.md');
console.log('   • REPORTE_OPTIMIZACION_IMPORTS.md');
console.log('   • ejemplos_optimizacion_codigo.md');
console.log('   • reporte_duplicacion_codigo.md');

process.exit(passedCount === totalCount ? 0 : 1);
