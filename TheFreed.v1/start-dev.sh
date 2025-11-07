#!/bin/bash
echo "🚀 Iniciando TheFreed.v1 - Desarrollo"
echo ""

echo "📦 Instalando dependencias..."
pnpm install
if [ $? -ne 0 ]; then
    echo "❌ Error en instalación"
    exit 1
fi

echo ""
echo "🖥️  Abriendo frontend en http://localhost:5173"
echo "🔧 Backend estará en http://localhost:5174"
echo ""
echo "⚠️  Mantén esta terminal abierta para ver los logs"
echo "🛑 Presiona Ctrl+C para detener ambos servidores"
echo ""

# Ejecutar frontend y backend en paralelo
pnpm run dev:frontend &
pnpm run dev:backend &

echo ""
echo "✅ Servidores iniciados"
echo "🎨 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:5174"
echo ""

# Esperar a que el usuario presione Ctrl+C
wait