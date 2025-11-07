#!/bin/bash

# Script de verificación de optimización de imports para TheFreed.v1
# Este script verifica que se mantengan las mejores prácticas de imports

echo "🔍 Verificando optimización de imports en TheFreed.v1..."
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

error_count=0
warning_count=0

# Función para reportar errores
report_error() {
    echo -e "${RED}❌ ERROR:${NC} $1"
    ((error_count++))
}

# Función para reportar advertencias
report_warning() {
    echo -e "${YELLOW}⚠️  WARNING:${NC} $1"
    ((warning_count++))
}

# Función para reportar éxito
report_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo ""
echo "🔍 Verificando patrones de imports..."

# Verificar imports de React innecesarios
react_unnecessary=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "import React," | wc -l)
if [ $react_unnecessary -gt 0 ]; then
    report_warning "Se encontraron $react_unnecessary archivos con 'import React,' que podrían no ser necesarios"
    find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "import React," | head -5
else
    report_success "No se encontraron imports de React innecesarios"
fi

# Verificar imports con extensiones
imports_with_extensions=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -n "from ['\"].*\.tsx['\"]" | wc -l)
if [ $imports_with_extensions -gt 0 ]; then
    report_error "Se encontraron $imports_with_extensions imports con extensiones .tsx/.ts"
    find src -name "*.tsx" -o -name "*.ts" | xargs grep -n "from ['\"].*\.tsx['\"]" | head -5
else
    report_success "No se encontraron imports con extensiones"
fi

# Verificar imports de React Router no utilizados
router_unused=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "from 'react-router-dom'" | wc -l)
if [ $router_unused -gt 0 ]; then
    # Verificar si realmente usan las funciones importadas
    for file in $(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "from 'react-router-dom'"); do
        if ! grep -q "useNavigate\|useLocation\|Link\|Routes\|Route\|BrowserRouter" "$file"; then
            report_warning "Archivo $file importa react-router-dom pero no usa funciones del router"
        fi
    done
fi

# Verificar imports duplicados
echo ""
echo "🔍 Verificando imports duplicados..."

# Crear archivo temporal para análisis
temp_file=$(mktemp)
for file in $(find src -name "*.tsx" -o -name "*.ts"); do
    if [ -f "$file" ]; then
        echo "=== $file ===" >> "$temp_file"
        grep "^import" "$file" >> "$temp_file" 2>/dev/null || true
    fi
done

# Buscar duplicados (esto es una verificación básica)
duplicates=$(grep -A1 -B1 "from ['\"]" "$temp_file" | sort | uniq -d | wc -l)
if [ $duplicates -gt 0 ]; then
    report_warning "Posibles imports duplicados encontrados"
else
    report_success "No se detectaron imports duplicados obvios"
fi

rm -f "$temp_file"

# Verificar orden de imports (básico)
echo ""
echo "🔍 Verificando orden básico de imports..."

# Verificar que los imports estén antes de cualquier código
for file in $(find src -name "*.tsx" -o -name "*.ts"); do
    if [ -f "$file" ]; then
        # Buscar líneas de import
        import_lines=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
        if [ ! -z "$import_lines" ]; then
            # Verificar si hay código antes del último import
            code_before_import=$(sed -n "1,${import_lines}p" "$file" | grep -v "^import" | grep -v "^$" | grep -v "^\s*//" | wc -l)
            if [ $code_before_import -gt 0 ]; then
                report_warning "Archivo $file tiene código antes de imports en línea $import_lines"
            fi
        fi
    fi
done

# Estadísticas
echo ""
echo "📊 Estadísticas de archivos verificados:"
total_files=$(find src -name "*.tsx" -o -name "*.ts" | wc -l)
echo "  • Total de archivos TypeScript/TSX: $total_files"

# Contar líneas de import
total_imports=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep "^import" | wc -l)
echo "  • Total de líneas de import: $total_files"

# Verificar uso de type imports para TypeScript
type_imports=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep "import type" | wc -l)
echo "  • Imports con 'type' keyword: $type_imports"

# Resumen final
echo ""
echo "=================================================="
echo "🎯 RESUMEN DE VERIFICACIÓN"
echo "=================================================="

if [ $error_count -eq 0 ] && [ $warning_count -eq 0 ]; then
    report_success "¡Perfecto! No se encontraron problemas de optimización de imports"
    exit 0
elif [ $error_count -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Se encontraron $warning_count advertencias${NC}"
    echo "Revisa las advertencias y considera aplicar las mejoras sugeridas"
    exit 0
else
    echo -e "${RED}❌ Se encontraron $error_count errores y $warning_count advertencias${NC}"
    echo "Es necesario corregir los errores antes de continuar"
    exit 1
fi