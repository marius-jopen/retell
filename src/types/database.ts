export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'author'
          full_name: string
          avatar_url: string | null
          company: string | null
          country: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: 'admin' | 'author'
          full_name: string
          avatar_url?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'author'
          full_name?: string
          avatar_url?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      podcasts: {
        Row: {
          id: string
          title: string
          description: string
          cover_image_url: string | null
          author_id: string
          category: string
          language: string
          country: string
          status: 'draft' | 'pending' | 'approved' | 'rejected'
          rss_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          cover_image_url?: string | null
          author_id: string
          category: string
          language: string
          country: string
          status?: 'draft' | 'pending' | 'approved' | 'rejected'
          rss_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          cover_image_url?: string | null
          author_id?: string
          category?: string
          language?: string
          country?: string
          status?: 'draft' | 'pending' | 'approved' | 'rejected'
          rss_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      episodes: {
        Row: {
          id: string
          podcast_id: string
          title: string
          description: string
          audio_url: string
          script_url: string
          duration: number | null
          episode_number: number
          season_number: number | null
          status: 'draft' | 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          podcast_id: string
          title: string
          description: string
          audio_url: string
          script_url: string
          duration?: number | null
          episode_number: number
          season_number?: number | null
          status?: 'draft' | 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          podcast_id?: string
          title?: string
          description?: string
          audio_url?: string
          script_url?: string
          duration?: number | null
          episode_number?: number
          season_number?: number | null
          status?: 'draft' | 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      agencies: {
        Row: {
          id: string
          name: string
          description: string
          contact_email: string
          country: string
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          contact_email: string
          country: string
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          contact_email?: string
          country?: string
          website?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      uploads: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          upload_type: 'audio' | 'script' | 'image' | 'document'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          upload_type: 'audio' | 'script' | 'image' | 'document'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          upload_type?: 'audio' | 'script' | 'image' | 'document'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'author'
      content_status: 'draft' | 'pending' | 'approved' | 'rejected'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 