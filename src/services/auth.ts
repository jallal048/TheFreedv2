// Servicio de autenticación usando Supabase Auth
import { supabase } from './supabase';
import { User } from '../types';

export class AuthService {
  
  // Login con Supabase
  static async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: {
          user: this.mapSupabaseUser(data.user),
          token: data.session?.access_token,
          refreshToken: data.session?.refresh_token
        }
      };
    } catch (error: any) {
      console.error('Error de login:', error);
      return {
        success: false,
        error: error.message || 'Error de autenticación'
      };
    }
  }

  // Registro con Supabase
  static async register(email: string, password: string, userData?: any) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: {
          user: this.mapSupabaseUser(data.user),
          token: data.session?.access_token,
          refreshToken: data.session?.refresh_token
        }
      };
    } catch (error: any) {
      console.error('Error de registro:', error);
      return {
        success: false,
        error: error.message || 'Error de registro'
      };
    }
  }

  // Logout
  static async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error de logout:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener usuario actual
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        throw new Error(error.message);
      }

      if (!user) {
        return { success: false, error: 'No hay usuario autenticado' };
      }

      return {
        success: true,
        data: {
          user: this.mapSupabaseUser(user)
        }
      };
    } catch (error: any) {
      console.error('Error al obtener usuario:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Renovar token
  static async refreshToken() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: {
          token: data.session?.access_token,
          refreshToken: data.session?.refresh_token
        }
      };
    } catch (error: any) {
      console.error('Error al renovar token:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Mapear usuario de Supabase a nuestro tipo User
  static mapSupabaseUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      username: supabaseUser.user_metadata?.username || '',
      firstName: supabaseUser.user_metadata?.firstName || '',
      lastName: supabaseUser.user_metadata?.lastName || '',
      userType: 'USER' as any,
      isEmailVerified: supabaseUser.email_confirmed_at ? true : false,
      isPhoneVerified: false,
      isActive: true,
      isSuspended: false,
      createdAt: supabaseUser.created_at,
      lastActive: new Date().toISOString(),
      profile: {
        id: `profile_${supabaseUser.id}`,
        userId: supabaseUser.id,
        displayName: supabaseUser.user_metadata?.displayName || 
                     `${supabaseUser.user_metadata?.firstName || ''} ${supabaseUser.user_metadata?.lastName || ''}`.trim() ||
                     'Usuario',
        bio: supabaseUser.user_metadata?.bio || '',
        avatarUrl: supabaseUser.user_metadata?.avatarUrl || '',
        bannerUrl: supabaseUser.user_metadata?.bannerUrl || '',
        website: supabaseUser.user_metadata?.website || '',
        socialLinks: {
          twitter: supabaseUser.user_metadata?.socialLinks?.twitter || '',
          instagram: supabaseUser.user_metadata?.socialLinks?.instagram || '',
          youtube: supabaseUser.user_metadata?.socialLinks?.youtube || ''
        },
        categories: ['general'],
        contentTypes: ['TEXT', 'IMAGE', 'VIDEO'],
        isVerified: false,
        verificationLevel: 'BASIC',
        isLiveStreaming: false,
        isAdultContent: false,
        monthlyPrice: 0,
        yearlyPrice: 0,
        customPrice: 0,
        commissionRate: 15,
        isPublic: true,
        isActive: true,
        followerCount: 0,
        totalViews: 0,
        totalEarnings: 0,
        totalContent: 0,
        createdAt: supabaseUser.created_at,
        updatedAt: new Date().toISOString()
      }
    };
  }

  // Verificar si hay sesión activa
  static async hasActiveSession(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }

  // Obtener sesión actual
  static async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(error.message);
    }

    return session;
  }
}

// Configurar listeners de autenticación
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.id);
  
  // Puedes agregar lógica aquí para manejar cambios de estado
  // Por ejemplo, actualizar el AuthContext
});