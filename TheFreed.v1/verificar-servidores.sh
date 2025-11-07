#!/bin/bash
# Script de verificación de TheFreed.v1

echo "🔍 Verificando TheFreed.v1 - Estado de servidores"
echo "=================================================="
echo

# Verificar backend
echo "🔧 Backend (puerto 5174):"
if curl -s http://localhost:5174/health > /dev/null 2>&1; then
    echo "   ✅ Backend funcionando correctamente"
    curl -s http://localhost:5174/health | jq '.'
else
    echo "   ❌ Backend no responde"
fi

echo

# Verificar API Status
echo "📊 API Status (puerto 5174):"
if curl -s http://localhost:5174/api/status > /dev/null 2>&1; then
    echo "   ✅ API respondiendo"
    curl -s http://localhost:5174/api/status | jq '.'
else
    echo "   ❌ API no responde"
fi

echo

# Verificar frontend
echo "🎨 Frontend (puerto 5173):"
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "   ✅ Frontend funcionando correctamente"
else
    echo "   ❌ Frontend no responde"
fi

echo

# Verificar configuración de variables de entorno
echo "⚙️  Variables de entorno:"
echo "   VITE_API_URL = $(grep VITE_API_URL .env.local | cut -d'=' -f2)"
echo "   PORT = $(grep PORT .env | head -1 | cut -d'=' -f2)"
echo "   CORS_ORIGIN = $(grep CORS_ORIGIN .env | cut -d'=' -f2)"

echo
echo "🏁 Verificación completada"