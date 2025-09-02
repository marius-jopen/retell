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

              {/* Language Selector - Only show if multiple languages */}
              {availableLanguages.length > 1 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-white/90 mb-3 uppercase tracking-wide">
                    Available Languages
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

              {/* Action Buttons - Only for logged-in clients */}
              {user?.user_metadata?.role === 'client' && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-6 py-3 rounded-full">
                    Request License
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Licensing Information Section */}
      {(podcast.license_format || podcast.license_territory || podcast.license_total_listeners || podcast.license_copyright || podcast.license_rights_ownership) && (
        <div className=" border- border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <div className="text-4xl mb-4">🏛️</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Licensing Information</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Complete licensing details and terms for this premium podcast content
              </p>
              </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Left Column - Licensing Terms */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="text-2xl mr-3">📜</span>
                    Copyright Terms
                  </h3>
                  
                  <div className="space-y-4">
                    {podcast.license_copyright && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-700">License Duration</span>
                        <span className="text-gray-900 font-semibold">
                          {podcast.license_copyright === 'lifetime' ? 'Lifetime + 70 years' : '5 years'}
                        </span>
                      </div>
                    )}
                    
                    {podcast.license_rights_ownership && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-700">Content Rights</span>
                        <span className="text-gray-900 font-semibold">
                          {podcast.license_rights_ownership === 'full_owner' ? 'Full Commercial Use' :
                           podcast.license_rights_ownership === 'granted_rights' ? 'Licensed Use' :
                           podcast.license_rights_ownership === 'partial_rights' ? 'Limited Use' : 'Restricted Use'}
                        </span>
                      </div>
                    )}
                    
                    {podcast.license_territory && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-700">Territory</span>
                        <span className="text-gray-900 font-semibold">
                          {podcast.license_territory === 'worldwide' ? 'Worldwide' : 'Limited Regions'}
                        </span>
                      </div>
                    )}
                    
                    {podcast.license_excluded_countries && podcast.license_excluded_countries.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <span className="text-sm font-medium text-amber-800">Excluded Territories:</span>
                        <span className="text-sm text-amber-700 ml-2">
                          {podcast.license_excluded_countries.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Package */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="text-2xl mr-3">📦</span>
                    Content Package
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <span className="text-green-500 mr-3">✓</span>
                      <span>High-quality audio files (320kbps)</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="text-green-500 mr-3">✓</span>
                      <span>Complete episode scripts</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="text-green-500 mr-3">✓</span>
                      <span>Metadata & show notes</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="text-green-500 mr-3">✓</span>
                      <span>Cover art & branding</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="text-green-500 mr-3">✓</span>
                      <span>Professional production</span>
                </div>
                </div>
                </div>
              </div>

              {/* Right Column - Demographics & Performance */}
              <div className="space-y-6">
                {/* Performance Metrics */}
                {(podcast.license_total_listeners || podcast.license_listeners_per_episode) && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="text-2xl mr-3">📊</span>
                      Demographics
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {podcast.license_total_listeners && (
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {podcast.license_total_listeners >= 1000 
                              ? `${Math.round(podcast.license_total_listeners / 1000)}K+` 
                              : podcast.license_total_listeners.toLocaleString()}
                          </div>
                          <div className="text-sm text-blue-700 font-medium">Total Listeners</div>
                          <div className="text-xs text-blue-600">per launch</div>
                        </div>
                      )}
                      
                      {podcast.license_listeners_per_episode && (
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {podcast.license_listeners_per_episode >= 1000 
                              ? `${Math.round(podcast.license_listeners_per_episode / 1000)}K+` 
                              : podcast.license_listeners_per_episode.toLocaleString()}
                          </div>
                          <div className="text-sm text-green-700 font-medium">Per Episode</div>
                          <div className="text-xs text-green-600">average</div>
                        </div>
                      )}
                    </div>

                    {/* Age Groups */}
                    {podcast.license_demographics?.age && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Age Groups</h4>
                        <div className="space-y-2">
                          {podcast.license_demographics.age.age_18_27 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">18-27 years</span>
                              <span className="font-semibold text-gray-900">{podcast.license_demographics.age.age_18_27}%</span>
                            </div>
                          )}
                          {podcast.license_demographics.age.age_27_34 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">27-34 years</span>
                              <span className="font-semibold text-gray-900">{podcast.license_demographics.age.age_27_34}%</span>
                            </div>
                          )}
                          {podcast.license_demographics.age.age_35_45 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">35-45 years</span>
                              <span className="font-semibold text-gray-900">{podcast.license_demographics.age.age_35_45}%</span>
                            </div>
                          )}
                          {podcast.license_demographics.age.age_45_plus && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">45+ years</span>
                              <span className="font-semibold text-gray-900">{podcast.license_demographics.age.age_45_plus}%</span>
                            </div>
                          )}
                          
                          {/* Show primary age group summary */}
                          {(podcast.license_demographics.age.age_27_34 && podcast.license_demographics.age.age_35_45) && (
                            <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                              <span className="text-sm font-medium text-purple-800">
                                25-45 ({(podcast.license_demographics.age.age_27_34 + podcast.license_demographics.age.age_35_45)}%)
                              </span>
                              <span className="text-sm text-purple-600 ml-2">primary audience</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Gender Demographics */}
                {podcast.license_demographics?.gender && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <span className="text-xl mr-2">👥</span>
                      Gender Distribution
                    </h3>
                    
                    <div className="space-y-3">
                      {podcast.license_demographics.gender.male && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Male</span>
                          <div className="flex items-center">
                            <div className="w-20 h-2 bg-gray-200 rounded-full mr-3">
                              <div 
                                className="h-2 bg-blue-500 rounded-full" 
                                style={{ width: `${podcast.license_demographics.gender.male}%` }}
                              ></div>
                            </div>
                            <span className="font-semibold text-gray-900 w-8 text-right">
                              {podcast.license_demographics.gender.male}%
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {podcast.license_demographics.gender.female && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Female</span>
                          <div className="flex items-center">
                            <div className="w-20 h-2 bg-gray-200 rounded-full mr-3">
                              <div 
                                className="h-2 bg-pink-500 rounded-full" 
                                style={{ width: `${podcast.license_demographics.gender.female}%` }}
                              ></div>
                            </div>
                            <span className="font-semibold text-gray-900 w-8 text-right">
                              {podcast.license_demographics.gender.female}%
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {podcast.license_demographics.gender.diverse && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Diverse</span>
                          <div className="flex items-center">
                            <div className="w-20 h-2 bg-gray-200 rounded-full mr-3">
                              <div 
                                className="h-2 bg-purple-500 rounded-full" 
                                style={{ width: `${podcast.license_demographics.gender.diverse}%` }}
                              ></div>
                            </div>
                            <span className="font-semibold text-gray-900 w-8 text-right">
                              {podcast.license_demographics.gender.diverse}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Production Format Badge */}
            {podcast.license_format && (
              <div className="text-center">
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold shadow-lg">
                  <span className="text-xl mr-2">📻</span>
                  <span>
                    {podcast.license_format === 'always_on' ? 'Always On Production' : 'Seasonal Series'}
                  </span>
                  <span className="ml-2 text-orange-100">
                    {podcast.license_format === 'always_on' ? '• Continuous Episodes' : '• Planned Seasons'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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