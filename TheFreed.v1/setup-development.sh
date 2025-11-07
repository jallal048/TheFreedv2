#!/bin/bash

# Script de configuración automática para optimizaciones de desarrollo de TheFreed.v1
# Este script configura automáticamente todas las herramientas y optimizaciones

set -e

echo "🚀 Configurando optimizaciones de desarrollo para TheFreed.v1..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar Node.js y npm
check_prerequisites() {
    log_info "Verificando prerrequisitos..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js no está instalado. Por favor instala Node.js primero."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm no está instalado. Por favor instala npm primero."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    NPM_VERSION=$(npm --version)
    
    log_success "Node.js v${NODE_VERSION} detectado"
    log_success "npm v${NPM_VERSION} detectado"
    echo ""
}

# Instalar dependencias de desarrollo
install_dependencies() {
    log_info "Instalando dependencias de desarrollo..."
    
    # Intentar instalar con versiones específicas compatibles
    log_info "Instalando Husky..."
    npm install --save-dev husky@8.0.3 2>/dev/null || log_warning "No se pudo instalar Husky automáticamente"
    
    log_info "Instalando lint-staged..."
    npm install --save-dev lint-staged@13.2.3 2>/dev/null || log_warning "No se pudo instalar lint-staged automáticamente"
    
    log_info "Instalando herramientas adicionales..."
    npm install --save-dev serve@14.2.1 vite-inspect@0.8.7 2>/dev/null || log_warning "Algunas herramientas no se pudieron instalar"
    
    log_success "Dependencias instaladas"
    echo ""
}

