export interface Host {
  id: string
  name: string
  language: string
  image?: string
  imagePreviewUrl?: string
  image_url?: string // For database storage
  imageFile?: File | null
}

export interface CountryTranslation {
  title: string
  description: string
  cover_image_url?: string
}



export interface ManualOverrides {
  title?: boolean
  description?: boolean
  cover_image?: boolean
  category?: boolean
  language?: boolean
  country?: boolean
}

export interface Podcast {
  id: string
  title: string
  description: string
  title_english?: string | null
  description_english?: string | null
  category: string
  language: string
  country: string
  rss_url: string | null
  cover_image_url: string | null
  author_id: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  auto_publish_episodes: boolean
  script_url?: string | null
  script_english_url?: string | null
  script_audio_tracks_url?: string | null
  script_music_url?: string | null

  license_countries?: string[]
  user_profiles?: {
    full_name: string
    email: string
  }
  hosts?: Host[]
  manual_overrides?: ManualOverrides
}

export interface Episode {
  id: string
  title: string
  description: string
  title_english?: string | null
  description_english?: string | null
  episode_number: number
  duration: number | null
  published_at?: string | null
  audio_url?: string | null
  cover_image_url?: string | null
  script_url?: string | null
  season_number?: number | null
  created_at?: string
  updated_at?: string
  status?: 'draft' | 'scheduled' | 'published'
}
