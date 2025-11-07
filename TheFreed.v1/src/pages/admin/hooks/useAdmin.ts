// Hook personalizado para gestión de administración en TheFreed.v1
import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  userType: 'USER' | 'CREATOR' | 'ADMIN';
  isActive: boolean;
  isSuspended: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  lastActive: string;
  profile?: {
    displayName?: string;
    followerCount?: number;
    isVerified?: boolean;
  };
}

export interface AdminContent {
  id: string;
  title: string;
  description?: string;
  contentType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE';
  visibility: 'PUBLIC' | 'SUBSCRIBERS' | 'PRIVATE';
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: string;
  creator: {
    id: string;
    username: string;
    displayName?: string;
  };
}

export interface AdminStats {
  totalUsers: number;
  activeCreators: number;
  totalContent: number;
  totalRevenue: number;
  pendingReports: number;
  newUsersToday: number;
  usersGrowth: number;
  contentGrowth: number;
  revenueGrowth: number;
}

export interface AdminReport {
  id: string;
  type: 'CONTENT' | 'USER' | 'PAYMENT';
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  description: string;
  createdAt: string;
  reporter: {
    id: string;
    username: string;
  };
  reportedItem?: {
    type: string;
    id: string;
    title?: string;
    creator?: string;
  };
}

// Hook para obtener estadísticas del dashboard
export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular datos por ahora - se puede conectar con API real
      const mockStats: AdminStats = {
        totalUsers: 12847,
        activeCreators: 1256,
        totalContent: 8964,
        totalRevenue: 156789.50,
        pendingReports: 12,
        newUsersToday: 89,
        usersGrowth: 12.5,
        contentGrowth: 15.3,
        revenueGrowth: 23.7
      };
      
      setStats(mockStats);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};

// Hook para gestión de usuarios
export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    userType?: string;
    status?: 'active' | 'suspended' | 'all';
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getUsers(params);
      
      if (response.success && response.data) {
        setUsers(response.data.items || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const suspendUser = async (userId: string) => {
    try {
      const response = await apiService.request(`/api/admin/users/${userId}/suspend`, {
        method: 'POST'
      });
      
      if (response.success) {
        // Actualizar el usuario en la lista
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isSuspended: true } : user
        ));
      }
      return response;
    } catch (err: any) {
      throw new Error(err.message || 'Error al suspender usuario');
    }
  };

  const activateUser = async (userId: string) => {
    try {
      const response = await apiService.request(`/api/admin/users/${userId}/activate`, {
        method: 'POST'
      });
      
      if (response.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isSuspended: false } : user
        ));
      }
      return response;
    } catch (err: any) {
      throw new Error(err.message || 'Error al activar usuario');
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    suspendUser,
    activateUser
  };
};

// Hook para gestión de contenido
export const useAdminContent = () => {
  const [content, setContent] = useState<AdminContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async (params?: {
    page?: number;
    limit?: number;
    contentType?: string;
    visibility?: string;
    search?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getContent(params);
      
      if (response.success && response.data) {
        setContent(response.data.items || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar contenido');
    } finally {
      setLoading(false);
    }
  };

  const deleteContent = async (contentId: string) => {
    try {
      const response = await apiService.request(`/api/admin/content/${contentId}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        setContent(prev => prev.filter(item => item.id !== contentId));
      }
      return response;
    } catch (err: any) {
      throw new Error(err.message || 'Error al eliminar contenido');
    }
  };

  const flagContent = async (contentId: string, reason: string) => {
    try {
      const response = await apiService.request(`/api/admin/content/${contentId}/flag`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      
      if (response.success) {
        // Actualizar estado del contenido si es necesario
        setContent(prev => prev.map(item => 
          item.id === contentId ? { ...item, isFlagged: true } : item
        ));
      }
      return response;
    } catch (err: any) {
      throw new Error(err.message || 'Error al marcar contenido');
    }
  };

  return {
    content,
    loading,
    error,
    fetchContent,
    deleteContent,
    flagContent
  };
};

// Hook para gestión de reportes
export const useAdminReports = () => {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async (params?: {
    page?: number;
    limit?: number;
    status?: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
    type?: 'CONTENT' | 'USER' | 'PAYMENT';
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.request('/api/admin/reports', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      });
      
      if (response.success && response.data) {
        setReports(response.data.items || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const resolveReport = async (reportId: string, action: 'RESOLVE' | 'DISMISS') => {
    try {
      const response = await apiService.request(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action })
      });
      
      if (response.success) {
        setReports(prev => prev.map(report => 
          report.id === reportId ? { ...report, status: action === 'RESOLVE' ? 'RESOLVED' : 'DISMISSED' } : report
        ));
      }
      return response;
    } catch (err: any) {
      throw new Error(err.message || 'Error al resolver reporte');
    }
  };

  return {
    reports,
    loading,
    error,
    fetchReports,
    resolveReport
  };
};

// Hook para configuraciones del sistema
export const useAdminSettings = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.request('/api/admin/settings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      });
      
      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const response = await apiService.request(`/api/admin/settings/${key}`, {
        method: 'PATCH',
        body: JSON.stringify({ value })
      });
      
      if (response.success) {
        setSettings((prev: any) => ({
          ...prev,
          [key]: value
        }));
      }
      return response;
    } catch (err: any) {
      throw new Error(err.message || 'Error al actualizar configuración');
    }
  };

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSetting
  };
};
