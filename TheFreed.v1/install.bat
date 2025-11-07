@echo off
REM Script de instalación rápida para TheFreed.v1 (Windows)
REM Este script instala dependencias y configura el entorno local

echo.
echo 🚀 Instalando TheFreed.v1 en tu ordenador...
echo ==================================

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado. Instálalo desde https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
for /f "tokens=*" %%i in ('node --version') do echo    Versión: %%i

REM Verificar npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm no está instalado
    pause
    exit /b 1
)

echo ✅ npm encontrado
for /f "tokens=*" %%i in ('npm --version') do echo    Versión: %%i

REM Copiar archivo .env si no existe
if not exist ".env" (
    echo 📋 Creando archivo .env...
    copy ".env.example" ".env" >nul
    echo ✅ Archivo .env creado
) else (
    echo ✅ Archivo .env ya existe
)

REM Instalar dependencias
echo 📦 Instalando dependencias...
npm install

if %errorlevel% equ 0 (
    echo ✅ Dependencias instaladas correctamente
) else (
    echo ❌ Error al instalar dependencias
    pause
    exit /b 1
)

REM Limpiar caché
echo 🧹 Limpiando caché...
npm run clean:cache

echo.
echo 🎉 ¡Instalación completada!
echo.
echo Para iniciar el proyecto:
echo   npm run dev          # Frontend + Backend
echo   npm run dev:frontend # Solo frontend
echo   npm run dev:backend  # Solo backend
echo.
echo URLs:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3001
echo   Health:   http://localhost:3001/health
echo.
echo ¡Listo para usar! 🚀
echo.
pause