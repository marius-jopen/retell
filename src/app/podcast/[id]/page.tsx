import { createServerSupabaseClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Database } from '@/types/database'

type Episode = Database['public']['Tables']['episodes']['Row']
type Podcast = Database['public']['Tables']['podcasts']['Row'] & {
  episodes: Episode[]
  user_profiles: {
    full_name: string
    avatar_url: string | null
    company: string | null
  }
}

interface PodcastDetailPageProps {
  params: { id: string }
}

export default async function PodcastDetailPage({ params }: PodcastDetailPageProps) {
  const supabase = await createServerSupabaseClient()
  const user = await getCurrentUser()
  
  // Await params in Next.js 15
  const { id } = await params

  // Get podcast details with episodes
  const { data: podcast } = await supabase
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
        status,
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

  if (!podcast) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Podcast Not Found</h1>
          <p className="mt-2 text-gray-600">The podcast you're looking for doesn't exist.</p>
          <Link href="/catalog">
            <Button className="mt-4">Back to Catalog</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Check if user can access this podcast
  const canAccess = podcast.status === 'approved' || 
                   (user && (user.profile.role === 'admin' || user.profile.id === podcast.author_id))

  if (!canAccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">This podcast is not available for public viewing.</p>
          <Link href="/catalog">
            <Button className="mt-4">Back to Catalog</Button>
          </Link>
        </div>
      </div>
    )
  }

  const approvedEpisodes = podcast.episodes?.filter((ep: Episode) => ep.status === 'approved') || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Podcast Header */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <div className="h-48 w-full md:w-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {podcast.cover_image_url ? (
                <img
                  src={podcast.cover_image_url}
                  alt={podcast.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-white text-3xl font-bold">
                  {podcast.title.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
              {podcast.category}
            </div>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">{podcast.title}</h1>
            <p className="mt-2 text-gray-600">{podcast.description}</p>
            
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900">
                  {podcast.user_profiles?.full_name}
                </span>
                {podcast.user_profiles?.company && (
                  <span className="ml-2 text-sm text-gray-500">
                    • {podcast.user_profiles.company}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {podcast.language.toUpperCase()}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {podcast.country}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {approvedEpisodes.length} Episodes
              </span>
            </div>

            <div className="mt-6 flex space-x-4">
              {user?.profile.role === 'client' && (
                <Button size="lg">
                  Request License
                </Button>
              )}
              {!user && (
                <Link href="/auth/signup?role=client">
                  <Button size="lg">
                    Sign Up to License
                  </Button>
                </Link>
              )}
              {podcast.rss_url && (
                <Button variant="outline" size="lg">
                  <a href={podcast.rss_url} target="_blank" rel="noopener noreferrer">
                    RSS Feed
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Episodes List */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Episodes</h2>
        {approvedEpisodes.length > 0 ? (
          <div className="space-y-4">
            {approvedEpisodes.map((episode: Episode) => (
              <div key={episode.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500">
                        Episode {episode.episode_number}
                        {episode.season_number && episode.season_number > 1 && (
                          <span> • Season {episode.season_number}</span>
                        )}
                      </span>
                      <span className="text-sm text-gray-400">
                        {formatDate(episode.created_at)}
                      </span>
                    </div>
                    <h3 className="mt-1 text-lg font-semibold text-gray-900">
                      {episode.title}
                    </h3>
                    <p className="mt-1 text-gray-600">{episode.description}</p>
                    {episode.duration && (
                      <p className="mt-2 text-sm text-gray-500">
                        Duration: {Math.floor(episode.duration / 60)} minutes
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex space-x-2">
                    {user?.profile.role === 'client' && (
                      <Button variant="outline" size="sm">
                        Preview Script
                      </Button>
                    )}
                    <Button size="sm">
                      Play
                    </Button>
                  </div>
                </div>
                
                {/* Audio Player Placeholder */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0:00</span>
                        <span>{episode.duration ? `${Math.floor(episode.duration / 60)}:${String(episode.duration % 60).padStart(2, '0')}` : '--:--'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No episodes available yet.</p>
          </div>
        )}
      </div>

      {/* Licensing Information */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Podcast</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900">Content Details</h4>
            <ul className="mt-2 text-sm text-gray-600 space-y-1">
              <li>• {podcast.episodes.length} episodes available</li>
              <li>• {podcast.language} language</li>
              <li>• {podcast.category} category</li>
              <li>• From {podcast.country}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Format & Quality</h4>
            <ul className="mt-2 text-sm text-gray-600 space-y-1">
              <li>• High-quality audio files</li>
              <li>• Complete episode scripts</li>
              <li>• Professional production</li>
              <li>• Curated content</li>
            </ul>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Interested in similar content? 
            <span className="ml-1">
              <Link href="/catalog">
                <Button variant="link" className="p-0 h-auto">
                  Browse more podcasts
                </Button>
              </Link>
            </span>
          </p>
        </div>
      </div>
    </div>
  )
} 