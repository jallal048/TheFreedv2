// Servicio de datos de prueba abundantes para TheFreed.v1
// Datos realistas para que la aplicación cargue instantáneamente

import { Content, Subscription, Notification, User } from '../types';

// Usuarios mock
export const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: `user_${i + 1}`,
  email: `usuario${i + 1}@example.com`,
  username: `usuario${i + 1}`,
  firstName: `Usuario`,
  lastName: `${i + 1}`,
  userType: i % 5 === 0 ? 'CREATOR' : 'CONSUMER',
  isEmailVerified: true,
  isPhoneVerified: Math.random() > 0.5,
  isActive: true,
  isSuspended: false,
  createdAt: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
  lastActive: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
  profile: i % 5 === 0 ? {
    id: `profile_${i + 1}`,
    userId: `user_${i + 1}`,
    displayName: `Usuario ${i + 1}`,
    bio: `Bio del usuario ${i + 1}. Creo contenido increíble sobre lifestyle y fitness.`,
    avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + i}?w=150&h=150&fit=crop&crop=face`,
    bannerUrl: `https://images.unsplash.com/photo-${1600000000000 + i}?w=800&h=400&fit=crop`,
    website: `https://usuario${i + 1}.com`,
    socialLinks: {
      twitter: `@usuario${i + 1}`,
      instagram: `@usuario${i + 1}`,
      youtube: `usuario${i + 1}`
    },
    categories: ['lifestyle', 'fitness', 'health'],
    contentTypes: ['VIDEO', 'IMAGE', 'TEXT'],
    isVerified: i % 3 === 0,
    verificationLevel: i % 3 === 0 ? 'VERIFIED' : 'BASIC',
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
}));

// Contenido mock abundante
const contentTypes = ['VIDEO', 'IMAGE', 'TEXT', 'AUDIO', 'LIVESTREAM'] as const;
const categories = ['lifestyle', 'fitness', 'cooking', 'music', 'art', 'travel', 'tech', 'beauty', 'fashion', 'photography', 'business', 'education'];
const tags = ['viral', 'trending', 'new', 'popular', 'premium', 'exclusive', 'tutorial', 'review', 'behind-the-scenes', 'daily', 'weekly', 'monthly'];

export const mockContent: Content[] = Array.from({ length: 200 }, (_, i) => {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
  const createdAt = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
  const creatorIndex = Math.floor(Math.random() * mockUsers.length);
  const creator = mockUsers[creatorIndex];
  
  return {
    id: `content_${i + 1}`,
    creatorId: creator.id,
    title: `${category.charAt(0).toUpperCase() + category.slice(1)} Content #${i + 1}`,
    description: `Contenido increíble de ${category} creado por mi comunidad. Descubre los mejores tips, tutoriales y contenido exclusivo que te ayudará a crecer y aprender cada día.`,
    contentType: contentType,
    category: category,
    tags: Array.from({ length: Math.floor(Math.random() * 5) + 2 }, () => tags[Math.floor(Math.random() * tags.length)]),
    mediaUrl: `https://images.unsplash.com/photo-${2000000000000 + i}?w=800&h=600&fit=crop`,
    thumbnailUrl: `https://images.unsplash.com/photo-${2000000000000 + i}?w=400&h=300&fit=crop`,
    duration: contentType === 'VIDEO' || contentType === 'AUDIO' ? Math.floor(Math.random() * 600) + 60 : undefined,
    fileSize: Math.floor(Math.random() * 100000000) + 1000000, // 1MB to 100MB
    isPremium: Math.random() > 0.7,
    isFree: Math.random() > 0.3,
    price: Math.floor(Math.random() * 50) + 5, // $5 to $54
    isPrivate: Math.random() > 0.8,
    isArchived: Math.random() > 0.9,
    isNSFW: category === 'beauty' || category === 'fashion',
    ageRestriction: Math.random() > 0.8 ? 18 : undefined,
    currency: 'USD',
    views: Math.floor(Math.random() * 50000) + 100,
    likesCount: Math.floor(Math.random() * 5000) + 10,
    downloads: Math.floor(Math.random() * 500) + 5,
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
    publishedAt: createdAt.toISOString(),
    creator: {
      id: creator.id,
      username: creator.username,
      firstName: creator.firstName,
      lastName: creator.lastName,
      profile: creator.profile ? {
        avatarUrl: creator.profile.avatarUrl,
        displayName: creator.profile.displayName,
        isVerified: creator.profile.isVerified,
      } : undefined
    }
  };
});

// Suscripciones mock
const subscriptionTypes = ['MONTHLY', 'YEARLY', 'LIFETIME', 'CUSTOM'] as const;
const subscriptionStatus = ['ACTIVE', 'CANCELLED', 'EXPIRED', 'PAUSED'] as const;

