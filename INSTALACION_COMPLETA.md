# 🛠️ **GUÍA DEFINITIVA DE INSTALACIÓN - TheFreed.v1**

## 📋 **Paso a Paso Completo**

### **1. Verificar/Requisitos Previos**

```bash
# Verificar versión de Node.js
node --version
# Debe ser v20.x.x o superior

# Si tienes una versión anterior, actualiza desde:
# https://nodejs.org/
```

### **2. Descargar el Proyecto**

Si aún no tienes el código:
```bash
# El código ya está en tu workspace: /workspace/TheFreed.v1/
cd /workspace/TheFreed.v1
```

### **3. Instalación Automática**

#### **Para Windows:**
```cmd
# Ejecutar el script automático
start-dev.bat
```

#### **Para Mac/Linux:**
```bash
# Hacer ejecutable y correr
chmod +x start-dev.sh
./start-dev.sh
```

### **4. Instalación Manual (si los scripts fallan)**

```bash
# 1. Limpiar instalaciones anteriores
rmdir /s node_modules  # Windows
rm -rf node_modules    # Mac/Linux
del package-lock.json  # Windows
rm package-lock.json   # Mac/Linux

# 2. Instalar pnpm (más confiable)
npm install -g pnpm

# 3. Instalar dependencias
pnpm install

# 4. Ejecutar en dos terminales separadas:
# Terminal 1: Backend
pnpm run dev:backend

# Terminal 2: Frontend  
pnpm run dev:frontend
```

### **5. Acceso a la Aplicación**

Una vez ejecutándose, abre tu navegador:

- **🎨 Frontend (Interfaz)**: http://localhost:5173
- **🔧 Backend API**: http://localhost:5174
- **❤️ Health Check**: http://localhost:5174/health

---

## 🛠️ **Solución de Problemas**

### **Error: "Port already in use"**
```bash
# Cambiar puertos en .env:
PORT=3002
API_PORT=3002
VITE_API_URL=http://localhost:3002
```

### **Error: "Cannot find module"**
```bash
# Reinstalar dependencias
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### **Error: "Permission denied" (Windows)**
```cmd
# Ejecutar como Administrador en PowerShell:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **Error: "Node version incompatible"**
- Actualiza Node.js desde https://nodejs.org/ (versión 20 LTS)

---

## 🚀 **Comandos Rápidos**

```bash
# Desarrollo completo
pnpm run dev

# Solo frontend
pnpm run dev:frontend

# Solo backend
pnpm run dev:backend

# Build para producción
pnpm run build

# Verificar estado del backend
curl http://localhost:5174/health
```

---

## 📁 **Estructura del Proyecto**

```
TheFreed.v1/
├── src/
│   ├── components/     # Componentes React
│   ├── pages/         # Páginas de la app
│   ├── server/        # Backend Express
│   └── App.tsx        # Aplicación principal
├── public/            # Archivos estáticos
├── package.json       # Dependencias
├── .env              # Variables de entorno
└── start-dev.bat/.sh # Scripts de inicio
```

---

## ✅ **Verificación Final**

Al final deberías ver:
- ✅ Terminal mostrando "Local: http://localhost:5173"
- ✅ Backend respondiendo en http://localhost:5174/health
- ✅ Interfaz web cargando sin errores
- ✅ Sin mensajes de error en consola

---

## 🎯 **¡Listo para Desarrollar!**

Una vez que todo esté funcionando:
1. Explora la interfaz en http://localhost:5173
2. Prueba crear una cuenta
3. Navega por las diferentes secciones
4. Revisa el código en `src/components/`

**¡El proyecto está completamente configurado y optimizado!** 🚀