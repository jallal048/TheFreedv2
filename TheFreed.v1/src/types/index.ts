// Tipos TypeScript para TheFreed.v1 Frontend

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  userType: 'CONSUMER' | 'CREATOR' | 'ADMIN' | 'MODERATOR';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  isSuspended: boolean;
  createdAt: string;
  lastActive: string;
  profile?: CreatorProfile;
}

export interface CreatorProfile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  categories: string[];
  contentTypes: string[];
  isVerified: boolean;
  verificationLevel: 'NONE' | 'BASIC' | 'VERIFIED' | 'PREMIUM';
  isLiveStreaming: boolean;
  isAdultContent: boolean;
  monthlyPrice?: number;
  yearlyPrice?: number;
  customPrice?: number;
  commissionRate: number;
  isPublic: boolean;
  isActive: boolean;
  followerCount: number;
  totalViews: number;
  totalEarnings: number;
  totalContent: number;
  createdAt: string;
  updatedAt: string;
}

export interface Content {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  contentType: 'VIDEO' | 'AUDIO' | 'IMAGE' | 'TEXT' | 'LIVESTREAM' | 'GALLERY' | 'DOCUMENT';
  category: string;
  tags: string[];
  mediaUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  fileSize?: number;
  isPremium: boolean;
  isFree: boolean;
  price?: number;
  isPrivate: boolean;
  isArchived: boolean;
  isNSFW: boolean;
  ageRestriction?: number;
  currency: string;
  views: number;
  likesCount: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  creator: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profile?: {
      avatarUrl?: string;
      displayName: string;
      isVerified: boolean;
    };
  };
}

export interface Subscription {
  id: string;
  subscriberId: string;
  creatorId: string;
  subscriptionType: 'MONTHLY' | 'YEARLY' | 'LIFETIME' | 'CUSTOM';
  price: number;
  currency: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  paymentMethod?: string;
  transactionId?: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAUSED';
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profile?: {
      avatarUrl?: string;
      displayName: string;
      bio?: string;
      isVerified: boolean;
    };
  };
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE';
  mediaUrl?: string;
  isRead: boolean;
  isDeleted: boolean;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profile?: { avatarUrl?: string };
  };
}

export interface Comment {
  id: string;
  userId: string;
  contentId: string;
  content: string;
  parentId?: string;
  isDeleted: boolean;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profile?: { avatarUrl?: string };
  };
  replies?: Comment[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'NEW_FOLLOWER' | 'NEW_MESSAGE' | 'NEW_CONTENT' | 'PAYMENT_RECEIVED' | 'SUBSCRIPTION_RENEWED' | 'DISPUTE_UPDATE' | 'SYSTEM_ALERT' | 'PROMOTION';
  title: string;
  content: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  gateway: 'STRIPE' | 'PAYPAL' | 'BANK_TRANSFER' | 'CRYPTO' | 'OTHER';
  gatewayTransactionId?: string;
  failureReason?: string;
  processedAt?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  privacyLevel: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  contentVisibility: 'ALL' | 'SUBSCRIBERS' | 'PREMIUM' | 'PRIVATE';
  autoLike: boolean;
  darkMode: boolean;
  currency: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  id: string;
  creatorId?: string;
  contentId?: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  revenue: number;
  metadata?: Record<string, any>;
}