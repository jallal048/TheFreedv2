// Servidor mínimo para testing
import http from 'http';

// Simular delay de red para respuestas realistas
const simulateDelay = (min = 100, max = 500) => {
  return new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));
};

// Datos mock simplificados para el servidor minimal
const mockUserSettings = {
  id: 'settings_1',
  userId: '1',
  language: 'es',
  timezone: 'America/Mexico_City',
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  privacyLevel: 'PUBLIC',
  contentVisibility: 'ALL',
  autoLike: false,
  darkMode: false,
  currency: 'USD',
  twoFactorEnabled: false,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date().toISOString()
};

const mockCreatorStats = {
  totalFollowers: 1250,
  totalSubscribers: 340,
  totalViews: 45600,
  totalLikes: 12300,
  totalContent: 45,
  monthlyViews: 8400,
  monthlyLikes: 2100,
  monthlyEarnings: 2300,
  engagementRate: 8.5,
  topContent: [
    {
      id: 'content_1',
      title: 'Mi mejor contenido #1',
      views: 5400,
      likes: 450
    },
    {
      id: 'content_2',
      title: 'Tutorial increíble',
      views: 3200,
      likes: 280
    },
    {
      id: 'content_3',
      title: 'Behind the scenes',
      views: 2100,
      likes: 190
    }
  ]
};

const mockMonetizationSettings = {
  id: 'monetization_1',
  creatorId: '1',
  monthlyPrice: 15,
  yearlyPrice: 150,
  customPrice: 25,
  commissionRate: 15,
  payoutMethod: 'BANK_TRANSFER',
  bankAccount: '****-****-****-1234',
  taxId: '***-**-****',
  isActive: true,
  minPayoutAmount: 50,
  paymentSchedule: 'MONTHLY',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date().toISOString()
};

const PORT = 3001;

