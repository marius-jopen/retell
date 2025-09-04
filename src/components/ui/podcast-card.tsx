import Link from 'next/link'
import { Card } from './card'
import { countryNameByCode } from '@/lib/countries'

interface Episode {
  id: string
  title: string
  duration?: number
  episode_number?: number
}

interface Podcast {
  id: string
  title: string
  description: string
  title_english?: string | null
  description_english?: string | null
  category: string
  language: string
  country: string
  cover_image_url: string | null
  episodes?: Episode[]
  license_countries?: string[]
  license_excluded_countries?: string[]
  translations?: Array<{ language_code: string; title: string; description: string }>
}

interface PodcastCardProps {
  podcast: Podcast
}

export function PodcastCard({ podcast }: PodcastCardProps) {
  // Get all countries for this podcast
  const getAllCountries = () => {
    const countrySet = new Set<string>()
    
    // Add default country
    if (podcast.country) {
      countrySet.add(podcast.country)
    }
    
    // Add license countries
    if (podcast.license_countries) {
      podcast.license_countries.forEach(code => {
        if (code && code.trim()) {
          countrySet.add(code)
        }
      })
    }
    
    // Add translation countries
    if (podcast.translations) {
      podcast.translations.forEach(t => {
        if (t.language_code && t.language_code.trim()) {
          countrySet.add(t.language_code)
        }
      })
    }
    
    return Array.from(countrySet)
      .filter(code => code && countryNameByCode(code) !== 'Unknown')
      .sort((a, b) => countryNameByCode(a).localeCompare(countryNameByCode(b)))
  }

  const countries = getAllCountries()

  return (
    <Link href={`/podcast/${podcast.id}`} className="group h-full">
      <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-200 overflow-hidden border-gray-100 group-hover:border-red-200 group-hover:shadow-red-100/50">
        <div className="relative flex-shrink-0">
          {podcast.cover_image_url ? (
            <img
              src={podcast.cover_image_url}
              alt={podcast.title}
              className="w-full h-50 object-cover transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-40 bg-brand flex items-center justify-center group-hover:brightness-110 transition-all duration-300">
              <span className="text-white text-2xl font-bold">
                {podcast.title.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-white">
              {podcast.episodes?.length || 0}
            </span>
          </div>
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          {/* Category, Language and Country Info - All in one line */}
          <div className="flex items-center justify-between gap-4 mb-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span>📂</span>
                <span className="capitalize">{podcast.category}</span>
              </div>
        
            </div>
            <div className="flex items-center gap-1">
            <div className="flex items-center gap-1">
                <span>🗣️</span>
                <span>{podcast.language === 'en' ? 'English' :
                      podcast.language === 'de' ? 'German' :
                      podcast.language === 'fr' ? 'French' :
                      podcast.language === 'es' ? 'Spanish' :
                      podcast.language === 'it' ? 'Italian' :
                      podcast.language === 'nl' ? 'Dutch' :
                      podcast.language === 'pt' ? 'Portuguese' :
                      podcast.language === 'pl' ? 'Polish' :
                      podcast.language || 'English'}</span>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
            {podcast.title_english || podcast.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed flex-grow">
            {podcast.description_english || podcast.description}
          </p>
          
          {/* Excluded Countries Information */}
          {podcast.license_excluded_countries && podcast.license_excluded_countries.length > 0 && (
            <div className="mt-auto pt-3 border-t border-gray-100">
              <div className="text-xs text-red-600 mb-2 font-medium">
                {podcast.license_excluded_countries.length === 1 
                  ? `Not available in ${countryNameByCode(podcast.license_excluded_countries[0])}`
                  : `Not available in ${podcast.license_excluded_countries.length} countries`
                }
              </div>
              <div className="flex flex-wrap gap-1.5">
                {podcast.license_excluded_countries.slice(0, 3).map((countryCode) => (
                  <span
                    key={countryCode}
                    className="px-2.5 py-1 text-xs bg-red-50 text-red-700 rounded-full border border-red-200"
                  >
                    {countryNameByCode(countryCode)}
                  </span>
                ))}
                {podcast.license_excluded_countries.length > 3 && (
                  <span className="px-2.5 py-1 text-xs bg-red-50 text-red-600 rounded-full border border-red-200">
                    +{podcast.license_excluded_countries.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
} 