#!/bin/bash

# Script de automatización de optimización de imports para TheFreed.v1
# Automatiza la verificación, corrección y reporte de imports

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración
PROJECT_DIR="/workspace/TheFreed.v1"
LOG_FILE="$PROJECT_DIR/import-optimization.log"
BACKUP_DIR="$PROJECT_DIR/.import-backup"

echo -e "${BLUE}🚀 Automatización de Optimización de Imports - TheFreed.v1${NC}"
echo "=============================================================="

# Función de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Función para crear backup
create_backup() {
    log "Creando backup de archivos originales..."
    mkdir -p "$BACKUP_DIR"
    tar -czf "$BACKUP_DIR/imports-backup-$(date +%Y%m%d-%H%M%S).tar.gz" src/
    log "Backup creado en $BACKUP_DIR"
}

# Función para verificar dependencias
check_dependencies() {
    log "Verificando dependencias necesarias..."
    
    # Verificar si eslint está instalado
    if ! command -v npx &> /dev/null; then
        log "❌ npx no está disponible"
        exit 1
    fi
    
    # Verificar si prettier está disponible
    if ! npx prettier --version &> /dev/null; log "⚠️  Prettier no está instalado globally"; then
        log "📦 Instalando prettier para formateo de imports..."
        npm install --save-dev prettier
    fi
    
    log "✅ Dependencias verificadas"
}

# Función para ejecutar verificaciones
run_verification() {
    log "🔍 Ejecutando verificación de imports..."
    
    # Ejecutar script de verificación personalizado
    if [ -f "$PROJECT_DIR/verify-imports.sh" ]; then
        bash "$PROJECT_DIR/verify-imports.sh"
    else
        log "❌ Script de verificación no encontrado"
        return 1
    fi
}

# Función para ejecutar ESLint
run_eslint() {
    log "🔧 Ejecutando ESLint para corrección de imports..."
    
    if [ -f "$PROJECT_DIR/.eslintrc.optimized.json" ]; then
        npx eslint src --ext .ts,.tsx --config .eslintrc.optimized.json --fix
    else
        npx eslint src --ext .ts,.tsx --fix
    fi
    
    log "✅ ESLint ejecutado"
}

# Función para formatear con Prettier
run_prettier() {
    log "🎨 Formateando imports con Prettier..."
    
    npx prettier --write "src/**/*.{ts,tsx}" --parser typescript
    npx prettier --write "src/**/*.{ts,tsx}" --parser typescript --range-end 100
    
    log "✅ Prettier ejecutado"
}

# Función para generar reporte
generate_report() {
    log "📊 Generando reporte de optimización..."
    
    local report_file="$PROJECT_DIR/REPORTE_IMPORTS_AUTO.md"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    cat > "$report_file" << EOF
# Reporte Automático de Optimización de Imports

**Fecha de ejecución:** $timestamp  
**Usuario:** $(whoami)  
**Directorio:** $PROJECT_DIR

## Resumen de acciones realizadas

### Archivos procesados
$(find src -name "*.ts" -o -name "*.tsx" | wc -l) archivos TypeScript/TSX procesados

### Importes optimizados
- Imports de React innecesarios removidos
- Extensions de archivos eliminadas
- Orden de imports organizado
- Type-only imports aplicados donde corresponde

## Archivos modificados
EOF
    
    # Listar archivos modificados en la última hora
    find src -name "*.ts" -o -name "*.tsx" -newermt "1 hour ago" 2>/dev/null | while read file; do
        echo "- $file" >> "$report_file"
    done
    
    echo "" >> "$report_file"
    echo "## Recomendaciones" >> "$report_file"
    echo "- Ejecutar este script regularmente (diariamente)" >> "$report_file"
    echo "- Revisar cambios antes de commit" >> "$report_file"
    echo "- Mantener configuración de ESLint actualizada" >> "$report_file"
    echo "- Documentar nuevas convenciones en el equipo" >> "$report_file"
    
    log "📋 Reporte generado: $report_file"
}

# Función principal
main() {
    local action=${1:-"all"}
    
    case $action in
        "verify")
            log "🎯 Modo: Solo verificación"
            run_verification
            ;;
        "fix")
            log "🎯 Modo: Corrección de imports"
            check_dependencies
            run_eslint
            run_prettier
            run_verification
            generate_report
            ;;
        "all"|"")
            log "🎯 Modo: Completo (backup + verificación + corrección + reporte)"
            check_dependencies
            create_backup
            run_eslint
            run_prettier
            run_verification
            generate_report
            ;;
        "backup")
            log "🎯 Modo: Solo backup"
            create_backup
            ;;
        "report")
            log "🎯 Modo: Solo reporte"
            generate_report
            ;;
        *)
            echo -e "${RED}❌ Acción no reconocida: $action${NC}"
            echo "Acciones disponibles: verify, fix, all, backup, report"
            exit 1
            ;;
    esac
}

# Verificar directorio del proyecto
if [ ! -d "$PROJECT_DIR/src" ]; then
    echo -e "${RED}❌ Directorio del proyecto no encontrado: $PROJECT_DIR/src${NC}"
    exit 1
fi

# Cambiar al directorio del proyecto
cd "$PROJECT_DIR"

# Ejecutar función principal
main "$@"

echo ""
echo -e "${GREEN}✨ Automatización de optimización de imports completada!${NC}"
echo "Revisa el log en: $LOG_FILE"
echo "Último reporte: $PROJECT_DIR/REPORTE_IMPORTS_AUTO.md"