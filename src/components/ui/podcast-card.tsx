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
  category: string
  language: string
  country: string
  cover_image_url: string | null
  episodes?: Episode[]
  license_countries?: string[]
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
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
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
          <div className="flex items-center justify-between mb-2">
            <span className="bg-red-50 text-red-700 text-xs font-medium px-2 py-1 rounded-md capitalize">
              {podcast.category}
            </span>
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              {podcast.language}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
            {podcast.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed flex-grow">
            {podcast.description}
          </p>
          
          {/* Available Countries */}
          <div className="mt-auto">
            <div className="text-xs text-gray-500 mb-2">Available in:</div>
            <div className="flex flex-wrap gap-1 mb-1">
              {countries.slice(0, 3).map((countryCode) => (
                <span
                  key={countryCode}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  title={countryNameByCode(countryCode)}
                >
                  🌍 {countryNameByCode(countryCode)}
                </span>
              ))}
              {countries.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  +{countries.length - 3} more
                </span>
              )}
            </div>
            
            {/* <div className="flex items-center justify-end">
              <span className="text-red-500 font-medium text-xs">
                Explore →
              </span>
            </div> */}
          </div>
        </div>
      </Card>
    </Link>
  )
} 