export const mockSubscriptions: Subscription[] = Array.from({ length: 150 }, (_, i) => {
  const creator = mockUsers[Math.floor(Math.random() * mockUsers.length)];
  const createdAt = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
  const startDate = createdAt.toISOString();
  const endDate = Math.random() > 0.7 ? new Date(createdAt.getTime() + (Math.random() * 365 + 30) * 24 * 60 * 60 * 1000).toISOString() : undefined;
  const status = endDate && new Date(endDate) < new Date() ? 'EXPIRED' : subscriptionStatus[Math.floor(Math.random() * subscriptionStatus.length)];
  
  return {
    id: `subscription_${i + 1}`,
    subscriberId: `user_${Math.floor(Math.random() * 30) + 1}`,
    creatorId: creator.id,
    subscriptionType: subscriptionTypes[Math.floor(Math.random() * subscriptionTypes.length)],
    price: Math.floor(Math.random() * 50) + 10, // $10 to $59
    currency: 'USD',
    isActive: status === 'ACTIVE',
    startDate: startDate,
    endDate: endDate,
    autoRenew: Math.random() > 0.3,
    paymentMethod: 'credit_card',
    transactionId: `txn_${i + 1}`,
    status: status as 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAUSED',
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
    creator: {
      id: creator.id,
      username: creator.username,
      firstName: creator.firstName,
      lastName: creator.lastName,
      profile: creator.profile ? {
        avatarUrl: creator.profile.avatarUrl,
        displayName: creator.profile.displayName,
        bio: creator.profile.bio,
        isVerified: creator.profile.isVerified,
      } : undefined
    }
  };
});

// Notificaciones mock
const notificationTypes = ['NEW_FOLLOWER', 'NEW_MESSAGE', 'NEW_CONTENT', 'PAYMENT_RECEIVED', 'SUBSCRIPTION_RENEWED', 'DISPUTE_UPDATE', 'SYSTEM_ALERT', 'PROMOTION'] as const;

export const mockNotifications: Notification[] = Array.from({ length: 100 }, (_, i) => {
  const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
  const createdAt = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  const isRead = Math.random() > 0.4; // 60% read rate
  
  let title = '';
  let content = '';
  let data: Record<string, any> = {};
  
  switch (type) {
    case 'NEW_FOLLOWER':
      title = 'Nuevo seguidor';
      content = `Usuario${Math.floor(Math.random() * 50) + 1} comenzó a seguirte`;
      data = { userId: `user_${Math.floor(Math.random() * 50) + 1}` };
      break;
    case 'NEW_MESSAGE':
      title = 'Nuevo mensaje';
      content = `Usuario${Math.floor(Math.random() * 50) + 1} te envió un mensaje`;
      data = { messageId: `message_${i + 1}` };
      break;
    case 'NEW_CONTENT':
      title = 'Contenido publicado';
      content = 'Tu contenido ha sido aprobado y publicado exitosamente';
      data = { contentId: `content_${Math.floor(Math.random() * 200) + 1}` };
      break;
    case 'PAYMENT_RECEIVED':
      title = 'Pago recibido';
      content = `Has recibido un pago de $${Math.floor(Math.random() * 500) + 50} por tu contenido`;
      data = { amount: Math.floor(Math.random() * 500) + 50, currency: 'USD' };
      break;
    case 'SUBSCRIPTION_RENEWED':
      title = 'Suscripción renovada';
      content = 'Tu suscripción ha sido renovada exitosamente';
      data = { subscriptionId: `subscription_${Math.floor(Math.random() * 150) + 1}` };
      break;
    case 'DISPUTE_UPDATE':
      title = 'Actualización de disputa';
      content = 'Hay una actualización en una de tus disputas';
      data = { disputeId: `dispute_${i + 1}` };
      break;
    case 'SYSTEM_ALERT':
      title = 'Alerta del sistema';
      content = 'La plataforma ha sido actualizada con nuevas funcionalidades';
      data = {};
      break;
    case 'PROMOTION':
      title = 'Nueva promoción';
      content = 'Descubre las nuevas promociones disponibles para creadores';
      data = { promotionId: `promo_${i + 1}` };
      break;
  }
  
  return {
    id: `notification_${i + 1}`,
    userId: `user_${Math.floor(Math.random() * 30) + 1}`,
    type: type,
    title: title,
    content: content,
    data: data,
    isRead: isRead,
    createdAt: createdAt.toISOString(),
  };
});

// Función para obtener datos de contenido con paginación
export const getMockContent = (params?: { page?: number; limit?: number; category?: string; contentType?: string; search?: string }) => {
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  let filteredContent = [...mockContent];
  
  if (params?.category && params.category !== 'all') {
    filteredContent = filteredContent.filter(content => content.category === params.category);
  }
  
  if (params?.contentType) {
    filteredContent = filteredContent.filter(content => content.contentType === params.contentType);
  }
  
  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filteredContent = filteredContent.filter(content => 
      content.title.toLowerCase().includes(searchLower) ||
      content.description.toLowerCase().includes(searchLower) ||
      content.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }
  
  const paginatedContent = filteredContent.slice(startIndex, endIndex);
  
  return {
    data: paginatedContent,
    total: filteredContent.length,
    page: page,
    limit: limit,
    totalPages: Math.ceil(filteredContent.length / limit),
  };
};

