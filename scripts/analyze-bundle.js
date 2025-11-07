#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parsear argumentos de línea de comandos
const args = process.argv.slice(2);
const isPerformanceMode = args.includes('--performance');
const isWatchMode = args.includes('--watch');
const isDetailedMode = args.includes('--detailed');

console.log('🔍 Iniciando análisis completo del bundle de TheFreed.v1...\n');

// Configuración
const BUILD_DIR = path.join(__dirname, '..', 'dist');
const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const OUTPUT_DIR = path.join(__dirname, 'analysis');
const REPORT_FILE = path.join(REPORTS_DIR, 'bundle-analysis-report.json');
const PERFORMANCE_FILE = path.join(REPORTS_DIR, 'performance-metrics.json');

// Crear directorio de salida si no existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

try {
  // 1. Ejecutar build con análisis
  console.log('📦 Ejecutando build optimizado...');
  execSync('npm run build', { stdio: 'inherit' });

  // 2. Analizar archivos del dist
  console.log('\n📊 Analizando archivos generados...');
  const distFiles = getFilesRecursive(BUILD_DIR);
  const analysis = analyzeFiles(distFiles);

  // 3. Generar reporte detallado
  console.log('\n📋 Generando reporte detallado...');
  const report = generateDetailedReport(analysis, distFiles);

  // 4. Guardar reporte
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  
  // 5. Mostrar resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DEL ANÁLISIS DE BUNDLE');
  console.log('='.repeat(60));
  console.log(`📁 Archivos totales: ${report.summary.totalFiles}`);
  console.log(`💾 Tamaño total: ${formatBytes(report.summary.totalSize)}`);
  console.log(`🗜️  Tamaño gzipped: ${formatBytes(report.summary.totalGzippedSize)}`);
  console.log(`🔧 Compresión: ${((1 - report.summary.totalGzippedSize / report.summary.totalSize) * 100).toFixed(1)}%`);
  
  console.log('\n📦 ANÁLISIS POR TIPO DE ARCHIVO:');
  Object.entries(report.fileTypes).forEach(([type, data]) => {
    console.log(`  ${type.toUpperCase()}: ${formatBytes(data.totalSize)} (${data.count} archivos)`);
  });

  console.log('\n⚡ ANÁLISIS DE RENDIMIENTO:');
  console.log(`  JS Main: ${formatBytes(report.performance.mainBundleSize)}`);
  console.log(`  JS Chunks: ${formatBytes(report.performance.totalChunksSize)}`);
  console.log(`  CSS Total: ${formatBytes(report.performance.totalCSSSize)}`);
  console.log(`  Assets Total: ${formatBytes(report.performance.totalAssetsSize)}`);

  if (report.recommendations.length > 0) {
    console.log('\n💡 RECOMENDACIONES:');
    report.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec.title}`);
      console.log(`     Impacto: ${rec.impact}`);
      console.log(`     Descripción: ${rec.description}\n`);
    });
  }

  console.log(`\n📄 Reporte completo guardado en: ${REPORT_FILE}`);
  console.log(`🌐 Bundle analyzer: ${path.join(BUILD_DIR, 'stats.html')}`);
  
  if (fs.existsSync(path.join(BUILD_DIR, 'stats.html'))) {
    console.log(`\n💡 Para ver el análisis visual del bundle, abre: file://${path.resolve(path.join(BUILD_DIR, 'stats.html'))}`);
  }

} catch (error) {
  console.error('❌ Error durante el análisis:', error.message);
  process.exit(1);
}

// Funciones auxiliares
function getFilesRecursive(dir) {
  const files = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (stat.isFile()) {
        files.push({
          path: fullPath,
          relativePath: path.relative(BUILD_DIR, fullPath),
          size: stat.size,
          name: item,
          extension: path.extname(item).toLowerCase(),
          type: getFileType(item)
        });
      }
    }
  }
  
  if (fs.existsSync(dir)) {
    scanDirectory(dir);
  }
  
  return files;
}

function getFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  
  if (ext === '.js') return 'javascript';
  if (ext === '.css') return 'css';
  if (ext.match(/\.(png|jpe?g|gif|svg|webp|ico)$/)) return 'images';
  if (ext.match(/\.(woff2?|ttf|eot)$/)) return 'fonts';
  if (ext === '.html') return 'html';
  if (ext === '.json') return 'json';
  if (ext === '.map') return 'sourcemaps';
  
  return 'other';
}

function analyzeFiles(files) {
  const analysis = {
    byType: {},
    bySize: {
      large: [],
      medium: [],
      small: []
    },
    chunks: [],
    largest: [],
    gzipEstimates: {}
  };

  for (const file of files) {
    // Análisis por tipo
    if (!analysis.byType[file.type]) {
      analysis.byType[file.type] = { count: 0, totalSize: 0, files: [] };
    }
    analysis.byType[file.type].count++;
    analysis.byType[file.type].totalSize += file.size;
    analysis.byType[file.type].files.push(file);

    // Análisis por tamaño
    if (file.size > 500 * 1024) {
      analysis.bySize.large.push(file);
    } else if (file.size > 100 * 1024) {
      analysis.bySize.medium.push(file);
    } else {
      analysis.bySize.small.push(file);
    }

    // Identificar chunks principales
    if (file.type === 'javascript' && file.name.includes('main')) {
      analysis.chunks.push(file);
    }

    // Los archivos más grandes
    if (file.size > 50 * 1024) {
      analysis.largest.push(file);
    }

    // Estimar tamaño gzipped (aproximación)
    const gzipRatio = getGzipRatio(file.extension);
    analysis.gzipEstimates[file.relativePath] = file.size * gzipRatio;
  }

  return analysis;
}

