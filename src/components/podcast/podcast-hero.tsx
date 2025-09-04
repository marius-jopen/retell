'use client'

import { Button } from '@/components/ui/button'
import { COUNTRIES, countryNameByCode } from '@/lib/countries'
import { LANGUAGES } from '@/lib/languages'

// Helper function to get language name
const getLanguageName = (languageCode: string): string => {
  const language = LANGUAGES.find(lang => lang.code === languageCode)
  return language ? language.name : languageCode.toUpperCase()
}

interface PodcastHeroProps {
  podcast: any
  currentTranslation: any
  selectedCountry: string
  selectedLanguage: string
  availableLanguages: string[]
  episodes: any[]
  user: any
  onLanguageChange: (language: string) => void
}

export function PodcastHero({
  podcast,
  currentTranslation,
  selectedCountry,
  selectedLanguage,
  availableLanguages,
  episodes,
  user,
  onLanguageChange
}: PodcastHeroProps) {
  return (
    <div className="bg-brand text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Cover Image and Authors */}
          <div className="flex flex-col items-center lg:items-start space-y-6">
            {/* Cover Image */}
            <div className="relative">
              {(currentTranslation?.cover_image_url || podcast.cover_image_url) ? (
                <img
                  src={(currentTranslation?.cover_image_url || podcast.cover_image_url) as string}
                  alt={currentTranslation?.title || podcast.title}
                  className="w-80 h-80 lg:w-96 lg:h-96 object-cover rounded-xl shadow-lg"
                />
              ) : (
                <div className="w-80 h-80 lg:w-96 lg:h-96 bg-brand rounded-xl flex items-center justify-center shadow-lg">
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
            
            <h1 className="text-xl lg:text-2xl font-bold mb-3 leading-tight">
              {podcast.title_english || currentTranslation?.title || podcast.title}
            </h1>
            
            <p className="text-sm text-orange-100 mb-6 leading-relaxed">
              {podcast.description_english || currentTranslation?.description || podcast.description}
            </p>

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
                      onClick={() => onLanguageChange(languageCode)}
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

            {/* Excluded Countries Warning - Prominent */}
            {podcast.license_excluded_countries && podcast.license_excluded_countries.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white/90 mb-3 uppercase tracking-wide">
                  {podcast.license_excluded_countries.length === 1 
                    ? 'Not Available in This Country'
                    : 'Not Available in These Countries'
                  }
                </h3>
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  {podcast.license_excluded_countries.map((countryCode: string) => (
                    <div
                      key={countryCode}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-red-600 border border-white/30 shadow-lg"
                    >
                      {countryNameByCode(countryCode)}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/70 mt-2 text-center lg:text-left">
                  This content is restricted in the selected regions
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
  )
}