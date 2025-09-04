export interface Host {
  id: string
  name: string
  language: string
  image?: File | string
  imagePreviewUrl?: string
  image_url?: string // For database storage
}

export interface CountryTranslation {
  title: string
  description: string
  cover_image_url?: string
}



export interface Podcast {
  id: string
  title: string
  description: string
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
}

export interface Episode {
  id: string
  title: string
  description: string
  episode_number: number
  duration: number
  published_at: string | null
  audio_url: string | null
  cover_image_url: string | null
  status: 'draft' | 'scheduled' | 'published'
}
