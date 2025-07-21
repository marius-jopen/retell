import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PodcastDescription } from './podcast-description'

interface Episode {
  id: string
  duration?: number
}

interface Author {
  full_name: string
  avatar_url: string | null
  company: string | null
}

interface Podcast {
  id: string
  title: string
  description: string
  category: string
  language: string
  country: string
  cover_image_url: string | null
  rss_url?: string | null
  episodes?: Episode[]
  user_profiles?: Author
}

interface User {
  profile: {
    role: string
  }
}

interface PodcastHeroProps {
  podcast: Podcast
  user?: User | null
}

export function PodcastHero({ podcast, user }: PodcastHeroProps) {
  const episodes = podcast.episodes || []
  const totalDuration = episodes.reduce((total: number, ep: Episode) => total + (ep.duration || 0), 0)

  return (
    <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Cover Image */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative">
              {podcast.cover_image_url ? (
                <img
                  src={podcast.cover_image_url}
                  alt={podcast.title}
                  className="w-64 h-64 object-cover rounded-2xl shadow-2xl"
                />
              ) : (
                <div className="w-64 h-64 bg-gradient-to-br from-red-300 via-red-400 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-white text-5xl font-bold">
                    {podcast.title.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-3 -right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-xs font-semibold text-gray-800">
                  {episodes.length} Episodes
                </span>
              </div>
            </div>
          </div>

          {/* Podcast Info */}
          <div className="text-center lg:text-left">
            <div className="mb-3">
              <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                {podcast.category}
              </span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
              {podcast.title}
            </h1>
            
            <PodcastDescription 
              description={podcast.description}
              className="mb-6"
            />

            {/* Author Info */}
            <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {podcast.user_profiles?.full_name?.substring(0, 2).toUpperCase() || 'AU'}
                </span>
              </div>
              <div className="text-left">
                <div className="text-base font-semibold text-white">
                  {podcast.user_profiles?.full_name || 'Unknown Author'}
                </div>
                {podcast.user_profiles?.company && (
                  <div className="text-sm text-blue-200">
                    {podcast.user_profiles.company}
                  </div>
                )}
              </div>
            </div>

            {/* Podcast Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div className="text-center">
                <div className="text-xl font-bold text-white">{episodes.length}</div>
                <div className="text-xs text-red-200">Episodes</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{Math.floor(totalDuration / 60)}h</div>
                <div className="text-xs text-red-200">Total Duration</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{podcast.language.toUpperCase()}</div>
                <div className="text-xs text-red-200">Language</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{podcast.country}</div>
                <div className="text-xs text-red-200">Country</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              {user?.profile.role === 'client' && (
                <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 font-semibold px-6 py-3">
                  Request License
                </Button>
              )}
              {!user && (
                <Link href="/auth/signup?role=client">
                  <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 font-semibold px-6 py-3">
                    Sign Up to License
                  </Button>
                </Link>
              )}
              {podcast.rss_url && (
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-red-600 font-semibold px-6 py-3">
                  <a href={podcast.rss_url} target="_blank" rel="noopener noreferrer">
                    RSS Feed
                  </a>
                </Button>
              )}
              <Link href="/catalog">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-red-600 font-semibold px-6 py-3">
                  Browse More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 