const server = http.createServer((req, res) => {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-limit, x-offset, x-sort, x-order, x-filter, x-search, x-category');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  
  // Routes
  if (path === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0-minimal'
    }));
    return;
  }

  if (path === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0-minimal'
      }
    }));
    return;
  }

  if (path === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        server: {
          uptime: process.uptime(),
          port: PORT,
          version: '1.0.0-minimal'
        },
        timestamp: new Date().toISOString()
      }
    }));
    return;
  }

  if (path === '/api/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'TheFreed.v1 API funcionando correctamente',
      timestamp: new Date().toISOString(),
      data: {
        method: req.method,
        url: req.url,
        ip: req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      }
    }));
    return;
  }

  if (path === '/api/users/profile' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        id: '1',
        email: 'demo@thefreed.com',
        username: 'demo_user',
        firstName: 'Demo',
        lastName: 'User',
        userType: 'CREATOR',
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        isSuspended: false,
        createdAt: new Date('2024-01-01').toISOString(),
        lastActive: new Date().toISOString(),
        profile: {
          id: 'profile_1',
          userId: '1',
          displayName: 'Demo User',
          bio: 'Soy un creador de contenido demo en TheFreed.v1. Creo contenido increíble para mi comunidad.',
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          bannerUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
          website: 'https://demouser.com',
          socialLinks: {
            twitter: '@demouser',
            instagram: '@demouser',
            youtube: 'demouser'
          },
          categories: ['lifestyle', 'fitness', 'health'],
          contentTypes: ['VIDEO', 'IMAGE', 'TEXT'],
          isVerified: true,
          verificationLevel: 'VERIFIED',
          isLiveStreaming: false,
          isAdultContent: false,
          monthlyPrice: 15,
          yearlyPrice: 150,
          customPrice: 25,
          commissionRate: 15,
          isPublic: true,
          isActive: true,
          followerCount: 1250,
          totalViews: 45600,
          totalEarnings: 2300,
          totalContent: 45,
          createdAt: new Date('2024-01-01').toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    }));
    return;
  }

  if (path === '/api/auth/refresh-token' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        token: 'mock-refreshed-jwt-token-12345',
        refreshToken: 'mock-refreshed-refresh-token-12345'
      }
    }));
    return;
  }

  if (path === '/api/recommendations' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        recommendations: [],
        total: 0,
        page: 1,
        hasMore: false
      }
    }));
    return;
  }

  if (path === '/api/discover/trending' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        trending: [],
        total: 0
      }
    }));
    return;
  }

  if (path.startsWith('/api/discover') && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        content: [],
        total: 0,
        page: 1,
        hasMore: false
      }
    }));
    return;
  }

  if (path === '/api/analytics/session' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        sessionId: 'mock-session-12345',
        tracked: true
      }
    }));
    return;
  }

  if (path === '/api/analytics/behavior' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        tracked: true,
        eventId: 'mock-event-12345'
      }
    }));
    return;
  }

  // ENDPOINTS DE PERFIL
  // PUT /api/user/settings
  if (path === '/api/user/settings' && req.method === 'PUT') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      await simulateDelay();
      try {
        const settings = JSON.parse(body);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: {
            ...mockUserSettings,
            ...settings,
            updatedAt: new Date().toISOString()
          },
          message: 'Configuraciones actualizadas correctamente'
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: {
            message: 'JSON inválido',
            code: 'INVALID_JSON'
          }
        }));
      }
    });
    return;
  }

  // GET /api/user/settings
  if (path === '/api/user/settings' && req.method === 'GET') {
    simulateDelay().then(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: mockUserSettings
      }));
    });
    return;
  }

  // PUT /api/user/profile
  if (path === '/api/user/profile' && req.method === 'PUT') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      await simulateDelay();
      try {
        const profile = JSON.parse(body);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: {
            id: 'profile_1',
            userId: '1',
            displayName: profile.displayName || 'Demo User',
            bio: profile.bio || 'Soy un creador de contenido demo en TheFreed.v1. Creo contenido increíble para mi comunidad.',
            avatarUrl: profile.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            bannerUrl: profile.bannerUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
            website: profile.website || 'https://demouser.com',
            socialLinks: profile.socialLinks || {
              twitter: '@demouser',
              instagram: '@demouser',
              youtube: 'demouser'
            },
            categories: profile.categories || ['lifestyle', 'fitness', 'health'],
            contentTypes: profile.contentTypes || ['VIDEO', 'IMAGE', 'TEXT'],
            isVerified: true,
            verificationLevel: 'VERIFIED',
            isLiveStreaming: false,
            isAdultContent: false,
            monthlyPrice: profile.monthlyPrice || 15,
            yearlyPrice: profile.yearlyPrice || 150,
            customPrice: profile.customPrice || 25,
            commissionRate: 15,
            isPublic: true,
            isActive: true,
            followerCount: 1250,
            totalViews: 45600,
            totalEarnings: 2300,
            totalContent: 45,
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date().toISOString()
          },
          message: 'Perfil actualizado correctamente'
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: {
            message: 'JSON inválido',
            code: 'INVALID_JSON'
          }
        }));
      }
    });
    return;
  }

  // GET /api/users/:id
  const userProfileMatch = path.match(/^\/api\/users\/([^/]+)$/);
  if (userProfileMatch && req.method === 'GET') {
    const userId = userProfileMatch[1];
    simulateDelay().then(() => {
      // Simular usuario encontrado o no encontrado
      const userExists = userId !== '999';
      
      if (!userExists) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: {
            message: 'Usuario no encontrado',
            code: 'USER_NOT_FOUND'
          }
        }));
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: {
          id: userId,
          email: `usuario${userId}@example.com`,
          username: `usuario${userId}`,
          firstName: `Usuario`,
          lastName: `${userId}`,
          userType: parseInt(userId) % 5 === 0 ? 'CREATOR' : 'CONSUMER',
          isEmailVerified: true,
          isPhoneVerified: Math.random() > 0.5,
          isActive: true,
          isSuspended: false,
          createdAt: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
          lastActive: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
          profile: parseInt(userId) % 5 === 0 ? {
            id: `profile_${userId}`,
            userId: userId,
            displayName: `Usuario ${userId}`,
            bio: `Bio del usuario ${userId}. Creo contenido increíble sobre lifestyle y fitness.`,
            avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + parseInt(userId)}?w=150&h=150&fit=crop&crop=face`,
            bannerUrl: `https://images.unsplash.com/photo-${1600000000000 + parseInt(userId)}?w=800&h=400&fit=crop`,
            website: `https://usuario${userId}.com`,
            socialLinks: {
              twitter: `@usuario${userId}`,
              instagram: `@usuario${userId}`,
              youtube: `usuario${userId}`
            },
            categories: ['lifestyle', 'fitness', 'health'],
            contentTypes: ['VIDEO', 'IMAGE', 'TEXT'],
            isVerified: parseInt(userId) % 3 === 0,
            verificationLevel: parseInt(userId) % 3 === 0 ? 'VERIFIED' : 'BASIC',
            isLiveStreaming: false,
            isAdultContent: false,
            monthlyPrice: Math.floor(Math.random() * 20) + 5,
            yearlyPrice: Math.floor(Math.random() * 200) + 50,
            customPrice: Math.floor(Math.random() * 50) + 10,
            commissionRate: 15,
            isPublic: true,
            isActive: true,
            followerCount: Math.floor(Math.random() * 10000) + 100,
            totalViews: Math.floor(Math.random() * 100000) + 5000,
            totalEarnings: Math.floor(Math.random() * 5000) + 100,
            totalContent: Math.floor(Math.random() * 50) + 5,
            createdAt: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
            updatedAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
          } : undefined
        }
      }));
    });
    return;
  }

  // POST /api/users/:id/follow
  const followUserMatch = path.match(/^\/api\/users\/([^/]+)\/follow$/);
  if (followUserMatch && req.method === 'POST') {
    const targetUserId = followUserMatch[1];
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      await simulateDelay();
      try {
        const { action } = JSON.parse(body || '{}');
        const isFollowing = action === 'follow';
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: {
            userId: targetUserId,
            isFollowing: isFollowing,
            followerCount: isFollowing ? 1251 : 1249,
            timestamp: new Date().toISOString()
          },
          message: isFollowing ? 'Usuario seguido correctamente' : 'Dejaste de seguir al usuario'
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: {
            message: 'JSON inválido',
            code: 'INVALID_JSON'
          }
        }));
      }
    });
    return;
  }

  // GET /api/creator/stats
  if (path === '/api/creator/stats' && req.method === 'GET') {
    simulateDelay().then(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: mockCreatorStats
      }));
    });
    return;
  }

  // GET /api/creator/monetization
  if (path === '/api/creator/monetization' && req.method === 'GET') {
    simulateDelay().then(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: mockMonetizationSettings
      }));
    });
    return;
  }

  // PUT /api/creator/monetization
  if (path === '/api/creator/monetization' && req.method === 'PUT') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      await simulateDelay();
      try {
        const settings = JSON.parse(body);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: {
            ...mockMonetizationSettings,
            ...settings,
            updatedAt: new Date().toISOString()
          },
          message: 'Configuraciones de monetización actualizadas correctamente'
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: {
            message: 'JSON inválido',
            code: 'INVALID_JSON'
          }
        }));
      }
    });
    return;
  }

  if (path === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      await simulateDelay();
      try {
        const { email, password } = JSON.parse(body);
        
        if (!email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: {
              message: 'Email y contraseña requeridos',
              code: 'VALIDATION_ERROR'
            }
          }));
          return;
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: {
            token: 'mock-jwt-token-12345',
            refreshToken: 'mock-refresh-token-12345',
            user: {
              id: '1',
              email: email,
              username: 'demo_user',
              firstName: 'Demo',
              lastName: 'User',
              userType: 'CREATOR',
              isEmailVerified: true,
              isPhoneVerified: true,
              isActive: true,
              isSuspended: false,
              createdAt: new Date('2024-01-01').toISOString(),
              lastActive: new Date().toISOString(),
              profile: {
                id: 'profile_1',
                userId: '1',
                displayName: 'Demo User',
                bio: 'Soy un creador de contenido demo en TheFreed.v1. Creo contenido increíble para mi comunidad.',
                avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                bannerUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
                website: 'https://demouser.com',
                socialLinks: {
                  twitter: '@demouser',
                  instagram: '@demouser',
                  youtube: 'demouser'
                },
                categories: ['lifestyle', 'fitness', 'health'],
                contentTypes: ['VIDEO', 'IMAGE', 'TEXT'],
                isVerified: true,
                verificationLevel: 'VERIFIED',
                isLiveStreaming: false,
                isAdultContent: false,
                monthlyPrice: 15,
                yearlyPrice: 150,
                customPrice: 25,
                commissionRate: 15,
                isPublic: true,
                isActive: true,
                followerCount: 1250,
                totalViews: 45600,
                totalEarnings: 2300,
                totalContent: 45,
                createdAt: new Date('2024-01-01').toISOString(),
                updatedAt: new Date().toISOString()
              }
            }
          },
          message: 'Login exitoso'
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: {
            message: 'JSON inválido',
            code: 'INVALID_JSON'
          }
        }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: false,
    error: {
      message: `Ruta no encontrada: ${path}`,
      code: 'NOT_FOUND',
      availableRoutes: [
        '/health',
        '/api/health',
        '/api/status',
        '/api/test',
        '/api/auth/login',
        '/api/auth/refresh-token',
        '/api/users/profile',
        '/api/users/:id',
        '/api/users/:id/follow',
        '/api/user/settings',
        '/api/user/profile',
        '/api/creator/stats',
        '/api/creator/monetization',
        '/api/recommendations',
        '/api/discover/trending',
        '/api/discover',
        '/api/analytics/session',
        '/api/analytics/behavior'
      ]
    },
    timestamp: new Date().toISOString()
  }));

