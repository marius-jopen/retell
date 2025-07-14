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
  params: Promise<{ id: string }>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.194-5.5-3M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Podcast Not Found</h1>
          <p className="text-gray-600 mb-6">The podcast you're looking for doesn't exist or might have been removed.</p>
          <Link href="/catalog">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Browse All Podcasts
            </Button>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-6">This podcast is not yet available for public viewing. Please check back later.</p>
          <Link href="/catalog">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Back to Catalog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const episodes = podcast.episodes || []
  const totalDuration = episodes.reduce((total: number, ep: Episode) => total + (ep.duration || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-400 via-red-500 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Cover Image */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                {podcast.cover_image_url ? (
                  <img
                    src={podcast.cover_image_url}
                    alt={podcast.title}
                    className="w-80 h-80 object-cover rounded-3xl shadow-2xl"
                  />
                ) : (
                  <div className="w-80 h-80 bg-gradient-to-br from-red-300 via-red-400 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl">
                    <span className="text-white text-6xl font-bold">
                      {podcast.title.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-4 -right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-sm font-semibold text-gray-800">
                    {episodes.length} Episodes
                  </span>
                </div>
              </div>
            </div>

            {/* Podcast Info */}
            <div className="text-center lg:text-left">
              <div className="mb-4">
                <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wide">
                  {podcast.category}
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {podcast.title}
              </h1>
              
              <p className="text-xl text-red-100 mb-8 leading-relaxed">
                {podcast.description}
              </p>

              {/* Author Info */}
              <div className="flex items-center justify-center lg:justify-start space-x-4 mb-8">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {podcast.user_profiles?.full_name?.substring(0, 2).toUpperCase() || 'AU'}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-lg font-semibold text-white">
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{episodes.length}</div>
                  <div className="text-sm text-red-200">Episodes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{Math.floor(totalDuration / 60)}h</div>
                  <div className="text-sm text-red-200">Total Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{podcast.language.toUpperCase()}</div>
                  <div className="text-sm text-red-200">Language</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{podcast.country}</div>
                  <div className="text-sm text-red-200">Country</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {user?.profile.role === 'client' && (
                  <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 font-semibold px-8 py-4">
                    Request License
                  </Button>
                )}
                {!user && (
                  <Link href="/auth/signup?role=client">
                    <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 font-semibold px-8 py-4">
                      Sign Up to License
                    </Button>
                  </Link>
                )}
                {podcast.rss_url && (
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-red-600 font-semibold px-8 py-4">
                    <a href={podcast.rss_url} target="_blank" rel="noopener noreferrer">
                      RSS Feed
                    </a>
                  </Button>
                )}
                <Link href="/catalog">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-red-600 font-semibold px-8 py-4">
                    Browse More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Episodes</h2>
          <p className="text-lg text-gray-600">
            {episodes.length > 0 
              ? `Discover ${episodes.length} episodes of high-quality content`
              : 'No episodes are currently available for this podcast'
            }
          </p>
        </div>

        {episodes.length > 0 ? (
          <div className="space-y-6">
            {episodes.map((episode: Episode, index: number) => (
              <div key={episode.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {episode.episode_number}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            Episode {episode.episode_number}
                          </span>
                          {episode.season_number && episode.season_number > 1 && (
                            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              Season {episode.season_number}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {formatDate(episode.created_at)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {episode.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {episode.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {episode.duration && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {Math.floor(episode.duration / 60)}:{String(episode.duration % 60).padStart(2, '0')}
                        </span>
                      )}
                      {user?.profile.role === 'client' && (
                        <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                          Preview Script
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Enhanced Audio Player */}
                  <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Audio Preview</span>
                          <span className="text-xs text-gray-500">
                            {episode.duration ? `${Math.floor(episode.duration / 60)}:${String(episode.duration % 60).padStart(2, '0')}` : 'Duration unknown'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0:00</span>
                          <span>Full episode available with license</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mb-8">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Episodes Available</h3>
            <p className="text-gray-600 mb-6">This podcast doesn't have any episodes available yet. Check back soon for new content!</p>
            <Link href="/catalog">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Explore Other Podcasts
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* About Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">About This Podcast</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Content Details</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      {podcast.episodes?.length || 0} episodes available
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      {podcast.language} language
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {podcast.category} category
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      From {podcast.country}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Quality & Format</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  High-quality audio files
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Complete episode scripts
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Professional production
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Curated content
                </li>
              </ul>
              
              <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-2">Interested in licensing?</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Get access to high-quality podcast content for your platform or project.
                </p>
                <div className="flex space-x-3">
                  <Link href="/auth/signup?role=client">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/catalog">
                    <Button variant="outline" size="sm">
                      Browse More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 