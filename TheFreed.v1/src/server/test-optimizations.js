#!/usr/bin/env node

/**
 * Script de prueba para verificar las optimizaciones del servidor TheFreed.v1
 * 
 * Este script realiza pruebas básicas para verificar:
 * - Compresión gzip
 * - Cache en memoria
 * - Rate limiting
 * - Headers apropiados
 * - Rendimiento general
 */

import http from 'http';
import { URL } from 'url';

const SERVER_URL = 'http://localhost:5174';

// Función para hacer requests con medición de tiempo
async function makeRequest(path, options = {}) {
  const startTime = Date.now();
  const url = new URL(path, SERVER_URL);
  
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: JSON.parse(data || '{}'),
          duration,
          compressed: res.headers['content-encoding'] === 'gzip'
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => reject(new Error('Request timeout')));
  });
}

// Función para probar rate limiting
async function testRateLimit() {
  console.log('\n🧪 Testing Rate Limiting...');
  
  const results = [];
  const concurrentRequests = 5;
  
  for (let i = 0; i < concurrentRequests; i++) {
    try {
      const result = await makeRequest('/api/health');
      results.push(result);
    } catch (error) {
      console.log(`❌ Request ${i + 1} failed:`, error.message);
    }
  }
  
  const successCount = results.filter(r => r.statusCode === 200).length;
  const successRate = (successCount / concurrentRequests) * 100;
  
  console.log(`✅ Rate Limit Test Results:`);
  console.log(`   Successful requests: ${successCount}/${concurrentRequests} (${successRate}%)`);
  console.log(`   Average response time: ${Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length)}ms`);
  
  return successRate > 90; // Expect > 90% success rate
}

// Función para probar compresión
async function testCompression() {
  console.log('\n🧪 Testing Gzip Compression...');
  
  const result = await makeRequest('/api/status');
  
  console.log(`✅ Compression Test Results:`);
  console.log(`   Status: ${result.statusCode}`);
  console.log(`   Compressed: ${result.compressed ? 'YES ✅' : 'NO ❌'}`);
  console.log(`   Content-Type: ${result.headers['content-type']}`);
  console.log(`   Response time: ${result.duration}ms`);
  console.log(`   Cache headers: ${result.headers['x-cache'] || 'None'}`);
  
  return result.compressed && result.statusCode === 200;
}

// Función para probar cache
async function testCaching() {
  console.log('\n🧪 Testing Response Caching...');
  
  const request1 = await makeRequest('/api/health');
  const request2 = await makeRequest('/api/health');
  const request3 = await makeRequest('/api/health');
  
  console.log(`✅ Cache Test Results:`);
  console.log(`   Request 1 - Cache: ${request1.headers['x-cache'] || 'Unknown'}, Time: ${request1.duration}ms`);
  console.log(`   Request 2 - Cache: ${request2.headers['x-cache'] || 'Unknown'}, Time: ${request2.duration}ms`);
  console.log(`   Request 3 - Cache: ${request3.headers['x-cache'] || 'Unknown'}, Time: ${request3.duration}ms`);
  
  // Deberíamos ver al menos una respuesta HIT en requests subsecuentes
  const hasHitCache = [request1, request2, request3].some(r => r.headers['x-cache'] === 'HIT');
  
  return hasHitCache && request2.duration <= request1.duration; // Segunda request debería ser más rápida
}

// Función para probar headers de seguridad
async function testSecurityHeaders() {
  console.log('\n🧪 Testing Security Headers...');
  
  const result = await makeRequest('/health');
  
  const securityHeaders = {
    'x-powered-by': result.headers['x-powered-by'],
    'content-security-policy': result.headers['content-security-policy'],
    'x-frame-options': result.headers['x-frame-options'],
  };
  
  console.log(`✅ Security Headers Test Results:`);
  console.log(`   X-Powered-By: ${securityHeaders['x-powered-by'] || 'Hidden ✅'}`);
  console.log(`   Content-Security-Policy: ${securityHeaders['content-security-policy'] ? 'Present ✅' : 'Missing (dev mode OK)'}`);
  console.log(`   X-Frame-Options: ${securityHeaders['x-frame-options'] || 'Default security enabled'}`);
  
  return !securityHeaders['x-powered-by']; // X-Powered-By debería estar oculto
}

// Función para probar rendimiento general
async function testPerformance() {
  console.log('\n🧪 Testing General Performance...');
  
  const endpoints = [
    { path: '/health', method: 'GET' },
    { path: '/api/health', method: 'GET' },
    { path: '/api/status', method: 'GET' },
    { path: '/api/admin/stats', method: 'GET' }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const result = await makeRequest(endpoint.path);
      results.push({
        endpoint: endpoint.path,
        status: result.statusCode,
        duration: result.duration,
        compressed: result.compressed,
        cacheable: !!result.headers['x-cache']
      });
    } catch (error) {
      results.push({
        endpoint: endpoint.path,
        status: 'ERROR',
        error: error.message
      });
    }
  }
  
  console.log(`✅ Performance Test Results:`);
  results.forEach(result => {
    if (result.status === 'ERROR') {
      console.log(`   ${result.endpoint}: ERROR - ${result.error}`);
    } else {
      console.log(`   ${result.endpoint}: ${result.status} | ${result.duration}ms | ${result.compressed ? 'Gzip ✅' : 'No compress'}`);
    }
  });
  
  const allSuccess = results.every(r => r.status === 200);
  const avgDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length;
  
  console.log(`   Average response time: ${Math.round(avgDuration)}ms`);
  
  return allSuccess && avgDuration < 500; // Expect < 500ms average
}

// Función principal de pruebas
async function runTests() {
  console.log('🚀 Starting TheFreed.v1 Server Optimization Tests');
  console.log(`📍 Server URL: ${SERVER_URL}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  
  const tests = [
    { name: 'Compression', test: testCompression },
    { name: 'Caching', test: testCaching },
    { name: 'Rate Limiting', test: testRateLimit },
    { name: 'Security Headers', test: testSecurityHeaders },
    { name: 'Performance', test: testPerformance }
  ];
  
  const results = {};
  
  for (const { name, test } of tests) {
    try {
      results[name] = await test();
    } catch (error) {
      console.log(`❌ ${name} test failed with error:`, error.message);
      results[name] = false;
    }
  }
  
  // Resumen de resultados
  console.log('\n📊 Test Summary:');
  console.log('='.repeat(50));
  
  const passedTests = Object.entries(results).filter(([_, result]) => result).length;
  const totalTests = Object.keys(results).length;
  
  Object.entries(results).forEach(([name, result]) => {
    console.log(`${result ? '✅' : '❌'} ${name}: ${result ? 'PASSED' : 'FAILED'}`);
  });
  
  console.log('\n🎯 Overall Results:');
  console.log(`   Tests Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! The server optimizations are working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the server configuration.');
  }
  
  console.log(`\n⏰ Completed at: ${new Date().toISOString()}`);
}

// Ejecutar pruebas si este archivo es el script principal
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}