module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/', // URL de desarrollo
        'http://localhost:3000/dashboard', // Dashboard
        'http://localhost:3000/discovery', // Discovery
        'http://localhost:3000/auth/login', // Login
      ],
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      settings: {
        // Configuración de Chrome para Lighthouse
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --headless',
        // Configuración de red throttling para simular conexiones lentas
        throttlingMethod: 'devtools',
        throttling: {
          requestLatencyMs: 150,
          downloadThroughputKbps: 1638.4,
          uploadThroughputKbps: 675,
        },
        // Configuración de viewport
        screenEmulation: {
          mobile: false,
          width: 1920,
          height: 1080,
        },
        // Configuración adicional
        emulatedUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    },
    assert: {
      // Umbrales de rendimiento
      assertions: {
        // Core Web Vitals
        'first-contentful-paint': ['warn', { minScore: 0.8 }],
        'largest-contentful-paint': ['warn', { minScore: 0.8 }],
        'cumulative-layout-shift': ['warn', { minScore: 0.9 }],
        'total-blocking-time': ['warn', { minScore: 0.8 }],
        'interactive': ['warn', { minScore: 0.8 }],
        
        // Performance
        'speed-index': ['warn', { minScore: 0.7 }],
        'server-response-time': ['warn', { maxNumericValue: 800 }],
        'mainthread-work-breakdown': ['warn', { minScore: 0.7 }],
        'bootup-time': ['warn', { minScore: 0.7 }],
        'uses-long-cache-ttl': ['warn', { minScore: 0.8 }],
        'total-byte-weight': ['warn', { maxNumericValue: 1700 }],
        
        // Accesibilidad
        'accessibility': ['error', { minScore: 0.9 }],
        'color-contrast': ['error', { minScore: 0.9 }],
        'heading-order': ['error', { minScore: 0.9 }],
        'image-alt': ['error', { minScore: 0.9 }],
        'label': ['error', { minScore: 0.9 }],
        'link-name': ['error', { minScore: 0.9 }],
        
        // Best Practices
        'best-practices': ['warn', { minScore: 0.8 }],
        'no-vulnerabilities': ['error'],
        'is-on-https': ['error'],
        'uses-http2': ['warn'],
        'uses-rel-preconnect': ['warn'],
        
        // SEO
        'seo': ['warn', { minScore: 0.8 }],
        'viewport': ['error'],
        'document-title': ['error'],
        'meta-description': ['warn'],
        'font-size': ['warn'],
        'link-text': ['warn'],
        
        // PWA (si se implementa)
        'webapp': ['warn', { minScore: 0.7 }],
        'installable-manifest': ['warn'],
        'service-worker': ['warn'],
        'splash-screen': ['warn'],
      },
    },
    upload: {
      // Configuración para subir resultados a un servidor
      target: 'filesystem',
      outputDir: './lighthouse-results',
    },
    server: {
      port: 9001,
    },
  },
};