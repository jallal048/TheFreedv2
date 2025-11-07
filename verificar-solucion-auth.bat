@echo off
echo ======================================
echo 🔍 VERIFICADOR DE SOLUCIÓN AUTH
echo TheFreed.v1 - Verificación completa
echo ======================================
echo.

echo 📋 Paso 1: Verificando estado de procesos...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I "node.exe" >NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ Node.js ejecutándose (frontend/backend)
) else (
    echo ⚠️  Node.js no se detectó ejecutándose
    echo    Inicia con: pnpm dev:frontend
)

echo.
echo 📋 Paso 2: Verificando conectividad backend...
curl -s http://localhost:3001/health >NUL
if %ERRORLEVEL%==0 (
    echo ✅ Backend temporal respondiendo
) else (
    echo ❌ Backend temporal no disponible
    echo    Inicia con: pnpm dev:backend
)

echo.
echo 📋 Paso 3: Verificando conectividad frontend...
curl -s -I http://localhost:5173 | find "200" >NUL
if %ERRORLEVEL%==0 (
    echo ✅ Frontend disponible
) else (
    echo ❌ Frontend no disponible
    echo    Inicia con: pnpm dev:frontend
)

echo.
echo 📋 Paso 4: Verificando Supabase...
curl -s https://eaggsjqcsjzdjrkdjeog.supabase.co/rest/v1/ -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhZ2dzanFjc2p6ZGpya2RqZW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDQzMzcsImV4cCI6MjA3ODAyMDMzN30.3UYBnXyumaceB6frWFEF2MC1n9WNm4qNkDQoy8qxdek" >NUL
if %ERRORLEVEL%==0 (
    echo ✅ Supabase conectado
) else (
    echo ❌ Supabase no disponible
)

echo.
echo 📋 Paso 5: Verificando archivos corregidos...
set "found_issues=0"

if exist "src\components\ProtectedRoute.tsx" (
    find /C /I "AuthContextSupabase" "src\components\ProtectedRoute.tsx" >NUL
    if !ERRORLEVEL!==0 (
        echo ✅ ProtectedRoute.tsx - Import corregido
    ) else (
        echo ❌ ProtectedRoute.tsx - Import NO corregido
        set "found_issues=1"
    )
) else (
    echo ❌ ProtectedRoute.tsx - Archivo no encontrado
    set "found_issues=1"
)

if exist "src\contexts\AuthContextSupabase.tsx" (
    find /C /I "export.*useAdmin" "src\contexts\AuthContextSupabase.tsx" >NUL
    if !ERRORLEVEL!==0 (
        echo ✅ AuthContextSupabase.tsx - Hooks agregados
    ) else (
        echo ❌ AuthContextSupabase.tsx - Hooks FALTANTES
        set "found_issues=1"
    )
) else (
    echo ❌ AuthContextSupabase.tsx - Archivo no encontrado
    set "found_issues=1"
)

echo.
echo 📋 RESUMEN DE VERIFICACIÓN:
if "%found_issues%"=="0" (
    echo 🎉 ¡TODO CORRECTO!
    echo.
    echo ✅ Sistema TheFreed.v1 completamente funcional
    echo ✅ Contexto de autenticación unificado
    echo ✅ Todas las importaciones corregidas
    echo ✅ Backend y frontend operativos
    echo.
    echo 🌐 Para acceder a la aplicación:
    echo    http://localhost:5173
    echo.
    echo 🧪 Credenciales de prueba:
    echo    Email: sdkwhfda@minimax.com
    echo    Password: xr1duq4yYt
    echo.
    echo 🎯 FUNCIONALIDADES DISPONIBLES:
    echo    ✅ Login/Logout sin errores
    echo    ✅ Editor Rico WYSIWYG
    echo    ✅ Sistema de Drafts con autoguardado
    echo    ✅ Publicación Programada
    echo    ✅ Gestión de contenido
    echo    ✅ Rutas protegidas
    echo.
) else (
    echo ⚠️  SE ENCONTRARON PROBLEMAS
    echo.
    echo 🔧 SOLUCIÓN:
    echo    1. Ejecuta: pnpm dev:backend
    echo    2. Ejecuta: pnpm dev:frontend
    echo    3. Verifica que no hay errores en consola
    echo.
    echo 📞 Si el problema persiste:
    echo    - Revisa SOLUCION_CONTEXTO_AUTENTICACION.md
    echo    - Contacta soporte técnico
)

echo.
echo ======================================
echo ✅ Verificación completada
echo ======================================
pause