// ===============================================
// NUEVOS ENDPOINTS PARA MEJORAS DEL PERFIL
// ===============================================

// Endpoint: Actividad personal
app('/api/user/activity', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    data: {
      postsCreated: 47,
      postsLiked: 234,
      commentsMade: 89,
      timeOnPlatform: 156,
      currentStreak: 12,
      longestStreak: 45,
      viewsReceived: 1280,
      followers: 156,
      following: 89,
      engagementRate: 7.8,
      lastActive: new Date().toISOString(),
      accountAge: 180
    }
  }));
});

// Endpoint: Gestión de avatares
app('/api/user/avatars', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    data: [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        name: 'Avatar actual',
        isDefault: true,
        isActive: true,
        createdAt: new Date('2024-01-01').toISOString(),
        size: 245760,
        dimensions: { width: 400, height: 400 }
      },
      {
        id: '2',
        url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
        name: 'Avatar alternativo',
        isDefault: false,
        isActive: false,
        createdAt: new Date('2024-01-05').toISOString(),
        size: 128000,
        dimensions: { width: 400, height: 400 }
      }
    ]
  }));
});

// Endpoint: Avatar con datos
app('/api/user/avatar/upload', (req, res) => {
  // Simular subida de avatar
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    data: {
      id: Date.now().toString(),
      url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      name: `Avatar ${new Date().toLocaleDateString()}`,
      isDefault: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      size: 150000,
      dimensions: { width: 400, height: 400 }
    }
  }));
});

