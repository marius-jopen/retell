import { createServerSupabaseClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Database } from '@/types/database'
import TruncatedText from '@/components/ui/truncated-text'
import AudioPlayer from '@/components/ui/audio-player'

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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <svg className="mx-auto h-16 w-16 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.194-5.5-3M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h1 className="text-2xl font-light text-stone-800 mb-3">Podcast Not Found</h1>
          <p className="text-stone-600 mb-8 font-light">The podcast you're looking for doesn't exist or might have been removed.</p>
          <Link href="/catalog">
            <Button className="bg-red-500 hover:bg-red-600 text-white">
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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <svg className="mx-auto h-16 w-16 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-light text-stone-800 mb-3">Access Restricted</h1>
          <p className="text-stone-600 mb-8 font-light">This podcast is not yet available for public viewing. Please check back later.</p>
          <Link href="/catalog">
            <Button className="bg-red-500 hover:bg-red-600 text-white">
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
    <div className="min-h-screen bg-orange-50">
      {/* Hero Section - Smaller */}
      <div className="bg-gradient-warm text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Cover Image - Smaller */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                {podcast.cover_image_url ? (
                  <img
                    src={podcast.cover_image_url}
                    alt={podcast.title}
                    className="w-64 h-64 object-cover rounded-modern-xl shadow-modern-lg"
                  />
                ) : (
                  <div className="w-64 h-64 bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 rounded-modern-xl flex items-center justify-center shadow-modern-lg">
                    <span className="text-white text-4xl font-bold">
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
              
              <h1 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight">
                {podcast.title}
              </h1>
              
              <p className="text-sm text-orange-100 mb-6 leading-relaxed">
                {podcast.description}
              </p>

              {/* Author Info */}
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {podcast.user_profiles?.full_name?.substring(0, 2).toUpperCase() || 'AU'}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-base font-semibold text-white">
                    {podcast.user_profiles?.full_name || 'Unknown Author'}
                  </div>
                  {podcast.user_profiles?.company && (
                    <div className="text-xs text-orange-200">
                      {podcast.user_profiles.company}
                    </div>
                  )}
                </div>
              </div>

              {/* Podcast Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{episodes.length}</div>
                  <div className="text-xs text-orange-200">Episodes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{Math.floor(totalDuration / 60)}h</div>
                  <div className="text-xs text-orange-200">Total Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{podcast.language.toUpperCase()}</div>
                  <div className="text-xs text-orange-200">Language</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{podcast.country}</div>
                  <div className="text-xs text-orange-200">Country</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                {user?.profile.role === 'client' && (
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
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-6 py-3 rounded-full">
                  Share Podcast
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column - About This Podcast */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h3 className="text-2xl font-light text-stone-800 mb-8">About This Podcast</h3>
              
              <div className="space-y-8">
                {/* Content Details */}
                <div>
                  <h4 className="font-medium text-stone-800 mb-4 text-sm uppercase tracking-wider">Content Details</h4>
                  <ul className="space-y-3 text-stone-600">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-4"></div>
                      {podcast.episodes?.length || 0} episodes available
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-4"></div>
                      {podcast.language} language
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-4"></div>
                      {podcast.category} category
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-4"></div>
                      From {podcast.country}
                    </li>
                  </ul>
                </div>

                {/* Quality & Format */}
                <div>
                  <h4 className="font-medium text-stone-800 mb-4 text-sm uppercase tracking-wider">Quality & Format</h4>
                  <ul className="space-y-3 text-stone-600">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-4"></div>
                      High-quality audio files
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-4"></div>
                      Complete episode scripts
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-4"></div>
                      Professional production
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-4"></div>
                      Curated content
                    </li>
                  </ul>
                </div>
                
                {/* Licensing CTA */}
                <div className="mt-8 p-6 bg-white/70 backdrop-blur-sm rounded-lg border border-stone-200/50">
                  <h4 className="font-medium text-stone-800 mb-2">Interested in licensing?</h4>
                  <p className="text-sm text-stone-600 mb-5 leading-relaxed">
                    Get access to high-quality podcast content for your platform or project.
                  </p>
                  <div className="flex flex-col space-y-2">
                    <Link href="/auth/signup?role=client">
                      <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white w-full">
                        Get Started
                      </Button>
                    </Link>
                    <Link href="/catalog">
                      <Button variant="outline" size="sm" className="border-stone-300 text-stone-600 hover:bg-stone-50 w-full">
                        Browse More
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Episodes */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-light text-stone-800 mb-1">Episodes</h2>
              <p className="text-sm text-stone-500">
                {episodes.length > 0 
                  ? `${episodes.length} episodes`
                  : 'No episodes available'
                }
              </p>
            </div>

            {episodes.length > 0 ? (
              <div className="space-y-3">
                {episodes.map((episode: Episode, index: number) => (
                  <div key={episode.id} className="bg-white/70 rounded-lg border border-stone-200/30 hover:bg-white hover:border-stone-300/50 transition-all duration-200">
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-medium text-xs flex-shrink-0 mt-0.5">
                          {episode.episode_number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                              <span>Episode {episode.episode_number}</span>
                              {episode.season_number && episode.season_number > 1 && (
                                <>
                                  <span>•</span>
                                  <span>Season {episode.season_number}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>{formatDate(episode.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {episode.duration && (
                                <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-full">
                                  {Math.floor(episode.duration / 60)}:{String(episode.duration % 60).padStart(2, '0')}
                                </span>
                              )}
                              {user?.profile.role === 'client' && (
                                <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50 text-xs h-6 px-2">
                                  Script
                                </Button>
                              )}
                            </div>
                          </div>
                          <h3 className="text-base font-medium text-stone-800 mb-2 leading-snug">
                            {episode.title}
                          </h3>
                          <TruncatedText text={episode.description} className="text-sm text-stone-600 leading-relaxed" />
                        </div>
                      </div>
                      
                      {/* Audio Player */}
                      {episode.audio_url && (
                        <div className="mt-3">
                          <AudioPlayer 
                            src={episode.audio_url} 
                            title={episode.title}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mb-8">
              <svg className="mx-auto h-16 w-16 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-light text-stone-800 mb-3">No Episodes Available</h3>
            <p className="text-stone-600 mb-8 font-light">This podcast doesn't have any episodes available yet. Check back soon for new content!</p>
            <Link href="/catalog">
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                Explore Other Podcasts
              </Button>
            </Link>
          </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 