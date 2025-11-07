@echo off
echo 🚀 Iniciando TheFreed.v1 - Desarrollo
echo.

echo 📦 Instalando dependencias...
pnpm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error en instalación
    pause
    exit /b 1
)

echo.
echo 🖥️  Abriendo frontend en http://localhost:5173
echo 🔧 Backend estará en http://localhost:5174
echo.
echo ⚠️  Mantén esta ventana abierta para ver los logs
echo 🛑 Presiona Ctrl+C para detener ambos servidores
echo.

REM Ejecutar frontend y backend en paralelo usando start
start "Frontend" cmd /k "pnpm run dev:frontend"
start "Backend" cmd /k "node src/server/minimal.js"

echo.
echo ✅ Servidores iniciados
echo 🎨 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:5174
echo.
pause