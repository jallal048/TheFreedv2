#!/usr/bin/env node

/**
 * Script de productividad y debugging para TheFreed.v1
 * Herramientas avanzadas para diagnóstico y optimización del desarrollo
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProductivityTools {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.reportsDir = path.join(this.projectRoot, 'reports');
    this.analysisDir = path.join(this.projectRoot, 'analysis');
  }

  async diagnoseProject() {
    console.log('🔍 Running comprehensive project diagnosis...\n');
    
    const diagnosis = {
      timestamp: new Date().toISOString(),
      project: 'TheFreed.v1',
      sections: {}
    };
    
    // 1. Diagnóstico de dependencias
    diagnosis.sections.dependencies = await this.diagnoseDependencies();
    
    // 2. Diagnóstico de configuración
    diagnosis.sections.configuration = await this.diagnoseConfiguration();
    
    // 3. Diagnóstico de rendimiento
    diagnosis.sections.performance = await this.diagnosePerformance();
    
    // 4. Diagnóstico de estructura del proyecto
    diagnosis.sections.structure = await this.diagnoseProjectStructure();
    
    // 5. Diagnóstico de caché
    diagnosis.sections.cache = await this.diagnoseCache();
    
    // 6. Generar reporte completo
    await this.generateDiagnosisReport(diagnosis);
    
    // 7. Mostrar resumen
    this.showDiagnosisSummary(diagnosis);
    
    return diagnosis;
  }

  async diagnoseDependencies() {
    console.log('📦 Analyzing dependencies...');
    
    const analysis = {
      total: 0,
      production: 0,
      development: 0,
      outdated: [],
      vulnerabilities: [],
      unused: [],
      suggestions: []
    };
    
    try {
      // Leer package.json
      const packagePath = path.join(this.projectRoot, 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        analysis.production = Object.keys(packageJson.dependencies || {}).length;
        analysis.development = Object.keys(packageJson.devDependencies || {}).length;
        analysis.total = analysis.production + analysis.development;
      }
      
      // Verificar dependencias desactualizadas
      try {
        const outdated = execSync('npm outdated --json 2>/dev/null', { 
          cwd: this.projectRoot,
          encoding: 'utf8'
        });
        analysis.outdated = JSON.parse(outdated);
      } catch (error) {
        // No outdated packages or JSON parse error
        analysis.outdated = [];
      }
      
      // Verificar vulnerabilidades
      try {
        const audit = execSync('npm audit --json 2>/dev/null', { 
          cwd: this.projectRoot,
          encoding: 'utf8'
        });
        const auditResult = JSON.parse(audit);
        analysis.vulnerabilities = Object.values(auditResult.vulnerabilities || {});
      } catch (error) {
        analysis.vulnerabilities = [];
      }
      
      // Generar sugerencias
      if (analysis.total > 50) {
        analysis.suggestions.push('Consider reducing number of dependencies');
      }
      
      if (analysis.outdated.length > 10) {
        analysis.suggestions.push('Many dependencies are outdated - consider updating');
      }
      
      if (analysis.vulnerabilities.length > 0) {
        analysis.suggestions.push('Security vulnerabilities found - run npm audit fix');
      }
      
    } catch (error) {
      analysis.error = error.message;
    }
    
    console.log(`  ✓ Found ${analysis.total} dependencies`);
    return analysis;
  }

  async diagnoseConfiguration() {
    console.log('⚙️  Analyzing configuration files...');
    
    const analysis = {
      files: {},
      issues: [],
      suggestions: []
    };
    
    const configFiles = [
      'package.json',
      'vite.config.ts',
      'tsconfig.json',
      'tailwind.config.js',
      'eslint.config.js',
      'postcss.config.js',
      '.eslintrc.json',
      '.prettierrc'
    ];
    
    configFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          analysis.files[file] = {
            exists: true,
            size: Buffer.byteLength(content, 'utf8'),
            readable: true
          };
        } catch (error) {
          analysis.files[file] = {
            exists: true,
            readable: false,
            error: error.message
          };
        }
      } else {
        analysis.files[file] = { exists: false };
      }
    });
    
    // Verificar configuraciones específicas
    if (!analysis.files['vite.config.ts']?.exists) {
      analysis.issues.push('vite.config.ts not found');
      analysis.suggestions.push('Create vite.config.ts for build optimization');
    }
    
    if (!analysis.files['tsconfig.json']?.exists) {
      analysis.issues.push('tsconfig.json not found');
      analysis.suggestions.push('Create tsconfig.json for TypeScript configuration');
    }
    
    console.log(`  ✓ Analyzed ${Object.keys(analysis.files).length} configuration files`);
    return analysis;
  }

  async diagnosePerformance() {
    console.log('🚀 Analyzing performance...');
    
    const analysis = {
      buildTime: null,
      bundleSize: null,
      dependenciesSize: null,
      cacheEfficiency: null,
      memoryUsage: {},
      suggestions: []
    };
    
    try {
      // Medir tiempo de build
      const startTime = Date.now();
      try {
        execSync('npm run build', { 
          cwd: this.projectRoot,
          stdio: 'pipe'
        });
        analysis.buildTime = Date.now() - startTime;
      } catch (error) {
        analysis.buildTime = 'Build failed';
      }
      
      // Analizar tamaño del bundle
      const distPath = path.join(this.projectRoot, 'dist');
      if (fs.existsSync(distPath)) {
        analysis.bundleSize = this.getDirectorySize(distPath);
      }
      
      // Analizar tamaño de node_modules
      const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
      if (fs.existsSync(nodeModulesPath)) {
        analysis.dependenciesSize = this.getDirectorySize(nodeModulesPath);
      }
      
      // Generar sugerencias
      if (analysis.buildTime > 30000) {
        analysis.suggestions.push('Build time is slow - consider optimization');
      }
      
      if (analysis.bundleSize > 10 * 1024 * 1024) {
        analysis.suggestions.push('Bundle size is large - consider code splitting');
      }
      
      if (analysis.dependenciesSize > 500 * 1024 * 1024) {
        analysis.suggestions.push('node_modules is large - consider removing unused dependencies');
      }
      
    } catch (error) {
      analysis.error = error.message;
    }
    
    console.log(`  ✓ Performance analysis completed`);
    return analysis;
  }

  async diagnoseProjectStructure() {
    console.log('📁 Analyzing project structure...');
    
    const analysis = {
      directories: {},
      fileCount: {},
      totalSize: 0,
      issues: [],
      suggestions: []
    };
    
    const dirs = ['src', 'public', 'scripts', 'reports', 'dist'];
    
    dirs.forEach(dir => {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        const stats = this.getDirectoryStats(dirPath);
        analysis.directories[dir] = stats;
        analysis.totalSize += stats.size;
        
        // Verificar estructura específica
        if (dir === 'src' && !fs.existsSync(path.join(dirPath, 'components'))) {
          analysis.issues.push('src/components directory missing');
          analysis.suggestions.push('Create src/components for component organization');
        }
        
        if (dir === 'src' && !fs.existsSync(path.join(dirPath, 'hooks'))) {
          analysis.issues.push('src/hooks directory missing');
          analysis.suggestions.push('Create src/hooks for custom hooks');
        }
        
      } else {
        analysis.directories[dir] = { exists: false };
      }
    });
    
    console.log(`  ✓ Analyzed ${Object.keys(analysis.directories).length} directories`);
    return analysis;
  }

  async diagnoseCache() {
    console.log('💾 Analyzing cache...');
    
    const analysis = {
      viteCache: null,
      npmCache: null,
      buildCache: null,
      totalSize: 0,
      efficiency: 'unknown',
      suggestions: []
    };
    
    const cachePaths = {
      viteCache: path.join(this.projectRoot, 'node_modules/.vite'),
      npmCache: path.join(this.projectRoot, 'node_modules/.cache'),
      buildCache: path.join(this.projectRoot, 'dist')
    };
    
    Object.entries(cachePaths).forEach(([type, cachePath]) => {
      if (fs.existsSync(cachePath)) {
        const stats = this.getDirectoryStats(cachePath);
        analysis[type] = stats;
        analysis.totalSize += stats.size;
      } else {
        analysis[type] = { exists: false };
      }
    });
    
    // Calcular eficiencia de cache
    if (analysis.viteCache && analysis.viteCache.fileCount > 100) {
      analysis.efficiency = 'high';
    } else if (analysis.viteCache && analysis.viteCache.fileCount > 50) {
      analysis.efficiency = 'medium';
    } else {
      analysis.efficiency = 'low';
      analysis.suggestions.push('Cache appears to be cold - consider running cache warm-up');
    }
    
    console.log(`  ✓ Cache analysis completed (${analysis.efficiency} efficiency)`);
    return analysis;
  }

  async generateDiagnosisReport(diagnosis) {
    console.log('📋 Generating comprehensive report...');
    
    // Crear directorios si no existen
    [this.reportsDir, this.analysisDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // Guardar reporte principal
    const reportPath = path.join(this.reportsDir, 'project-diagnosis.json');
    fs.writeFileSync(reportPath, JSON.stringify(diagnosis, null, 2));
    
    // Generar reporte de resumen
    const summaryPath = path.join(this.reportsDir, 'diagnosis-summary.md');
    this.generateMarkdownReport(diagnosis, summaryPath);
    
    console.log(`  ✓ Reports saved:`);
    console.log(`    - JSON: ${reportPath}`);
    console.log(`    - Markdown: ${summaryPath}`);
  }

  generateMarkdownReport(diagnosis, outputPath) {
    let markdown = `# Project Diagnosis Report\n\n`;
    markdown += `**Project:** ${diagnosis.project}\n`;
    markdown += `**Generated:** ${new Date(diagnosis.timestamp).toLocaleString()}\n\n`;
    
    // Dependencies section
    if (diagnosis.sections.dependencies) {
      markdown += `## Dependencies Analysis\n\n`;
      const deps = diagnosis.sections.dependencies;
      markdown += `- **Total:** ${deps.total}\n`;
      markdown += `- **Production:** ${deps.production}\n`;
      markdown += `- **Development:** ${deps.development}\n`;
      markdown += `- **Outdated:** ${Object.keys(deps.outdated || {}).length}\n`;
      markdown += `- **Vulnerabilities:** ${deps.vulnerabilities.length}\n\n`;
      
      if (deps.suggestions.length > 0) {
        markdown += `### Suggestions\n`;
        deps.suggestions.forEach(suggestion => {
          markdown += `- ${suggestion}\n`;
        });
        markdown += `\n`;
      }
    }
    
    // Performance section
    if (diagnosis.sections.performance) {
      markdown += `## Performance Analysis\n\n`;
      const perf = diagnosis.sections.performance;
      markdown += `- **Build Time:** ${typeof perf.buildTime === 'number' ? `${perf.buildTime}ms` : perf.buildTime}\n`;
      markdown += `- **Bundle Size:** ${perf.bundleSize ? this.formatBytes(perf.bundleSize) : 'N/A'}\n`;
      markdown += `- **Dependencies Size:** ${perf.dependenciesSize ? this.formatBytes(perf.dependenciesSize) : 'N/A'}\n`;
      markdown += `- **Cache Efficiency:** ${perf.cacheEfficiency || 'Unknown'}\n\n`;
      
      if (perf.suggestions.length > 0) {
        markdown += `### Suggestions\n`;
        perf.suggestions.forEach(suggestion => {
          markdown += `- ${suggestion}\n`;
        });
        markdown += `\n`;
      }
    }
    
    // Structure section
    if (diagnosis.sections.structure) {
      markdown += `## Project Structure\n\n`;
      const structure = diagnosis.sections.structure;
      markdown += `- **Total Size:** ${this.formatBytes(structure.totalSize)}\n\n`;
      
      markdown += `### Directories\n`;
      Object.entries(structure.directories).forEach(([dir, stats]) => {
        if (stats.exists) {
          markdown += `- **${dir}:** ${this.formatBytes(stats.size)} (${stats.fileCount} files)\n`;
        } else {
          markdown += `- **${dir}:** Not found\n`;
        }
      });
      markdown += `\n`;
    }
    
    // Issues and suggestions
    const allIssues = Object.values(diagnosis.sections)
      .flatMap(section => section.issues || []);
    const allSuggestions = Object.values(diagnosis.sections)
      .flatMap(section => section.suggestions || []);
    
    if (allIssues.length > 0) {
      markdown += `## Issues Found\n\n`;
      allIssues.forEach(issue => {
        markdown += `- ❌ ${issue}\n`;
      });
      markdown += `\n`;
    }
    
    if (allSuggestions.length > 0) {
      markdown += `## Recommendations\n\n`;
      allSuggestions.forEach(suggestion => {
        markdown += `- 💡 ${suggestion}\n`;
      });
      markdown += `\n`;
    }
    
    fs.writeFileSync(outputPath, markdown);
  }

  showDiagnosisSummary(diagnosis) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PROJECT DIAGNOSIS SUMMARY');
    console.log('='.repeat(60));
    
    // Dependencies
    if (diagnosis.sections.dependencies) {
      const deps = diagnosis.sections.dependencies;
      console.log(`📦 Dependencies: ${deps.total} total (${deps.production} prod, ${deps.dev} dev)`);
      console.log(`   Outdated: ${Object.keys(deps.outdated || {}).length}`);
      console.log(`   Vulnerabilities: ${deps.vulnerabilities.length}`);
    }
    
    // Performance
    if (diagnosis.sections.performance) {
      const perf = diagnosis.sections.performance;
      console.log(`🚀 Build Time: ${typeof perf.buildTime === 'number' ? `${perf.buildTime}ms` : 'Failed'}`);
      console.log(`📦 Bundle Size: ${perf.bundleSize ? this.formatBytes(perf.bundleSize) : 'N/A'}`);
      console.log(`💾 Dependencies Size: ${perf.dependenciesSize ? this.formatBytes(perf.dependenciesSize) : 'N/A'}`);
    }
    
    // Cache
    if (diagnosis.sections.cache) {
      const cache = diagnosis.sections.cache;
      console.log(`💾 Cache Efficiency: ${cache.efficiency}`);
      console.log(`📊 Total Cache Size: ${this.formatBytes(cache.totalSize)}`);
    }
    
    // Issues and suggestions
    const allIssues = Object.values(diagnosis.sections)
      .flatMap(section => section.issues || []);
    const allSuggestions = Object.values(diagnosis.sections)
      .flatMap(section => section.suggestions || []);
    
    console.log(`❌ Issues: ${allIssues.length}`);
    console.log(`💡 Recommendations: ${allSuggestions.length}`);
    
    console.log('\n📄 Detailed reports generated in reports/ directory');
    console.log('='.repeat(60));
  }

  // Utilidades
  getDirectorySize(dir) {
    let totalSize = 0;
    
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
          }
        });
      } catch (error) {
        // Ignore permission errors
      }
    }
    
    scanDirectory(dir);
    return totalSize;
  }

  getDirectoryStats(dir) {
    let totalSize = 0;
    let fileCount = 0;
    let dirCount = 0;
    
    function scanDirectory(currentDir) {
      try {
        const items = fs.readdirSync(currentDir);
        
        items.forEach(item => {
          const itemPath = path.join(currentDir, item);
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory()) {
            dirCount++;
            scanDirectory(itemPath);
          } else if (stat.isFile()) {
            fileCount++;
            totalSize += stat.size;
          }
        });
      } catch (error) {
        // Ignore permission errors
      }
    }
    
    scanDirectory(dir);
    
    return {
      size: totalSize,
      fileCount,
      dirCount,
      exists: true
    };
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
const tools = new ProductivityTools();
const command = process.argv[2];

switch (command) {
  case 'diagnose':
  case undefined:
    tools.diagnoseProject();
    break;
  case 'help':
    console.log(`
🛠️  Productivity Tools for TheFreed.v1

Usage:
  node productivity-tools.js diagnose  - Run comprehensive project diagnosis
  node productivity-tools.js help      - Show this help

Features:
  • Comprehensive dependency analysis
  • Configuration validation
  • Performance benchmarking
  • Project structure analysis
  • Cache efficiency assessment
  • Automated reporting (JSON & Markdown)

Reports generated in:
  - reports/project-diagnosis.json
  - reports/diagnosis-summary.md
    `);
    break;
  default:
    console.error(`❌ Unknown command: ${command}`);
    console.error('Use "node productivity-tools.js help" for usage information');
    process.exit(1);
}