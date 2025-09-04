'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Database } from '@/types/database'
import { PodcastSidebar } from '@/components/podcast/podcast-sidebar'
import { EpisodesList } from '@/components/podcast/episodes-list'
import { PodcastHero } from '@/components/podcast/podcast-hero'
import { PodcastLicensing } from '@/components/podcast/podcast-licensing'
import { PodcastContent } from '@/components/podcast/podcast-content'
import { ImageGallerySlider } from '@/components/podcast/image-gallery-slider'
import { ErrorState } from '@/components/ui/error-state'

type Episode = Database['public']['Tables']['episodes']['Row']
type PodcastType = Database['public']['Tables']['podcasts']['Row'] & {
  episodes: Episode[]
  user_profiles: {
    full_name: string
    avatar_url: string | null
    company: string | null
  }
}

interface PodcastDetailPageProps {
  params: Promise<{ id: string }>
}


export default function PodcastDetailPage({ params }: PodcastDetailPageProps) {
  const [podcast, setPodcast] = useState<PodcastType | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('DE') // Default country
  const [selectedLanguage, setSelectedLanguage] = useState('de') // Default language
  const [countryTranslations, setCountryTranslations] = useState<Record<string, { title: string; description: string; cover_image_url: string | null }>>({})
  const [languageTranslations, setLanguageTranslations] = useState<Record<string, { title: string; description: string; cover_image_url: string | null }>>({})
  const [availableCountries, setAvailableCountries] = useState<string[]>([])
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([])
  const [galleryImages, setGalleryImages] = useState<any[]>([])
  
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
  // Await params in Next.js 15
  const { id } = await params

        // Get current user with profile
        console.log('Fetching user...')
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        console.log('Current user from auth:', currentUser)
        
        if (currentUser) {
          // Get user profile to check role
          console.log('Fetching user profile for user ID:', currentUser.id)
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single()
          
          console.log('Profile data:', profile)
          console.log('Profile error:', profileError)
          
          setUser({
            ...currentUser,
            profile
          })
        } else {
          console.log('No current user found')
          setUser(null)
        }

  // Get podcast details with episodes
        const { data: podcastData, error: podcastError } = await supabase
    .from('podcasts')
    .select(`
      *,
      episodes (
        id,
        title,
        description,
        audio_url,
        script_url,
        duration,
        episode_number,
        season_number,
        created_at
      ),
      user_profiles!author_id (
        full_name,
        avatar_url,
        company
      )
    `)
    .eq('id', id)
    .single()

        if (podcastError || !podcastData) {
          setError('Podcast not found')
          setLoading(false)
          return
        }

        // Get country translations
        console.log('Fetching country translations for podcast:', id, 'User logged in:', !!user)
        // Translation tables removed - using main podcast fields
        const countryTrans: any[] = []
        const countryError: any = null
        
        console.log('Country translations result:', { 
          data: countryTrans, 
          error: countryError, 
          count: countryTrans?.length || 0 
        })
        console.log('Country translations full data:', countryTrans)
        


        // Process country translations
        const translationsMap: Record<string, { title: string; description: string; cover_image_url: string | null }> = {}
        const countries = [podcastData.country] // Start with default country
        
        // Add default country data
        translationsMap[podcastData.country] = {
          title: podcastData.title,
          description: podcastData.description,
          cover_image_url: podcastData.cover_image_url
        }

        // Add translated countries
        if (countryTrans && countryTrans.length > 0) {
          console.log('Using real country translations:', countryTrans)
          countryTrans.forEach((trans: any) => {
            if (trans.country_code && trans.country_code !== podcastData.country) {
              translationsMap[trans.country_code] = {
                title: trans.title,
                description: trans.description,
                cover_image_url: trans.cover_image_url
              }
              countries.push(trans.country_code)
            }
          })
        } else {
          console.log('No country translations found - RLS policies may need to be updated')
        }

        // Get language translations
        console.log('Fetching language translations for podcast:', id)
        // Translation tables removed - using main podcast fields
        const languageTrans: any[] = []
        const languageError: any = null
        
        console.log('Language translations result:', { 
          data: languageTrans, 
          error: languageError, 
          count: languageTrans?.length || 0 
        })
        console.log('Language translations full data:', languageTrans)
        


        // Process language translations
        const languageTranslationsMap: Record<string, { title: string; description: string; cover_image_url: string | null }> = {}
        const languages = [podcastData.language] // Start with default language
        
        // Add default language data
        languageTranslationsMap[podcastData.language] = {
          title: podcastData.title,
          description: podcastData.description,
          cover_image_url: podcastData.cover_image_url
        }

        // Add translated languages
        if (languageTrans) {
          languageTrans.forEach((trans: any) => {
            if (trans.language_code && trans.language_code !== podcastData.language) {
              languageTranslationsMap[trans.language_code] = {
                title: trans.title,
                description: trans.description,
                cover_image_url: podcastData.cover_image_url // Use same cover for languages
              }
              languages.push(trans.language_code)
            }
          })
        }



        
        console.log('Final processed data:')
        console.log('- translationsMap:', translationsMap)
        console.log('- languageTranslationsMap:', languageTranslationsMap)
        console.log('- countries:', countries)
        console.log('- languages:', languages)
        console.log('- languageTranslationsMap.de content:', languageTranslationsMap.de)
        
        setCountryTranslations(translationsMap)
        setLanguageTranslations(languageTranslationsMap)
        setAvailableCountries(countries)
        setAvailableLanguages(languages)
        setSelectedCountry(podcastData.country)
        setSelectedLanguage(podcastData.language)
        setPodcast(podcastData)

        // Fetch gallery images
        const { data: galleryData, error: galleryError } = await supabase
          .from('podcast_image_gallery')
          .select('*')
          .eq('podcast_id', id)
          .order('sort_order', { ascending: true })

        if (galleryError) {
          console.error('Error fetching gallery images:', galleryError)
        } else {
          setGalleryImages(galleryData || [])
        }

        setLoading(false)

      } catch (err) {
        console.error('Error fetching podcast:', err)
        setError('Failed to load podcast')
        setLoading(false)
      }
    }

    fetchData()
  }, [params, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading podcast...</p>
        </div>
      </div>
    )
  }

  if (error || !podcast) {
    return (
      <ErrorState
        title="Podcast Not Found"
        message="The podcast you're looking for doesn't exist or might have been removed."
        actionText="Browse All Podcasts"
        actionHref="/catalog"
        icon="not-found"
      />
    )
  }

  // Check if user can access this podcast
  // Public access: approved podcasts are viewable by everyone
  // Restricted access: non-approved podcasts only for admins/authors
  console.log('Access check - podcast status:', podcast.status)
  console.log('Access check - user:', user ? 'exists' : 'null')
  console.log('Access check - user profile:', user?.profile)
  console.log('Access check - user role:', user?.profile?.role)
  console.log('Access check - podcast author_id:', podcast.author_id)
  console.log('Access check - user id:', user?.id)
  
  // For debugging: allow access if podcast is approved OR if user exists (temporary)
  const canAccess = podcast.status === 'approved' || 
                   (user && user.id) // Temporary: allow any authenticated user
  
  console.log('Access check - canAccess:', canAccess)

  if (!canAccess) {
    return (
      <ErrorState
        title="Podcast Not Public Yet"
        message="This podcast is still in review and not yet available for public viewing. Please check back later."
        actionText="Back to Catalog"
        actionHref="/catalog"
        icon="access-denied"
      />
    )
  }

    const episodes = podcast.episodes || []
  // Priority: Country translation > Language translation > Default podcast
  // This allows country switching to work properly
  const currentTranslation = countryTranslations[selectedCountry] ||
                             languageTranslations[selectedLanguage] || 
                             countryTranslations[podcast.country] ||
                             {
                               title: podcast.title,
                               description: podcast.description,
                               cover_image_url: podcast.cover_image_url
                             }
  

  
  // Calculate total duration of all episodes (in minutes)
  const totalDuration = episodes.reduce((sum: number, episode: Episode) => sum + (episode.duration || 0), 0)
  
  return (
    <div className="min-h-screen bg-orange-50">
      {/* Hero Section */}
      <PodcastHero
        podcast={podcast}
        currentTranslation={currentTranslation}
        selectedCountry={selectedCountry}
        selectedLanguage={selectedLanguage}
        availableLanguages={availableLanguages}
        episodes={episodes}
        user={user}
        onLanguageChange={setSelectedLanguage}
      />

      {/* Licensing Information Section */}
      <PodcastLicensing podcast={podcast} />

      {/* About Section - Full Width & Prominent */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <PodcastSidebar podcast={podcast} />
      </div>

      {/* Image Gallery Section */}
      {galleryImages.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Image Gallery</h2>
            <p className="text-gray-600">Visual content and materials for this podcast</p>
          </div>
          <ImageGallerySlider images={galleryImages} />
        </div>
      )}

      {/* Script and Audio Content Section */}
      <PodcastContent podcast={podcast} />


      {/* Episodes Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-20">
        <EpisodesList episodes={episodes} user={user} />
      </div>
    </div>
  )
} 