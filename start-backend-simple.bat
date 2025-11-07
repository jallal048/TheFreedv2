@echo off
echo 🔧 Iniciando Backend - Servidor Simplificado
echo.
echo ✅ El servidor simplificado evita problemas de Prisma
echo ✅ Perfecto para desarrollo frontend
echo.
echo 🖥️  Backend ejecutándose en: http://localhost:5174
echo 📊 Health Check: http://localhost:5174/health
echo 🔗 API Status: http://localhost:5174/api/status
echo.
echo ⚠️  Mantén esta ventana abierta
echo 🛑 Presiona Ctrl+C para detener
echo.

npx tsx watch src/server/simple.ts