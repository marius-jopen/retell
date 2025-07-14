import { requireRole } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Podcast {
  id: string
  title: string
  description: string
  cover_image_url: string | null
  category: string
  language: string
  country: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  rss_url: string | null
  created_at: string
  updated_at: string
  episodes: Array<{
    id: string
    title: string
    episode_number: number
    status: 'draft' | 'pending' | 'approved' | 'rejected'
    created_at: string
  }>
}

async function getAuthorPodcasts(authorId: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data: podcasts, error } = await supabase
    .from('podcasts')
    .select(`
      *,
      episodes (
        id,
        title,
        episode_number,
        status,
        created_at
      )
    `)
    .eq('author_id', authorId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching podcasts:', error)
    return []
  }
  
  return podcasts as Podcast[]
}

async function updatePodcastStatus(podcastId: string, status: 'pending') {
  'use server'
  
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('podcasts')
    .update({ status })
    .eq('id', podcastId)
  
  if (error) {
    console.error('Error updating podcast status:', error)
    throw error
  }
}

async function deletePodcast(podcastId: string) {
  'use server'
  
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('podcasts')
    .delete()
    .eq('id', podcastId)
  
  if (error) {
    console.error('Error deleting podcast:', error)
    throw error
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusColor(status: string) {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'draft': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default async function AuthorPodcastsPage() {
  const user = await requireRole(['author'])
  const podcasts = await getAuthorPodcasts(user.id)
  
  const stats = {
    total: podcasts.length,
    draft: podcasts.filter(p => p.status === 'draft').length,
    pending: podcasts.filter(p => p.status === 'pending').length,
    approved: podcasts.filter(p => p.status === 'approved').length,
    totalEpisodes: podcasts.reduce((sum, p) => sum + p.episodes.length, 0)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Podcasts</h1>
            <p className="mt-2 text-lg text-gray-600">
              Manage your podcast content and episodes
            </p>
          </div>
          <div className="flex space-x-2">
            <Link href="/author/upload">
              <Button>Create New Podcast</Button>
            </Link>
            <Link href="/author">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Total Podcasts</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Draft</h3>
          <p className="text-3xl font-bold text-gray-600">{stats.draft}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Approved</h3>
          <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Total Episodes</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.totalEpisodes}</p>
        </div>
      </div>

      {/* Podcast List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Podcasts</h2>
        </div>
        
        {podcasts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 616 0v6a3 3 0 01-3 3z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No podcasts yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first podcast.
            </p>
            <div className="mt-6">
              <Link href="/author/upload">
                <Button>Create Your First Podcast</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {podcasts.map((podcast) => (
              <div key={podcast.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {podcast.cover_image_url ? (
                        <img 
                          src={podcast.cover_image_url} 
                          alt={podcast.title}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {podcast.title.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">{podcast.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(podcast.status)}`}>
                          {podcast.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{podcast.description}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span className="capitalize">{podcast.category}</span>
                        <span>•</span>
                        <span>{podcast.language.toUpperCase()}</span>
                        <span>•</span>
                        <span>{podcast.country}</span>
                        <span>•</span>
                        <span>{podcast.episodes.length} episodes</span>
                        <span>•</span>
                        <span>Created {formatDate(podcast.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/podcast/${podcast.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link href={`/author/podcasts/${podcast.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/author/podcasts/${podcast.id}/episodes`}>
                      <Button variant="outline" size="sm">
                        Episodes
                      </Button>
                    </Link>
                    {podcast.status === 'draft' && (
                      <form action={async () => {
                        'use server'
                        await updatePodcastStatus(podcast.id, 'pending')
                      }}>
                        <Button type="submit" size="sm">
                          Submit for Review
                        </Button>
                      </form>
                    )}
                    {podcast.status === 'draft' && (
                      <form action={async () => {
                        'use server'
                        await deletePodcast(podcast.id)
                      }}>
                        <Button type="submit" variant="destructive" size="sm">
                          Delete
                        </Button>
                      </form>
                    )}
                  </div>
                </div>

                {/* Episodes Preview */}
                {podcast.episodes.length > 0 && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Episodes</h4>
                    <div className="space-y-2">
                      {podcast.episodes.slice(0, 3).map((episode) => (
                        <div key={episode.id} className="flex items-center justify-between py-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-500">
                              #{episode.episode_number}
                            </span>
                            <span className="text-sm text-gray-900">{episode.title}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(episode.status)}`}>
                              {episode.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatDate(episode.created_at)}
                            </span>
                            <Button variant="outline" size="sm" className="text-xs">
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))}
                      {podcast.episodes.length > 3 && (
                        <div className="text-center py-2">
                          <Link href={`/author/podcasts/${podcast.id}/episodes`}>
                            <Button variant="outline" size="sm">
                              View All {podcast.episodes.length} Episodes
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 