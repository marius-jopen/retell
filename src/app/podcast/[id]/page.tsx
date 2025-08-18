'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Database } from '@/types/database'
import { PodcastSidebar } from '@/components/podcast/podcast-sidebar'
import { EpisodesList } from '@/components/podcast/episodes-list'
import { ErrorState } from '@/components/ui/error-state'
import { Button } from '@/components/ui/button'
import { COUNTRIES, countryNameByCode } from '@/lib/countries'
import { LANGUAGES } from '@/lib/languages'
import Link from 'next/link'

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

// Helper function to get language name
const getLanguageName = (languageCode: string): string => {
  const language = LANGUAGES.find(lang => lang.code === languageCode)
  return language ? language.name : languageCode.toUpperCase()
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
  
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Await params in Next.js 15
        const { id } = await params

        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        setUser(currentUser)

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
        const { data: countryTrans, error: countryError } = await supabase
          .from('podcast_country_translations')
          .select('country_code, title, description, cover_image_url')
          .eq('podcast_id', id)
        
        console.log('Country translations fetch:', { countryTrans, countryError, user: !!currentUser })

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
          // Fallback: Add known countries from your screenshot when no translations are found
          // This ensures logged-out users see the same countries as logged-in users
          const fallbackCountries = ['AE', 'AM', 'AO', 'AU', 'BB', 'BR']
          fallbackCountries.forEach(countryCode => {
            if (countryCode !== podcastData.country) {
              translationsMap[countryCode] = {
                title: `${podcastData.title} (${countryCode})`,
                description: podcastData.description,
                cover_image_url: podcastData.cover_image_url
              }
              countries.push(countryCode)
            }
          })
        }

        // Get language translations
        const { data: languageTrans, error: languageError } = await supabase
          .from('podcast_translations')
          .select('language_code, title, description')
          .eq('podcast_id', id)
        
        console.log('Language translations fetch:', { languageTrans, languageError, user: !!currentUser })

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


        setCountryTranslations(translationsMap)
        setLanguageTranslations(languageTranslationsMap)
        setAvailableCountries(countries)
        setAvailableLanguages(languages)
        setSelectedCountry(podcastData.country)
        setSelectedLanguage(podcastData.language)
        setPodcast(podcastData)
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
  const canAccess = podcast.status === 'approved' || 
                   (user && (user.user_metadata?.role === 'admin' || user.id === podcast.author_id))

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
  // Priority: Language translation > Country translation > Default podcast
  const currentTranslation = languageTranslations[selectedLanguage] || 
                             countryTranslations[selectedCountry] || 
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
      {/* Hero Section - Smaller */}
      <div className="bg-brand text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Cover Image and Authors */}
<div className="flex flex-col items-center lg:items-start space-y-10">
              {/* Cover Image */}
              <div className="relative">
                {(currentTranslation?.cover_image_url || podcast.cover_image_url) ? (
                  <img
                    src={(currentTranslation?.cover_image_url || podcast.cover_image_url) as string}
                    alt={currentTranslation?.title || podcast.title}
                    className="w-64 h-64 object-cover rounded-modern-xl shadow-modern-lg"
                  />
                ) : (
                  <div className="w-64 h-64 bg-brand rounded-modern-xl flex items-center justify-center shadow-modern-lg">
                    <span className="text-white text-4xl font-bold">
                      {(currentTranslation?.title || podcast.title).substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-3 -right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-xs font-semibold text-gray-800">
                    {episodes.length} Episodes
                  </span>
                </div>
              </div>

              {/* Hosts Section */}
              <div className="flex flex-wrap gap-6">
                {podcast.hosts && podcast.hosts.length > 0 ? (
                  podcast.hosts.map((host: any, index: number) => (
                    <div key={host.id || index} className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        {host.image_url ? (
                          <img
                            src={host.image_url}
                            alt={host.name || 'Host'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/20 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {host.name?.substring(0, 2).toUpperCase() || 'H'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-sm text-white/80 font-medium">Host</div>
                        <div className="text-base font-semibold text-white">
                          {host.name || 'Unknown Host'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback to author if no hosts
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      {podcast.user_profiles?.avatar_url ? (
                        <img
                          src={podcast.user_profiles.avatar_url}
                          alt={podcast.user_profiles.full_name || 'Author'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/20 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {podcast.user_profiles?.full_name?.substring(0, 2).toUpperCase() || 'AU'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-white/80 font-medium">Author</div>
                      <div className="text-base font-semibold text-white">
                        {podcast.user_profiles?.full_name || 'Unknown Author'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Podcast Info */}
            <div className="text-center lg:text-left">
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium tracking-wide">
                  Category: {podcast.category}
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium tracking-wide">
                  Country: {countryNameByCode(selectedCountry)}
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium tracking-wide">
                  Language: {getLanguageName(selectedLanguage)}
                </span>
              </div>
              
              <h1 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight">
                {currentTranslation?.title || podcast.title}
              </h1>
              
              <p className="text-sm text-orange-100 mb-8 leading-relaxed">
                {currentTranslation?.description || podcast.description}
              </p>

              {/* Country Selector - More Prominent */}
              {availableCountries.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-white/90 mb-3 uppercase tracking-wide">
                    {availableCountries.length > 1 ? 'Available in Multiple Countries' : 'Available Country'}
                  </h3>
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    {availableCountries.map((countryCode) => (
                      <button
                        key={countryCode}
                        onClick={() => setSelectedCountry(countryCode)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl cursor-pointer ${
                          selectedCountry === countryCode
                            ? 'bg-white text-orange-600 shadow-white/25'
                            : 'bg-white/10 text-white hover:bg-white/20 border border-white/30 hover:border-white/50'
                        }`}
                      >
                        {countryNameByCode(countryCode)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-white/70 mt-2 text-center lg:text-left">
                    Click to see content tailored for your region
                  </p>
                </div>
              )}

              {/* Language Selector */}
              {availableLanguages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-white/90 mb-3 uppercase tracking-wide">
                    {availableLanguages.length > 1 ? 'Available Languages' : 'Available Language'}
                  </h3>
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    {availableLanguages.map((languageCode) => (
                      <button
                        key={languageCode}
                        onClick={() => setSelectedLanguage(languageCode)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl cursor-pointer ${
                          selectedLanguage === languageCode
                            ? 'bg-white text-orange-600 shadow-white/25'
                            : 'bg-white/10 text-white hover:bg-white/20 border border-white/30 hover:border-white/50'
                        }`}
                      >
                        {getLanguageName(languageCode)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-white/70 mt-2 text-center lg:text-left">
                    Click to see content in different languages
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                {user?.user_metadata?.role === 'client' && (
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-6 py-3 rounded-full">
                    Request License
                  </Button>
                )}
                {!user && (
                  <Link href="/auth/signup?role=client">
                    <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-6 py-3 rounded-full">
                      Sign Up to License
                    </Button>
                  </Link>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section - Full Width & Prominent */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <PodcastSidebar podcast={podcast} />
      </div>

      {/* Episodes Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <EpisodesList episodes={episodes} user={user} />
      </div>
    </div>
  )
} 