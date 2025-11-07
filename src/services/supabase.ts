import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://eaggsjqcsjzdjrkdjeog.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhZ2dzanFjc2p6ZGpya2RqZW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDQzMzcsImV4cCI6MjA3ODAyMDMzN30.3UYBnXyumaceB6frWFEF2MC1n9WNm4qNkDQoy8qxdek";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para las tablas
export interface Content {
  id: string;
  title: string;
  description: string | null;
  content_html: string | null;
  content_type: 'VIDEO' | 'AUDIO' | 'IMAGE' | 'TEXT';
  category: string;
  tags: string[];
  visibility: 'public' | 'private' | 'unlisted';
  price: number;
  is_premium: boolean;
  is_free: boolean;
  is_nsfw: boolean;
  age_restriction: number;
  media_url: string | null;
  thumbnail_url: string | null;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  scheduled_for: string | null;
  views: number;
  likes_count: number;
  downloads: number;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface Draft {
  id: string;
  content_id: string | null;
  draft_data: any;
  autosaved_at: string;
  author_id: string;
  created_at: string;
}

export interface ScheduledPost {
  id: string;
  content_id: string;
  scheduled_for: string;
  status: 'pending' | 'published' | 'failed' | 'cancelled';
  error_message: string | null;
  author_id: string;
  created_at: string;
  published_at: string | null;
}

// Servicios de Supabase
export const supabaseService = {
  // Contenidos
  async createContent(data: Partial<Content>) {
    const { data: content, error } = await supabase
      .from('contents')
      .insert([data])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return content;
  },

  async updateContent(id: string, data: Partial<Content>) {
    const { data: content, error } = await supabase
      .from('contents')
      .update(data)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return content;
  },

  async getContent(id: string) {
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getContentsByAuthor(authorId: string, status?: string) {
    let query = supabase
      .from('contents')
      .select('*')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async deleteContent(id: string) {
    const { error } = await supabase
      .from('contents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Drafts
  async saveDraft(authorId: string, draftData: any, contentId?: string) {
    const { data: existing, error: existError } = await supabase
      .from('drafts')
      .select('*')
      .eq('author_id', authorId)
      .is('content_id', null)
      .maybeSingle();
    
    if (existError && existError.code !== 'PGRST116') {
      throw existError;
    }
    
    if (existing) {
      const { data, error } = await supabase
        .from('drafts')
        .update({ 
          draft_data: draftData, 
          autosaved_at: new Date().toISOString() 
        })
        .eq('id', existing.id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('drafts')
        .insert([{ 
          author_id: authorId, 
          draft_data: draftData,
          content_id: contentId 
        }])
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  },

  async getDraft(authorId: string) {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('author_id', authorId)
      .is('content_id', null)
      .order('autosaved_at', { ascending: false })
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async deleteDraft(id: string) {
    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Publicaciones programadas
  async schedulePost(contentId: string, scheduledFor: string, authorId: string) {
    const { data, error } = await supabase
      .from('scheduled_posts')
      .insert([{ 
        content_id: contentId, 
        scheduled_for: scheduledFor,
        author_id: authorId 
      }])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getScheduledPosts(authorId: string) {
    const { data, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('author_id', authorId)
      .eq('status', 'pending')
      .order('scheduled_for', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async cancelScheduledPost(id: string) {
    const { error } = await supabase
      .from('scheduled_posts')
      .update({ status: 'cancelled' })
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateScheduledPost(id: string, scheduledFor: string) {
    const { error } = await supabase
      .from('scheduled_posts')
      .update({ scheduled_for: scheduledFor })
      .eq('id', id);
    
    if (error) throw error;
  },

  // Storage
  async uploadFile(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from('content-media')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('content-media')
      .getPublicUrl(data.path);
    
    return publicUrl;
  },

  async deleteFile(path: string) {
    const { error } = await supabase.storage
      .from('content-media')
      .remove([path]);
    
    if (error) throw error;
  }
};
