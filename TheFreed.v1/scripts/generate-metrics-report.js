#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📊 Generando reporte completo de métricas de rendimiento...\n');

// Configuración
const OUTPUT_DIR = path.join(__dirname, 'metrics-report');
const REPORT_FILE = path.join(OUTPUT_DIR, 'performance-metrics-report.md');

// Crear directorio de salida si no existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

try {
  // Leer archivos de análisis disponibles
  const analysisFiles = {
    bundleAnalysis: path.join(__dirname, 'analysis', 'bundle-analysis-report.json'),
    lighthouseResults: path.join(__dirname, 'lighthouse-results'),
    distStats: path.join(__dirname, 'dist', 'stats.html')
  };

  // Recopilar datos de métricas
  const metrics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    bundle: readJsonFile(analysisFiles.bundleAnalysis) || null,
    lighthouse: getLighthouseSummary(analysisFiles.lighthouseResults),
    system: getSystemInfo(),
    recommendations: []
  };

  // Generar recomendaciones basadas en los datos
  metrics.recommendations = generateRecommendations(metrics);

  // Crear el reporte
  const report = generateMarkdownReport(metrics);

  // Guardar el reporte
  fs.writeFileSync(REPORT_FILE, report);

  console.log('✅ Reporte generado exitosamente!');
  console.log(`📄 Ubicación: ${REPORT_FILE}`);
  console.log(`📊 Tamaño: ${formatBytes(fs.statSync(REPORT_FILE).size)}\n`);

  // Mostrar resumen
  console.log('📋 RESUMEN DE MÉTRICAS:');
  console.log(`   • Bundle size: ${metrics.bundle ? formatBytes(metrics.bundle.summary.totalSize) : 'N/A'}`);
  console.log(`   • Gzip ratio: ${metrics.bundle ? ((1 - metrics.bundle.summary.totalGzippedSize / metrics.bundle.summary.totalSize) * 100).toFixed(1) + '%' : 'N/A'}`);
  console.log(`   • Performance score: ${metrics.lighthouse?.performance || 'N/A'}`);
  console.log(`   • Total files: ${metrics.bundle ? metrics.bundle.summary.totalFiles : 'N/A'}`);
  console.log(`   • Recommendations: ${metrics.recommendations.length}\n`);

  if (metrics.recommendations.length > 0) {
    console.log('🎯 RECOMENDACIONES PRINCIPALES:');
    metrics.recommendations.slice(0, 3).forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec.title} (${rec.impact} impacto)`);
    });
  }

} catch (error) {
  console.error('❌ Error generando reporte:', error.message);
  process.exit(1);
}

function readJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
    return null;
  } catch (error) {
    console.warn(`Warning: Could not read ${filePath}:`, error.message);
    return null;
  }
}

function getLighthouseSummary(lighthouseDir) {
  try {
    if (!fs.existsSync(lighthouseDir)) {
      console.warn('Lighthouse results directory not found');
      return null;
    }

    const files = fs.readdirSync(lighthouseDir).filter(f => f.endsWith('.json'));
    if (files.length === 0) {
      console.warn('No Lighthouse JSON files found');
      return null;
    }

    // Usar el archivo más reciente
    const latestFile = files.sort((a, b) => 
      fs.statSync(path.join(lighthouseDir, b)).mtime - 
      fs.statSync(path.join(lighthouseDir, a)).mtime
    )[0];

    const lighthouseData = readJsonFile(path.join(lighthouseDir, latestFile));
    if (!lighthouseData || !lighthouseData.categories) {
      return null;
    }

    // Extraer scores de las categorías principales
    const categories = lighthouseData.categories;
    return {
      performance: Math.round((categories.performance?.score || 0) * 100),
      accessibility: Math.round((categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
      seo: Math.round((categories.seo?.score || 0) * 100),
      pwa: Math.round((categories.pwa?.score || 0) * 100),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Error reading Lighthouse results:', error.message);
    return null;
  }
}

function getSystemInfo() {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    cpus: require('os').cpus().length,
    totalMemory: require('os').totalmem(),
    freeMemory: require('os').freemem(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };
}

function generateRecommendations(metrics) {
  const recommendations = [];

  // Análisis del bundle
  if (metrics.bundle) {
    const { summary, fileTypes, performance } = metrics.bundle;
    
    // Recomendaciones de tamaño
    if (summary.totalSize > 2 * 1024 * 1024) { // > 2MB
      recommendations.push({
        title: 'Bundle muy grande',
        description: `El bundle principal es de ${formatBytes(summary.totalSize)}. Considera implementar code splitting y lazy loading.`,
        impact: 'high',
        category: 'performance'
      });
    }

    // Recomendaciones de JS/CSS ratio
    if (performance.jsToTotalRatio > 70) {
      recommendations.push({
        title: 'Alto peso de JavaScript',
        description: `JavaScript representa ${performance.jsToTotalRatio}% del bundle. Revisa dependencias y elimina código no utilizado.`,
        impact: 'high',
        category: 'performance'
      });
    }

    // Recomendaciones de compresión
    const compressionRatio = summary.totalGzippedSize / summary.totalSize;
    if (compressionRatio > 0.5) {
      recommendations.push({
        title: 'Compresión subóptima',
        description: 'La ratio de compresión es menor al esperado. Verifica la configuración del servidor web.',
        impact: 'medium',
        category: 'performance'
      });
    }

    // Recomendaciones de imágenes
    if (fileTypes.images && fileTypes.images.totalSize > summary.totalSize * 0.3) {
      recommendations.push({
        title: 'Imágenes optimizadas',
        description: 'Las imágenes representan más del 30% del bundle. Considera WebP, compresión y lazy loading.',
        impact: 'medium',
        category: 'performance'
      });
    }

    // Recomendaciones de archivos grandes
    const largeFiles = metrics.bundle.analysis.largeFiles || [];
    if (largeFiles.length > 0) {
      recommendations.push({
        title: 'Archivos de gran tamaño',
        description: `Se encontraron ${largeFiles.length} archivos mayores a 500KB. Optimiza o divide estos archivos.`,
        impact: 'high',
        category: 'performance'
      });
    }
  }

  // Análisis de Lighthouse
  if (metrics.lighthouse) {
    const { performance: perfScore, accessibility, bestPractices, seo, pwa } = metrics.lighthouse;

    if (perfScore < 90) {
      recommendations.push({
        title: 'Mejorar Core Web Vitals',
        description: `El score de performance es ${perfScore}/100. Optimiza First Contentful Paint, Largest Contentful Paint y Cumulative Layout Shift.`,
        impact: 'high',
        category: 'performance'
      });
    }

    if (accessibility < 90) {
      recommendations.push({
        title: 'Mejorar accesibilidad',
        description: `El score de accesibilidad es ${accessibility}/100. Revisa contraste de colores, etiquetas alt y navegación por teclado.`,
        impact: 'medium',
        category: 'accessibility'
      });
    }

    if (seo < 90) {
      recommendations.push({
        title: 'Optimizar SEO',
        description: `El score de SEO es ${seo}/100. Mejora meta tags, estructura de headings y enlaces internos.`,
        impact: 'medium',
        category: 'seo'
      });
    }

    if (bestPractices < 90) {
      recommendations.push({
        title: 'Seguir mejores prácticas',
        description: `El score de mejores prácticas es ${bestPractices}/100. Resuelve vulnerabilidades y problemas de seguridad.`,
        impact: 'medium',
        category: 'best-practices'
      });
    }
  }

  return recommendations;
}

function generateMarkdownReport(metrics) {
  const reportDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let report = `# 📊 Reporte de Métricas de Rendimiento - TheFreed.v1