// Función para obtener suscripciones con paginación
export const getMockSubscriptions = (params?: { page?: number; limit?: number; status?: string; creatorId?: string }) => {
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  let filteredSubscriptions = [...mockSubscriptions];
  
  if (params?.status) {
    filteredSubscriptions = filteredSubscriptions.filter(sub => sub.status === params.status);
  }
  
  if (params?.creatorId) {
    filteredSubscriptions = filteredSubscriptions.filter(sub => sub.creatorId === params.creatorId);
  }
  
  const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, endIndex);
  
  return {
    data: paginatedSubscriptions,
    total: filteredSubscriptions.length,
    page: page,
    limit: limit,
    totalPages: Math.ceil(filteredSubscriptions.length / limit),
  };
};

// Función para obtener notificaciones con paginación
export const getMockNotifications = (params?: { page?: number; limit?: number; search?: string }) => {
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  let filteredNotifications = [...mockNotifications];
  
  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filteredNotifications = filteredNotifications.filter(notification => 
      notification.title.toLowerCase().includes(searchLower) ||
      notification.message.toLowerCase().includes(searchLower)
    );
  }
  
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);
  
  return {
    data: paginatedNotifications,
    total: filteredNotifications.length,
    page: page,
    limit: limit,
    totalPages: Math.ceil(filteredNotifications.length / limit),
  };
};

// Función para obtener estadísticas rápidas
export const getMockStats = () => {
  return {
    totalContent: mockContent.length,
    totalSubscriptions: mockSubscriptions.length,
    totalNotifications: mockNotifications.length,
    totalUsers: mockUsers.length,
    totalLikes: mockContent.reduce((sum, content) => sum + content.likesCount, 0),
    totalViews: mockContent.reduce((sum, content) => sum + content.viewsCount, 0),
    totalRevenue: mockSubscriptions.reduce((sum, sub) => sum + sub.price, 0),
  };
};

// Función para simular delay de red (opcional para testing)
export const simulateNetworkDelay = (ms: number = 100) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Función para obtener recomendaciones mock
export const getMockRecommendations = (params: { limit?: number } = {}) => {
  const limit = params.limit || 10;
  const recommendations = mockContent.slice(0, limit).map((content, index) => ({
    id: `rec_${index + 1}`,
    content,
    score: Math.random() * 100,
    reason: ['similar_content', 'followed_creator', 'trending', 'personalized'][Math.floor(Math.random() * 4)] as any,
    confidence: Math.random() * 100,
    metadata: {
      matchedTags: content.tags?.slice(0, 2) || [],
      creatorSimilarity: Math.random() * 100,
      engagementScore: Math.random() * 100,
      timeDecay: Math.random() * 100,
    }
  }));

  return {
    success: true,
    data: {
      recommendations,
      total: recommendations.length,
      hasMore: false
    },
    timestamp: new Date().toISOString()
  };
};

// Función para obtener contenido trending mock
export const getMockTrendingContent = () => {
  const trending = mockContent
    .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
    .slice(0, 20)
    .map((content, index) => ({
      contentId: content.id,
      trendScore: Math.random() * 100,
      views24h: Math.floor(Math.random() * 10000) + 1000,
      likes24h: Math.floor(Math.random() * 1000) + 100,
      comments24h: Math.floor(Math.random() * 500) + 50,
      shares24h: Math.floor(Math.random() * 200) + 20,
      velocity: Math.random() * 10,
    }));

  return {
    success: true,
    data: {
      trending,
      total: trending.length
    },
    timestamp: new Date().toISOString()
  };
};

// Función para obtener contenido discover mock
export const getMockDiscoverContent = (params: any = {}) => {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const discoverContent = mockContent.slice(startIndex, endIndex).map(content => ({
    ...content,
    // Agregar datos específicos de discover
    discoverScore: Math.random() * 100,
    isSuggested: Math.random() > 0.7,
    reason: ['trending', 'similar_to_interest', 'new_creator', 'popular_in_community'][Math.floor(Math.random() * 4)]
  }));

  return {
    success: true,
    data: {
      content: discoverContent,
      total: mockContent.length,
      page,
      hasMore: endIndex < mockContent.length
    },
    timestamp: new Date().toISOString()
  };
};

// Función para track de analytics mock
export const trackMockAnalytics = (event: string) => {
  return {
    success: true,
    data: {
      tracked: true,
      eventId: `mock-event-${Date.now()}`,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };
};