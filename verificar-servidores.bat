@echo off
echo 🔍 Verificando TheFreed.v1 - Estado de servidores
echo ==================================================
echo.

echo 🔧 Backend (puerto 3001):
echo    Comprobando salud del servidor...
curl -s -m 5 http://localhost:3001/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    ✅ Backend funcionando correctamente
) else (
    echo    ⚠️  Backend no responde (puede estar iniciando)
)

echo.
echo 🎨 Frontend (puerto 5173):
echo    Comprobando interfaz web...
curl -s -m 5 http://localhost:5173 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    ✅ Frontend funcionando correctamente
) else (
    echo    ⚠️  Frontend no responde (puede estar iniciando)
)

echo.
echo ⚙️  Configuración actual:
echo    VITE_API_URL = http://localhost:3001
echo    Puerto Backend = 3001
echo    Puerto Frontend = 5173

echo.
echo 📊 Para ver logs detallados:
echo    - Backend: Revisar terminal donde se ejecutó 'node src/server/minimal.js'
echo    - Frontend: Revisar terminal donde se ejecutó 'pnpm run dev:frontend'

echo.
echo 🏁 Verificación completada
pause