**Fecha de generación:** ${reportDate}  
**Entorno:** ${metrics.environment}  
**Generado automáticamente por el sistema de monitoring**

---

## 🎯 Resumen Ejecutivo

`;

  // Agregar resumen del bundle
  if (metrics.bundle) {
    const { summary } = metrics.bundle;
    report += `### 📦 Análisis del Bundle

| Métrica | Valor |
|---------|-------|
| Tamaño total | ${formatBytes(summary.totalSize)} |
| Tamaño gzipped | ${formatBytes(summary.totalGzippedSize)} |
| Ratio de compresión | ${((1 - summary.totalGzippedSize / summary.totalSize) * 100).toFixed(1)}% |
| Total de archivos | ${summary.totalFiles} |
| Archivo más grande | ${summary.largestFile ? `${formatBytes(summary.largestFile.size)} (${summary.largestFile.name})` : 'N/A'} |

`;
  }

  // Agregar scores de Lighthouse
  if (metrics.lighthouse) {
    const { performance, accessibility, bestPractices, seo, pwa } = metrics.lighthouse;
    report += `### 🔍 Scores de Lighthouse

| Categoría | Score |
|-----------|-------|
| Performance | ${performance}/100 |
| Accesibilidad | ${accessibility}/100 |
| Mejores Prácticas | ${bestPractices}/100 |
| SEO | ${seo}/100 |
| PWA | ${pwa}/100 |

