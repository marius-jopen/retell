'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'
import PodcastWorkflowManager from '@/components/workflow/podcast-workflow-manager'
import { PodcastWorkflowState } from '@/lib/podcast-workflow'
import EpisodeActions from '@/components/author/episode-actions'
import { formatDate } from '@/lib/utils'

interface Episode {
  id: string
  title: string
  description: string
  episode_number: number
  season_number: number | null
  duration: number | null
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  audio_url: string | null
  script_url: string | null
}

interface Podcast {
  id: string
  title: string
  description: string
  category: string
  language: string
  country: string
  rss_url: string | null
  cover_image_url: string | null
  author_id: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
}

export default function EditPodcastPage({ params }: { params: Promise<{ id: string }> }) {
  const [podcastId, setPodcastId] = useState('')
  const [podcast, setPodcast] = useState<any>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [workflowState, setWorkflowState] = useState<PodcastWorkflowState | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    language: '',
    country: '',
    rss_url: '',
    auto_publish_episodes: false
  })
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'workflow'>('details')
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const { addToast } = useToast()

  const categories = [
    'Business',
    'Technology',
    'Entertainment',
    'Education',
    'News',
    'Health',
    'Sports',
    'Music',
    'Comedy',
    'True Crime',
    'Science',
    'History',
    'Politics',
    'Arts',
    'Other'
  ]

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'nl', name: 'Dutch' },
    { code: 'pl', name: 'Polish' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese (Mandarin)' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'other', name: 'Other' }
  ]

  const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Germany',
    'France',
    'Spain',
    'Italy',
    'Netherlands',
    'Japan',
    'South Korea',
    'Brazil',
    'Mexico',
    'Argentina',
    'India',
    'China',
    'Russia',
    'Other'
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        // Await params in Next.js 15
        const { id } = await params
        setPodcastId(id)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setFetchError('You must be logged in to edit a podcast')
          return
        }

        // Get podcast data
        const { data: podcastData, error: podcastError } = await supabase
          .from('podcasts')
          .select('*')
          .eq('id', id)
          .eq('author_id', user.id)
          .single()

        if (podcastError) {
          setFetchError('Error fetching podcast or you don\'t have permission to edit it')
          return
        }

        setPodcast(podcastData)
        setFormData({
          title: podcastData.title || '',
          description: podcastData.description || '',
          category: podcastData.category || '',
          language: podcastData.language || '',
          country: podcastData.country || '',
          rss_url: podcastData.rss_url || '',
          auto_publish_episodes: podcastData.auto_publish_episodes || false
        })

        // Fetch episodes
        const { data: episodesData, error: episodesError } = await supabase
          .from('episodes')
          .select('*')
          .eq('podcast_id', id)
          .order('episode_number', { ascending: false })

        if (episodesError) {
          console.error('Error fetching episodes:', episodesError)
        } else {
          setEpisodes(episodesData || [])
        }

        // Load workflow state
        const workflowResponse = await fetch(`/api/podcasts/${id}/workflow`)
        if (workflowResponse.ok) {
          const workflowData = await workflowResponse.json()
          setWorkflowState(workflowData.workflow)
        }
      } catch (error) {
        console.error('Error loading podcast:', error)
        setFetchError('Error loading podcast')
      }
    }

    fetchPodcast()
  }, [params, supabase])

  const uploadCoverImage = async (file: File, podcastId: string) => {
    try {
      const base64Url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = reader.result as string
          resolve(base64)
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })
      
      return base64Url
    } catch (error) {
      console.error('Error converting image to base64:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to update a podcast')
        return
      }

      // Validate form
      if (!formData.title.trim()) {
        setError('Title is required')
        return
      }
      if (!formData.description.trim()) {
        setError('Description is required')
        return
      }
      if (!formData.category) {
        setError('Category is required')
        return
      }
      if (!formData.language) {
        setError('Language is required')
        return
      }
      if (!formData.country) {
        setError('Country is required')
        return
      }

      // Upload cover image if provided
      let coverImageUrl = podcast?.cover_image_url
      if (coverImage) {
        const imageUrl = await uploadCoverImage(coverImage, podcastId)
        if (imageUrl) {
          coverImageUrl = imageUrl
        }
      }

      // Check if we should set manual overrides based on workflow state
      const updates: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        language: formData.language,
        country: formData.country,
        rss_url: formData.rss_url.trim() || null,
        cover_image_url: coverImageUrl,
        auto_publish_episodes: formData.auto_publish_episodes,
        updated_at: new Date().toISOString()
      }

      // Set manual overrides if in hybrid mode
      if (workflowState?.mode === 'hybrid') {
        const overrides = { ...workflowState.manual_overrides }
        
        // Check if values have changed from RSS values
        if (formData.title !== podcast?.title) {
          overrides.title = true
        }
        if (formData.description !== podcast?.description) {
          overrides.description = true
        }
        if (formData.category !== podcast?.category) {
          overrides.category = true
        }
        if (formData.language !== podcast?.language) {
          overrides.language = true
        }
        if (formData.country !== podcast?.country) {
          overrides.country = true
        }
        if (coverImage) {
          overrides.cover_image = true
        }
        
        updates.manual_overrides = overrides
      }

      // Update podcast
      const { error: updateError } = await supabase
        .from('podcasts')
        .update(updates)
        .eq('id', podcastId)
        .eq('author_id', user.id)

      if (updateError) {
        console.error('Error updating podcast:', updateError)
        setError('Failed to update podcast. Please try again.')
        return
      }

      // Show success message
      addToast({
        type: 'success',
        message: `Successfully updated podcast "${formData.title}"`
      })

      // Navigate back to podcast list
      router.push('/author/podcasts')
    } catch (error) {
      console.error('Error updating podcast:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleWorkflowChanged = (newWorkflowState: PodcastWorkflowState) => {
    setWorkflowState(newWorkflowState)
    // Reload podcast data if workflow changed
    if (newWorkflowState.mode !== workflowState?.mode) {
      window.location.reload()
    }
  }

  if (fetchError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-red-800 mb-2">Error</h1>
          <p className="text-red-700">{fetchError}</p>
          <Link href="/author/podcasts" className="mt-4 inline-block">
            <Button variant="outline">← Back to Podcasts</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!podcast) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="space-y-6">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              📝 Edit Podcast
            </h1>
            <p className="text-lg text-gray-600">
              Update your podcast details and manage episodes
            </p>
          </div>
          <Link href="/author/podcasts">
            <Button variant="outline" className="rounded-2xl">
              ← Back to Podcasts
            </Button>
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'details'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📝 Podcast Details
            </button>
            <button
              onClick={() => setActiveTab('workflow')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'workflow'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🔧 Workflow Settings
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Podcast Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200">
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    📝 Podcast Details
                  </h2>
                  <p className="text-gray-600">
                    Update your podcast information and settings
                  </p>
                  
                  {/* Workflow Status Indicator */}
                  {workflowState && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Current Mode: 
                          </span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            workflowState.mode === 'manual' 
                              ? 'bg-blue-100 text-blue-800'
                              : workflowState.mode === 'rss'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {workflowState.mode.toUpperCase()}
                          </span>
                        </div>
                        <Button
                          onClick={() => setActiveTab('workflow')}
                          variant="outline"
                          size="sm"
                        >
                          Configure Workflow
                        </Button>
                      </div>
                      {workflowState.mode === 'hybrid' && (
                        <p className="text-xs text-gray-500 mt-2">
                          Some fields may be automatically synced from RSS feed
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Podcast Title *
                      {workflowState?.manual_overrides?.title && (
                        <span className="ml-2 text-xs text-purple-600">(Manual Override)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter podcast title"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                      {workflowState?.manual_overrides?.description && (
                        <span className="ml-2 text-xs text-purple-600">(Manual Override)</span>
                      )}
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Describe your podcast"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                      {workflowState?.manual_overrides?.category && (
                        <span className="ml-2 text-xs text-purple-600">(Manual Override)</span>
                      )}
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Language */}
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                      Language *
                      {workflowState?.manual_overrides?.language && (
                        <span className="ml-2 text-xs text-purple-600">(Manual Override)</span>
                      )}
                    </label>
                    <select
                      id="language"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Select a language</option>
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Country */}
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                      {workflowState?.manual_overrides?.country && (
                        <span className="ml-2 text-xs text-purple-600">(Manual Override)</span>
                      )}
                    </label>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Select a country</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label htmlFor="cover_image" className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Image
                      {workflowState?.manual_overrides?.cover_image && (
                        <span className="ml-2 text-xs text-purple-600">(Manual Override)</span>
                      )}
                    </label>
                    <input
                      type="file"
                      id="cover_image"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            setError('Cover image must be less than 5MB')
                            return
                          }
                          setCoverImage(file)
                          setError('')
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    {podcast?.cover_image_url && (
                      <div className="mt-2">
                        <img
                          src={podcast.cover_image_url}
                          alt="Current cover"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  {/* RSS URL */}
                  <div>
                    <label htmlFor="rss_url" className="block text-sm font-medium text-gray-700 mb-2">
                      RSS Feed URL
                    </label>
                    <input
                      type="url"
                      id="rss_url"
                      value={formData.rss_url}
                      onChange={(e) => setFormData({ ...formData, rss_url: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="https://example.com/feed.xml"
                    />
                  </div>

                  {/* Auto-publish Episodes */}
                  <div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="auto_publish_episodes"
                        checked={formData.auto_publish_episodes}
                        onChange={(e) => setFormData({ ...formData, auto_publish_episodes: e.target.checked })}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label htmlFor="auto_publish_episodes" className="ml-2 text-sm text-gray-700">
                        Automatically publish new episodes from RSS feed
                      </label>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                      <div className="flex items-center">
                        <span className="text-red-600 mr-2">⚠️</span>
                        <p className="text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4">
                    <Link href="/author/podcasts">
                      <Button variant="outline" className="rounded-2xl">
                        Cancel
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
                    >
                      {loading ? '💾 Saving...' : '💾 Save Changes'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column - Episodes */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 h-fit">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    📻 Episodes ({episodes.length})
                  </h2>
                  <Link href={`/author/podcasts/${podcastId}/episodes/new`}>
                    <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl">
                      ✨ Add Episode
                    </Button>
                  </Link>
                </div>

                {/* Episodes List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {episodes.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🎧</div>
                      <p className="text-gray-500 mb-4">No episodes yet</p>
                      <Link href={`/author/podcasts/${podcastId}/episodes/new`}>
                        <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl">
                          Create First Episode
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    episodes.map((episode) => (
                      <div key={episode.id} className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-100 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold">
                                #{episode.episode_number}
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Published
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                              {episode.title}
                            </h3>
                            <div className="text-xs text-gray-500 space-y-1">
                              <div>Duration: {formatDuration(episode.duration)}</div>
                              <div>Created: {formatDate(episode.created_at)}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-2">
                            <Link href={`/author/podcasts/${podcastId}/episodes/${episode.id}/edit`}>
                              <Button variant="outline" size="sm" className="text-xs rounded-full border-blue-200 text-blue-700 hover:bg-blue-50">
                                ✏️ Edit
                              </Button>
                            </Link>
                            <EpisodeActions
                              episodeId={episode.id}
                              episodeTitle={episode.title}
                              podcastId={podcast.id}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* View All Episodes Link */}
                {episodes.length > 0 && (
                  <div className="mt-6 text-center">
                    <Link href={`/author/podcasts/${podcastId}/episodes`}>
                      <Button variant="outline" className="rounded-xl border-orange-200 text-orange-700 hover:bg-orange-50">
                        📋 View All Episodes
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'workflow' && (
        <PodcastWorkflowManager
          podcastId={podcastId}
          initialWorkflowState={workflowState || undefined}
          onWorkflowChanged={handleWorkflowChanged}
        />
      )}
    </div>
  )
} 