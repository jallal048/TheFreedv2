// Servicio de autenticación usando Supabase Auth y crea perfil manualmente
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
      if (error) throw new Error(error.message);
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

  // Registro con Supabase + perfil manual
  static async register(email: string, password: string, userData?: any) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: userData }
      });
      if (error) throw new Error(error.message);

      // Crear perfil manualmente en tabla public.profiles
      const user = data.user;
      if (user) {
        const profileInsert = {
          user_id: user.id,
          username: userData?.username || user.email.split('@')[0],
          first_name: userData?.firstName || '',
          last_name: userData?.lastName || '',
          display_name: userData?.displayName || userData?.username || user.email.split('@')[0],
          bio: '',
          avatar_url: '',
          banner_url: '',
          website: '',
          social_links: {},
          categories: userData?.categories || ['general'],
          is_verified: false,
          is_public: true,
          is_active: true,
          follower_count: 0,
          monthly_price: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const { error: errProfile } = await supabase.from('profiles').insert([profileInsert]);
        if (errProfile) {
          console.warn('Error al crear perfil tras registro:', errProfile.message);
          return { success: false, error: 'Registro: usuario creado pero perfil falló: ' + errProfile.message };
        }
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

  // ... resto igual ...