`;
  }

  // Agregar análisis por tipo de archivo
  if (metrics.bundle?.fileTypes) {
    report += `### 📁 Análisis por Tipo de Archivo\n\n`;
    
    Object.entries(metrics.bundle.fileTypes).forEach(([type, data]) => {
      report += `**${type.toUpperCase()}**\n`;
      report += `- Archivos: ${data.count}\n`;
      report += `- Tamaño total: ${formatBytes(data.totalSize)}\n`;
      report += `- Porcentaje del bundle: ${data.percentage}%\n`;
      if (data.gzipEstimate) {
        report += `- Tamaño estimado gzipped: ${formatBytes(data.gzipEstimate)}\n`;
      }
      report += '\n';
    });
  }

  // Agregar recomendaciones
  if (metrics.recommendations.length > 0) {
    report += `## 🎯 Recomendaciones de Optimización\n\n`;
    
    metrics.recommendations.forEach((rec, index) => {
      const impactEmoji = rec.impact === 'high' ? '🔴' : rec.impact === 'medium' ? '🟡' : '🟢';
      report += `### ${index + 1}. ${impactEmoji} ${rec.title}\n\n`;
      report += `**Impacto:** ${rec.impact}  \n`;
      report += `**Categoría:** ${rec.category}  \n`;
      report += `**Descripción:** ${rec.description}\n\n`;
    });
  }

  // Agregar análisis detallado de archivos grandes
  if (metrics.bundle?.analysis?.largeFiles?.length > 0) {
    report += `## 📋 Archivos de Gran Tamaño\n\n`;
    
    report += `| Archivo | Tamaño | % del Bundle |\n`;
    report += `|---------|--------|--------------|\n`;
    
    metrics.bundle.analysis.largeFiles.forEach(file => {
      const percentage = ((file.size / metrics.bundle.summary.totalSize) * 100).toFixed(2);
      report += `| ${file.path} | ${file.sizeFormatted} | ${percentage}% |\n`;
    });
    
    report += '\n';
  }

  // Agregar información del sistema
  if (metrics.system) {
    report += `## 💻 Información del Sistema\n\n`;
    report += `- **Node.js:** ${metrics.system.nodeVersion}\n`;
    report += `- **Plataforma:** ${metrics.system.platform} (${metrics.system.arch})\n`;
    report += `- **CPUs:** ${metrics.system.cpus}\n`;
    report += `- **Memoria total:** ${formatBytes(metrics.system.totalMemory)}\n`;
    report += `- **Memoria libre:** ${formatBytes(metrics.system.freeMemory)}\n`;
    report += `- **Tiempo de actividad:** ${Math.round(metrics.system.uptime / 60)} minutos\n`;
  }

  // Agregar métricas de Core Web Vitals (si están disponibles)
  report += `\n---\n\n`;
  report += `## 📊 Notas Importantes\n\n`;
  report += `- Este reporte se genera automáticamente después de cada build\n`;
  report += `- Los scores de Lighthouse se ejecutan en un entorno controlado\n`;
  report += `- Para optimizar el rendimiento, implementa las recomendaciones en orden de prioridad\n`;
  report += `- El monitoreo continuo se puede activar con: \`npm run monitor:start\`\n\n`;
  
  report += `---\n`;
  report += `*Generado automáticamente por el sistema de monitoring de TheFreed.v1*\n`;

  return report;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}