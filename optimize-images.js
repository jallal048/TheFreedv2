#!/usr/bin/env node

/**
 * Script para compresión automática de imágenes
 * Convierte imágenes a formatos WebP y AVIF con múltiples calidades
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuración de compresión
const COMPRESSION_CONFIG = {
  qualities: [90, 75, 60, 45], // Diferentes calidades
  formats: ['webp', 'avif', 'jpeg', 'png'],
  sizes: {
    thumbnail: 150,
    small: 400,
    medium: 800,
    large: 1200,
    original: 1920
  },
  inputDir: 'public/images',
  outputDir: 'public/images/optimized'
};

// Colores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Función para log con colores
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Función para verificar si Sharp está disponible
function checkSharpInstallation() {
  try {
    require('sharp');
    return true;
  } catch (error) {
    return false;
  }
}

// Instalar Sharp si no está disponible
function installSharp() {
  try {
    log('Instalando sharp para optimización de imágenes...', colors.yellow);
    execSync('npm install sharp --save-dev', { stdio: 'inherit' });
    log('Sharp instalado correctamente', colors.green);
    return true;
  } catch (error) {
    log(`Error instalando sharp: ${error.message}`, colors.red);
    return false;
  }
}

// Función para crear directorios si no existen
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Función para obtener información de la imagen
async function getImageInfo(imagePath) {
  const sharp = require('sharp');
  try {
    const metadata = await sharp(imagePath).metadata();
    return metadata;
  } catch (error) {
    log(`Error obteniendo información de ${imagePath}: ${error.message}`, colors.red);
    return null;
  }
}

// Función para optimizar imagen con diferentes calidades y formatos
async function optimizeImage(inputPath, outputDir, baseName) {
  const sharp = require('sharp');
  const imageInfo = await getImageInfo(inputPath);
  
  if (!imageInfo) return false;

  const originalWidth = imageInfo.width;
  const originalHeight = imageInfo.height;

  log(`Optimizando ${baseName} (${originalWidth}x${originalHeight})...`, colors.cyan);

  try {
    const image = sharp(inputPath);
    const tasks = [];

    // Para cada tamaño definido
    Object.entries(COMPRESSION_CONFIG.sizes).forEach(([sizeName, targetWidth]) => {
      // Solo procesar si la imagen original es más grande que el target
      if (originalWidth <= targetWidth && sizeName !== 'original') {
        return;
      }

      const resizeOptions = {
        width: sizeName === 'original' ? originalWidth : targetWidth,
        height: sizeName === 'original' ? originalHeight : undefined,
        fit: 'inside',
        withoutEnlargement: true
      };

      // Para cada calidad
      COMPRESSION_CONFIG.qualities.forEach(quality => {
        // WebP
        tasks.push(
          image.clone()
            .resize(resizeOptions)
            .webp({ quality, effort: 6 })
            .toFile(path.join(outputDir, `${baseName}-${sizeName}-q${quality}.webp`))
        );

        // AVIF
        tasks.push(
          image.clone()
            .resize(resizeOptions)
            .avif({ quality, effort: 9 })
            .toFile(path.join(outputDir, `${baseName}-${sizeName}-q${quality}.avif`))
        );

        // JPEG (solo si la imagen no tiene transparencia)
        if (!imageInfo.hasAlpha) {
          tasks.push(
            image.clone()
              .resize(resizeOptions)
              .jpeg({ quality, mozjpeg: true })
              .toFile(path.join(outputDir, `${baseName}-${sizeName}-q${quality}.jpg`))
          );
        }

        // PNG (para imágenes con transparencia o como fallback)
        tasks.push(
          image.clone()
            .resize(resizeOptions)
            .png({ quality: Math.min(quality + 10, 100), compressionLevel: 9 })
            .toFile(path.join(outputDir, `${baseName}-${sizeName}-q${quality}.png`))
        );
      });
    });

    // Ejecutar todas las tareas en paralelo
    await Promise.all(tasks);
    log(`✓ ${baseName} optimizado correctamente`, colors.green);
    return true;

  } catch (error) {
    log(`Error optimizando ${baseName}: ${error.message}`, colors.red);
    return false;
  }
}

// Función para procesar todas las imágenes en el directorio
async function processImages() {
  const inputDir = COMPRESSION_CONFIG.inputDir;
  const outputDir = COMPRESSION_CONFIG.outputDir;

  // Verificar que el directorio de entrada existe
  if (!fs.existsSync(inputDir)) {
    log(`El directorio ${inputDir} no existe`, colors.red);
    return;
  }

  // Crear directorio de salida
  ensureDirectoryExists(outputDir);

  // Obtener todos los archivos de imagen
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
  const files = fs.readdirSync(inputDir)
    .filter(file => imageExtensions.includes(path.extname(file).toLowerCase()));

  if (files.length === 0) {
    log('No se encontraron imágenes para optimizar', colors.yellow);
    return;
  }

  log(`Procesando ${files.length} imágenes...`, colors.blue);
  log(`Directorio de entrada: ${inputDir}`, colors.blue);
  log(`Directorio de salida: ${outputDir}`, colors.blue);

  let successCount = 0;
  let errorCount = 0;

  // Procesar cada imagen
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const baseName = path.parse(file).name;
    
    try {
      const success = await optimizeImage(inputPath, outputDir, baseName);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    } catch (error) {
      log(`Error procesando ${file}: ${error.message}`, colors.red);
      errorCount++;
    }
  }

  log('\n=== RESUMEN ===', colors.bright);
  log(`✓ Imágenes procesadas correctamente: ${successCount}`, colors.green);
  if (errorCount > 0) {
    log(`✗ Errores: ${errorCount}`, colors.red);
  }
  log(`Total de imágenes procesadas: ${successCount + errorCount}`, colors.blue);
}

// Función para generar un manifest de las imágenes optimizadas
function generateImageManifest() {
  const outputDir = COMPRESSION_CONFIG.outputDir;
  
  if (!fs.existsSync(outputDir)) {
    log('El directorio de salida no existe', colors.red);
    return;
  }

  const manifest = {
    generated: new Date().toISOString(),
    formats: COMPRESSION_CONFIG.formats,
    qualities: COMPRESSION_CONFIG.qualities,
    sizes: COMPRESSION_CONFIG.sizes,
    images: []
  };

  const files = fs.readdirSync(outputDir);
  
  // Agrupar archivos por imagen base
  const imageGroups = {};
  
  files.forEach(file => {
    const match = file.match(/^(.+)-(\w+)-q(\d+)\.(webp|avif|jpg|png)$/);
    if (match) {
      const [, baseName, size, quality, format] = match;
      if (!imageGroups[baseName]) {
        imageGroups[baseName] = {};
      }
      if (!imageGroups[baseName][size]) {
        imageGroups[baseName][size] = {};
      }
      imageGroups[baseName][size][format] = {
        quality: parseInt(quality),
        filename: file
      };
    }
  });

  manifest.images = imageGroups;

  const manifestPath = path.join(outputDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  log(`Manifest generado: ${manifestPath}`, colors.green);
}

// Función principal
async function main() {
  log('=== COMPRESOR AUTOMÁTICO DE IMÁGENES ===', colors.bright);
  log('Versión 1.0.0', colors.cyan);
  
  // Verificar Sharp
  if (!checkSharpInstallation()) {
    log('Sharp no está instalado', colors.yellow);
    const installed = installSharp();
    if (!installed) {
      log('No se pudo instalar Sharp. Abortando.', colors.red);
      process.exit(1);
    }
  }

  try {
    await processImages();
    generateImageManifest();
    log('\n¡Optimización completada!', colors.bright, colors.green);
  } catch (error) {
    log(`Error general: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  optimizeImage,
  processImages,
  generateImageManifest,
  COMPRESSION_CONFIG
};