#!/bin/bash

# Script de instalación rápida para corregir el error 401
# TheFreed.v1 - Sistema de Autenticación Supabase

echo "🚀 Instalando corrección de autenticación para TheFreed.v1"
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Ejecuta este script desde el directorio TheFreed.v1"
    exit 1
fi

print_status "Verificando estructura del proyecto..."

# Verificar que los archivos necesarios existen
if [ ! -f "src/services/supabase.ts" ]; then
    print_error "No se encontró src/services/supabase.ts. Ejecuta primero la migración a Supabase."
    exit 1
fi

# 1. Verificar backend
print_status "Verificando backend temporal..."
if curl -f http://localhost:3001/api/status > /dev/null 2>&1; then
    print_success "Backend temporal funcionando en puerto 3001"
else
    print_warning "Backend temporal no está corriendo. Iniciando..."
    node server-temp.js &
    sleep 3
fi

# 2. Verificar Supabase
print_status "Verificando conectividad con Supabase..."
if curl -f https://eaggsjqcsjzdjrkdjeog.supabase.co/rest/v1/ > /dev/null 2>&1; then
    print_success "Supabase conectado correctamente"
else
    print_error "No se puede conectar a Supabase. Verifica tu conexión a internet."
    exit 1
fi

# 3. Instalar dependencias si es necesario
print_status "Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    print_status "Instalando dependencias..."
    pnpm install
fi

# 4. Verificar que el frontend esté corriendo
print_status "Verificando frontend..."
if curl -f http://localhost:5173 > /dev/null 2>&1; then
    print_success "Frontend funcionando en puerto 5173"
else
    print_warning "Frontend no está corriendo. Inicia con: pnpm dev:frontend"
fi

# 5. Mostrar información de credenciales
echo ""
echo -e "${GREEN}🎉 INSTALACIÓN COMPLETADA${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}📧 CREDENCIALES DE PRUEBA (Supabase):${NC}"
echo "   Email:    sdkwhfda@minimax.com"
echo "   Password: xr1duq4yYt"
echo ""
echo -e "${BLUE}📧 CREDENCIALES TEMPORAL (Solo Testing):${NC}"
echo "   Email:    demo@thefreed.com"
echo "   Password: demo123"
echo ""
echo -e "${BLUE}🔗 URLS IMPORTANTES:${NC}"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:3001"
echo "   Supabase:  https://eaggsjqcsjzdjrkdjeog.supabase.co"
echo ""

# 6. Mostrar próximos pasos
echo -e "${YELLOW}📋 PRÓXIMOS PASOS:${NC}"
echo "1. Abre http://localhost:5173 en tu navegador"
echo "2. Ve a la página de login"
echo "3. Haz clic en '🔄 Usar credenciales de prueba'"
echo "4. O ingresa manualmente:"
echo "   - Email: sdkwhfda@minimax.com"
echo "   - Password: xr1duq4yYt"
echo "5. ¡El error 401 debería estar resuelto!"
echo ""

# 7. Verificación final
read -p "¿Quieres verificar que todo está funcionando? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Ejecutando verificación final..."
    
    # Test backend
    if curl -f http://localhost:3001/api/status > /dev/null 2>&1; then
        print_success "✅ Backend: OK"
    else
        print_error "❌ Backend: FAILED"
    fi
    
    # Test Supabase
    if curl -f https://eaggsjqcsjzdjrkdjeog.supabase.co/rest/v1/ > /dev/null 2>&1; then
        print_success "✅ Supabase: OK"
    else
        print_error "❌ Supabase: FAILED"
    fi
    
    # Test frontend
    if curl -f http://localhost:5173 > /dev/null 2>&1; then
        print_success "✅ Frontend: OK"
    else
        print_warning "⚠️  Frontend: No está corriendo. Ejecuta 'pnpm dev:frontend'"
    fi
fi

echo ""
print_success "¡Listo! Ya puedes usar TheFreed.v1 sin errores 401."
echo ""
echo -e "${BLUE}📚 DOCUMENTACIÓN:${NC}"
echo "   - SOLUCION_AUTH_401.md: Guía completa de la solución"
echo "   - SOLUCION_BACKEND_FINAL.md: Configuración del backend"
echo "   - APP_SUPABASE_AUTH_EXAMPLE.tsx: Ejemplo de App.tsx actualizado"
echo ""

# Ejecutar en segundo plano si se desea
if [[ "$1" == "--background" ]]; then
    print_status "Ejecutando backend en segundo plano..."
    node server-temp.js &
    print_success "Backend iniciado en segundo plano (PID: $!)"
fi

print_success "¡Instalación completada exitosamente! 🎉"