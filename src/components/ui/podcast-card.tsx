import Link from 'next/link'
import { Card } from './card'

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
}

interface PodcastCardProps {
  podcast: Podcast
}

export function PodcastCard({ podcast }: PodcastCardProps) {
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
            <div className="w-full h-40 bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex items-center justify-center group-hover:from-red-500 group-hover:via-red-600 group-hover:to-red-700 transition-all duration-300">
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
          
          <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {podcast.country}
            </span>
            <span className="text-red-500 font-medium text-xs">
              Explore →
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
} 