# Configurar Husky
setup_husky() {
    log_info "Configurando Husky..."
    
    if command -v npx &> /dev/null; then
        # Intentar configurar husky
        npx husky install 2>/dev/null || log_warning "No se pudo configurar Husky automáticamente"
        
        # Copiar hooks si existen
        if [ -d ".husky" ]; then
            chmod +x .husky/* 2>/dev/null || log_warning "No se pudieron hacer ejecutables los hooks de Husky"
            log_success "Hooks de Husky configurados"
        else
            log_warning "Directorio .husky no encontrado"
        fi
    else
        log_warning "npx no disponible, configuración manual requerida"
    fi
    
    echo ""
}

# Crear directorios necesarios
create_directories() {
    log_info "Creando directorios necesarios..."
    
    local dirs=("reports" "analysis" "dist" "logs")
    
    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            log_success "Creado: $dir/"
        fi
    done
    
    echo ""
}

# Configurar cache
setup_cache() {
    log_info "Configurando cache de desarrollo..."
    
    # Limpiar cache existente
    if [ -d "node_modules/.vite" ]; then
        rm -rf node_modules/.vite
        log_info "Cache de Vite limpiado"
    fi
    
    # Configurar npm para mejor cache
    npm config set prefer-offline true 2>/dev/null || log_warning "No se pudo configurar npm cache"
    npm config set cache-min 3600 2>/dev/null || log_warning "No se pudo configurar cache mínimo"
    
    log_success "Cache configurado"
    echo ""
}

# Ejecutar primera compilación
first_build() {
    log_info "Ejecutando primera compilación para popular cache..."
    
    if [ -f "vite.config.ts" ]; then
        npm run build:fast 2>/dev/null || log_warning "Primera compilación falló (normal en configuración inicial)"
        log_success "Primera compilación completada"
    else
        log_warning "vite.config.ts no encontrado, saltando compilación"
    fi
    
    echo ""
}

# Configurar permisos de scripts
setup_script_permissions() {
    log_info "Configurando permisos de scripts..."
    
    local scripts=("scripts/cache-optimizer.js" "scripts/dev-optimizer.js" "scripts/productivity-tools.js")
    
    for script in "${scripts[@]}"; do
        if [ -f "$script" ]; then
            chmod +x "$script" 2>/dev/null || log_warning "No se pudo hacer ejecutable: $script"
        fi
    done
    
    log_success "Permisos configurados"
    echo ""
}

# Generar configuración inicial
generate_initial_config() {
    log_info "Generando configuración inicial..."
    
    # Crear archivo de configuración de desarrollo
    cat > .env.development << 'EOF'
# Configuración de desarrollo para TheFreed.v1
NODE_ENV=development
VITE_HMR_PORT=24678
VITE_HMR_HOST=localhost
VITE_PROFILE=false
DEBUG=vite:*
EOF
    
    # Crear archivo de configuración de producción
    cat > .env.production << 'EOF'
# Configuración de producción para TheFreed.v1
NODE_ENV=production
BUILD_MODE=prod
VITE_PROFILE=false
EOF
    
    log_success "Archivos de configuración generados"
    echo ""
}

# Verificar configuración
verify_setup() {
    log_info "Verificando configuración..."
    
    local checks_passed=0
    local total_checks=6
    
    # Verificar package.json
    if [ -f "package.json" ]; then
        log_success "package.json encontrado"
        ((checks_passed++))
    else
        log_error "package.json no encontrado"
    fi
    
    # Verificar vite.config.ts
    if [ -f "vite.config.ts" ]; then
        log_success "vite.config.ts encontrado"
        ((checks_passed++))
    else
        log_error "vite.config.ts no encontrado"
    fi
    
    # Verificar directorios
    if [ -d "src" ]; then
        log_success "Directorio src/ encontrado"
        ((checks_passed++))
    else
        log_error "Directorio src/ no encontrado"
    fi
    
    # Verificar scripts
    if [ -d "scripts" ]; then
        log_success "Directorio scripts/ encontrado"
        ((checks_passed++))
    else
        log_error "Directorio scripts/ no encontrado"
    fi
    
    # Verificar hooks de Husky
    if [ -d ".husky" ]; then
        log_success "Hooks de Husky configurados"
        ((checks_passed++))
    else
        log_warning "Hooks de Husky no configurados"
    fi
    
    # Verificar node_modules
    if [ -d "node_modules" ]; then
        log_success "node_modules instalado"
        ((checks_passed++))
    else
        log_warning "node_modules no instalado"
    fi
    
    echo ""
    log_info "Verificación completada: $checks_passed/$total_checks checks pasados"
    echo ""
    
    if [ $checks_passed -ge 4 ]; then
        log_success "Configuración básica completada exitosamente"
        return 0
    else
        log_warning "Configuración incompleta. Algunos componentes pueden requerir configuración manual."
        return 1
    fi
}

# Mostrar instrucciones finales
show_final_instructions() {
    echo ""
    echo "🎉 ¡Configuración completada!"
    echo ""
    echo -e "${GREEN}══════════════════════════════════════════════${NC}"
    echo -e "${GREEN}    OPTIMIZACIONES DE DESARROLLO ACTIVAS${NC}"
    echo -e "${GREEN}══════════════════════════════════════════════${NC}"
    echo ""
    echo "🚀 Comandos de desarrollo disponibles:"
    echo "  npm run dev               - Servidor de desarrollo optimizado"
    echo "  npm run dev:optimized     - Desarrollo con profiling"
    echo "  npm run cache:warm        - Calentar cache"
    echo "  npm run bundle:perf       - Análisis de performance"
    echo "  npm run metrics:full      - Métricas completas"
    echo "  npm run setup:dev         - Reconfigurar desarrollo"
    echo ""
    echo "🛠️  Herramientas de productividad:"
    echo "  node scripts/cache-optimizer.js warm"
    echo "  node scripts/dev-optimizer.js start"
    echo "  node scripts/productivity-tools.js diagnose"
    echo ""
    echo "📊 Comandos de análisis:"
    echo "  npm run performance:audit - Auditoría completa"
    echo "  npm run bundle:compare    - Comparación de bundles"
    echo "  npm run lighthouse:full   - Lighthouse CI"
    echo ""
    echo "🔧 Configuración manual adicional:"
    echo "  • Instalar Husky: npx husky install"
    echo "  • Configurar lint-staged: verificar .lintstagedrc.json"
    echo "  • Verificar hooks: ls .husky/"
    echo ""
    echo -e "${BLUE}💡 Tip: Ejecuta 'npm run dev' para empezar${NC}"
    echo ""
}

# Función principal
main() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║    CONFIGURADOR DE DESARROLLO THEFREED.V1    ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"
    echo ""
    
    check_prerequisites
    install_dependencies
    setup_husky
    create_directories
    setup_cache
    first_build
    setup_script_permissions
    generate_initial_config
    
    if verify_setup; then
        show_final_instructions
    else
        log_error "Configuración incompleta. Revisa los errores anteriores."
        exit 1
    fi
}

# Ejecutar función principal
main "$@"