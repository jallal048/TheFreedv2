# Script de instalación para TheFreed.v1 - Windows PowerShell
# Autor: MiniMax Agent
# Versión: 1.0

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🚀 INSTALADOR DE DEPENDENCIAS" -ForegroundColor Green
Write-Host "TheFreed.v1 - Windows" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Función para verificar si un comando existe
function Test-Command($command) {
    try {
        Get-Command $command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Paso 1: Verificar Node.js
Write-Host "📦 Paso 1: Verificando Node.js..." -ForegroundColor Blue
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 SOLUCIÓN:" -ForegroundColor Yellow
    Write-Host "1. Ve a: https://nodejs.org/" -ForegroundColor White
    Write-Host "2. Descarga e instala Node.js LTS" -ForegroundColor White
    Write-Host "3. Reinicia tu terminal/PC" -ForegroundColor White
    Write-Host "4. Ejecuta este script nuevamente" -ForegroundColor White
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Paso 2: Verificar pnpm
Write-Host ""
Write-Host "📦 Paso 2: Verificando pnpm..." -ForegroundColor Blue
if (Test-Command "pnpm") {
    $pnpmVersion = pnpm --version
    Write-Host "✅ pnpm encontrado: $pnpmVersion" -ForegroundColor Green
} else {
    Write-Host "⚡ Instalando pnpm globalmente..." -ForegroundColor Yellow
    try {
        npm install -g pnpm
        if (Test-Command "pnpm") {
            Write-Host "✅ pnpm instalado exitosamente" -ForegroundColor Green
        } else {
            throw "pnpm no se instaló correctamente"
        }
    }
    catch {
        Write-Host "❌ Error al instalar pnpm" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 SOLUCIÓN ALTERNATIVA:" -ForegroundColor Yellow
        Write-Host "Abre PowerShell como Administrador y ejecuta:" -ForegroundColor White
        Write-Host "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Cyan
        Write-Host "npm install -g pnpm" -ForegroundColor Cyan
        Write-Host ""
        Read-Host "Presiona Enter para salir"
        exit 1
    }
}

# Paso 3: Verificar directorio del proyecto
Write-Host ""
Write-Host "📦 Paso 3: Verificando directorio del proyecto..." -ForegroundColor Blue
$projectDir = Get-Location
Write-Host "📁 Directorio actual: $projectDir" -ForegroundColor White

if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json no encontrado" -ForegroundColor Red
    Write-Host "Asegúrate de ejecutar este script desde el directorio TheFreed.v1" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}
Write-Host "✅ package.json encontrado" -ForegroundColor Green

# Paso 4: Limpiar instalaciones anteriores
Write-Host ""
Write-Host "📦 Paso 4: Limpiando instalaciones anteriores..." -ForegroundColor Blue
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "🗑️ node_modules eliminado" -ForegroundColor Yellow
}
if (Test-Path "pnpm-lock.yaml") {
    Remove-Item "pnpm-lock.yaml"
    Write-Host "🗑️ pnpm-lock.yaml eliminado" -ForegroundColor Yellow
}
Write-Host "✅ Limpieza completada" -ForegroundColor Green

# Paso 5: Instalar dependencias
Write-Host ""
Write-Host "📦 Paso 5: Instalando dependencias..." -ForegroundColor Blue
Write-Host "⏳ Esto puede tomar varios minutos, por favor espera..." -ForegroundColor Yellow

try {
    # Instalar dependencias principales primero
    Write-Host "📦 Instalando dependencias principales..." -ForegroundColor Cyan
    pnpm install @supabase/supabase-js --save
    
    Write-Host "📦 Instalando todas las dependencias..." -ForegroundColor Cyan
    pnpm install
    
    Write-Host "✅ Instalación completada exitosamente" -ForegroundColor Green
}
catch {
    Write-Host ""
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 SOLUCIÓN MANUAL:" -ForegroundColor Yellow
    Write-Host "1. Abre PowerShell como Administrador" -ForegroundColor White
    Write-Host "2. Navega a: $projectDir" -ForegroundColor White
    Write-Host "3. Ejecuta: npm install @supabase/supabase-js" -ForegroundColor Cyan
    Write-Host "4. Ejecuta: pnpm install" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Resumen final
Write-Host ""
Write-Host "🎉 ¡INSTALACIÓN COMPLETADA!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "1. Abre DOS terminals/PowerShell:" -ForegroundColor White
Write-Host "   Terminal 1: pnpm dev:backend" -ForegroundColor Cyan
Write-Host "   Terminal 2: pnpm dev:frontend" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Abre tu navegador en:" -ForegroundColor White
Write-Host "   http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧪 CREDENCIALES DE PRUEBA:" -ForegroundColor Yellow
Write-Host "Email: sdkwhfda@minimax.com" -ForegroundColor White
Write-Host "Password: xr1duq4yYt" -ForegroundColor White
Write-Host ""
Write-Host "🔧 COMANDOS ÚTILES:" -ForegroundColor Yellow
Write-Host "Test backend: pnpm test:backend" -ForegroundColor Cyan
Write-Host "Ver estado: pnpm backend:status" -ForegroundColor Cyan
Write-Host ""
Read-Host "Presiona Enter para salir"