function getGzipRatio(extension) {
  const ratios = {
    '.js': 0.3,
    '.css': 0.2,
    '.html': 0.3,
    '.json': 0.2,
    '.svg': 0.5,
    '.png': 0.8,
    '.jpg': 0.8,
    '.jpeg': 0.8,
    '.webp': 0.7,
    '.woff': 0.7,
    '.woff2': 0.7,
  };
  
  return ratios[extension] || 0.7;
}

function generateDetailedReport(analysis, files) {
  const summary = {
    totalFiles: files.length,
    totalSize: files.reduce((sum, file) => sum + file.size, 0),
    totalGzippedSize: files.reduce((sum, file) => {
      const gzipSize = analysis.gzipEstimates[file.relativePath] || (file.size * 0.3);
      return sum + gzipSize;
    }, 0),
    averageFileSize: 0,
    largestFile: null,
    smallestFile: null
  };

  if (files.length > 0) {
    summary.averageFileSize = summary.totalSize / files.length;
    summary.largestFile = files.reduce((max, file) => file.size > max.size ? file : max);
    summary.smallestFile = files.reduce((min, file) => file.size < min.size ? file : min);
  }

  // Estadísticas por tipo de archivo
  const fileTypes = {};
  Object.entries(analysis.byType).forEach(([type, data]) => {
    fileTypes[type] = {
      count: data.count,
      totalSize: data.totalSize,
      percentage: (data.totalSize / summary.totalSize * 100).toFixed(1),
      largest: data.files.reduce((max, file) => file.size > max.size ? file : max, data.files[0]),
      gzipEstimate: data.files.reduce((sum, file) => sum + (analysis.gzipEstimates[file.relativePath] || 0), 0)
    };
  });

  // Análisis de rendimiento
  const performance = {
    mainBundleSize: 0,
    totalChunksSize: 0,
    totalCSSSize: analysis.byType.css?.totalSize || 0,
    totalAssetsSize: (analysis.byType.images?.totalSize || 0) + (analysis.byType.fonts?.totalSize || 0),
    totalJSChunks: analysis.byType.javascript?.count || 0,
    jsToTotalRatio: 0,
    cssToTotalRatio: 0
  };

  // Buscar main bundle
  const mainBundle = files.find(f => f.type === 'javascript' && f.name.includes('main'));
  if (mainBundle) {
    performance.mainBundleSize = mainBundle.size;
  }

  // Calcular tamaño total de chunks JS
  const jsChunks = files.filter(f => f.type === 'javascript');
  performance.totalChunksSize = jsChunks.reduce((sum, chunk) => sum + chunk.size, 0);
  performance.jsToTotalRatio = (performance.totalChunksSize / summary.totalSize * 100).toFixed(1);
  performance.cssToTotalRatio = (performance.totalCSSSize / summary.totalSize * 100).toFixed(1);

  // Generar recomendaciones
  const recommendations = [];

  // Recomendación para archivos grandes
  if (analysis.bySize.large.length > 0) {
    recommendations.push({
      title: 'Optimizar archivos grandes',
      impact: 'Alto',
      description: `Se encontraron ${analysis.bySize.large.length} archivos mayores a 500KB. Considera usar code splitting o lazy loading.`,
      files: analysis.bySize.large.map(f => f.relativePath)
    });
  }

  // Recomendación para el ratio JS/CSS
  if (performance.jsToTotalRatio > 70) {
    recommendations.push({
      title: 'Reducir peso de JavaScript',
      impact: 'Alto',
      description: `JavaScript representa ${performance.jsToTotalRatio}% del bundle. Considera eliminar código no utilizado.`,
    });
  }

  // Recomendación para compresión
  if (summary.totalGzippedSize / summary.totalSize > 0.5) {
    recommendations.push({
      title: 'Mejorar compresión',
      impact: 'Medio',
      description: 'El ratio de compresión es menor al esperado. Verifica la configuración de tu servidor web.',
    });
  }

  // Recomendación para imágenes
  if (analysis.byType.images && analysis.byType.images.totalSize > summary.totalSize * 0.3) {
    recommendations.push({
      title: 'Optimizar imágenes',
      impact: 'Medio',
      description: 'Las imágenes representan más del 30% del bundle. Considera usar WebP o compresión adicional.',
    });
  }

  return {
    summary,
    fileTypes,
    performance,
    recommendations,
    analysis: {
      largeFiles: analysis.bySize.large.map(f => ({
        path: f.relativePath,
        size: f.size,
        sizeFormatted: formatBytes(f.size)
      })),
      chunks: analysis.chunks.map(f => ({
        path: f.relativePath,
        size: f.size,
        sizeFormatted: formatBytes(f.size)
      })),
      gzipEstimates: Object.entries(analysis.gzipEstimates).map(([path, size]) => ({
        path,
        originalSize: files.find(f => f.relativePath === path)?.size || 0,
        gzippedSize: size,
        ratio: ((files.find(f => f.relativePath === path)?.size || 0) - size) / (files.find(f => f.relativePath === path)?.size || 1)
      }))
    },
    timestamp: new Date().toISOString(),
    buildInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}