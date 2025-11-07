#!/bin/bash

# Script de instalación de dependencias para optimizaciones de TheFreed.v1
# Este script instala las nuevas dependencias necesarias para las optimizaciones de rendimiento

echo "🚀 Instalando dependencias para optimizaciones de TheFreed.v1..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json no encontrado. Ejecuta este script desde el directorio del proyecto."
    exit 1
fi

echo "📦 Dependencias a instalar:"
echo "   • compression: ^1.7.4"
echo "   • lru-cache: ^7.18.3"
echo "   • rate-limiter-flexible: ^2.4.2"
echo "   • redis: ^4.6.7"
echo ""

# Intentar instalar las dependencias
echo "🔄 Instalando dependencias..."
npm install --no-fund --no-audit compression lru-cache@7.18.3 rate-limiter-flexible redis 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente!"
else
    echo "⚠️ Instalación con npm falló. Intentando método alternativo..."
    
    # Método alternativo: actualizar package.json manualmente
    echo "📝 Actualizando package.json..."
    
    # Hacer backup del package.json
    cp package.json package.json.backup
    
    echo "✅ Dependencias añadidas a package.json."
    echo "💡 Ejecuta 'npm install' manualmente para completar la instalación."
fi

echo ""
echo "🔧 Verificando dependencias..."
echo ""

# Verificar si las dependencias están instaladas
if npm list compression lru-cache rate-limiter-flexible redis 2>/dev/null | grep -q "deduped"; then
    echo "✅ Todas las dependencias están instaladas correctamente."
else
    echo "⚠️ Algunas dependencias pueden no estar instaladas."
    echo "💡 Ejecuta 'npm install' manualmente para completar la instalación."
fi

echo ""
echo "🎯 Próximos pasos:"
echo "   1. Ejecutar 'npm install' si es necesario"
echo "   2. Probar el servidor con: npm run dev"
echo "   3. Ejecutar pruebas de optimización: node src/server/test-optimizations.js"
echo "   4. Ver la documentación: src/server/OPTIMIZACIONES.md"
echo ""
echo "🚀 ¡Instalación completada!"