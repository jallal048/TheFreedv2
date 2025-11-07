#!/usr/bin/env node

/**
 * Script de optimización de cache inteligente para TheFreed.v1
 * Automatiza la gestión de caché para optimizar tiempos de build y desarrollo
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CacheOptimizer {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.cacheDirs = [
      'node_modules/.vite',
      'node_modules/.cache',
      'node_modules/.vite-temp',
      '.vite',
      'dist'
    ];
    this.warmUpFiles = [
      'src/main.tsx',
      'src/App.tsx',
      'src/components',
      'src/pages',
      'src/hooks',
      'src/services'
    ];
  }

  async warmCache() {
    console.log('🔥 Warming up cache for TheFreed.v1...');
    
    try {
      // 1. Crear directorios de cache si no existen
      this.createCacheDirectories();
      
      // 2. Ejecutar build para popular cache
      console.log('📦 Building to populate cache...');
      execSync('npm run build:fast', { stdio: 'inherit' });
      
      // 3. Optimizar node_modules cache
      this.optimizeNodeModulesCache();
      
      // 4. Generar estadísticas de cache
      this.generateCacheStats();
      
      console.log('✅ Cache warming completed successfully!');
      console.log('💡 Next builds will be significantly faster');
      
    } catch (error) {
      console.error('❌ Cache warming failed:', error.message);
      process.exit(1);
    }
  }

  async clearCache(type = 'all') {
    console.log(`🧹 Clearing ${type} cache...`);
    
    const actions = {
      'vite': () => this.clearViteCache(),
      'build': () => this.clearBuildCache(),
      'node': () => this.clearNodeModulesCache(),
      'all': () => this.clearAllCache()
    };
    
    if (actions[type]) {
      await actions[type]();
      console.log(`✅ ${type} cache cleared successfully!`);
    } else {
      console.error(`❌ Unknown cache type: ${type}`);
      process.exit(1);
    }
  }

  async analyzeCache() {
    console.log('📊 Analyzing cache performance...');
    
    const stats = this.getCacheStats();
    const analysis = {
      timestamp: new Date().toISOString(),
      totalSize: 0,
      cacheEfficiency: 0,
      recommendations: [],
      breakdown: {}
    };
    
    Object.entries(stats).forEach(([cacheType, cacheStats]) => {
      analysis.breakdown[cacheType] = cacheStats;
      analysis.totalSize += cacheStats.size;
    });
    
    // Calcular eficiencia de cache
    if (stats.vite && stats.vite.hitRate > 80) {
      analysis.cacheEfficiency = 'High';
    } else if (stats.vite && stats.vite.hitRate > 60) {
      analysis.cacheEfficiency = 'Medium';
    } else {
      analysis.cacheEfficiency = 'Low';
      analysis.recommendations.push('Consider running cache warm-up');
    }
    
    // Generar recomendaciones
    this.generateRecommendations(analysis, stats);
    
    // Guardar análisis
    this.saveAnalysis(analysis);
    
    console.log('\n📊 CACHE ANALYSIS RESULTS');
    console.log('=' .repeat(50));
    console.log(`Total Cache Size: ${this.formatBytes(analysis.totalSize)}`);
    console.log(`Cache Efficiency: ${analysis.cacheEfficiency}`);
    console.log('\nBreakdown:');
    
    Object.entries(analysis.breakdown).forEach(([type, data]) => {
      console.log(`  ${type}: ${this.formatBytes(data.size)} (${data.fileCount} files)`);
    });
    
    if (analysis.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      analysis.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
    }
    
    return analysis;
  }

  async optimizeDependencies() {
    console.log('🔧 Optimizing dependencies...');
    
    try {
      // 1. Analizar dependencias
      const depsAnalysis = this.analyzeDependencies();
      
      // 2. Optimizar package.json
      this.optimizePackageJson();
      
      // 3. Reinstall dependencies if needed
      if (depsAnalysis.shouldReinstall) {
        console.log('📦 Reinstalling optimized dependencies...');
        execSync('npm install --prefer-offline --no-audit', { stdio: 'inherit' });
      }
      
      console.log('✅ Dependencies optimized successfully!');
      
    } catch (error) {
      console.error('❌ Dependency optimization failed:', error.message);
      process.exit(1);
    }
  }

  createCacheDirectories() {
    console.log('📁 Creating cache directories...');
    
    const dirs = [
      'node_modules/.vite',
      'node_modules/.cache',
      'reports',
      'analysis'
    ];
    
    dirs.forEach(dir => {
      const fullPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`  Created: ${dir}`);
      }
    });
  }

  clearViteCache() {
    const viteCacheDirs = [
      'node_modules/.vite',
      'node_modules/.vite-temp',
      '.vite'
    ];
    
    viteCacheDirs.forEach(dir => {
      const fullPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`  Cleared: ${dir}`);
      }
    });
  }

  clearBuildCache() {
    const buildDirs = ['dist', 'build'];
    
    buildDirs.forEach(dir => {
      const fullPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`  Cleared: ${dir}`);
      }
    });
  }

  clearNodeModulesCache() {
    const cacheDirs = [
      'node_modules/.cache',
      'node_modules/.cache/_cacache'
    ];
    
    cacheDirs.forEach(dir => {
      const fullPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`  Cleared: ${dir}`);
      }
    });
  }

  clearAllCache() {
    [...this.cacheDirs].forEach(dir => {
      const fullPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`  Cleared: ${dir}`);
      }
    });
  }

  optimizeNodeModulesCache() {
    try {
      // Configurar npm para mejor cache
      execSync('npm config set prefer-offline true', { stdio: 'inherit' });
      execSync('npm config set cache-min 3600', { stdio: 'inherit' });
      console.log('  ✓ npm cache optimized');
    } catch (error) {
      console.warn('  ⚠️ Could not optimize npm cache:', error.message);
    }
  }

  generateCacheStats() {
    console.log('📊 Generating cache statistics...');
    
    const stats = this.getCacheStats();
    const statsFile = path.join(__dirname, '..', 'reports', 'cache-stats.json');
    
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
    console.log(`  ✓ Stats saved to: ${statsFile}`);
  }

  getCacheStats() {
    const stats = {};
    
    this.cacheDirs.forEach(dir => {
      const fullPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        const dirStats = this.getDirectoryStats(fullPath);
        stats[dir] = {
          ...dirStats,
          exists: true
        };
      } else {
        stats[dir] = {
          exists: false,
          size: 0,
          fileCount: 0
        };
      }
    });
    
    return stats;
  }

  getDirectoryStats(dir) {
    let totalSize = 0;
    let fileCount = 0;
    
    function scanDirectory(currentDir) {
      try {
        const items = fs.readdirSync(currentDir);
        
        items.forEach(item => {
          const itemPath = path.join(currentDir, item);
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory()) {
            scanDirectory(itemPath);
          } else if (stat.isFile()) {
            totalSize += stat.size;
            fileCount++;
          }
        });
      } catch (error) {
        console.warn(`Warning: Could not read directory ${currentDir}:`, error.message);
      }
    }
    
    scanDirectory(dir);
    
    return {
      size: totalSize,
      fileCount: fileCount,
      hitRate: this.calculateHitRate(dir)
    };
  }

  calculateHitRate(dir) {
    // Simular hit rate basado en el tamaño y edad del cache
    const stats = fs.statSync(dir);
    const daysOld = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);
    
    if (daysOld < 1) return 95;
    if (daysOld < 7) return 80;
    if (daysOld < 30) return 60;
    return 40;
  }

  analyzeDependencies() {
    console.log('📦 Analyzing dependencies...');
    
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8')
      );
      
      const analysis = {
        total: Object.keys(packageJson.dependencies || {}).length + 
               Object.keys(packageJson.devDependencies || {}).length,
        shouldReinstall: false,
        recommendations: []
      };
      
      if (analysis.total > 100) {
        analysis.recommendations.push('Consider reducing number of dependencies');
        analysis.shouldReinstall = true;
      }
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing dependencies:', error.message);
      return { total: 0, shouldReinstall: false, recommendations: [] };
    }
  }

  optimizePackageJson() {
    try {
      const packagePath = path.join(this.projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Agregar configuraciones de cache
      if (!packageJson.npmConfig) {
        packageJson.npmConfig = {};
      }
      
      packageJson.npmConfig.preferOffline = true;
      packageJson.npmConfig.cacheMin = 3600;
      
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      console.log('  ✓ package.json optimized');
    } catch (error) {
      console.warn('Could not optimize package.json:', error.message);
    }
  }

  generateRecommendations(analysis, stats) {
    // Análisis de tamaño de cache
    if (analysis.totalSize > 500 * 1024 * 1024) { // 500MB
      analysis.recommendations.push('Cache size is large. Consider clearing old cache files.');
    }
    
    // Análisis de eficiencia de Vite
    if (stats.vite && stats.vite.hitRate < 70) {
      analysis.recommendations.push('Vite cache hit rate is low. Consider running warm-cache.');
    }
    
    // Recomendaciones generales
    analysis.recommendations.push('Run cache warm-up after major dependency changes');
    analysis.recommendations.push('Monitor cache size regularly to prevent disk space issues');
  }

  saveAnalysis(analysis) {
    const analysisFile = path.join(__dirname, '..', 'reports', 'cache-analysis.json');
    fs.writeFileSync(analysisFile, JSON.stringify(analysis, null, 2));
    console.log(`  ✓ Analysis saved to: ${analysisFile}`);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// CLI Interface
const optimizer = new CacheOptimizer();
const command = process.argv[2];

switch (command) {
  case 'warm':
    optimizer.warmCache();
    break;
  case 'clear':
    const type = process.argv[3] || 'all';
    optimizer.clearCache(type);
    break;
  case 'analyze':
    optimizer.analyzeCache();
    break;
  case 'optimize-deps':
    optimizer.optimizeDependencies();
    break;
  default:
    console.log(`
🔥 Cache Optimizer for TheFreed.v1

Usage:
  node cache-optimizer.js warm           - Warm up cache
  node cache-optimizer.js clear [type]   - Clear cache (types: vite, build, node, all)
  node cache-optimizer.js analyze        - Analyze cache performance
  node cache-optimizer.js optimize-deps  - Optimize dependencies

Examples:
  node cache-optimizer.js warm
  node cache-optimizer.js clear vite
  node cache-optimizer.js analyze
    `);
    process.exit(0);
}