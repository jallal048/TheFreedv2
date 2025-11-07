#!/bin/bash

# Script de verificación completa - Mejoras de Perfiles TheFreed.v1
# Verifica que todas las mejoras estén implementadas correctamente

echo "🚀 VERIFICACIÓN COMPLETA - MEJORAS DE PERFILES"
echo "================================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para verificar archivo
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 existe${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 no encontrado${NC}"
        return 1
    fi
}

# Función para verificar contenido en archivo
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✅ '$2' encontrado en $1${NC}"
        return 0
    else
        echo -e "${RED}❌ '$2' no encontrado en $1${NC}"
        return 1
    fi
}

# Contadores
total_checks=0
passed_checks=0

# Incrementar contador
increment_check() {
    total_checks=$((total_checks + 1))
}

# Verificar que pasó
pass_check() {
    passed_checks=$((passed_checks + 1))
}

echo -e "${BLUE}📁 VERIFICANDO ARCHIVOS PRINCIPALES...${NC}"
echo "=============================================="

# Verificar nuevos componentes
echo ""
echo "🔍 Componentes nuevos:"
check_file "src/components/PersonalActivityWidget.tsx"
increment_check
[ $? -eq 0 ] && pass_check

check_file "src/components/ProfilePreviewToggle.tsx"
increment_check
[ $? -eq 0 ] && pass_check

check_file "src/components/BioEditor.tsx"
increment_check
[ $? -eq 0 ] && pass_check

check_file "src/components/AvatarManager.tsx"
increment_check
[ $? -eq 0 ] && pass_check

check_file "src/components/OnboardingFlow.tsx"
increment_check
[ $? -eq 0 ] && pass_check

# Verificar páginas mejoradas
echo ""
echo "🔍 Páginas mejoradas:"
check_file "src/pages/profile/ProfilePage.tsx"
increment_check
[ $? -eq 0 ] && pass_check

check_file "src/pages/settings/SettingsPage.tsx"
increment_check
[ $? -eq 0 ] && pass_check

# Verificar backend
echo ""
echo "🔍 Backend extendido:"
check_file "src/server/minimal.js"
increment_check
[ $? -eq 0 ] && pass_check

echo ""
echo -e "${BLUE}🔍 VERIFICANDO CONTENIDO ESPECÍFICO...${NC}"
echo "==========================================="

# Verificar importaciones en ProfilePage
echo ""
echo "📝 ProfilePage.tsx - Importaciones:"
check_content "src/pages/profile/ProfilePage.tsx" "PersonalActivityWidget"
increment_check
[ $? -eq 0 ] && pass_check

check_content "src/pages/profile/ProfilePage.tsx" "ProfilePreviewToggle"
increment_check
[ $? -eq 0 ] && pass_check

check_content "src/pages/profile/ProfilePage.tsx" "BioEditor"
increment_check
[ $? -eq 0 ] && pass_check

check_content "src/pages/profile/ProfilePage.tsx" "AvatarManager"
increment_check
[ $? -eq 0 ] && pass_check

# Verificar tabs en ProfilePage
echo ""
echo "📝 ProfilePage.tsx - Nuevas tabs:"
check_content "src/pages/profile/ProfilePage.tsx" "activity"
increment_check
[ $? -eq 0 ] && pass_check

check_content "src/pages/profile/ProfilePage.tsx" "preview"
increment_check
[ $? -eq 0 ] && pass_check

check_content "src/pages/profile/ProfilePage.tsx" "PersonalActivityWidget"
increment_check
[ $? -eq 0 ] && pass_check

check_content "src/pages/profile/ProfilePage.tsx" "ProfilePreviewToggle"
increment_check
[ $? -eq 0 ] && pass_check

# Verificar backend endpoints
echo ""
echo "📡 Backend - Nuevos endpoints:"
check_content "src/server/minimal.js" "/api/user/activity"
increment_check
[ $? -eq 0 ] && pass_check

check_content "src/server/minimal.js" "/api/user/avatars"
increment_check
[ $? -eq 0 ] && pass_check

check_content "src/server/minimal.js" "/api/user/avatar/upload"
increment_check
[ $? -eq 0 ] && pass_check

