'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'
import EpisodeActions from '@/components/author/episode-actions'
import { formatDate } from '@/lib/utils'
import { EpisodePreviewList } from '@/components/ui/episode-preview-list'

interface Episode {
  id: string
  title: string
  description: string
  episode_number: number
  season_number?: number
  duration?: number
  created_at: string
  updated_at: string
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
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const { addToast } = useToast()

  // Define categories for the dropdown
  const categories = [
    'Arts',
    'Business',
    'Comedy',
    'Education',
    'Fiction',
    'Government',
    'Health & Fitness',
    'History',
    'Kids & Family',
    'Leisure',
    'Music',
    'News',
    'Religion & Spirituality',
    'Science',
    'Society & Culture',
    'Sports',
    'Technology',
    'True Crime',
    'TV & Film'
  ]

  // Define languages for the dropdown
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'nl', name: 'Dutch' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' }
  ]

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params
      setPodcastId(resolvedParams.id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (podcastId) {
      fetchPodcast()
    }
  }, [podcastId])

  const fetchPodcast = async () => {
    try {
      setFetchError('')
      
      // Get podcast details
      const { data: podcastData, error: podcastError } = await supabase
        .from('podcasts')
        .select('*')
        .eq('id', podcastId)
        .single()

      if (podcastError) throw podcastError

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

      // Get episodes
      const { data: episodeData, error: episodeError } = await supabase
        .from('episodes')
        .select('*')
        .eq('podcast_id', podcastId)
        .order('episode_number', { ascending: true })

      if (episodeError) throw episodeError
      setEpisodes(episodeData || [])

    } catch (error: any) {
      console.error('Error fetching podcast:', error)
      setFetchError(error.message || 'Failed to load podcast')
    }
  }

  const handleSubmit = async (formData: any, coverImage: File | null) => {
    setLoading(true)

    try {
      let coverImageUrl = podcast?.cover_image_url

      // Upload cover image if provided
      if (coverImage) {
        const fileExt = coverImage.name.split('.').pop()
        const fileName = `podcast-cover-${podcastId}-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('podcast-covers')
          .upload(fileName, coverImage)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('podcast-covers')
          .getPublicUrl(fileName)

        coverImageUrl = urlData.publicUrl
      }

      // Update podcast
      const { error: updateError } = await supabase
        .from('podcasts')
        .update({
          ...formData,
          cover_image_url: coverImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', podcastId)

      if (updateError) throw updateError

      addToast({
        title: 'Success',
        description: 'Podcast updated successfully',
        type: 'success'
      })

      await fetchPodcast()

    } catch (error: any) {
      console.error('Error updating podcast:', error)
      setError(error.message || 'Failed to update podcast')
      addToast({
        title: 'Error',
        description: error.message || 'Failed to update podcast',
        type: 'error'
      })
    } finally {
      setLoading(false)
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
    <div className="min-h-screen bg-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Podcast</h1>
              <p className="mt-2 text-lg text-gray-600">
                {podcast?.title || 'Loading...'}
              </p>
            </div>
            <Link href="/author/podcasts">
              <Button variant="outline" className="rounded-full">Back to Podcasts</Button>
            </Link>
          </div>
        </div>

        {/* 2-Column Sticky Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Podcast Details (Scrollable) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-modern-lg shadow-modern border border-orange-200">
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Podcast Details
                  </h2>
                  <p className="text-gray-600">
                    Update your podcast information and settings
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Podcast Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-orange-200 rounded-modern focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter podcast title"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={4}
                                              className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Describe your podcast"
                    />
                  </div>

                  {/* Category and Language Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-orange-200 rounded-modern focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                        Language *
                      </label>
                      <select
                        id="language"
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-orange-200 rounded-modern focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">Select language</option>
                        {languages.map((lang) => (
                          <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label htmlFor="cover-image" className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Image
                    </label>
                    <div className="border-2 border-dashed border-orange-200 rounded-modern p-6">
                      {podcast?.cover_image_url && (
                        <div className="mb-4">
                          <img
                            src={podcast.cover_image_url}
                            alt="Current cover"
                            className="w-32 h-32 object-cover rounded-modern"
                          />
                          <p className="text-sm text-gray-500 mt-2">Current cover image</p>
                        </div>
                      )}
                      <input
                        type="file"
                        id="cover-image"
                        accept="image/*"
                        onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end space-x-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8"
                    >
                      {loading ? 'Updating...' : 'Update Podcast'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column - Episodes (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky-sidebar">

            </div>

            {/* Episodes List */}
            <div className="flex-1 min-h-0">
              <EpisodePreviewList
                title={`Episodes (${episodes.length})`}
                episodes={episodes.map(ep => ({
                  ...ep,
                  season_number: ep.season_number || undefined,
                  duration: ep.duration || undefined
                }))}
                maxHeight="100%"
                emptyStateMessage="No episodes yet"
                emptyStateIcon="🎙️"
                showActions={true}
                getEpisodeHref={(episode) => `/author/podcasts/${podcastId}/episodes/${episode.id}/edit`}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 