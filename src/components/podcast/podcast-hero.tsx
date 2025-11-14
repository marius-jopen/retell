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
  const displayCountryCode = selectedCountry || podcast.country || 'DE'
  const displayLanguageCode = selectedLanguage || podcast.language || 'en'

  const scrollToLicensing = () => {
    const target = document.getElementById('licensing-section')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="bg-brand text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
          {/* Cover Image and Authors */}
          <div className="flex flex-col items-center lg:items-start space-y-4 sm:space-y-6">
            {/* Cover Image */}
            <div className="relative">
              {(currentTranslation?.cover_image_url || podcast.cover_image_url) ? (
                <img
                  src={(currentTranslation?.cover_image_url || podcast.cover_image_url) as string}
                  alt={currentTranslation?.title || podcast.title}
                  className="w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[384px] sm:aspect-square object-cover rounded-xl shadow-lg mx-auto lg:mx-0"
                />
              ) : (
                <div className="w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[384px] sm:aspect-square bg-brand rounded-xl flex items-center justify-center shadow-lg mx-auto lg:mx-0 min-h-[200px] sm:min-h-0">
                  <span className="text-white text-3xl sm:text-4xl font-bold">
                    {(currentTranslation?.title || podcast.title).substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-2 sm:-bottom-3 -right-2 sm:-right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1">
                <span className="text-xs font-semibold text-gray-800">
                  {episodes.length} Episodes
                </span>
              </div>
            </div>

            {/* Hosts Section */}
            <div className="flex flex-wrap gap-4 sm:gap-6 justify-center lg:justify-start w-full">
              {podcast.hosts && podcast.hosts.length > 0 ? (
                podcast.hosts
                  .map((host: any, index: number) => {
                    const hostImage =
                      host.image_url ||
                      host.imageUrl ||
                      host.image ||
                      host.imagePreviewUrl ||
                      host.imageFile?.preview ||
                      null

                    return {
                      key: host.id || index,
                      hasImage: Boolean(hostImage),
                      image: hostImage,
                      name: host.name || 'Unknown Host',
                    }
                  })
                  .sort((a: { hasImage: boolean }, b: { hasImage: boolean }) => Number(b.hasImage) - Number(a.hasImage))
                  .map(
                    ({
                      key,
                      hasImage,
                      image,
                      name,
                    }: {
                      key: string | number
                      hasImage: boolean
                      image: string | null
                      name: string
                    }) => (
                    <div key={key} className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                        {hasImage && image ? (
                          <img
                            src={image}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/20 flex items-center justify-center">
                            <span className="text-white font-semibold text-xs sm:text-sm">
                              {name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-xs sm:text-sm text-white/80 font-medium">Host</div>
                        <div className="text-sm sm:text-base font-semibold text-white">
                          {name}
                        </div>
                      </div>
                    </div>
                    )
                  )
              ) : (
                // Fallback to author if no hosts
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0">
                    {podcast.user_profiles?.avatar_url ? (
                      <img
                        src={podcast.user_profiles.avatar_url}
                        alt={podcast.user_profiles.full_name || 'Author'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/20 flex items-center justify-center">
                        <span className="text-white font-semibold text-xs sm:text-sm">
                          {podcast.user_profiles?.full_name?.substring(0, 2).toUpperCase() || 'AU'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-xs sm:text-sm text-white/80 font-medium">Author</div>
                    <div className="text-sm sm:text-base font-semibold text-white">
                      {podcast.user_profiles?.full_name || 'Unknown Author'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Podcast Info */}
          <div className="text-center lg:text-left">
            <div className="mb-3 flex flex-wrap gap-2 justify-center lg:justify-start">
              <span className="bg-white/20 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium tracking-wide">
                Category: {podcast.category}
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium tracking-wide">
                Country: {countryNameByCode(displayCountryCode)}
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium tracking-wide">
                Language: {getLanguageName(displayLanguageCode)}
              </span>
            </div>
            
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 leading-tight px-2 lg:px-0">
              {podcast.title_english || currentTranslation?.title || podcast.title}
            </h1>
            
            <p className="text-sm text-orange-100 mb-4 sm:mb-6 leading-relaxed px-2 lg:px-0">
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
            {/* {user?.user_metadata?.role === 'client' && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-6 py-3 rounded-full">
                  Request License
                </Button>
              </div>
            )} */}
          </div>
        </div>

        <div className="mt-6 sm:mt-8 lg:mt-10 flex justify-center px-4">
          <Button
            size="lg"
            onClick={scrollToLicensing}
            className="bg-white text-black hover:bg-gray-100 font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-full shadow-lg shadow-orange-900/30 transition-transform hover:-translate-y-0.5 w-full sm:w-auto text-sm sm:text-base"
          >
            🚀 Start Licensing
          </Button>
        </div>
      </div>
    </div>
  )
}