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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Podcast Catalog
        </h1>
        <p className="text-lg text-gray-600">
          Discover premium podcast content from creators worldwide
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search podcasts..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              <option value="comedy">Comedy</option>
              <option value="business">Business</option>
              <option value="technology">Technology</option>
              <option value="education">Education</option>
              <option value="news">News</option>
            </select>
          </div>
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              id="language"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Languages</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
            </select>
          </div>
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              id="sort"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="title">Title A-Z</option>
              <option value="episodes">Episode Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* Podcast Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {podcasts && podcasts.length > 0 ? (
          podcasts.map((podcast) => (
            <div key={podcast.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-t-lg">
                {podcast.cover_image_url ? (
                  <img
                    src={podcast.cover_image_url}
                    alt={podcast.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {podcast.title.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {podcast.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {podcast.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="capitalize">{podcast.category}</span>
                  <span>{podcast.language.toUpperCase()}</span>
                  <span>{podcast.episodes?.length || 0} episodes</span>
                </div>
                <Link href={`/podcast/${podcast.id}`}>
                  <Button className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No podcasts found</h3>
              <p className="text-gray-500">
                Be the first to discover amazing podcast content when it becomes available.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {podcasts && podcasts.length > 0 && (
        <div className="mt-8 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-900 hover:bg-gray-50">
              Previous
            </button>
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-900 hover:bg-gray-50">
              1
            </button>
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
              2
            </button>
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-900 hover:bg-gray-50">
              3
            </button>
            <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-900 hover:bg-gray-50">
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  )
} 