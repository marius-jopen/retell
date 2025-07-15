'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'

import { PodcastWorkflowState } from '@/lib/podcast-workflow'
import EditPodcastForm from '@/components/forms/edit-podcast-form'
import { EpisodePreviewList, Episode } from '@/components/ui/episode-preview-list'
import EpisodeActions from '@/components/author/episode-actions'
import { formatDate } from '@/lib/utils'

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
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')

  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const { addToast } = useToast()

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

  const handleSubmit = async (formData: any, coverImage: File | null) => {
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to update a podcast')
      }

      // Upload cover image if provided
      let coverImageUrl = podcast?.cover_image_url
      if (coverImage) {
        // TEMPORARY: Use base64 until storage bucket is set up
        const base64Url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const base64 = reader.result as string
            resolve(base64)
          }
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsDataURL(coverImage)
        })
        coverImageUrl = base64Url
      }

      // Check if we should set manual overrides based on workflow state
      const updates: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        language: formData.language,
        country: formData.country,
        rss_url: formData.rss_url?.trim() || null,
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
        throw updateError
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
      throw new Error('Failed to update podcast. Please try again.')
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Podcast Cover Image */}
            <div className="flex-shrink-0">
              {podcast.cover_image_url ? (
                <img
                  src={podcast.cover_image_url}
                  alt={podcast.title}
                  className="w-16 h-16 rounded-2xl object-cover shadow-md"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-red-400 via-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">
                    {podcast.title.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Title and Description */}
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Edit {podcast.title}
              </h1>
              <p className="text-gray-600">
                Update your podcast details and manage episodes
              </p>
            </div>
          </div>
          <Link href="/author/podcasts">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              ← Back to Podcasts
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8 min-h-0">
          {/* Left Column - Podcast Form (Sticky) */}
          <div className="lg:w-2/3 lg:sticky lg:top-8 lg:self-start">
            {/* Workflow Status Indicator */}
            {workflowState && (
              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Current Mode: 
                    </span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      workflowState.mode === 'manual' 
                        ? 'bg-blue-100 text-blue-800'
                        : workflowState.mode === 'rss'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {workflowState.mode.toUpperCase()}
                    </span>
                  </div>

                </div>
                {workflowState.mode === 'hybrid' && (
                  <p className="text-xs text-gray-500 mt-2">
                    Some fields may be automatically synced from RSS feed
                  </p>
                )}
              </div>
            )}

            <EditPodcastForm
              podcast={podcast}
              onSubmit={handleSubmit}
              loading={loading}
              isAdmin={false}
              workflowState={workflowState}
            />
          </div>

          {/* Right Column - Episodes (Scrollable) */}
          <div className="lg:w-1/3 flex flex-col space-y-4 min-h-0">
            {/* Episode Actions */}
            <div className="space-y-2 flex-shrink-0">
              <Link href={`/author/podcasts/${podcastId}/episodes/new`} className="block">
                <Button 
                  variant="default" 
                  size="lg" 
                  rounded="full"
                  className="w-full"
                >
                  Add Episode
                </Button>
              </Link>
              {episodes.length > 0 && (
                <Link href={`/author/podcasts/${podcastId}/episodes`} className="block">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    rounded="full"
                    className="w-full"
                  >
                    View All Episodes
                  </Button>
                </Link>
              )}
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
  )
} 