// Endpoint: Verificación de estados
app('/api/user/verification', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    data: {
      email: {
        isVerified: true,
        verifiedAt: new Date('2024-01-01').toISOString(),
        status: 'verified'
      },
      phone: {
        isVerified: false,
        verifiedAt: null,
        status: 'pending'
      },
      identity: {
        isVerified: false,
        verifiedAt: null,
        status: 'not_submitted',
        level: 'none'
      },
      badges: [
        {
          id: 'email_verified',
          name: 'Email Verificado',
          description: 'Has verificado tu dirección de email',
          icon: '✉️',
          earnedAt: new Date('2024-01-01').toISOString()
        },
        {
          id: 'early_adopter',
          name: 'Early Adopter',
          description: 'Uno de los primeros usuarios de TheFreed',
          icon: '🚀',
          earnedAt: new Date('2024-01-01').toISOString()
        }
      ],
      reputation: {
        score: 85,
        level: 'Trusted',
        totalPoints: 425,
        nextLevel: 'Verified Creator',
        pointsToNext: 75
      }
    }
  }));
});

// Endpoint: Onboarding status
app('/api/user/onboarding-status', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    data: {
      isCompleted: true,
      completedSteps: 5,
      totalSteps: 5,
      completedAt: new Date('2024-01-01').toISOString(),
      skipped: false
    }
  }));
});

// Endpoint: Configuraciones avanzadas
app('/api/user/advanced-settings', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    data: {
      dataExport: {
        isEnabled: true,
        lastExport: new Date('2024-01-10').toISOString(),
        formats: ['json', 'csv', 'pdf']
      },
      accountDeletion: {
        scheduledAt: null,
        isRequested: false
      },
      sessionManagement: {
        totalSessions: 3,
        activeSession: 1,
        lastLogin: new Date().toISOString(),
        sessions: [
          {
            id: 'session_1',
            device: 'Chrome on Windows',
            location: 'Mexico City, MX',
            isActive: true,
            lastActive: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }
        ]
      },
      accessibility: {
        fontSize: 'medium',
        highContrast: false,
        screenReader: false,
        reducedMotion: false,
        colorBlindness: 'none'
      }
    }
  }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Servidor TheFreed.v1 Minimal iniciado');
  console.log(`🌐 Puerto: ${PORT}`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 API Status: http://localhost:${PORT}/api/status`);
  console.log('✅ Servidor listo para desarrollo frontend');
  console.log('🎉 NUEVAS FUNCIONALIDADES DE PERFIL IMPLEMENTADAS:');
  console.log('   📊 /api/user/activity - Métricas personales y racha de actividad');
  console.log('   🖼️  /api/user/avatars - Gestión avanzada de múltiples avatares');
  console.log('   📤 /api/user/avatar/upload - Subida y procesamiento de avatares');
  console.log('   ✅ /api/user/verification - Estados de verificación y badges');
  console.log('   🚀 /api/user/onboarding-status - Estado del onboarding');
  console.log('   ⚙️  /api/user/advanced-settings - Configuraciones avanzadas');
  console.log('');
  console.log('   👤 /api/user/settings (GET/PUT)');
  console.log('   📝 /api/user/profile (PUT)');
  console.log('   👥 /api/users/:id (GET)');
  console.log('   ➕ /api/users/:id/follow (POST)');
  console.log('   👑 /api/creator/stats (GET)');
  console.log('   💰 /api/creator/monetization (GET/PUT)');
  console.log('-------------------------------------------------');
});

// Manejo de errores
server.on('error', (err) => {
  console.error('Error del servidor:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('🛑 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});
});