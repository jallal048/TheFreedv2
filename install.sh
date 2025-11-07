#!/bin/bash

# Script de instalación rápida para TheFreed.v1
# Este script instala dependencias y configura el entorno local

echo "🚀 Instalando TheFreed.v1 en tu ordenador..."
echo "=================================="

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Instálalo desde https://nodejs.org"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

echo "✅ npm encontrado: $(npm --version)"

# Copiar archivo .env si no existe
if [ ! -f ".env" ]; then
    echo "📋 Creando archivo .env..."
    cp .env.example .env
    echo "✅ Archivo .env creado"
else
    echo "✅ Archivo .env ya existe"
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error al instalar dependencias"
    exit 1
fi

# Limpiar caché
echo "🧹 Limpiando caché..."
npm run clean:cache

echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "Para iniciar el proyecto:"
echo "  npm run dev          # Frontend + Backend"
echo "  npm run dev:frontend # Solo frontend"
echo "  npm run dev:backend  # Solo backend"
echo ""
echo "URLs:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001"
echo "  Health:   http://localhost:3001/health"
echo ""
echo "¡Listo para usar! 🚀"