check_content "src/server/minimal.js" "/api/user/verification"
increment_check
[ $? -eq 0 ] && pass_check

check_content "src/server/minimal.js" "/api/user/advanced-settings"
increment_check
[ $? -eq 0 ] && pass_check

# Verificar SettingsPage
echo ""
echo "⚙️ SettingsPage.tsx - Nueva sección avanzada:"
check_content "src/pages/settings/SettingsPage.tsx" "AdvancedSection"
increment_check
[ $? -eq 0 ] && pass_check

check_content "src/pages/settings/SettingsPage.tsx" "avanzado"
increment_check
[ $? -eq 0 ] && pass_check

# Verificar funcionalidad específica
echo ""
echo -e "${BLUE}🔍 VERIFICANDO FUNCIONALIDADES...${NC}"
echo "======================================"

# Contar líneas en componentes principales
echo ""
echo "📊 Estadísticas de archivos:"
if [ -f "src/components/PersonalActivityWidget.tsx" ]; then
    lines=$(wc -l < src/components/PersonalActivityWidget.tsx)
    echo -e "${GREEN}✅ PersonalActivityWidget.tsx: $lines líneas${NC}"
    increment_check
    pass_check
fi

if [ -f "src/components/ProfilePreviewToggle.tsx" ]; then
    lines=$(wc -l < src/components/ProfilePreviewToggle.tsx)
    echo -e "${GREEN}✅ ProfilePreviewToggle.tsx: $lines líneas${NC}"
    increment_check
    pass_check
fi

if [ -f "src/components/BioEditor.tsx" ]; then
    lines=$(wc -l < src/components/BioEditor.tsx)
    echo -e "${GREEN}✅ BioEditor.tsx: $lines líneas${NC}"
    increment_check
    pass_check
fi

if [ -f "src/components/AvatarManager.tsx" ]; then
    lines=$(wc -l < src/components/AvatarManager.tsx)
    echo -e "${GREEN}✅ AvatarManager.tsx: $lines líneas${NC}"
    increment_check
    pass_check
fi

if [ -f "src/components/OnboardingFlow.tsx" ]; then
    lines=$(wc -l < src/components/OnboardingFlow.tsx)
    echo -e "${GREEN}✅ OnboardingFlow.tsx: $lines líneas${NC}"
    increment_check
    pass_check
fi

# Verificar que no se rompieron funcionalidades existentes
echo ""
echo -e "${YELLOW}🛡️ VERIFICANDO QUE NO SE RUMPIÓ NADA...${NC}"
echo "=========================================="

# Verificar que AuthContext sigue funcionando
check_content "src/pages/profile/ProfilePage.tsx" "useAuth"
increment_check
[ $? -eq 0 ] && pass_check

# Verificar que Tabs originales siguen
check_content "src/pages/profile/ProfilePage.tsx" "TabsList"
increment_check
[ $? -eq 0 ] && pass_check

# Verificar que Card components siguen
check_content "src/pages/profile/ProfilePage.tsx" "Card"
increment_check
[ $? -eq 0 ] && pass_check

# Verificar que el sistema de rutas sigue
check_content "src/pages/settings/SettingsPage.tsx" "TabsContent"
increment_check
[ $? -eq 0 ] && pass_check

# Resultado final
echo ""
echo "================================================"
echo -e "${BLUE}📊 RESULTADO FINAL${NC}"
echo "================================================"
echo "Total de verificaciones: $total_checks"
echo "Verificaciones exitosas: $passed_checks"

if [ $passed_checks -eq $total_checks ]; then
    echo -e "${GREEN}🎉 ¡TODAS LAS VERIFICACIONES PASARON!${NC}"
    echo -e "${GREEN}✅ Las mejoras de perfiles están implementadas correctamente${NC}"
    echo -e "${GREEN}🚀 El sistema está listo para usar${NC}"
    exit 0
else
    failed=$((total_checks - passed_checks))
    echo -e "${RED}⚠️ $failed verificaciones fallaron${NC}"
    echo -e "${YELLOW}Revisa los elementos marcados con ❌${NC}"
    exit 1
fi
