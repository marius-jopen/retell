import { createServerSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function CatalogPage() {
  const supabase = await createServerSupabaseClient()

  // Get approved podcasts
  const { data: podcasts } = await supabase
    .from('podcasts')
    .select(`
      *,
      episodes (
        id,
        title,
        duration,
        episode_number
      )
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-400 via-red-500 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">
              Discover Amazing Podcasts
            </h1>
            <p className="text-xl text-red-100 max-w-3xl mx-auto">
              Explore premium podcast content from talented creators worldwide. Find your next favorite show.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Minimal Search */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search podcasts..."
                className="w-full px-6 py-4 text-lg bg-white rounded-full shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 pl-12"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {podcasts && podcasts.length > 0 && (
          <div className="mb-8">
            <div className="text-center">
              <p className="text-gray-600">
                {podcasts.length} podcast{podcasts.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
        )}

        {/* Podcast Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {podcasts && podcasts.length > 0 ? (
            podcasts.map((podcast) => (
              <Link key={podcast.id} href={`/podcast/${podcast.id}`} className="group">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 group-hover:border-red-200">
                  <div className="relative">
                    {podcast.cover_image_url ? (
                      <img
                        src={podcast.cover_image_url}
                        alt={podcast.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex items-center justify-center group-hover:from-red-500 group-hover:via-red-600 group-hover:to-red-700 transition-all duration-300">
                        <span className="text-white text-3xl font-bold">
                          {podcast.title.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-800">
                        {podcast.episodes?.length || 0} episodes
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full capitalize">
                        {podcast.category}
                      </span>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        {podcast.language}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                      {podcast.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {podcast.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {podcast.country}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        New content
                      </span>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-center">
                      <span className="text-red-600 font-medium group-hover:text-red-700 transition-colors">
                        Explore Podcast →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full">
              <div className="text-center py-16">
                <div className="mb-8">
                  <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">No podcasts found</h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto mb-8">
                  We're working hard to bring you amazing podcast content. Check back soon for new releases!
                </p>
                <div className="flex justify-center space-x-4">
                  <Link href="/auth/signup?role=author">
                    <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white">
                      Become a Creator
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 