// Servidor temporal simple para TheFreed.v1
import http from 'http';

const PORT = 3001;

const server = http.createServer((req, res) => {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  
  console.log(`${req.method} ${path}`);
  
  // Response helper
  const sendResponse = (statusCode, data, contentType = 'application/json') => {
    res.writeHead(statusCode, { 'Content-Type': contentType });
    if (contentType === 'application/json') {
      res.end(JSON.stringify(data));
    } else {
      res.end(data);
    }
  };

  // Health check
  if (path === '/health') {
    sendResponse(200, { status: 'ok', timestamp: new Date().toISOString() });
    return;
  }

  // Status API
  if (path === '/api/status') {
    sendResponse(200, { 
      status: 'running', 
      server: 'TheFreed.v1 Temp Server',
      port: PORT,
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Login endpoint
  if (path === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        if (email === 'demo@thefreed.com' && password === 'demo123') {
          sendResponse(200, {
            success: true,
            token: 'demo-token-123',
            user: {
              id: '1',
              email: email,
              name: 'Usuario Demo',
              role: 'USER'
            }
          });
        } else {
          sendResponse(401, { success: false, message: 'Credenciales inválidas' });
        }
      } catch (error) {
        sendResponse(400, { success: false, message: 'Datos inválidos' });
      }
    });
    return;
  }

  // Default 404
  sendResponse(404, { error: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Servidor TheFreed.v1 Temporal iniciado');
  console.log(`🌐 Puerto: ${PORT}`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 API Status: http://localhost:${PORT}/api/status`);
  console.log('✅ Servidor listo para desarrollo frontend');
});

server.on('error', (err) => {
  console.error('Error del servidor:', err);
  process.exit(1);
});
